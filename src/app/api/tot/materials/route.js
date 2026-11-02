import { NextResponse } from "next/server";
import { requireAuth, serverError } from "@/lib/api-auth";
import { getEnrolledCourses, getTraineeUser, isPaidUser, materialsView } from "@/service/trainee-service";

/** Study materials of the signed-in trainee's enrolled courses (paid trainees only). */
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    const paid = isPaidUser(user);
    const { courses } = await getEnrolledCourses(user);
    const category = new URL(request.url).searchParams.get("category");
    let resources = materialsView(courses, paid);
    if (category && category !== "all") resources = resources.filter((r) => r.category === category);
    return NextResponse.json({ success: true, paid, count: resources.length, resources });
  } catch (error) {
    return serverError(error, "TOT materials GET");
  }
}
