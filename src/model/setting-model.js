import mongoose, { Schema } from "mongoose";

const settingSchema = new Schema(
  {
    key: {
      type: String,
      default: "system_settings",
      unique: true,
      index: true,
    },
    // Institute & General Info
    siteTitle: {
      type: String,
      default: "ফজর একাডেমি | টিচার্স ট্রেনিং (TOT) প্রোগ্রাম",
    },
    instituteName: {
      type: String,
      default: "Fajr Academy",
    },
    tagline: {
      type: String,
      default: "Empowering Next-Generation Quran & Islamic Teachers Worldwide",
    },
    officeAddress: {
      type: String,
      default: "ঢাকা, বাংলাদেশ",
    },

    // Academic & Admission
    coursePrice: {
      type: Number,
      default: 1000,
    },
    regularCoursePrice: {
      type: Number,
      default: 2500,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    currentBatch: {
      type: String,
      default: "TOT Batch 014 (September 2026)",
    },
    admissionStatus: {
      type: String,
      enum: ["open", "closed", "waitlist"],
      default: "open",
    },
    maxSeatsPerBatch: {
      type: Number,
      default: 60,
    },
    certificatePrefix: {
      type: String,
      default: "FJR-TOT-2026",
    },
    orientationDate: {
      type: String,
      default: "২০ সেপ্টেম্বর ২০২৬",
    },
    orientationTime: {
      type: String,
      default: "রাত ৮:০০ টা – ৯:৩০ টা",
    },

    // Payment Gateway (SSLCommerz, bKash/Nagad)
    sslcommerzMode: {
      type: String,
      enum: ["sandbox", "live"],
      default: "live",
    },
    sslStoreId: {
      // Deprecated: gateway credentials live in env vars (SSLCOMMERZ_*), never in the DB.
      type: String,
      default: "",
    },
    sslStorePassword: {
      type: String,
      default: "",
      select: false,
    },
    autoApprovePayment: {
      type: Boolean,
      default: true,
    },
    bkashMerchantNumber: {
      type: String,
      default: "01410764581",
    },
    nagadMerchantNumber: {
      type: String,
      default: "01410764581",
    },

    // Support & Communication
    helplinePhone: {
      type: String,
      default: "01410764581",
    },
    supportEmail: {
      type: String,
      default: "support@fajracademy.io",
    },
    whatsappSupport: {
      type: String,
      default: "https://wa.me/8801410764581",
    },
    whatsappCommunityGroup: {
      type: String,
      default: "",
    },

    // System & Security
    adminNotificationEmail: {
      type: String,
      default: "admin@fajracademy.io",
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    emailNotificationEnabled: {
      type: Boolean,
      default: true,
    },

    // UI / Theme Preference
    defaultTheme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  {
    timestamps: true,
  }
);

export const SettingModel =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
