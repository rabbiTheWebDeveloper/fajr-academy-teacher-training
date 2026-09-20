import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Protect Admin Page Routes (/admin, /admin/users, /admin/payments, etc.)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "auth_required");
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid or expired JWT token: clear cookie and redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "session_expired");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      return response;
    }

    // Role Enforcement: Only "admin" and "super-admin" are allowed in the /admin area
    const allowedRoles = ["admin", "super-admin"];
    if (!allowedRoles.includes(payload.role)) {
      if (payload.role === "instructor") {
        return NextResponse.redirect(new URL("/instructor?error=admin_only", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard?error=admin_only", request.url));
    }

    return NextResponse.next();
  }

  // 2. Protect Admin API Routes (/api/admin/...)
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "অননুমোদিত এক্সেস! অ্যাডমিন প্যানেল ব্যবহারের জন্য অনুগ্রহ করে লগইন করুন।",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.json(
        {
          success: false,
          message: "মেয়াদোত্তীর্ণ বা অবৈধ সেশন টোকেন। অনুগ্রহ করে পুনরায় লগইন করুন।",
        },
        { status: 401 }
      );
      response.cookies.delete("auth_token");
      return response;
    }

    const allowedRoles = ["admin", "super-admin"];
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "অ্যাডমিন অনুমতি নেই। এই তথ্য পরিবর্তন বা পরিদর্শনের অধিকার আপনার অ্যাকাউন্টে নেই।",
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
