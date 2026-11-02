import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { requireAuth, INSTRUCTOR_ROLES, serverError } from "@/lib/api-auth";
import { isObjectId, pick } from "@/lib/query-helpers";

// Instructors run classes: links, routine and the session schedule.
// Pricing, publishing and identifiers stay with admins (/api/admin/courses).
const EDITABLE_FIELDS = ["meetLink", "whatsappLink", "routine", "orientationDate", "orientationTime", "curriculum"];
const MODULE_EDITABLE = ["liveDate", "sessionDate", "sessionTime", "trainerName", "trainerRole", "topics"];

const isHttpUrl = (v) => v === "" || /^https:\/\/[^\s]+$/i.test(v);

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const track = new URL(request.url).searchParams.get("track");
    const query = {};
    if (track === "men" || track === "women") query.track = track;
    else if (track && track !== "all") query.courseId = track;

    let courses = await CourseModel.find(query).sort({ createdAt: 1 }).lean();
    if (courses.length === 0 && !track) {
      await ensureDefaultCourses();
      courses = await CourseModel.find(query).sort({ createdAt: 1 }).lean();
    }
    return NextResponse.json({ success: true, courses: JSON.parse(JSON.stringify(courses)) });
  } catch (error) {
    return serverError(error, "Instructor courses GET");
  }
}

export async function PATCH(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const query = isObjectId(body._id) ? { _id: body._id } : body.courseId ? { courseId: String(body.courseId) } : null;
    if (!query) {
      return NextResponse.json({ success: false, message: "কোর্স ID আবশ্যক।" }, { status: 400 });
    }

    const updates = pick(body, EDITABLE_FIELDS);
    for (const key of ["meetLink", "whatsappLink"]) {
      if (updates[key] !== undefined) {
        updates[key] = String(updates[key]).trim();
        if (!isHttpUrl(updates[key])) {
          return NextResponse.json({ success: false, message: "লিংকটি অবশ্যই https:// দিয়ে শুরু হতে হবে।" }, { status: 400 });
        }
      }
    }

    // Curriculum edits: only schedule fields of existing modules, matched by moduleNo —
    // instructors can't add/remove modules or rewrite content.
    if (updates.curriculum !== undefined) {
      if (!Array.isArray(updates.curriculum)) {
        return NextResponse.json({ success: false, message: "কারিকুলাম ফরম্যাট সঠিক নয়।" }, { status: 400 });
      }
      const course = await CourseModel.findOne(query).select("curriculum").lean();
      if (!course) {
        return NextResponse.json({ success: false, message: "কোর্স পাওয়া যায়নি।" }, { status: 404 });
      }
      const incoming = new Map(updates.curriculum.map((m) => [Number(m.moduleNo), m]));
      updates.curriculum = (course.curriculum || []).map((m) => {
        const patch = pick(incoming.get(Number(m.moduleNo)) || {}, MODULE_EDITABLE);
        if (patch.topics && !Array.isArray(patch.topics)) delete patch.topics;
        return { ...m, ...patch };
      });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।" }, { status: 400 });
    }

    const updated = await CourseModel.findOneAndUpdate(query, { $set: updates }, { returnDocument: "after", runValidators: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, message: "কোর্স পাওয়া যায়নি।" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "কোর্স ও শিডিউল সফলভাবে আপডেট করা হয়েছে!",
      course: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    return serverError(error, "Instructor courses PATCH");
  }
}
