import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { RoleModel } from "@/model/role-model";
import { ADMIN_ROLES } from "@/lib/roles";
import { isObjectId } from "@/lib/query-helpers";
import { DEFAULT_ADMIN_LABEL, DEFAULT_ADMIN_PERMISSIONS, SUPER_ADMIN_LABEL, normalizePermissions } from "@/lib/rbac";

/**
 * What the signed-in admin account may do — read from the DATABASE on every check, never
 * from the JWT. The token lives 30 days, so trusting its `role` would let a demoted or
 * deactivated admin keep full (even super-admin) powers until it expired.
 *
 * resolveAdminAccess(tokenPayload) →
 *   { access }                  plain, serialisable:
 *       { id, email, fullName, role, isSuper, roleId, roleName, roleLabel, permissions }
 *   { reason }                  "unauthenticated" (account gone / not an admin collection record)
 *                               "forbidden"       (no admin panel role)
 *                               "inactive"        (account switched off)
 * Throws when the database is unreachable (callers decide how to fail).
 */
export async function resolveAdminAccess(session) {
  if (!session?.id || !isObjectId(session.id)) return { reason: "unauthenticated" };
  // The users collection only holds admins — a token for another account type never matches.
  if (!ADMIN_ROLES.includes(session.role)) return { reason: "forbidden" };

  await dbConnect();
  const user = await UserModel.findById(session.id).select("fullName email role isActive accessRole").lean();
  if (!user) return { reason: "unauthenticated" };
  if (!ADMIN_ROLES.includes(user.role)) return { reason: "forbidden" };
  if (user.isActive === false) return { reason: "inactive" };

  const isSuper = user.role === "super-admin";
  let permissions = DEFAULT_ADMIN_PERMISSIONS;
  let roleId = null;
  let roleName = "";

  if (!isSuper && user.accessRole) {
    const role = await RoleModel.findById(user.accessRole).select("name permissions").lean();
    // A role that vanished leaves the account with the least access, never the most.
    permissions = role ? normalizePermissions(role.permissions) : [];
    roleId = String(user.accessRole);
    roleName = role?.name || "";
  }

  return {
    access: {
      id: String(user._id),
      email: user.email || "",
      fullName: user.fullName || "",
      role: user.role,
      isSuper,
      roleId,
      roleName,
      roleLabel: isSuper ? SUPER_ADMIN_LABEL : roleName || DEFAULT_ADMIN_LABEL,
      permissions: isSuper ? [] : permissions, // super-admins are checked by `isSuper`, not by this list
    },
  };
}
