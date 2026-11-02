import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    // Id in the collection named by accountType (users / instructors / tots).
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ["admin", "instructor", "tot"],
      default: "tot",
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      default: "teacher",
    },
    track: {
      type: String,
      default: "TOT-MEN",
    },
    userAgent: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup when session expires
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sessionSchema.index({ userId: 1, isValid: 1 });
sessionSchema.index({ userEmail: 1, isValid: 1 });

export const SessionModel =
  mongoose.models.Session ?? mongoose.model("Session", sessionSchema);
