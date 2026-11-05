import mongoose, { Schema } from "mongoose";

/**
 * One browser / installed app that agreed to receive push notifications.
 * A device belongs to whoever enabled notifications on it last (the endpoint is unique),
 * and it is removed on logout or as soon as the push service reports it gone (404/410).
 */
const pushSubscriptionSchema = new Schema(
  {
    endpoint: { type: String, required: true, unique: true, trim: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    accountId: { type: Schema.Types.ObjectId, required: true },
    accountType: { type: String, enum: ["admin", "instructor", "tot"], required: true },
    userAgent: { type: String, default: "", maxlength: 300 },
    lastSuccessAt: { type: Date },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ accountType: 1, accountId: 1 });

export const PushSubscriptionModel =
  mongoose.models.PushSubscription || mongoose.model("PushSubscription", pushSubscriptionSchema);
