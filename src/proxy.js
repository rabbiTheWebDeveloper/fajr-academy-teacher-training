import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ADMIN_ROLES, INSTRUCTOR_ROLES, TRAINEE_ROLES, accountTypeForRole, homeForRole } from "@/lib/roles";

/**
 * Next 16 Proxy (formerly middleware.js): first line of defence for every panel.
 * Each API route ALSO checks the session itself (src/lib/api-auth.js), so this file
 * is about fast redirects for pages and early 401/403s for APIs.
 */

// Trainee ("TOT") panel pages — trainee accounts only (admins / instructors have their own
// panels and no TOT record). /id-card is also open to staff, to view a trainee's card.
const TRAINEE_PAGES = ["/dashboard", "/classes", "/materials", "/payments", "/results"];
const SHARED_PAGES = ["/id-card"];

const startsWithAny = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function rule(pathname) {
  if (startsWithAny(pathname, ["/api/admin"])) return { api: true, roles: ADMIN_ROLES };
  if (startsWithAny(pathname, ["/api/instructor"])) return { api: true, roles: INSTRUCTOR_ROLES };
  if (startsWithAny(pathname, ["/api/tot"])) return { api: true, roles: TRAINEE_ROLES };
  if (startsWithAny(pathname, ["/admin"])) return { api: false, roles: ADMIN_ROLES };
  if (startsWithAny(pathname, ["/instructor"])) return { api: false, roles: INSTRUCTOR_ROLES };
  if (startsWithAny(pathname, TRAINEE_PAGES)) return { api: false, roles: TRAINEE_ROLES, quiet: true };
  if (startsWithAny(pathname, SHARED_PAGES)) return { api: false, roles: null };
  return null;
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const r = rule(pathname);
  if (!r) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  const verified = token ? await verifyToken(token) : null;
  // A token whose role has no panel (e.g. an old "staff" account) counts as signed out.
  const payload = verified?.id && accountTypeForRole(verified.role) ? verified : null;

  if (!payload) {
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
    // Staff opening a trainee page simply land on their own panel (no error banner).
    const home = new URL(homeForRole(payload.role), request.url);
    if (!r.quiet) home.searchParams.set("error", "no_access");
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
