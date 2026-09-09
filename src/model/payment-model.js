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
      enum: ["VALID", "PENDING", "FAILED", "CANCELLED", "UNATTEMPTED"],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ userEmail: 1, status: 1 });

export const PaymentModel =
  mongoose.models.Payment ?? mongoose.model("Payment", paymentSchema);
