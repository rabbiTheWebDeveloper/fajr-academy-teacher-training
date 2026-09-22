import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseName: {
      type: String,
      trim: true,
      default: "",
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    track: {
      type: String,
      default: "TOT-MEN",
      index: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "male",
    },
    status: {
      type: String,
      enum: ["enrolled", "active", "completed", "dropped", "pending"],
      default: "active",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "free"],
      default: "paid",
      index: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    tranId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    attendanceCount: {
      type: Number,
      default: 0,
    },
    evaluationScore: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: "",
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique compound index: a user can only be enrolled once per courseId
participantSchema.index({ user: 1, courseId: 1 }, { unique: true });
participantSchema.index({ courseId: 1, status: 1 });
participantSchema.index({ userEmail: 1, courseId: 1 });

export const ParticipantModel =
  mongoose.models.Participant ?? mongoose.model("Participant", participantSchema);
