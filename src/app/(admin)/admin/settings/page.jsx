import AdminSettingsClient from "./AdminSettingsClient";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";
import { gatewayMode, isGatewayConfigured } from "@/lib/sslcommerz";
import { pick, toPlain } from "@/lib/query-helpers";
import { requireAdminPage } from "../../_shared/server";

export const metadata = {
  title: "সিস্টেম সেটিংস | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Global TOT Settings & Gateway Configuration.",
};

export const dynamic = "force-dynamic";

/** Exactly the keys PUT /api/admin/settings accepts. Gateway credentials are env-only. */
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

export default async function AdminSettingsPage() {
  await requireAdminPage("settings"); // redirects when the role may not open this page

  const gateway = { mode: gatewayMode(), configured: isGatewayConfigured() };
  let settings = null;
  let isDefault = false;
  let loadError = null;

  try {
    await dbConnect();
    const doc = await SettingModel.findOne({ key: "system_settings" }).select("-sslStorePassword -sslStoreId -sslcommerzMode -__v").lean();
    if (doc) {
      settings = pick(toPlain(doc), EDITABLE);
    } else {
      // Nothing saved yet: show the schema defaults (not persisted until the admin saves).
      settings = pick(new SettingModel().toObject(), EDITABLE);
      isDefault = true;
    }
  } catch (err) {
    console.error("Failed to load settings in Server Component:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — বর্তমান সেটিংস লোড হয়নি। ভুল করে ডিফল্ট মান সংরক্ষণ এড়াতে সংরক্ষণ বন্ধ রাখা হয়েছে।";
  }

  return <AdminSettingsClient initialSettings={settings} isDefault={isDefault} gateway={gateway} loadError={loadError} />;
}
