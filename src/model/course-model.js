import mongoose, { Schema } from "mongoose";

// Sub-schema for individual lessons in a curriculum module
const lessonSchema = new Schema(
  {
    lessonNo: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "৪৫ মিনিট",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Sub-schema for curriculum modules / weekly sessions
const moduleSchema = new Schema(
  {
    moduleNo: {
      type: Number,
      required: true,
      default: 1,
    },
    sessionBadge: {
      type: String,
      default: "", // "SESSION ORIENTATION", "SESSION 01", "SESSION 02", "SESSION 03", "SESSION FINAL"
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    themeQuote: {
      type: String,
      default: "",
    },
    trainerName: {
      type: String,
      default: "",
      trim: true,
    },
    trainerRole: {
      type: String,
      default: "",
      trim: true,
    },
    trainerQualifications: {
      type: String,
      default: "",
      trim: true,
    },
    sessionDate: {
      type: String,
      default: "",
      trim: true,
    },
    sessionTime: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: String,
      default: "১ ঘণ্টা",
    },
    liveDate: {
      type: String,
      default: "",
    },
    topics: {
      type: [String],
      default: [],
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { _id: true }
);

// Sub-schema for learning resources / downloadable study materials
const resourceSchema = new Schema(
  {
    resourceId: {
      type: String,
      default: () => `RES-${Date.now().toString().slice(-4)}`,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "কুরআন শিক্ষা ও তাজবীদ", // "টিচিং পেডাগজি", "লেসন প্ল্যান", "ডিজিটাল স্কিলস", "লার্নার সাইকোলজি", "সার্টিফিকেশন"
    },
    format: {
      type: String,
      default: "PDF", // "PDF", "DOCX", "SLIDES", "VIDEO", "DRIVE", "ZIP"
    },
    size: {
      type: String,
      default: "2.5 MB",
    },
    desc: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "https://drive.google.com/drive/folders/tot-fajr-resources",
    },
    isDownloadable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

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

    // Rich Curriculum Modules & Topics
    curriculum: {
      type: [moduleSchema],
      default: [],
    },

    // Downloadable Learning Resources & Books
    resources: {
      type: [resourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export {
  DEFAULT_TOT_CURRICULUM,
  WOMEN_TOT_CURRICULUM,
  MEN_TOT_CURRICULUM,
  DEFAULT_TOT_RESOURCES,
} from "@/constant/course-defaults";

export const CourseModel =
  mongoose.models.Course || mongoose.model("Course", courseSchema);

