import mongoose, { Schema } from "mongoose";

const scoreSchema = new Schema(
  {
    makhrajTajweed: {
      type: Number,
      min: 0,
      max: 25,
      default: 0,
    },
    childPsychologyPedagogy: {
      type: Number,
      min: 0,
      max: 25,
      default: 0,
    },
    digitalClassroomTools: {
      type: Number,
      min: 0,
      max: 25,
      default: 0,
    },
    microTeachingDemo: {
      type: Number,
      min: 0,
      max: 25,
      default: 0,
    },
  },
  { _id: false }
);

const evaluationSchema = new Schema(
  {
    traineeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    traineeName: {
      type: String,
      required: true,
      trim: true,
    },
    traineeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    traineePhone: {
      type: String,
      default: "",
      trim: true,
    },
    track: {
      type: String,
      enum: ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", "general"],
      default: "TOT-MEN",
      index: true,
    },
    courseId: {
      type: String,
      default: "TOT-MEN",
      index: true,
    },
    instructorId: {
      type: String,
      default: "",
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
    scores: {
      type: scoreSchema,
      default: () => ({}),
    },
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C", "F"],
      default: "B",
      index: true,
    },
    qualificationStatus: {
      type: String,
      enum: ["hired", "certified", "in-review", "retake-needed"],
      default: "in-review",
      index: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to calculate Grade and Qualification from Total Score
export function calculateGradeAndStatus(total) {
  let grade = "F";
  let status = "retake-needed";

  if (total >= 85) {
    grade = "A+";
    status = "hired"; // 80+ qualifies for immediate Fajr Academy hiring
  } else if (total >= 75) {
    grade = "A";
    status = "certified";
  } else if (total >= 65) {
    grade = "B+";
    status = "certified";
  } else if (total >= 50) {
    grade = "B";
    status = "in-review";
  } else if (total >= 40) {
    grade = "C";
    status = "retake-needed";
  } else {
    grade = "F";
    status = "retake-needed";
  }

  return { grade, status };
}

evaluationSchema.index({ traineeId: 1, courseId: 1 });
evaluationSchema.index({ track: 1, totalScore: -1 });

export const EvaluationModel =
  mongoose.models.Evaluation || mongoose.model("Evaluation", evaluationSchema);
