import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isResetTokenValid, resetPasswordWithToken } from "@/service/password-reset-service";

const json = (body, status = 200) => NextResponse.json(body, { status });
const MSG_INVALID = "এই রিসেট লিংকটি সঠিক নয় অথবা এর মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন লিংকের জন্য আবার অনুরোধ করুন।";
const MSG_SERVER = "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
const MSG_LIMIT = "অনেকবার চেষ্টা করা হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর আবার চেষ্টা করুন।";

const allowed = (request) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return rateLimit(`reset-ip:${ip}`, 30, 15 * 60 * 1000);
};

/** GET ?token= — lets the page show "link expired" before the user types a password. */
export async function GET(request) {
  try {
    if (!allowed(request)) return json({ success: false, valid: false, message: MSG_LIMIT }, 429);
    const token = request.nextUrl.searchParams.get("token") || "";
    const valid = await isResetTokenValid(token);
    return json({ success: true, valid, ...(valid ? {} : { message: MSG_INVALID }) });
  } catch (error) {
    console.error("Reset token check error:", error);
    return json({ success: false, valid: false, message: MSG_SERVER }, 500);
  }
}

/** POST { token, password } — set the new password and consume the link. */
export async function POST(request) {
  try {
    if (!allowed(request)) return json({ success: false, message: MSG_LIMIT }, 429);

    const body = await request.json().catch(() => ({}));
    const token = String(body.token || "");
    // Trimmed because the login route trims the password too.
    const password = String(body.password || "").trim();

    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ success: false, message: `পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।` }, 400);
    }
    if (password.length > 128) {
      return json({ success: false, message: "পাসওয়ার্ড সর্বোচ্চ ১২৮ অক্ষরের হতে পারে।" }, 400);
    }

    const result = await resetPasswordWithToken(token, password);
    if (!result.success) return json({ success: false, expired: true, message: MSG_INVALID }, 400);

    return json({
      success: true,
      email: result.email,
      message: "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।",
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return json({ success: false, message: MSG_SERVER }, 500);
  }
}
