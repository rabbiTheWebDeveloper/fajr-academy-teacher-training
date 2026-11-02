import mongoose, { Schema } from "mongoose";
import { ACCOUNT_TRACKS, BLOOD_GROUPS, applyAccountSecurity, baseAccountFields } from "./account-schema";

/**
 * TOT trainee accounts — collection "tots". Everyone who applies and pays (online via
 * SSLCommerz, or offline recorded by an admin) gets a document here; Participant,
 * Evaluation and Payment records point to it. Sign-in goes to the trainee panel (/dashboard).
 */
export const TOT_ROLES = ["teacher", "student", "participant"];

const totSchema = new Schema(
  {
    ...baseAccountFields(),
    role: { type: String, enum: TOT_ROLES, default: "teacher", index: true },
    track: { type: String, enum: ACCOUNT_TRACKS, default: "TOT-MEN", index: true },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "male" },
    emergencyContactNumber: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "TOT Trainee Teacher" },
    department: { type: String, trim: true, default: "Teacher Training Division" },
    employeeId: { type: String, trim: true, default: "" },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: "" },
    hasLaptop: { type: String, enum: ["yes", "no", ""], default: "yes" },
    quranSkill: { type: String, default: "fluent" },
    englishSkill: { type: String, default: "basic" },
    education: { type: String, default: "" },
    bio: { type: String, default: "" },

    // Payment summary (the full history is in the payments collection).
    paymentStatus: { type: String, enum: ["paid", "pending", "failed", "free"], default: "pending", index: true },
    paidAmount: { type: Number, default: 0 },
    tranId: { type: String, default: "", index: true },
    paymentGateway: { type: String, default: "sslcommerz" },
    enrolledAt: { type: Date, default: null },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    enrolledCourseIds: [{ type: String }],
  },
  { timestamps: true, versionKey: false, collection: "tots" }
);

totSchema.index({ createdAt: -1 });
totSchema.index({ track: 1, paymentStatus: 1 });
applyAccountSecurity(totSchema);

export const TotModel = mongoose.models.Tot ?? mongoose.model("Tot", totSchema);
