import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ParticipantModel } from "@/model/participant-model";
import { MEN_TOT_CURRICULUM, WOMEN_TOT_CURRICULUM } from "@/constant/course-defaults";
import { ensureDefaultCourses } from "@/service/course-service";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { isObjectId, pick } from "@/lib/query-helpers";

/**
 * Course catalogue management. enrolledCount is owned by the enrolment service and is
 * never written from here (saving a stale form used to reset it).
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
  "isPublished",
  "videoUrl",
  "curriculum",
  "resources",
];
const STATUSES = ["Active & Enrolling", "Upcoming", "Closed"];
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
  if (out.isPublished !== undefined) out.isPublished = Boolean(out.isPublished);
  return { data: out };
}

export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    let courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    if (courses.length === 0) {
      await ensureDefaultCourses();
      courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    }
    return NextResponse.json({ success: true, courses: plain(courses) });
  } catch (error) {
    return serverError(error, "Admin courses GET");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { data, error } = clean(body);
    if (error) return bad(error);
    if (!data.name?.trim()) return bad("কোর্সের নাম আবশ্যক।");

    const courseId = String(body.courseId || "").trim().toUpperCase() || `COURSE-${Date.now().toString(36).toUpperCase()}`;
    if (!/^[A-Z0-9-]{3,40}$/.test(courseId)) return bad("কোর্স আইডিতে শুধু ইংরেজি বড় হাতের অক্ষর, সংখ্যা ও - ব্যবহার করুন।");
    if (await CourseModel.exists({ courseId })) return bad("এই কোর্স আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।", 409);

    const track = data.track || "general";
    const course = await CourseModel.create({
      fee: 1000,
      regularFee: 2500,
      maxSeats: 60,
      status: "Active & Enrolling",
      isPublished: true,
      ...data,
      courseId,
      track,
      enrolledCount: 0,
      curriculum: data.curriculum?.length ? data.curriculum : track === "men" ? MEN_TOT_CURRICULUM : track === "women" ? WOMEN_TOT_CURRICULUM : [],
      resources: data.resources || [],
    });

    return NextResponse.json({ success: true, message: "নতুন কোর্স ও কারিকুলাম সফলভাবে যুক্ত হয়েছে!", course: plain(course.toObject()) });
  } catch (error) {
    return serverError(error, "Admin courses POST");
  }
}

export async function PUT(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const query = isObjectId(body._id) ? { _id: body._id } : body.courseId ? { courseId: String(body.courseId) } : null;
    if (!query) return bad("কোর্স আইডি বা _id প্রদান করুন।");

    const { data, error } = clean(body);
    if (error) return bad(error);
    if (Object.keys(data).length === 0) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

    const updated = await CourseModel.findOneAndUpdate(query, { $set: data }, { returnDocument: "after", runValidators: true }).lean();
    if (!updated) return bad("কোর্স পাওয়া যায়নি।", 404);

    return NextResponse.json({ success: true, message: "কোর্স, কারিকুলাম ও রিসোর্স সফলভাবে আপডেট করা হয়েছে!", course: plain(updated) });
  } catch (error) {
    return serverError(error, "Admin courses PUT");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
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
      return bad(`এই কোর্সে ${enrolled} জন অংশগ্রহণকারী আছেন — মুছে না ফেলে স্ট্যাটাস "Closed" বা আনপাবলিশ করুন।`, 409);
    }
    await CourseModel.deleteOne({ _id: course._id });
    return NextResponse.json({ success: true, message: "কোর্স সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin courses DELETE");
  }
}
