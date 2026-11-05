import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { ADMIN_ROLES, INSTRUCTOR_ROLES, TRAINEE_ROLES, isAdminRole } from "@/lib/roles";
import { hasPermission } from "@/lib/rbac";
import { resolveAdminAccess } from "@/service/access-service";

/**
 * Role groups (see src/lib/roles.js). Every API route checks the session itself
 * (not only proxy.js), so a proxy bypass or a mis-typed matcher can never expose data.
 */
export { ADMIN_ROLES, INSTRUCTOR_ROLES, TRAINEE_ROLES, isAdminRole };

export const MSG_DELETE_DENIED = "মুছে ফেলার অনুমতি শুধু সুপার-অ্যাডমিনের আছে।";
export const MSG_SUPER_ONLY = "এই কাজটি শুধু সুপার-অ্যাডমিন করতে পারবেন।";
export const MSG_PERMISSION_DENIED = "এই কাজটি করার অনুমতি আপনার রোলে দেওয়া হয়নি। সুপার-অ্যাডমিনের সাথে যোগাযোগ করুন।";
const MSG_INACTIVE = "আপনার অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।";

const unauthorized = () =>
  NextResponse.json(
    { success: false, message: "অনুগ্রহ করে লগইন করুন। আপনার সেশন পাওয়া যায়নি বা মেয়াদ শেষ হয়ে গেছে।" },
    { status: 401 }
  );

const forbidden = (message = "এই কাজটি করার অনুমতি আপনার অ্যাকাউন্টে নেই।") =>
  NextResponse.json({ success: false, message }, { status: 403 });

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

/**
 * Admin-panel guard with per-module permissions.
 *
 *   const auth = await requirePermission(request, "payments", "update")
 *   if (auth.error) return auth.error
 *   auth.session → the token payload, with `role` taken from the database
 *   auth.access  → { isSuper, role, permissions, roleLabel, … } (see access-service.js)
 *
 * `module` may be an array meaning "any of these". The "delete" action and the "users"
 * module always require a super-admin, whatever a custom role says (see rbac.hasPermission).
 * Authority comes from the database, not from the 30-day token, and a failed lookup denies.
 */
async function resolveAdminRequest(request) {
  const base = await requireAuth(request, ADMIN_ROLES);
  if (base.error) return base;

  let resolved;
  try {
    resolved = await resolveAdminAccess(base.session);
  } catch (error) {
    return { error: serverError(error, "Admin access check") };
  }
  if (resolved.reason === "unauthenticated") return { error: unauthorized() };
  if (resolved.reason === "inactive") return { error: forbidden(MSG_INACTIVE) };
  if (!resolved.access) return { error: forbidden() };

  const { access } = resolved;
  return { session: { ...base.session, role: access.role }, access };
}

export async function requirePermission(request, module, action = "read") {
  const auth = await resolveAdminRequest(request);
  if (auth.error) return auth;
  if (!hasPermission(auth.access, module, action)) {
    return { error: forbidden(action === "delete" ? MSG_DELETE_DENIED : MSG_PERMISSION_DENIED) };
  }
  return auth;
}

/** Super-admin only: admin users, roles and every delete. */
export async function requireSuperAdmin(request, message = MSG_SUPER_ONLY) {
  const auth = await resolveAdminRequest(request);
  if (auth.error) return auth;
  return auth.access.isSuper ? auth : { error: forbidden(message) };
}

/**
 * Deleting from the instructor panel (which admins may also open):
 *   "any"  → a super-admin (verified in the database): may delete anything
 *   "own"  → an instructor: may delete only what they created
 *   "none" → any other admin: deleting is super-admin only
 */
export async function deleteScope(session) {
  if (!isAdminRole(session?.role)) return "own";
  try {
    const { access } = await resolveAdminAccess(session);
    return access?.isSuper ? "any" : "none";
  } catch {
    return "none"; // can't verify → don't allow
  }
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
