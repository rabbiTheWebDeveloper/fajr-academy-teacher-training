import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { requestPasswordReset, RESET_TTL_MINUTES } from "@/service/password-reset-service";

const json = (body, status = 200) => NextResponse.json(body, { status });

/** POST { identifier } — e-mail a password-reset link to the matching account. */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = String(body.identifier || body.email || body.phone || "").trim();

    if (!identifier) {
      return json({ success: false, message: "আপনার ইমেইল অথবা মোবাইল নম্বর লিখুন।" }, 400);
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (
      !rateLimit(`forgot-ip:${ip}`, 10, 15 * 60 * 1000) ||
      !rateLimit(`forgot-id:${identifier.toLowerCase()}`, 3, 15 * 60 * 1000)
    ) {
      return json(
        { success: false, message: "অনেকবার অনুরোধ করা হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন।" },
        429
      );
    }

    const result = await requestPasswordReset(identifier);

    if (result.status === "not_found") {
      return json(
        { success: false, message: "এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। তথ্যটি পুনরায় যাচাই করুন।" },
        404
      );
    }
    if (result.status === "inactive") {
      return json(
        { success: false, message: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় রয়েছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।" },
        403
      );
    }
    if (result.status === "mail_failed") {
      return json(
        { success: false, message: "এই মুহূর্তে ইমেইল পাঠানো যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন অথবা সাপোর্ট হেল্পলাইনে যোগাযোগ করুন।" },
        503
      );
    }

    return json({
      success: true,
      maskedEmail: result.maskedEmail,
      expiresInMinutes: RESET_TTL_MINUTES,
      message: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।",
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return json({ success: false, message: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" }, 500);
  }
}
