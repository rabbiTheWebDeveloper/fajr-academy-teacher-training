import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ADMIN_ROLES, INSTRUCTOR_ROLES, TRAINEE_ROLES, isAdminRole } from "@/lib/roles";

/**
 * Role groups (see src/lib/roles.js). Every API route checks the session itself
 * (not only proxy.js), so a proxy bypass or a mis-typed matcher can never expose data.
 */
export { ADMIN_ROLES, INSTRUCTOR_ROLES, TRAINEE_ROLES, isAdminRole };

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: "অনুগ্রহ করে লগইন করুন। আপনার সেশন পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে।" },
    { status: 401 }
  );

const forbidden = () =>
  NextResponse.json(
    { success: false, message: "এই কাজটি করার অনুমতি আপনার অ্যাকাউন্টে নেই।" },
    { status: 403 }
  );

function readToken(request) {
  // NextRequest exposes parsed cookies; fall back to the raw header for plain Requests.
  const fromCookies = request?.cookies?.get?.("auth_token")?.value;
  if (fromCookies) return fromCookies;
  const header = request?.headers?.get?.("cookie") || "";
  return header.match(/(?:^|;\s*)auth_token=([^;]+)/)?.[1] || null;
}

/**
 * const auth = await requireAuth(request, ADMIN_ROLES)
 * if (auth.error) return auth.error
 * auth.session → { id, email, fullName, role, track }
 *
 * Pass no roles to accept any signed-in user.
 */
export async function requireAuth(request, roles) {
  const token = readToken(request);
  if (!token) return { error: unauthorized() };

  const session = await verifyToken(token);
  if (!session?.id) return { error: unauthorized() };

  if (roles?.length && !roles.includes(session.role)) return { error: forbidden() };

  return { session };
}

/** Uniform 500 response that never leaks stack traces to the browser. */
export function serverError(error, context = "API") {
  console.error(`${context} error:`, error);
  return NextResponse.json(
    { success: false, message: "সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" },
    { status: 500 }
  );
}

/** Only same-site relative paths, so ?redirect= can never send users off-site. */
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
