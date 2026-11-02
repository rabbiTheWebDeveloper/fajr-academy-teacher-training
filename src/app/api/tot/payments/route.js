import { NextResponse } from "next/server";
import { requireAuth, serverError } from "@/lib/api-auth";
import { getTraineePayments, getTraineeUser } from "@/service/trainee-service";

/** The signed-in user's own payments (no gateway raw data, no registration details). */
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    const payments = await getTraineePayments(user);
    return NextResponse.json({ success: true, count: payments.length, payments });
  } catch (error) {
    return serverError(error, "TOT payments GET");
  }
}
