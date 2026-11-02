import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { SettingModel } from "@/model/setting-model";
import { initSSLCommerzPayment, isGatewayConfigured } from "@/lib/sslcommerz";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { REGISTRABLE_TRACKS, getPriceForTrack } from "@/service/course-service";
import { newTranId } from "@/service/payment-service";
import { phoneVariants } from "@/queries/auth-queries";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/payment/sslcommerz/init — new applicant registration + payment start.
 * No account exists until the payment is verified (see payment-service.finalizeGatewayPayment).
 * The amount is decided here from the course/settings; anything the browser sends is ignored.
 */

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400, extra = {}) => NextResponse.json({ success: false, message, ...extra }, { status });

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pay-init:${ip}`, 10, 10 * 60 * 1000)) {
    return bad("অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", 429);
  }

  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const phones = phoneVariants(body.phone);
    const phone = phones[0] || "";
    const password = String(body.password || "").trim();
    const track = String(body.track || "");

    if (fullName.length < 3 || fullName.length > 100) return bad("অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।");
    if (!EMAIL_RX.test(email)) return bad("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।");
    if (!/^01[3-9]\d{8}$/.test(phone)) return bad("অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমনঃ 01712345678)।");
    if (password.length < MIN_PASSWORD_LENGTH) return bad(`কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের পাসওয়ার্ড দিন।`);
    if (!REGISTRABLE_TRACKS.includes(track)) return bad("সঠিক কোর্স ব্যাচ নির্বাচন করুন।");

    if (!isGatewayConfigured()) {
      return bad("অনলাইন পেমেন্ট সাময়িকভাবে বন্ধ আছে। অনুগ্রহ করে WhatsApp হেল্পলাইনে যোগাযোগ করুন।", 503);
    }

    await dbConnect();

    // Admission rules set by the admin.
    const settings = (await SettingModel.findOne({ key: "system_settings" }).lean()) || {};
    if (settings.registrationOpen === false || settings.admissionStatus === "closed") {
      return bad("এই মুহূর্তে ভর্তি বন্ধ রয়েছে। পরবর্তী ব্যাচের আপডেটের জন্য WhatsApp হেল্পলাইনে যোগাযোগ করুন।", 403, { admissionClosed: true });
    }

    const { amount, currency, course } = await getPriceForTrack(track);
    if (!course || course.status === "Closed" || course.isPublished === false) {
      return bad("নির্বাচিত ব্যাচে এখন ভর্তি নেওয়া হচ্ছে না।", 403, { admissionClosed: true });
    }
    if (course.maxSeats && course.enrolledCount >= course.maxSeats) {
      return bad("দুঃখিত, এই ব্যাচের সব আসন পূর্ণ হয়ে গেছে।", 409, { seatsFull: true });
    }

    // Duplicate account / payment checks.
    const existing = await UserModel.findOne({ email }).select("paymentStatus role").lean();
    const verifiedPayment = await PaymentModel.exists({ userEmail: email, status: "VALID" });
    if (
      verifiedPayment ||
      (existing && (["paid", "free"].includes(existing.paymentStatus) || ["admin", "super-admin", "instructor"].includes(existing.role)))
    ) {
      return bad(
        "এই ইমেইল দিয়ে ইতোমধ্যে একটি সক্রিয় অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন — লগইনের পর ড্যাশবোর্ড থেকে অন্য কোর্সও কিনতে পারবেন।",
        409,
        { alreadyPaid: true }
      );
    }
    const phoneOwner = await UserModel.findOne({ phone: { $in: phones }, email: { $ne: email } }).select("_id").lean();
    if (phoneOwner) return bad("এই মোবাইল নম্বরটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।", 409);

    const tranId = newTranId("TOT");
    const payment = await PaymentModel.create({
      tranId,
      amount,
      currency,
      status: "PENDING",
      purpose: "registration",
      courseId: course.courseId,
      userEmail: email,
      userName: fullName,
      userPhone: phone,
      track,
      paymentMethod: "SSLCOMMERZ",
      registrationData: {
        fullName,
        email,
        phone,
        passwordHash: await hashPassword(password),
        gender: body.gender === "female" ? "female" : "male",
        track,
        hasLaptop: body.hasLaptop === "no" ? "no" : "yes",
        quranSkill: String(body.quranSkill || "fluent").slice(0, 40),
        englishSkill: String(body.englishSkill || "basic").slice(0, 40),
        education: String(body.education || "").trim().slice(0, 200),
      },
    });

    let gateway;
    try {
      gateway = await initSSLCommerzPayment({
        tranId,
        amount,
        currency,
        productName: course.name,
        cusName: fullName,
        cusEmail: email,
        cusPhone: phone,
      });
    } catch (err) {
      await PaymentModel.updateOne({ _id: payment._id }, { $set: { status: "FAILED", notes: `Gateway init failed: ${err.message}` } });
      console.error("SSLCommerz init error:", err.message);
      return bad("পেমেন্ট গেটওয়েতে সংযোগ করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", 502);
    }

    await PaymentModel.updateOne(
      { _id: payment._id },
      { $set: { "rawResponse.sessionkey": gateway.sessionkey, "rawResponse.initStatus": gateway.status } }
    );

    return NextResponse.json({ success: true, tranId, amount, gatewayUrl: gateway.gatewayUrl });
  } catch (error) {
    console.error("Payment init error:", error);
    return bad("পেমেন্ট শুরু করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", 500);
  }
}
