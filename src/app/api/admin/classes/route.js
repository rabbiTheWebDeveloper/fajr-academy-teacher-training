import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { requirePermission, serverError } from "@/lib/api-auth";
import { isObjectId, toPlain } from "@/lib/query-helpers";
import { withCourseState } from "@/lib/course-state";

/**
 * Admin Class Schedule API
 *   GET    ?courseId=&status=&search=      list all scheduled classes across courses + course summaries
 *   POST   { courseId, title, ... }        add a new class session to a course's schedule
 *   PATCH  { courseId, classId|moduleNo, ... }  update a class session (or course logistics if scope="course")
 *   PUT    alias for PATCH
 *   DELETE ?courseId=&classId= (&moduleNo=)     remove a class session (super-admin only)
 *
 * All operations stay in sync with CourseModel.curriculum so the trainee portal (/classes,
 * /dashboard), instructor portal (/instructor/live, /instructor/curriculum) and public
 * marketing schedule always read the exact same source of truth.
 */

const SESSION_STATUSES = ["", "scheduled", "live", "completed", "cancelled", "postponed"];
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });

function validateHttps(value, label) {
  const v = String(value ?? "").trim();
  if (!v) return { value: "" };
  if (!/^https:\/\/[^\s]+$/i.test(v)) {
    return { error: `${label} অবশ্যই https:// দিয়ে শুরু হওয়া সঠিক লিংক হতে হবে।` };
  }
  return { value: v };
}

function cleanTopics(value) {
  if (Array.isArray(value)) {
    return value.map((t) => String(t ?? "").trim()).filter(Boolean).slice(0, 30);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 30);
  }
  return undefined;
}

function shapeCourseSummary(c) {
  const withState = withCourseState(c);
  return {
    _id: String(withState._id),
    courseId: withState.courseId,
    name: withState.name,
    tag: withState.tag || "",
    track: withState.track || "general",
    orientationDate: withState.orientationDate || "",
    orientationTime: withState.orientationTime || "",
    routine: withState.routine || "",
    duration: withState.duration || "",
    instructor: withState.instructor || "",
    meetLink: withState.meetLink || "",
    whatsappLink: withState.whatsappLink || "",
    status: withState.status || "",
    publishState: withState.publishState,
    sessionCount: (withState.curriculum || []).length,
  };
}

function shapeClassRow(course, mod, idx) {
  const moduleNo = Number(mod.moduleNo) || idx + 1;
  return {
    id: String(mod._id || `${course.courseId}-${moduleNo}-${idx}`),
    _id: mod._id ? String(mod._id) : "",
    courseDbId: String(course._id),
    courseId: course.courseId,
    courseName: course.name,
    courseTag: course.tag || "",
    courseTrack: course.track || "general",
    courseMeetLink: course.meetLink || "",
    courseWhatsappLink: course.whatsappLink || "",
    moduleNo,
    sessionBadge: mod.sessionBadge || `SESSION ${String(moduleNo).padStart(2, "0")}`,
    title: mod.title || "",
    subtitle: mod.subtitle || "",
    description: mod.description || "",
    trainerName: mod.trainerName || "",
    trainerRole: mod.trainerRole || "",
    sessionDate: mod.sessionDate || "",
    liveDate: mod.liveDate || "",
    sessionTime: mod.sessionTime || "",
    duration: mod.duration || "১ ঘণ্টা",
    meetLink: mod.meetLink || "",
    effectiveMeetLink: mod.meetLink || course.meetLink || "",
    recordingUrl: mod.recordingUrl || "",
    sessionStatus: mod.sessionStatus || "",
    topics: Array.isArray(mod.topics) ? mod.topics : [],
    lessonsCount: Array.isArray(mod.lessons) ? mod.lessons.length : 0,
    lessons: toPlain(mod.lessons || []),
  };
}

function sortedCourseClasses(course) {
  return [...(course.curriculum || [])]
    .map((m, idx) => ({ m, idx }))
    .sort((a, b) => (Number(a.m?.moduleNo) || a.idx + 1) - (Number(b.m?.moduleNo) || b.idx + 1) || a.idx - b.idx)
    .map(({ m, idx }) => shapeClassRow(course, m, idx));
}

async function findCourseDoc(body) {
  if (isObjectId(body?.courseDbId)) return CourseModel.findById(body.courseDbId);
  if (body?.courseId) return CourseModel.findOne({ courseId: String(body.courseId).trim() });
  return null;
}

function findModuleIndex(curriculum, { classId, moduleNo }) {
  if (classId && isObjectId(String(classId))) {
    const byId = curriculum.findIndex((m) => String(m._id) === String(classId));
    if (byId >= 0) return byId;
  }
  if (moduleNo !== undefined && moduleNo !== null && moduleNo !== "") {
    const targetNo = Number(moduleNo);
    if (Number.isFinite(targetNo)) {
      return curriculum.findIndex((m) => Number(m.moduleNo) === targetNo);
    }
  }
  return -1;
}

function cleanSessionFields(body, { isCreate = false } = {}) {
  const out = {};

  if (body.title !== undefined || isCreate) {
    const title = String(body.title ?? "").trim().slice(0, 240);
    if (!title) return { error: "ক্লাসের শিরোনাম (Title) আবশ্যক।" };
    out.title = title;
  }

  if (body.moduleNo !== undefined && body.moduleNo !== "") {
    const n = Number(body.moduleNo);
    if (!Number.isInteger(n) || n < 1 || n > 999) return { error: "সেশন নম্বর ১ থেকে ৯৯৯ এর মধ্যে পূর্ণসংখ্যা হতে হবে।" };
    out.moduleNo = n;
  }

  for (const [field, max] of [
    ["sessionBadge", 60],
    ["subtitle", 240],
    ["description", 2000],
    ["trainerName", 120],
    ["trainerRole", 160],
    ["trainerQualifications", 240],
    ["sessionDate", 120],
    ["sessionTime", 120],
    ["duration", 80],
    ["liveDate", 120],
  ]) {
    if (body[field] !== undefined) {
      out[field] = String(body[field] ?? "").trim().slice(0, max);
    }
  }

  // Keep liveDate synchronized whenever sessionDate is updated without an explicit liveDate.
  if (out.sessionDate !== undefined && body.liveDate === undefined) {
    out.liveDate = out.sessionDate;
  }

  if (body.meetLink !== undefined) {
    const checked = validateHttps(body.meetLink, "ক্লাস মিট লিংক");
    if (checked.error) return { error: checked.error };
    out.meetLink = checked.value;
  }

  if (body.recordingUrl !== undefined) {
    const checked = validateHttps(body.recordingUrl, "রেকর্ডিং লিংক");
    if (checked.error) return { error: checked.error };
    out.recordingUrl = checked.value;
  }

  if (body.sessionStatus !== undefined) {
    const st = String(body.sessionStatus ?? "").trim();
    if (!SESSION_STATUSES.includes(st)) return { error: "ক্লাস স্ট্যাটাস সঠিক নয়।" };
    out.sessionStatus = st;
  }

  if (body.topics !== undefined) {
    out.topics = cleanTopics(body.topics) || [];
  }

  return { data: out };
}

export async function GET(request) {
  const auth = await requirePermission(request, "classes", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const search = String(searchParams.get("search") || "").trim().toLowerCase();

    let courseDocs = await CourseModel.find().sort({ createdAt: 1 }).lean();
    if (courseDocs.length === 0) {
      await ensureDefaultCourses();
      courseDocs = await CourseModel.find().sort({ createdAt: 1 }).lean();
    }

    const courses = courseDocs.map(shapeCourseSummary);
    const filteredCourses =
      courseId && courseId !== "all" ? courseDocs.filter((c) => c.courseId === courseId) : courseDocs;

    let classes = filteredCourses.flatMap(sortedCourseClasses);

    if (status && status !== "all") {
      classes = classes.filter((item) => {
        const effective = item.sessionStatus || "scheduled";
        return effective === status;
      });
    }

    if (search) {
      classes = classes.filter((item) =>
        [
          item.title,
          item.subtitle,
          item.sessionBadge,
          item.trainerName,
          item.courseName,
          item.courseId,
          item.sessionDate,
          item.liveDate,
        ].some((v) => String(v || "").toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: classes.length,
      classes: toPlain(classes),
      courses: toPlain(courses),
    });
  } catch (error) {
    return serverError(error, "Admin classes GET");
  }
}

export async function POST(request) {
  const auth = await requirePermission(request, "classes", "create");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const course = await findCourseDoc(body);
    if (!course) return bad("কোর্স খুঁজে পাওয়া যায়নি। সঠিক courseId নির্বাচন করুন।", 404);

    const { data, error } = cleanSessionFields(body, { isCreate: true });
    if (error) return bad(error);

    const existing = course.curriculum || [];
    const maxNo = existing.reduce((max, m) => Math.max(max, Number(m.moduleNo) || 0), 0);
    const moduleNo = data.moduleNo || maxNo + 1;

    const newEntry = {
      moduleNo,
      sessionBadge: data.sessionBadge || `SESSION ${String(moduleNo).padStart(2, "0")}`,
      title: data.title,
      subtitle: data.subtitle || "",
      description: data.description || "",
      trainerName: data.trainerName || "",
      trainerRole: data.trainerRole || "",
      trainerQualifications: data.trainerQualifications || "",
      sessionDate: data.sessionDate || "",
      sessionTime: data.sessionTime || "",
      duration: data.duration || "১ ঘণ্টা",
      liveDate: data.liveDate || data.sessionDate || "",
      meetLink: data.meetLink || "",
      recordingUrl: data.recordingUrl || "",
      sessionStatus: data.sessionStatus || "",
      topics: data.topics || [],
      lessons: [],
    };

    course.curriculum.push(newEntry);
    await course.save();

    const savedDoc = course.toObject();
    const createdMod = savedDoc.curriculum[savedDoc.curriculum.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: "নতুন ক্লাস শিডিউল সফলভাবে যুক্ত হয়েছে!",
        classItem: toPlain(shapeClassRow(savedDoc, createdMod, savedDoc.curriculum.length - 1)),
        course: toPlain(shapeCourseSummary(savedDoc)),
      },
      { status: 201 }
    );
  } catch (error) {
    return serverError(error, "Admin classes POST");
  }
}

async function handleUpdate(request) {
  const auth = await requirePermission(request, "classes", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const course = await findCourseDoc(body);
    if (!course) return bad("কোর্স খুঁজে পাওয়া যায়নি।", 404);

    // Optional course-level class logistics update (meetLink, whatsappLink, routine, orientation)
    if (body.scope === "course") {
      const updates = {};
      if (body.meetLink !== undefined) {
        const checked = validateHttps(body.meetLink, "Google Meet / ক্লাস লিংক");
        if (checked.error) return bad(checked.error);
        updates.meetLink = checked.value;
      }
      if (body.whatsappLink !== undefined) {
        const checked = validateHttps(body.whatsappLink, "WhatsApp গ্রুপ লিংক");
        if (checked.error) return bad(checked.error);
        updates.whatsappLink = checked.value;
      }
      for (const field of ["routine", "orientationDate", "orientationTime", "instructor"]) {
        if (body[field] !== undefined) updates[field] = String(body[field] ?? "").trim().slice(0, 200);
      }
      if (Object.keys(updates).length === 0) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

      Object.assign(course, updates);
      await course.save();
      const savedDoc = course.toObject();
      return NextResponse.json({
        success: true,
        message: "ব্যাচের ক্লাস লিংক ও শিডিউল তথ্য আপডেট হয়েছে!",
        course: toPlain(shapeCourseSummary(savedDoc)),
        classes: toPlain(sortedCourseClasses(savedDoc)),
      });
    }

    const idx = findModuleIndex(course.curriculum || [], { classId: body.classId || body._id, moduleNo: body.targetModuleNo ?? body.moduleNo });
    if (idx < 0) return bad("ক্লাস সেশনটি খুঁজে পাওয়া যায়নি।", 404);

    const { data, error } = cleanSessionFields(body, { isCreate: false });
    if (error) return bad(error);
    if (Object.keys(data).length === 0) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

    const target = course.curriculum[idx];
    for (const [k, v] of Object.entries(data)) {
      target[k] = v;
    }

    await course.save();
    const savedDoc = course.toObject();
    const updatedMod = savedDoc.curriculum[idx];

    return NextResponse.json({
      success: true,
      message: "ক্লাস শিডিউল সফলভাবে আপডেট হয়েছে!",
      classItem: toPlain(shapeClassRow(savedDoc, updatedMod, idx)),
      course: toPlain(shapeCourseSummary(savedDoc)),
    });
  } catch (error) {
    return serverError(error, "Admin classes PATCH");
  }
}

export async function PATCH(request) {
  return handleUpdate(request);
}

export async function PUT(request) {
  return handleUpdate(request);
}

export async function DELETE(request) {
  const auth = await requirePermission(request, "classes", "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const courseDbId = searchParams.get("courseDbId");
    const classId = searchParams.get("classId") || searchParams.get("id");
    const moduleNo = searchParams.get("moduleNo");

    const course = await findCourseDoc({ courseId, courseDbId });
    if (!course) return bad("কোর্স খুঁজে পাওয়া যায়নি।", 404);

    const idx = findModuleIndex(course.curriculum || [], { classId, moduleNo });
    if (idx < 0) return bad("মুছে ফেলার মতো ক্লাস সেশন পাওয়া যায়নি।", 404);

    course.curriculum.splice(idx, 1);
    await course.save();

    return NextResponse.json({
      success: true,
      message: "ক্লাস সেশন সফলভাবে মুছে ফেলা হয়েছে।",
      course: toPlain(shapeCourseSummary(course.toObject())),
    });
  } catch (error) {
    return serverError(error, "Admin classes DELETE");
  }
}
