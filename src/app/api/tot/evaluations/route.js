import { NextResponse } from "next/server";
import { requireAuth, serverError, TRAINEE_ROLES } from "@/lib/api-auth";
import { getTraineeEvaluations, getTraineeUser } from "@/service/trainee-service";

/** The signed-in trainee's own evaluations (latest first). */
export async function GET(request) {
  const auth = await requireAuth(request, TRAINEE_ROLES); // trainee (TOT) accounts only
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    const evaluations = await getTraineeEvaluations(user);
    return NextResponse.json({ success: true, evaluation: evaluations[0] || null, evaluations });
  } catch (error) {
    return serverError(error, "TOT evaluations GET");
  }
}
