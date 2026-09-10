import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      default: "কোর্স ব্যাচ",
      trim: true,
    },
    track: {
      type: String,
      default: "general", // "men", "women", "general"
      index: true,
    },
    summary: {
      type: String,
      default: "",
    },
    fee: {
      type: Number,
      default: 1000,
    },
    regularFee: {
      type: Number,
      default: 2500,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    orientationDate: {
      type: String,
      default: "২০ সেপ্টেম্বর ২০২৬",
    },
    orientationTime: {
      type: String,
      default: "রাত ৮:০০ টা – ৯:৩০ টা",
    },
    routine: {
      type: String,
      default: "সপ্তাহে ৩ দিন (রাত ৮:০০)",
    },
    duration: {
      type: String,
      default: "১ মাস (৪টি প্রফেশনাল সেশন)",
    },
    meetLink: {
      type: String,
      default: "https://meet.google.com/tot-fajr-room",
    },
    whatsappLink: {
      type: String,
      default: "https://chat.whatsapp.com/tot-fajr-community",
    },
    instructor: {
      type: String,
      default: "ফজর একাডেমি ফ্যাকাল্টি",
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    maxSeats: {
      type: Number,
      default: 60,
    },
    status: {
      type: String,
      enum: ["Active & Enrolling", "Upcoming", "Closed"],
      default: "Active & Enrolling",
    },
    perks: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    videoUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const CourseModel =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
