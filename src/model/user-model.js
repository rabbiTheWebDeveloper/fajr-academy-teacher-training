import mongoose, { Schema } from "mongoose";
import { applyAccountSecurity, baseAccountFields } from "./account-schema";

/**
 * Admin accounts — collection "users".
 * Instructors live in InstructorModel ("instructors") and paying trainees in TotModel ("tots").
 * Older databases kept everyone here; src/service/account-migration.js moves those
 * documents (same _id) to their own collection on the first connection.
 */
export const USER_ROLES = ["admin", "super-admin"];
// Roles some old records carry. They have no panel access and are never created anymore.
const LEGACY_ROLES = ["staff", "organizer"];

const userSchema = new Schema(
  {
    ...baseAccountFields(),
    role: { type: String, enum: [...USER_ROLES, ...LEGACY_ROLES], default: "admin", index: true },
    designation: { type: String, trim: true, default: "System Administrator" },
    department: { type: String, trim: true, default: "Administration" },
    employeeId: { type: String, trim: true, default: "" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    permissions: [{ type: String }],
    // Custom access role (RoleModel) for role "admin"; null = the default admin permissions.
    // Ignored for super-admins, who can do everything.
    accessRole: { type: Schema.Types.ObjectId, ref: "Role", default: null, index: true },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

userSchema.index({ createdAt: -1 });
applyAccountSecurity(userSchema);

export const UserModel = mongoose.models.User ?? mongoose.model("User", userSchema);
