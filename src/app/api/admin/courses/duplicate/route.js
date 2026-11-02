import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { isObjectId } from "@/lib/query-helpers";
import { withCourseState } from "@/lib/course-state";

/**
 * POST /api/admin/courses/duplicate
 *   { _id | courseId, name?, newCourseId? }
 *
 * Copies a course as a new DRAFT so a batch can be reused:
 *   copied      details, fee, schedule, perks, promo video, curriculum (sessions, topics,
 *               lessons) and study resources (each with a fresh resource id)
 *   not copied  enrolments / seat count (starts at 0), the Google Meet and WhatsApp links
 *               (they belong to the old batch's live class), the publish state (always draft)
 * The copy starts as "Upcoming" so it is ready for the next intake.
 */
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const ID_RX = /^[A-Z0-9-]{3,40}$/;
const stripIds = (list, mapEach) =>
  (Array.isArray(list) ? list : []).map((item) => {
    const { _id, ...rest } = item || {};
    return mapEach ? mapEach(rest) : rest;
  });
const newResourceId = () => `RES-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

/** "BASE-COPY", "BASE-COPY-2", … kept within 40 characters and unused. */
async function freeCourseId(base) {
  for (let n = 1; n <= 99; n++) {
    const suffix = n === 1 ? "-COPY" : `-COPY-${n}`;
    const candidate = `${base.slice(0, 40 - suffix.length)}${suffix}`;
    if (!(await CourseModel.exists({ courseId: candidate }))) return candidate;
  }
  return `${base.slice(0, 28)}-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const source = isObjectId(body._id)
      ? await CourseModel.findById(body._id).lean()
      : body.courseId
        ? await CourseModel.findOne({ courseId: String(body.courseId) }).lean()
        : null;
    if (!source) return bad("কপি করার মতো কোর্স পাওয়া যায়নি।", 404);

    const name = String(body.name || "").trim().slice(0, 200) || `${source.name} (কপি)`;

    let courseId = String(body.newCourseId || "").trim().toUpperCase();
    if (courseId) {
      if (!ID_RX.test(courseId)) return bad("কোর্স আইডিতে শুধু ইংরেজি বড় হাতের অক্ষর, সংখ্যা ও - ব্যবহার করুন (৩–৪০ অক্ষর)।");
      if (await CourseModel.exists({ courseId })) return bad("এই কোর্স আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।", 409);
    } else {
      courseId = await freeCourseId(source.courseId);
    }

    const copy = {
      name,
      tag: source.tag,
      track: source.track,
      summary: source.summary,
      fee: source.fee,
      regularFee: source.regularFee,
      currency: source.currency,
      orientationDate: source.orientationDate,
      orientationTime: source.orientationTime,
      routine: source.routine,
      duration: source.duration,
      instructor: source.instructor,
      maxSeats: source.maxSeats,
      perks: source.perks || [],
      videoUrl: source.videoUrl || "",
      curriculum: stripIds(source.curriculum, (m) => ({ ...m, lessons: stripIds(m.lessons) })),
      resources: stripIds(source.resources, (r) => ({ ...r, resourceId: newResourceId() })),
      // The new batch's own classroom is announced later.
      meetLink: "",
      whatsappLink: "",
      status: "Upcoming",
      enrolledCount: 0,
      publishState: "draft",
      isPublished: false,
      stateChangedAt: new Date(),
      stateChangedBy: auth.session.email || "",
      duplicatedFrom: source.courseId,
    };

    // Two admins duplicating at once can pick the same free id — retry on the unique index.
    let created;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      try {
        created = await CourseModel.create({ ...copy, courseId });
      } catch (err) {
        if (err?.code !== 11000 || body.newCourseId) throw err;
        courseId = await freeCourseId(source.courseId);
      }
    }
    if (!created) return bad("কোর্স আইডি তৈরি করা যায়নি — আবার চেষ্টা করুন।", 409);

    return NextResponse.json({
      success: true,
      message: `“${source.name}” কপি হয়েছে — নতুন কোর্স ড্রাফট অবস্থায় আছে। ক্লাস লিংক ও তারিখ ঠিক করে “প্রকাশ করুন”।`,
      course: JSON.parse(JSON.stringify(withCourseState(created.toObject()))),
    });
  } catch (error) {
    return serverError(error, "Admin courses duplicate");
  }
}
