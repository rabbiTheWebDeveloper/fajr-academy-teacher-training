import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ParticipantModel } from "@/model/participant-model";
import { PaymentModel } from "@/model/payment-model";
import { MEN_TOT_CURRICULUM, WOMEN_TOT_CURRICULUM } from "@/constant/course-defaults";
import { ensureDefaultCourses, withLiveEnrolment } from "@/service/course-service";
import { requirePermission, serverError } from "@/lib/api-auth";
import { isObjectId, pick } from "@/lib/query-helpers";
import { COURSE_STATES, COURSE_STATE_LABEL, courseState, publishProblem, transitionProblem, withCourseState } from "@/lib/course-state";

/**
 * Course catalogue management.
 *   GET    ?state=all|draft|published|unpublished|archived
 *   POST   create (publishState "draft" | "published", default "published")
 *   PUT    edit details / curriculum / resources (never the publish state)
 *   PATCH  { _id | courseId, publishState } — publish / unpublish / archive / restore / draft
 *   DELETE ?id= | ?courseId=
 * Copying a course is POST /api/admin/courses/duplicate.
 * enrolledCount is owned by the enrolment service and is never written from here
 * (saving a stale form used to reset it).
 */
const EDITABLE = [
  "name",
  "tag",
  "track",
  "summary",
  "fee",
  "regularFee",
  "orientationDate",
  "orientationTime",
  "routine",
  "duration",
  "meetLink",
  "whatsappLink",
  "instructor",
  "maxSeats",
  "status",
  "perks",
  "videoUrl",
  "curriculum",
  "resources",
];
const STATUSES = ["Active & Enrolling", "Upcoming", "Closed"];
// Trainee checkout and enrolment code refers to these two codes directly, so they never change.
const OFFICIAL_COURSE_IDS = ["TOT-MEN", "TOT-WOMEN-014"];
const TRACKS = ["men", "women", "general"];
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

function clean(input) {
  const out = pick(input, EDITABLE);
  for (const k of ["fee", "regularFee", "maxSeats"]) {
    if (out[k] !== undefined) {
      const n = Number(out[k]);
      if (!Number.isFinite(n) || n < 0) return { error: `${k} সঠিক নয়।` };
      out[k] = n;
    }
  }
  if (out.status !== undefined && !STATUSES.includes(out.status)) return { error: "কোর্স স্ট্যাটাস সঠিক নয়।" };
  if (out.track !== undefined && !TRACKS.includes(out.track)) return { error: "ট্র্যাক সঠিক নয়।" };
  for (const k of ["meetLink", "whatsappLink", "videoUrl"]) {
    if (out[k] !== undefined) {
      out[k] = String(out[k]).trim();
      if (out[k] && !/^https:\/\//.test(out[k])) return { error: `${k} অবশ্যই https:// দিয়ে শুরু হতে হবে।` };
    }
  }
  if (out.perks !== undefined && !Array.isArray(out.perks)) return { error: "perks অবশ্যই তালিকা হতে হবে।" };
  if (out.curriculum !== undefined && !Array.isArray(out.curriculum)) return { error: "কারিকুলাম ফরম্যাট সঠিক নয়।" };
  if (out.resources !== undefined && !Array.isArray(out.resources)) return { error: "রিসোর্স ফরম্যাট সঠিক নয়।" };
  return { data: out };
}

const lessonTotal = (curriculum) => (curriculum || []).reduce((n, mod) => n + (Array.isArray(mod?.lessons) ? mod.lessons.length : 0), 0);

/**
 * Adding and editing modules, lessons and study files is an "update", but the UI removes
 * them by saving a shorter list — which is a delete, and deleting is super-admin only.
 * Returns what would be removed (for the error message) or null.
 */
function removedContent(current, data) {
  if (data.curriculum !== undefined) {
    if (data.curriculum.length < (current.curriculum || []).length) return "মডিউল";
    if (lessonTotal(data.curriculum) < lessonTotal(current.curriculum)) return "লেসন";
  }
  if (data.resources !== undefined && data.resources.length < (current.resources || []).length) return "স্টাডি ফাইল";
  return null;
}

const findCourse = (body) =>
  isObjectId(body?._id)
    ? CourseModel.findById(body._id).lean()
    : body?.courseId
      ? CourseModel.findOne({ courseId: String(body.courseId) }).lean()
      : null;

export async function GET(request) {
  const auth = await requirePermission(request, "courses", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const state = new URL(request.url).searchParams.get("state");
    let courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    if (courses.length === 0) {
      await ensureDefaultCourses();
      courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    }
    courses = (await withLiveEnrolment(courses)).map(withCourseState);
    if (COURSE_STATES.includes(state)) courses = courses.filter((c) => c.publishState === state);
    return NextResponse.json({ success: true, courses: plain(courses) });
  } catch (error) {
    return serverError(error, "Admin courses GET");
  }
}

export async function POST(request) {
  const auth = await requirePermission(request, "courses", "create");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { data, error } = clean(body);
    if (error) return bad(error);
    if (!data.name?.trim()) return bad("কোর্সের নাম আবশ্যক।");

    const publishState = body.publishState ?? "published";
    if (!["draft", "published"].includes(publishState)) return bad("নতুন কোর্স শুধু ড্রাফট বা প্রকাশিত অবস্থায় তৈরি করা যায়।");

    const courseId = String(body.courseId || "").trim().toUpperCase() || `COURSE-${Date.now().toString(36).toUpperCase()}`;
    if (!/^[A-Z0-9-]{3,40}$/.test(courseId)) return bad("কোর্স আইডিতে শুধু ইংরেজি বড় হাতের অক্ষর, সংখ্যা ও - ব্যবহার করুন।");
    if (await CourseModel.exists({ courseId })) return bad("এই কোর্স আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।", 409);

    const track = data.track || "general";
    const doc = { fee: 1000, regularFee: 2500, maxSeats: 60, status: "Active & Enrolling", ...data };
    if (publishState === "published") {
      const problem = publishProblem(doc);
      if (problem) return bad(problem);
    }

    const course = await CourseModel.create({
      ...doc,
      courseId,
      track,
      publishState,
      isPublished: publishState === "published",
      stateChangedAt: new Date(),
      stateChangedBy: auth.session.email || "",
      enrolledCount: 0,
      curriculum: data.curriculum?.length ? data.curriculum : track === "men" ? MEN_TOT_CURRICULUM : track === "women" ? WOMEN_TOT_CURRICULUM : [],
      resources: data.resources || [],
    });

    return NextResponse.json({
      success: true,
      message:
        publishState === "draft"
          ? "কোর্সটি ড্রাফট হিসেবে তৈরি হয়েছে — কারিকুলাম ও তথ্য ঠিক করে “প্রকাশ করুন”।"
          : "নতুন কোর্স তৈরি ও প্রকাশ করা হয়েছে!",
      course: plain(withCourseState(course.toObject())),
    });
  } catch (error) {
    return serverError(error, "Admin courses POST");
  }
}

export async function PUT(request) {
  const auth = await requirePermission(request, "courses", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const query = isObjectId(body._id) ? { _id: body._id } : body.courseId ? { courseId: String(body.courseId) } : null;
    if (!query) return bad("কোর্স আইডি বা _id প্রদান করুন।");

    // publishState / isPublished are deliberately not editable here — use PATCH.
    const { data, error } = clean(body);
    if (error) return bad(error);
    const requestedId = body.nextCourseId == null ? "" : String(body.nextCourseId).trim().toUpperCase();
    if (Object.keys(data).length === 0 && !requestedId) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

    // A live course must stay publishable: no emptying its name or setting a 0 fee. Only the
    // fields this request changes are checked, so unrelated edits are never blocked.
    const current = await CourseModel.findOne(query).select("publishState isPublished courseId curriculum resources").lean();
    if (!current) return bad("কোর্স পাওয়া যায়নি।", 404);

    if (!auth.access.isSuper) {
      const removed = removedContent(current, data);
      if (removed) return bad(`${removed} মুছে ফেলার অনুমতি শুধু সুপার-অ্যাডমিনের আছে।`, 403);
    }

    // Course ID change: only for a non-official course with no payments or enrolments yet.
    let idChange = null;
    if (requestedId && requestedId !== current.courseId) {
      if (OFFICIAL_COURSE_IDS.includes(current.courseId)) return bad("মূল ব্যাচের (TOT-MEN / TOT-WOMEN-014) কোর্স আইডি বদলানো যাবে না।");
      if (!/^[A-Z0-9-]{3,40}$/.test(requestedId)) return bad("কোর্স আইডিতে শুধু ইংরেজি বড় হাতের অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।");
      if (await CourseModel.exists({ courseId: requestedId })) return bad("এই কোর্স আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।");
      const [payments, enrolments] = await Promise.all([
        PaymentModel.countDocuments({ courseId: current.courseId }),
        ParticipantModel.countDocuments({ courseId: current.courseId }),
      ]);
      if (payments > 0 || enrolments > 0) return bad("এই কোর্সে পেমেন্ট বা ভর্তি আছে, তাই কোর্স আইডি বদলানো যাবে না।");
      idChange = requestedId;
    }
    if (idChange) data.courseId = idChange;
    if (courseState(current) === "published") {
      const touched = {};
      if (data.name !== undefined) touched.name = data.name;
      if (data.fee !== undefined) touched.fee = data.fee;
      const problem = publishProblem({ name: "-", fee: 1, ...touched });
      if (problem) return bad(`প্রকাশিত কোর্সে এটি করা যাবে না: ${problem} আগে আনপাবলিশ করুন।`);
    }

    const updated = await CourseModel.findOneAndUpdate(query, { $set: data }, { returnDocument: "after", runValidators: true }).lean();
    if (!updated) return bad("কোর্স পাওয়া যায়নি।", 404);

    return NextResponse.json({
      success: true,
      message: "কোর্স, কারিকুলাম ও রিসোর্স সফলভাবে আপডেট করা হয়েছে!",
      course: plain(withCourseState(updated)),
    });
  } catch (error) {
    return serverError(error, "Admin courses PUT");
  }
}

const STATE_MESSAGE = {
  published: "কোর্সটি প্রকাশিত হয়েছে — ওয়েবসাইটে দেখা যাচ্ছে এবং নতুন ভর্তি নেওয়া যাবে।",
  unpublished: "কোর্সটি আনপাবলিশ হয়েছে — ওয়েবসাইট থেকে সরে গেছে ও নতুন ভর্তি বন্ধ; ভর্তি থাকা ট্রেইনিরা আগের মতোই ক্লাস পাবেন।",
  draft: "কোর্সটি ড্রাফটে নেওয়া হয়েছে — শুধু অ্যাডমিন দেখতে পাবেন।",
  archived: "কোর্সটি আর্কাইভ করা হয়েছে — ইতিহাস হিসেবে সংরক্ষিত, নতুন ভর্তি বন্ধ।",
};

/** Publish / unpublish / archive / restore / move to draft. Body: { _id | courseId, publishState }. */
export async function PATCH(request) {
  const auth = await requirePermission(request, "courses", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const to = body.publishState;
    if (!COURSE_STATES.includes(to)) return bad(`অবস্থা অবশ্যই ${COURSE_STATES.join(" / ")} এর একটি হতে হবে।`);

    const course = await findCourse(body);
    if (!course) return bad("কোর্স পাওয়া যায়নি।", 404);
    const from = courseState(course);

    const participants = to === "draft" ? await ParticipantModel.countDocuments({ courseId: course.courseId }) : 0;
    const problem = transitionProblem(from, to, { participants }) || (to === "published" ? publishProblem(course) : null);
    if (problem) return bad(problem, from === to ? 409 : 400);

    // Only apply the change if the course is still in the state we validated against, so two
    // admins clicking at once resolve to a single change (older documents have no publishState).
    const stillIn = COURSE_STATES.includes(course.publishState) ? { publishState: course.publishState } : { publishState: { $exists: false } };
    const updated = await CourseModel.findOneAndUpdate(
      { _id: course._id, ...stillIn },
      { $set: { publishState: to, stateChangedAt: new Date(), stateChangedBy: auth.session.email || "" } },
      { returnDocument: "after" }
    ).lean();
    if (!updated) return bad("কোর্সটির অবস্থা এইমাত্র অন্য কেউ পরিবর্তন করেছেন — পেজ রিফ্রেশ করুন।", 409);

    return NextResponse.json({
      success: true,
      message: STATE_MESSAGE[to],
      from: COURSE_STATE_LABEL[from],
      course: plain(withCourseState(updated)),
    });
  } catch (error) {
    return serverError(error, "Admin courses PATCH");
  }
}

export async function DELETE(request) {
  const auth = await requirePermission(request, "courses", "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const courseId = searchParams.get("courseId");
    const course = isObjectId(id)
      ? await CourseModel.findById(id).lean()
      : courseId
        ? await CourseModel.findOne({ courseId }).lean()
        : null;
    if (!course) return bad("কোর্স পাওয়া যায়নি।", 404);

    const enrolled = await ParticipantModel.countDocuments({ courseId: course.courseId });
    if (enrolled > 0) {
      return bad(`এই কোর্সে ${enrolled} জন অংশগ্রহণকারী আছেন — মুছে না ফেলে “আনপাবলিশ” বা “আর্কাইভ” করুন।`, 409);
    }
    await CourseModel.deleteOne({ _id: course._id });
    return NextResponse.json({ success: true, message: "কোর্স সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin courses DELETE");
  }
}
