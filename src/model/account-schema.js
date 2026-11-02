import { hashPassword, isHashedPassword } from "@/lib/password";

/**
 * Pieces shared by the three account models:
 *   UserModel (admins) · InstructorModel · TotModel (paying trainees).
 * Each lives in its own collection; e-mail uniqueness ACROSS them is enforced by
 * src/service/account-service.js (emailInUse / phoneInUse) before any account is created.
 */

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""];
export const ACCOUNT_TRACKS = ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", ""];

/** Login + profile fields every account has. Returns fresh objects for each schema. */
export function baseAccountFields() {
  return {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, default: "", index: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  };
}

export const SAFE_ACCOUNT_SELECT = "-password -resetPasswordToken -resetPasswordExpires";

/**
 * Hash passwords on every write path (save, findOneAndUpdate, updateOne, updateMany) so no
 * route can persist a plain-text password, and never serialise the hash or reset tokens.
 */
export function applyAccountSecurity(schema) {
  schema.pre("save", async function () {
    if (this.isModified("password") && this.password && !isHashedPassword(this.password)) {
      this.password = await hashPassword(this.password);
    }
  });

  async function hashPasswordInUpdate() {
    const update = this.getUpdate();
    if (!update) return;
    for (const target of [update, update.$set, update.$setOnInsert]) {
      if (target && typeof target.password === "string" && target.password && !isHashedPassword(target.password)) {
        target.password = await hashPassword(target.password);
      }
    }
    this.setUpdate(update);
  }
  schema.pre("findOneAndUpdate", hashPasswordInUpdate);
  schema.pre("updateOne", hashPasswordInUpdate);
  schema.pre("updateMany", hashPasswordInUpdate);

  schema.set("toJSON", {
    transform(_doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    },
  });
}
