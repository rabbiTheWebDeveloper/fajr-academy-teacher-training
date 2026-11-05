/**
 * Server-only helpers for the admin pages (imported by layout.jsx / page.jsx files only).
 * The API routes enforce the same rules with requirePermission (src/lib/api-auth.js); this
 * is the page-side half, so a role without access never even renders the screen.
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/roles";
import { resolveAdminAccess } from "@/service/access-service";
import {
  DEFAULT_ADMIN_LABEL,
  DEFAULT_ADMIN_PERMISSIONS,
  SUPER_ADMIN_LABEL,
  hasPermission,
} from "@/lib/rbac";

/**
 * The signed-in admin's access, read from the database once per request (layout + page share it).
 * → { access }  |  { reason: "unauthenticated" | "forbidden" | "inactive" }
 * If the database is unreachable the shell is built from the token with the default admin
 * permissions and `degraded: true`: pages then show their own "database unavailable" banner,
 * and since every query needs that same database, no data can be reached this way.
 */
export const getAdminAccess = cache(async () => {
  const session = await getSessionUser();
  if (!session?.id) return { reason: "unauthenticated" };
  if (!ADMIN_ROLES.includes(session.role)) return { reason: "forbidden", role: session.role };

  try {
    return await resolveAdminAccess(session);
  } catch (error) {
    console.error("Admin access lookup failed (database unreachable):", error?.message || error);
    const isSuper = session.role === "super-admin";
    return {
      degraded: true,
      access: {
        id: String(session.id),
        email: session.email || "",
        fullName: session.fullName || session.email || "",
        role: session.role,
        isSuper,
        roleId: null,
        roleName: "",
        roleLabel: isSuper ? SUPER_ADMIN_LABEL : DEFAULT_ADMIN_LABEL,
        permissions: isSuper ? [] : DEFAULT_ADMIN_PERMISSIONS,
      },
    };
  }
});

/**
 * Page guard: signed in as an admin AND allowed `action` on `module` (a string or "any of" array).
 * Not signed in → login. Signed in without the permission → back to the dashboard with a notice.
 * Returns the access object.
 */
export async function requireAdminPage(module, action = "read") {
  const { access } = await getAdminAccess();
  if (!access) redirect("/login?redirect=/admin");
  if (!hasPermission(access, module, action)) redirect("/admin?error=no_access");
  return access;
}
