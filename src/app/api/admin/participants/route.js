import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { ParticipantModel } from "@/model/participant-model";
import { TotModel } from "@/model/tot-model";
import { CourseModel } from "@/model/course-model";
import { enrollUserInCourse } from "@/service/participant-service";
import { requirePermission, serverError } from "@/lib/api-auth";
import { escapeRegex, isObjectId } from "@/lib/query-helpers";
import { courseState, withCourseState } from "@/lib/course-state";

/**
 * Admin → course enrolments (participants).
 *   GET    ?courseId=&userId=&track=&status=&search=
 *   POST   { userId | userEmail, courseId, status?, paymentStatus?, paidAmount?, notes?, setRoleAsParticipant? }
 *   PATCH  { participantId, status?, paymentStatus?, paidAmount?, progress?, attendanceCount?,
 *            evaluationScore?, grade?, certificateIssued?, certificateUrl?, notes? }
 *   DELETE ?id=
 * Only the fields listed above can be changed — nothing else from the request body reaches the database.
 */
const STATUSES = ["enrolled", "active", "completed", "dropped", "pending"];
const PAYMENT_STATUSES = ["paid", "pending", "failed", "free"];
/** Draft and archived courses are closed to new enrolments (running-but-hidden ones are not). */
const ENROLLABLE_STATES = ["published", "unpublished"];
const MAX_LIST = 1000;

const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

const num = (v) => (v === "" || v === null || v === undefined ? NaN : Number(v));

/** Validates the editable fields of an enrolment; returns { data } or { error }. */
function cleanPatch(body) {
  const data = {};

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return { error: "এনরোলমেন্টের স্ট্যাটাস সঠিক নয়।" };
    data.status = body.status;
  }
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) return { error: "পেমেন্ট স্ট্যাটাস সঠিক নয়।" };
    data.paymentStatus = body.paymentStatus;
  }
  if (body.paidAmount !== undefined) {
    const n = num(body.paidAmount);
    if (!Number.isFinite(n) || n < 0) return { error: "পরিশোধিত টাকার পরিমাণ সঠিক নয়।" };
    data.paidAmount = n;
  }
  if (body.progress !== undefined) {
    const n = num(body.progress);
    if (!Number.isFinite(n) || n < 0 || n > 100) return { error: "অগ্রগতি ০ থেকে ১০০ এর মধ্যে হতে হবে।" };
    data.progress = Math.round(n);
  }
  if (body.attendanceCount !== undefined) {
    const n = num(body.attendanceCount);
    if (!Number.isInteger(n) || n < 0) return { error: "উপস্থিতির সংখ্যা সঠিক নয়।" };
    data.attendanceCount = n;
  }
  if (body.evaluationScore !== undefined) {
    const n = num(body.evaluationScore);
    if (!Number.isFinite(n) || n < 0 || n > 100) return { error: "মূল্যায়ন স্কোর ০ থেকে ১০০ এর মধ্যে হতে হবে।" };
    data.evaluationScore = n;
  }
  if (body.grade !== undefined) {
    const g = String(body.grade ?? "").trim();
    if (g.length > 20) return { error: "গ্রেড সর্বোচ্চ ২০ অক্ষরের হতে পারে।" };
    data.grade = g;
  }
  if (body.certificateIssued !== undefined) data.certificateIssued = Boolean(body.certificateIssued);
  if (body.certificateUrl !== undefined) {
    const url = String(body.certificateUrl ?? "").trim();
    if (url) {
      let ok = false;
      try {
        ok = new URL(url).protocol === "https:" && url.length <= 500;
      } catch {
        ok = false;
      }
      if (!ok) return { error: "সার্টিফিকেট লিংক অবশ্যই https:// দিয়ে শুরু হওয়া সঠিক URL হতে হবে।" };
    }
    data.certificateUrl = url;
  }
  if (body.notes !== undefined) {
    const notes = String(body.notes ?? "").trim();
    if (notes.length > 1000) return { error: "নোট সর্বোচ্চ ১০০০ অক্ষরের হতে পারে।" };
    data.notes = notes;
  }
  return { data };
}

const COURSE_FIELDS = "name courseId fee regularFee currency routine orientationDate publishState isPublished status";

/**
 * Enrolments are keyed by courseId; the `course` ObjectId reference can be missing on older rows
 * (e.g. created before the course document existed). Resolve those by courseId in one query.
 */
async function withCourses(rows) {
  const missing = [...new Set(rows.filter((p) => !p.course?.courseId).map((p) => p.courseId).filter(Boolean))];
  if (!missing.length) return rows;
  const found = await CourseModel.find({ courseId: { $in: missing } }).select(COURSE_FIELDS).lean();
  const byId = new Map(found.map((c) => [c.courseId, c]));
  return rows.map((p) => (p.course?.courseId ? p : { ...p, course: byId.get(p.courseId) || null }));
}

function shape(p) {
  return {
    ...p,
    _id: String(p._id),
    enrolledAt: p.enrolledAt ? new Date(p.enrolledAt).toISOString() : "",
    completedAt: p.completedAt ? new Date(p.completedAt).toISOString() : null,
    course: p.course && typeof p.course === "object" && p.course.courseId ? withCourseState(p.course) : null,
  };
}

// GET: enrolments with filters & search (a trainee's courses, or a course's roster)
export async function GET(request) {
  const auth = await requirePermission(request, ["tots", "courses"], "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = {};

    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");
    const track = searchParams.get("track");
    const status = searchParams.get("status");
    const search = String(searchParams.get("search") || "").trim().slice(0, 100);

    if (courseId && courseId !== "all") query.courseId = courseId;
    if (userId) {
      if (!isObjectId(userId)) return bad("সঠিক ট্রেইনি ID আবশ্যক।");
      query.user = userId;
    }
    if (track && track !== "all") query.track = track;
    if (status && status !== "all") {
      if (!STATUSES.includes(status)) return bad("স্ট্যাটাস ফিল্টার সঠিক নয়।");
      query.status = status;
    }
    if (search) {
      const rx = { $regex: escapeRegex(search), $options: "i" };
      query.$or = [{ userName: rx }, { userEmail: rx }, { phone: rx }, { tranId: rx }, { courseName: rx }];
    }

    const found = await ParticipantModel.find(query)
      .sort({ enrolledAt: -1 })
      .limit(MAX_LIST + 1)
      .populate("user", "fullName email phone avatar track gender designation")
      .populate("course", COURSE_FIELDS)
      .lean();

    const truncated = found.length > MAX_LIST;
    const participants = (await withCourses(truncated ? found.slice(0, MAX_LIST) : found)).map(shape);
    return NextResponse.json({ success: true, count: participants.length, truncated, participants: plain(participants) });
  } catch (error) {
    return serverError(error, "Admin participants GET");
  }
}

// POST: enrol a trainee into a course (or update the existing enrolment)
export async function POST(request) {
  const auth = await requirePermission(request, ["tots", "courses"], "create");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const userId = String(body.userId || "").trim();
    const userEmail = String(body.userEmail || "").trim().toLowerCase();
    const courseId = String(body.courseId || "").trim();

    if (!userId && !userEmail) return bad("ট্রেইনির আইডি অথবা ইমেইল আবশ্যক।");
    if (userId && !isObjectId(userId)) return bad("সঠিক ট্রেইনি ID আবশ্যক।");
    if (!courseId) return bad("কোর্স নির্বাচন করুন।");

    const status = body.status === undefined ? "active" : body.status;
    const paymentStatus = body.paymentStatus === undefined ? "paid" : body.paymentStatus;
    const checked = cleanPatch({ status, paymentStatus, paidAmount: body.paidAmount ?? 0, notes: body.notes ?? "" });
    if (checked.error) return bad(checked.error);

    // Only TOT trainee accounts are enrolled; look them up here so a missing one is a 404, not a 500.
    const user = userId ? await TotModel.findById(userId).select("_id") : await TotModel.findOne({ email: userEmail }).select("_id");
    if (!user) return bad("এই ট্রেইনি খুঁজে পাওয়া যায়নি। (শুধু TOT ট্রেইনি অ্যাকাউন্টকে কোর্সে ভর্তি করা যায়।)", 404);

    // The course must exist and be open to enrolment — never invent a batch from free text.
    const course = await CourseModel.findOne({ courseId });
    if (!course) return bad("এই কোর্সটি খুঁজে পাওয়া যায়নি।", 404);
    const state = courseState(course);
    if (!ENROLLABLE_STATES.includes(state)) {
      return bad(
        state === "draft"
          ? "ড্রাফট কোর্সে ভর্তি করা যাবে না — আগে কোর্সটি প্রকাশ করুন।"
          : "আর্কাইভড কোর্সে ভর্তি করা যাবে না — আগে কোর্সটি রিস্টোর করুন।",
        409
      );
    }

    const result = await enrollUserInCourse({
      userId: String(user._id),
      courseId: course.courseId,
      status: checked.data.status,
      paymentStatus: checked.data.paymentStatus,
      amount: checked.data.paidAmount,
      notes: checked.data.notes,
      setRoleAsParticipant: body.setRoleAsParticipant === true,
    });

    const saved = await ParticipantModel.findById(result.participant._id).populate("course", COURSE_FIELDS).lean();
    return NextResponse.json({
      success: true,
      message: result.isNew ? "ট্রেইনিকে কোর্সে ভর্তি করা হয়েছে।" : "ট্রেইনি আগে থেকেই এই কোর্সে ছিলেন — এনরোলমেন্ট আপডেট করা হয়েছে।",
      isNew: result.isNew,
      participant: plain(shape((await withCourses([saved]))[0])),
    });
  } catch (error) {
    return serverError(error, "Admin participants POST");
  }
}

// PATCH: change one enrolment's status, payment status, progress, certificate or notes
export async function PATCH(request) {
  const auth = await requirePermission(request, ["tots", "courses"], "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const participantId = String(body.participantId || "").trim();
    if (!isObjectId(participantId)) return bad("সঠিক পার্টিসিপেন্ট ID আবশ্যক।");

    const { data, error } = cleanPatch(body);
    if (error) return bad(error);
    if (!Object.keys(data).length) return bad("পরিবর্তনের জন্য কোনো তথ্য দেওয়া হয়নি।");

    const current = await ParticipantModel.findById(participantId).select("status completedAt").lean();
    if (!current) return bad("এনরোলমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    // completedAt follows the status: stamped on completion, cleared if the course is re-opened.
    if (data.status === "completed" && !current.completedAt) data.completedAt = new Date();
    else if (data.status && data.status !== "completed" && current.status === "completed") data.completedAt = null;

    const updated = await ParticipantModel.findByIdAndUpdate(participantId, { $set: data }, { returnDocument: "after", runValidators: true })
      .populate("course", COURSE_FIELDS)
      .lean();
    if (!updated) return bad("এনরোলমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    return NextResponse.json({ success: true, message: "এনরোলমেন্টের তথ্য আপডেট হয়েছে।", participant: plain(shape((await withCourses([updated]))[0])) });
  } catch (error) {
    return serverError(error, "Admin participants PATCH");
  }
}

// DELETE: remove a trainee from a course (the payment record is kept)
export async function DELETE(request) {
  const auth = await requirePermission(request, ["tots", "courses"], "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return bad("সঠিক পার্টিসিপেন্ট ID আবশ্যক।");

    const participant = await ParticipantModel.findByIdAndDelete(id).lean();
    if (!participant) return bad("এনরোলমেন্ট রেকর্ড খুঁজে পাওয়া যায়নি।", 404);

    // Free the seat (never below zero) and drop the trainee-side references to the course.
    if (participant.course) {
      await CourseModel.updateOne({ _id: participant.course, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });
    }
    const pull = { enrolledCourseIds: participant.courseId };
    if (participant.course) pull.enrolledCourses = participant.course;
    await TotModel.updateOne({ _id: participant.user }, { $pull: pull });

    return NextResponse.json({ success: true, message: "ট্রেইনিকে কোর্স থেকে সরানো হয়েছে। (পেমেন্ট রেকর্ড অক্ষত আছে।)" });
  } catch (error) {
    return serverError(error, "Admin participants DELETE");
  }
}
