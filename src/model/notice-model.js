import mongoose, { Schema } from "mongoose";

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    track: {
      type: String,
      enum: ["all", "TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN"],
      default: "all",
      index: true,
    },
    instructorName: {
      type: String,
      default: "ফজর একাডেমি ফ্যাকাল্টি",
      trim: true,
    },
    instructorEmail: {
      type: String,
      default: "instructor@fajracademy.io",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ track: 1, createdAt: -1 });

export const NoticeModel =
  mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
