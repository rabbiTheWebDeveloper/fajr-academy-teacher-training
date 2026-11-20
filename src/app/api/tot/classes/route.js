import { NextResponse } from "next/server";
import { requireAuth, serverError, TRAINEE_ROLES } from "@/lib/api-auth";
import {
  classView,
  getEnrolledCourses,
  getTraineeNotices,
  getTraineeUser,
  hasPaidAccess,
} from "@/service/trainee-service";

/** Schedule, class links (paid only) and notices for the signed-in trainee's courses. */
export async function GET(request) {
  const auth = await requireAuth(request, TRAINEE_ROLES); // trainee (TOT) accounts only
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });

    const courseIdFilter = new URL(request.url).searchParams.get("courseId");
    const [{ participants, courses }, notices] = await Promise.all([getEnrolledCourses(user), getTraineeNotices(user)]);
    const paid = hasPaidAccess(user, participants);

    const filteredCourses =
      courseIdFilter && courseIdFilter !== "all" ? courses.filter((c) => c.courseId === courseIdFilter) : courses;

    return NextResponse.json({
      success: true,
      paid,
      courses: filteredCourses.map((c) => classView(c, paid)),
      notices,
    });
  } catch (error) {
    return serverError(error, "TOT classes GET");
  }
}
