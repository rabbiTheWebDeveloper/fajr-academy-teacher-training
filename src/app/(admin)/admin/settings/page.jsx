import AdminSettingsClient from "./AdminSettingsClient";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";

export const metadata = {
  title: "সিস্টেম সেটিংস | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Global TOT Settings & Gateway Configuration.",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings = null;

  try {
    await dbConnect();
    const doc = await SettingModel.findOne({ key: "system_settings" }).lean();
    if (doc) {
      settings = JSON.parse(JSON.stringify(doc));
    }
  } catch (err) {
    console.error("Failed to load settings in Server Component:", err);
  }

  const defaultSettings = {
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
    sslcommerzMode: "live",
    sslStoreId: "fajra6aa249a39ddb2",
    sslStorePassword: "fajra6aa249a39ddb2@ssl",
    autoApprovePayment: true,
    bkashMerchantNumber: "01410764581",
    nagadMerchantNumber: "01410764581",
    helplinePhone: "01410764581",
    supportEmail: "support@fajracademy.io",
    whatsappSupport: "https://wa.me/8801410764581",
    whatsappCommunityGroup: "https://chat.whatsapp.com/tot-fajr-community",
    adminNotificationEmail: "admin@fajracademy.io",
    registrationOpen: true,
    maintenanceMode: false,
    emailNotificationEnabled: true,
    defaultTheme: "light",
  };

  const initialSettings = { ...defaultSettings, ...(settings || {}) };

  return <AdminSettingsClient initialSettings={initialSettings} />;
}
