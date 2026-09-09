import { NextResponse } from "next/server";
import { verifyUserLoginCredentials } from "@/queries/auth-queries";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, email, phone, password } = body;

    const loginId = (identifier || email || phone || "").trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "ইমেইল/মোবাইল নম্বর এবং পাসওয়ার্ড উভয়ই আবশ্যক।" },
        { status: 400 }
      );
    }

    const result = await verifyUserLoginCredentials(loginId, password);

    if (!result.success) {
      return NextResponse.json(result, { status: result.isUnpaid ? 402 : 401 });
    }

    // Sign JWT token
    const token = await signToken({
      id: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.user.role,
      track: result.user.track,
    });

    // Record session in SessionModel
    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent);
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "";

    const { createDatabaseSession } = await import("@/queries/auth-queries");
    await createDatabaseSession({
      userId: result.user.id,
      userEmail: result.user.email,
      token,
      role: result.user.role,
      track: result.user.track,
      userAgent,
      ipAddress,
      deviceType: isMobile ? "mobile" : "desktop",
    });

    const redirectUrl =
      result.user.role === "admin"
        ? "/admin"
        : result.user.role === "instructor"
        ? "/instructor"
        : "/dashboard";

    const response = NextResponse.json({
      success: true,
      message: "সফলভাবে লগইন হয়েছে!",
      user: result.user,
      redirectUrl,
    });

    // Set secure cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
