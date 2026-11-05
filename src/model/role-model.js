import mongoose, { Schema } from "mongoose";

/**
 * Custom access roles for admin accounts — collection "roles".
 * A super-admin creates them (Admin → অ্যাডমিন ইউজার → রোল ও পারমিশন) and assigns one to an
 * "admin" account via UserModel.accessRole. `permissions` holds `module:action` strings
 * (see src/lib/rbac.js); "delete" is never stored — it is super-admin only.
 */
const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // Lower-cased copy of `name`: makes the uniqueness check case-insensitive.
    nameKey: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true, default: "", maxlength: 200 },
    permissions: [{ type: String }],
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false, collection: "roles" }
);

export const RoleModel = mongoose.models.Role ?? mongoose.model("Role", roleSchema);
