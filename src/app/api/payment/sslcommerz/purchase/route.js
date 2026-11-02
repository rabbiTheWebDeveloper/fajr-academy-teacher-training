import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { TotModel } from "@/model/tot-model";
import { PaymentModel } from "@/model/payment-model";
import { ParticipantModel } from "@/model/participant-model";
import { CourseModel } from "@/model/course-model";
import { requireAuth, TRAINEE_ROLES } from "@/lib/api-auth";
import { verifyPassword } from "@/lib/password";
import { initSSLCommerzPayment, isGatewayConfigured } from "@/lib/sslcommerz";
import { courseIdForUserTrack, ensureDefaultCourses } from "@/service/course-service";
import { newTranId } from "@/service/payment-service";
import { findUserByIdentifier } from "@/queries/auth-queries";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/payment/sslcommerz/purchase — pay for a course as an EXISTING account.
 *  - Signed in:   { courseId }
 *  - Signed out:  { identifier, password, courseId? }  (accounts created unpaid, e.g. by an admin)
 * The price comes from the course document; the account is linked on the payment, so
 * finalisation enrols this exact user and never touches their role or password.
 */
const bad = (message, status = 400, extra = {}) => NextResponse.json({ success: false, message, ...extra }, { status });

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pay-purchase:${ip}`, 15, 10 * 60 * 1000)) {
    return bad("অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", 429);
  }

  try {
    if (!isGatewayConfigured()) return bad("অনলাইন পেমেন্ট সাময়িকভাবে বন্ধ আছে। হেল্পলাইনে যোগাযোগ করুন।", 503);
    const body = await request.json();
    await dbConnect();

    // Resolve the paying account.
    // Only trainee (TOT) accounts buy courses — admins / instructors are refused.
    let user = null;
    const auth = await requireAuth(request);
    if (!auth.error) {
      if (!TRAINEE_ROLES.includes(auth.session.role)) return bad("স্টাফ অ্যাকাউন্ট দিয়ে কোর্স কেনা যায় না।", 403);
      user = await TotModel.findById(auth.session.id).lean();
    } else {
      const found = await findUserByIdentifier(body.identifier);
      if (!found || !(await verifyPassword(String(body.password || "").trim(), found.password))) {
        return bad("ইমেইল/মোবাইল বা পাসওয়ার্ড সঠিক নয়।", 401);
      }
      if (found.accountType !== "tot") return bad("স্টাফ অ্যাকাউন্ট দিয়ে কোর্স কেনা যায় না।", 403);
      user = found;
    }
    if (!user || user.isActive === false) return bad("অ্যাকাউন্টটি পাওয়া যায়নি বা নিষ্ক্রিয়।", 403);

    // Resolve the course.
    await ensureDefaultCourses();
    const courseId = String(body.courseId || courseIdForUserTrack(user.track));
    const course = await CourseModel.findOne({ courseId }).lean();
    if (!course || course.isPublished === false || course.status === "Closed") {
      return bad("নির্বাচিত কোর্সে এখন ভর্তি নেওয়া হচ্ছে না।", 404);
    }
    if (course.maxSeats && course.enrolledCount >= course.maxSeats) {
      return bad("দুঃখিত, এই ব্যাচের সব আসন পূর্ণ হয়ে গেছে।", 409);
    }

    const already = await ParticipantModel.exists({ user: user._id, courseId, paymentStatus: { $in: ["paid", "free"] } });
    if (already) return bad("আপনি ইতোমধ্যে এই কোর্সে ভর্তি আছেন।", 409, { alreadyEnrolled: true });

    const tranId = newTranId("BUY");
    const amount = Number(course.fee) || 1000;
    const payment = await PaymentModel.create({
      tranId,
      amount,
      currency: course.currency || "BDT",
      status: "PENDING",
      purpose: "course-purchase",
      courseId,
      user: user._id,
      userEmail: user.email,
      userName: user.fullName,
      userPhone: user.phone || "",
      track: user.track || "",
      paymentMethod: "SSLCOMMERZ",
    });

    try {
      const gateway = await initSSLCommerzPayment({
        tranId,
        amount,
        currency: course.currency || "BDT",
        productName: course.name,
        cusName: user.fullName,
        cusEmail: user.email,
        cusPhone: user.phone || "01700000000",
      });
      await PaymentModel.updateOne({ _id: payment._id }, { $set: { "rawResponse.sessionkey": gateway.sessionkey } });
      return NextResponse.json({ success: true, tranId, amount, gatewayUrl: gateway.gatewayUrl });
    } catch (err) {
      await PaymentModel.updateOne({ _id: payment._id }, { $set: { status: "FAILED", notes: `Gateway init failed: ${err.message}` } });
      console.error("Purchase gateway init error:", err.message);
      return bad("পেমেন্ট গেটওয়েতে সংযোগ করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", 502);
    }
  } catch (error) {
    console.error("Purchase init error:", error);
    return bad("পেমেন্ট শুরু করতে সমস্যা হয়েছে।", 500);
  }
}
