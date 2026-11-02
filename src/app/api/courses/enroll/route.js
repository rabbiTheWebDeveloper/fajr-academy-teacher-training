import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { enrollUserInCourse } from "@/service/participant-service";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";

/**
 * Manual enrolment (admin only). Paid enrolments normally happen automatically when a
 * payment is verified (service/payment-service.js). This route never changes roles.
 */
export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { userId, userEmail, courseId, tranId, amount, currency, status, paymentStatus, notes } = await request.json();

    if (!userId && !userEmail) {
      return NextResponse.json({ success: false, message: "ব্যবহারকারীর আইডি অথবা ইমেইল আবশ্যক।" }, { status: 400 });
    }
    if (!courseId) {
      return NextResponse.json({ success: false, message: "কোর্স আইডি (courseId) আবশ্যক।" }, { status: 400 });
    }

    const result = await enrollUserInCourse({
      userId,
      userEmail,
      courseId,
      tranId,
      amount,
      currency,
      status,
      paymentStatus,
      notes: notes || `Manually enrolled by ${auth.session.email}`,
    });

    return NextResponse.json({
      success: true,
      message: result.isNew
        ? "কোর্সে সফলভাবে অংশগ্রহণকারী (Participant) হিসেবে যুক্ত করা হয়েছে।"
        : "অংশগ্রহণকারীর তথ্য ইতিমধ্যে বিদ্যমান এবং সফলভাবে আপডেট হয়েছে।",
      participant: JSON.parse(JSON.stringify(result.participant)),
      isNew: result.isNew,
    });
  } catch (error) {
    return serverError(error, "Manual enrol");
  }
}
