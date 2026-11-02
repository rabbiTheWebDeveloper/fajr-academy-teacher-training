import { NextResponse } from "next/server";
import { requireAuth, serverError } from "@/lib/api-auth";
import { classView, getEnrolledCourses, getTraineeNotices, getTraineeUser, isPaidUser } from "@/service/trainee-service";

/** Schedule, class links (paid only) and notices for the signed-in trainee's courses. */
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    const paid = isPaidUser(user);
    const [{ courses }, notices] = await Promise.all([getEnrolledCourses(user), getTraineeNotices(user)]);
    return NextResponse.json({ success: true, paid, courses: courses.map((c) => classView(c, paid)), notices });
  } catch (error) {
    return serverError(error, "TOT classes GET");
  }
}
