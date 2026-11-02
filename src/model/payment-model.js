import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    tranId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    valId: {
      type: String,
      default: "",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 1000,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    status: {
      type: String,
      // VALID = verified with the SSLCommerz validation API (or verified by an admin).
      enum: ["VALID", "PENDING", "FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED", "INVALID", "REFUNDED"],
      default: "PENDING",
      index: true,
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
      default: "",
    },
    userPhone: {
      type: String,
      default: "",
    },
    track: {
      type: String,
      default: "TOT-MEN",
    },
    cardType: {
      type: String,
      default: "",
    },
    bankTranId: {
      type: String,
      default: "",
    },
    paymentGateway: {
      type: String,
      default: "sslcommerz",
    },
    rawResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // New-applicant details captured before payment. The password is stored only as a
    // scrypt hash (passwordHash) and removed once the account is created.
    registrationData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    // "registration" = new applicant; "course-purchase" = signed-in user buying a course;
    // "manual" = recorded by an admin (bKash/Nagad/cash).
    purpose: {
      type: String,
      enum: ["registration", "course-purchase", "manual"],
      default: "registration",
      index: true,
    },
    courseId: {
      type: String,
      default: "",
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "SSLCOMMERZ",
    },
    // Set exactly once, atomically, when the payment moves to VALID.
    finalizedAt: {
      type: Date,
      default: null,
    },
    // Set once when the post-payment auto-login cookie is issued, so a replayed
    // success URL can never log anyone in again.
    loginIssuedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
    },
    refund: {
      refId: { type: String, default: "" },
      amount: { type: Number, default: 0 },
      status: { type: String, default: "" },
      remarks: { type: String, default: "" },
      requestedAt: { type: Date, default: null },
      requestedBy: { type: String, default: "" },
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

paymentSchema.index({ userEmail: 1, status: 1 });

export const PaymentModel =
  mongoose.models.Payment ?? mongoose.model("Payment", paymentSchema);
