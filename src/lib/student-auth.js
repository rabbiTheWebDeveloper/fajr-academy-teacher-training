import { headers } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * Resolve the signed-in user from the auth_token cookie.
 *
 * Earlier versions trusted `x-user-id` / `x-user-role` request headers, which any
 * client can send — that allowed impersonating any trainee. Only the signed JWT
 * cookie is trusted now, verified with the same key as the rest of the app.
 */
export async function getStudentAuth(request) {
  let token = request?.cookies?.get?.("auth_token")?.value;

  if (!token) {
    let cookieHeader = request?.headers?.get?.("cookie");
    if (!cookieHeader) {
      try {
        cookieHeader = (await headers()).get("cookie");
      } catch {}
    }
    token = (cookieHeader || "").match(/(?:^|;\s*)auth_token=([^;]+)/)?.[1];
  }

  if (!token) return { userId: null, userRole: null };

  const payload = await verifyToken(token);
  if (!payload?.id) return { userId: null, userRole: null };

  return { userId: payload.id, userRole: payload.role, email: payload.email, track: payload.track };
}
