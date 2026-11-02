import mongoose, { Schema } from "mongoose";
import { ACCOUNT_TRACKS, BLOOD_GROUPS, applyAccountSecurity, baseAccountFields } from "./account-schema";

/**
 * Instructor (trainer) accounts — collection "instructors". Created by admins only
 * (Admin → Instructors); they sign in to the /instructor panel.
 */
const instructorSchema = new Schema(
  {
    ...baseAccountFields(),
    // Fixed: everything in this collection is an instructor. Kept on the document so the
    // session token and role checks work the same way for all account types.
    role: { type: String, enum: ["instructor"], default: "instructor", index: true },
    track: { type: String, enum: ACCOUNT_TRACKS, default: "TOT-MEN", index: true },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "male" },
    designation: { type: String, trim: true, default: "TOT Master Trainer" },
    department: { type: String, trim: true, default: "Teacher Training Division" },
    employeeId: { type: String, trim: true, default: "" },
    emergencyContactNumber: { type: String, trim: true, default: "" },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: "" },
    specialization: { type: String, default: "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ" },
    experienceYears: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    education: { type: String, default: "" },
    bio: { type: String, default: "" },
    createdBy: { type: String, default: "" }, // admin e-mail
  },
  { timestamps: true, versionKey: false, collection: "instructors" }
);

instructorSchema.index({ createdAt: -1 });
instructorSchema.index({ isActive: 1, rating: -1 });
applyAccountSecurity(instructorSchema);

export const InstructorModel = mongoose.models.Instructor ?? mongoose.model("Instructor", instructorSchema);
