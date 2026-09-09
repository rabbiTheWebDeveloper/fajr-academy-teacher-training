import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    tranId: { type: String, required: true, unique: true, index: true },
    valId: { type: String, default: "" },
    amount: { type: Number, required: true, default: 1000 },
    currency: { type: String, default: "BDT" },
    status: {
      type: String,
      enum: ["PENDING", "VALID", "FAILED", "CANCELLED", "UNATTEMPTED"],
      default: "PENDING",
      index: true,
    },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, default: "" },
    userPhone: { type: String, default: "" },
    track: { type: String, default: "" },
    paymentMethod: { type: String, default: "SSLCOMMERZ" },
    cardType: { type: String, default: "" },
    bankTranId: { type: String, default: "" },
    gatewayResponse: { type: Schema.Types.Mixed, default: {} },
    rawPayload: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ createdAt: -1 });

export const PaymentModel =
  mongoose.models.Payment ?? mongoose.model("Payment", paymentSchema);
