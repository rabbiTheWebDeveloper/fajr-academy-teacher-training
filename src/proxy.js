import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Next 16 Proxy (formerly middleware.js): first line of defence for every panel.
 * Each API route ALSO checks the session itself (src/lib/api-auth.js), so this file
 * is about fast redirects for pages and early 401/403s for APIs.
 */

const ADMIN = ["admin", "super-admin"];
const INSTRUCTOR = ["instructor", ...ADMIN];

// Trainee ("TOT") panel pages — any signed-in account may open them.
const TRAINEE_PAGES = ["/dashboard", "/classes", "/materials", "/payments", "/results", "/id-card"];

const startsWithAny = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function homeFor(role) {
  if (ADMIN.includes(role)) return "/admin";
  if (role === "instructor") return "/instructor";
  return "/dashboard";
}

function rule(pathname) {
  if (startsWithAny(pathname, ["/api/admin"])) return { api: true, roles: ADMIN };
  if (startsWithAny(pathname, ["/api/instructor"])) return { api: true, roles: INSTRUCTOR };
  if (startsWithAny(pathname, ["/api/tot"])) return { api: true, roles: null };
  if (startsWithAny(pathname, ["/admin"])) return { api: false, roles: ADMIN };
  if (startsWithAny(pathname, ["/instructor"])) return { api: false, roles: INSTRUCTOR };
  if (startsWithAny(pathname, TRAINEE_PAGES)) return { api: false, roles: null };
  return null;
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const r = rule(pathname);
  if (!r) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload?.id) {
    if (r.api) {
      const res = NextResponse.json(
        { success: false, message: "অনুগ্রহ করে লগইন করুন। আপনার সেশন পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে।" },
        { status: 401 }
      );
      if (token) res.cookies.delete("auth_token");
      return res;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    loginUrl.searchParams.set("reason", token ? "session_expired" : "auth_required");
    const res = NextResponse.redirect(loginUrl);
    if (token) res.cookies.delete("auth_token");
    return res;
  }

  if (r.roles && !r.roles.includes(payload.role)) {
    if (r.api) {
      return NextResponse.json(
        { success: false, message: "এই তথ্য দেখার বা পরিবর্তনের অনুমতি আপনার অ্যাকাউন্টে নেই।" },
        { status: 403 }
      );
    }
    const home = new URL(homeFor(payload.role), request.url);
    home.searchParams.set("error", "no_access");
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/dashboard/:path*",
    "/classes/:path*",
    "/materials/:path*",
    "/payments/:path*",
    "/results/:path*",
    "/id-card/:path*",
    "/api/admin/:path*",
    "/api/instructor/:path*",
    "/api/tot/:path*",
  ],
};
