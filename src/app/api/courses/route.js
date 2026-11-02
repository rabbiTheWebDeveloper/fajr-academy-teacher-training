import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { serverError } from "@/lib/api-auth";

// Public catalogue: only marketing fields. Class links (meet/WhatsApp) are for
// enrolled trainees and are served from the authenticated /api/tot/* routes.
const PUBLIC_FIELDS =
  "courseId name tag track summary fee regularFee currency orientationDate orientationTime routine duration instructor enrolledCount maxSeats status perks videoUrl curriculum.moduleNo curriculum.sessionBadge curriculum.title curriculum.subtitle curriculum.description curriculum.trainerName curriculum.trainerRole curriculum.liveDate curriculum.sessionTime curriculum.topics";

export async function GET() {
  try {
    await dbConnect();
    let courses = await CourseModel.find({ isPublished: true }).select(PUBLIC_FIELDS).sort({ createdAt: 1 }).lean();

    if (courses.length === 0) {
      await ensureDefaultCourses();
      courses = await CourseModel.find({ isPublished: true }).select(PUBLIC_FIELDS).sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, courses: JSON.parse(JSON.stringify(courses)) });
  } catch (error) {
    return serverError(error, "Public courses GET");
  }
}
