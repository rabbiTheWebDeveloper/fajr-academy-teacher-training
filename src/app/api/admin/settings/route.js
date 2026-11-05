import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";
import { requirePermission, serverError } from "@/lib/api-auth";
import { gatewayMode, isGatewayConfigured } from "@/lib/sslcommerz";
import { pick } from "@/lib/query-helpers";

/**
 * Admin system settings. Gateway credentials are NOT stored or edited here any more —
 * they live in environment variables (SSLCOMMERZ_*), and this route only reports the
 * mode and whether they are configured.
 */
const EDITABLE = [
  "siteTitle",
  "instituteName",
  "tagline",
  "officeAddress",
  "coursePrice",
  "regularCoursePrice",
  "currentBatch",
  "admissionStatus",
  "maxSeatsPerBatch",
  "certificatePrefix",
  "orientationDate",
  "orientationTime",
  "bkashMerchantNumber",
  "nagadMerchantNumber",
  "helplinePhone",
  "supportEmail",
  "whatsappSupport",
  "whatsappCommunityGroup",
  "adminNotificationEmail",
  "registrationOpen",
  "emailNotificationEnabled",
  "defaultTheme",
];
const HIDDEN = "-sslStorePassword -sslStoreId -sslcommerzMode -__v";

const DEFAULTS = {
  key: "system_settings",
  siteTitle: "ফজর একাডেমি | টিচার্স ট্রেনিং (TOT) প্রোগ্রাম",
  instituteName: "Fajr Academy",
  tagline: "Empowering Next-Generation Quran & Islamic Teachers Worldwide",
  officeAddress: "ঢাকা, বাংলাদেশ",
  coursePrice: 1000,
  regularCoursePrice: 2500,
  currency: "BDT",
  currentBatch: "TOT Batch 014 (September 2026)",
  admissionStatus: "open",
  maxSeatsPerBatch: 60,
  certificatePrefix: "FJR-TOT-2026",
  orientationDate: "২০ সেপ্টেম্বর ২০২৬",
  orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
  bkashMerchantNumber: "01410764581",
  nagadMerchantNumber: "01410764581",
  helplinePhone: "01410764581",
  supportEmail: "support@fajracademy.io",
  whatsappSupport: "https://wa.me/8801410764581",
  whatsappCommunityGroup: "",
  adminNotificationEmail: "admin@fajracademy.io",
  registrationOpen: true,
  emailNotificationEnabled: true,
  defaultTheme: "light",
};

const gateway = () => ({ mode: gatewayMode(), configured: isGatewayConfigured() });
const plain = (v) => JSON.parse(JSON.stringify(v));

function validate(update) {
  for (const key of ["coursePrice", "regularCoursePrice", "maxSeatsPerBatch"]) {
    if (update[key] !== undefined) {
      const n = Number(update[key]);
      if (!Number.isFinite(n) || n < 0) return `${key} must be a non-negative number`;
      update[key] = n;
    }
  }
  if (update.admissionStatus !== undefined && !["open", "closed", "waitlist"].includes(update.admissionStatus)) return "admissionStatus is invalid";
  if (update.defaultTheme !== undefined && !["light", "dark"].includes(update.defaultTheme)) return "defaultTheme is invalid";
  for (const key of ["registrationOpen", "emailNotificationEnabled"]) {
    if (update[key] !== undefined) update[key] = Boolean(update[key]);
  }
  for (const key of ["whatsappSupport", "whatsappCommunityGroup"]) {
    if (update[key] && !/^https:\/\//.test(update[key])) return `${key} must start with https://`;
  }
  return null;
}

export async function GET(request) {
  const auth = await requirePermission(request, "settings", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    let settings = await SettingModel.findOne({ key: "system_settings" }).select(HIDDEN).lean();
    if (!settings) {
      await SettingModel.create(DEFAULTS);
      settings = await SettingModel.findOne({ key: "system_settings" }).select(HIDDEN).lean();
    }
    return NextResponse.json({ success: true, settings: plain(settings), gateway: gateway() });
  } catch (error) {
    return serverError(error, "Admin settings GET");
  }
}

export async function PUT(request) {
  const auth = await requirePermission(request, "settings", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const update = pick(await request.json(), EDITABLE);
    const problem = validate(update);
    if (problem) return NextResponse.json({ success: false, message: `সেটিংস সঠিক নয়: ${problem}` }, { status: 400 });

    const updated = await SettingModel.findOneAndUpdate(
      { key: "system_settings" },
      // Wipe any gateway credentials an older version stored in the database.
      { $set: update, $unset: { sslStorePassword: "", sslStoreId: "" } },
      { returnDocument: "after", upsert: true, runValidators: true }
    )
      .select(HIDDEN)
      .lean();

    return NextResponse.json({
      success: true,
      message: "সিস্টেম সেটিংস ডাটাবেসে সফলভাবে আপডেট করা হয়েছে!",
      settings: plain(updated),
      gateway: gateway(),
    });
  } catch (error) {
    return serverError(error, "Admin settings PUT");
  }
}

/** POST { action: "reset" } restores defaults. */
export async function POST(request) {
  const auth = await requirePermission(request, "settings", "update");
  if (auth.error) return auth.error;

  try {
    const { action } = await request.json().catch(() => ({}));
    if (action !== "reset") return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });

    await dbConnect();
    const reset = await SettingModel.findOneAndUpdate(
      { key: "system_settings" },
      { $set: DEFAULTS, $unset: { sslStorePassword: "", sslStoreId: "" } },
      { returnDocument: "after", upsert: true }
    )
      .select(HIDDEN)
      .lean();
    return NextResponse.json({ success: true, message: "ডিফল্ট সেটিংস সফলভাবে পুনরুদ্ধার করা হয়েছে!", settings: plain(reset), gateway: gateway() });
  } catch (error) {
    return serverError(error, "Admin settings reset");
  }
}
