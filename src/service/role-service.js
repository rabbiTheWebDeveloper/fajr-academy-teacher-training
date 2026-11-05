import { RoleModel } from "@/model/role-model";
import { UserModel } from "@/model/user-model";
import { normalizePermissions } from "@/lib/rbac";

/** Plain, client-safe view of a role document (lean or toObject()). */
export const roleView = (role, userCount = 0) => ({
  _id: String(role._id),
  name: role.name,
  description: role.description || "",
  permissions: normalizePermissions(role.permissions),
  userCount,
  createdBy: role.createdBy || "",
  createdAt: role.createdAt ? new Date(role.createdAt).toISOString() : "",
  updatedAt: role.updatedAt ? new Date(role.updatedAt).toISOString() : "",
});

/** Every custom role (oldest first) with the number of admin accounts that hold it. */
export async function listRolesWithCounts() {
  const [roles, counts] = await Promise.all([
    RoleModel.find().sort({ createdAt: 1 }).lean(),
    UserModel.aggregate([{ $match: { accessRole: { $ne: null } } }, { $group: { _id: "$accessRole", n: { $sum: 1 } } }]),
  ]);
  const byRole = new Map(counts.map((c) => [String(c._id), c.n]));
  return roles.map((r) => roleView(r, byRole.get(String(r._id)) || 0));
}
