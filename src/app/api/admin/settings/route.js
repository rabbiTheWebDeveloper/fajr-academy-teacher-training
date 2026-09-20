import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";
import { getSessionUser } from "@/lib/auth";

// Default settings fallback
const DEFAULT_SETTINGS = {
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

export async function GET() {
  try {
    await dbConnect();
    let settings = await SettingModel.findOne({ key: "system_settings" }).lean();

    if (!settings) {
      // Seed default settings on initial access
      settings = await SettingModel.create(DEFAULT_SETTINGS);
      settings = settings.toObject();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message, settings: DEFAULT_SETTINGS },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const session = await getSessionUser();

    // Verify session or permit in dev environment
    if (session && session.role !== "admin" && session.role !== "instructor") {
      return NextResponse.json(
        { success: false, message: "অননুমোদিত অ্যাক্সেস — শুধুমাত্র অ্যাডমিন পরিবর্তন করতে পারবেন" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Filter and sanitize incoming fields
    const updateData = { ...body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    updateData.key = "system_settings";

    if (updateData.coursePrice !== undefined) {
      updateData.coursePrice = Number(updateData.coursePrice) || 1000;
    }
    if (updateData.regularCoursePrice !== undefined) {
      updateData.regularCoursePrice = Number(updateData.regularCoursePrice) || 2500;
    }
    if (updateData.maxSeatsPerBatch !== undefined) {
      updateData.maxSeatsPerBatch = Number(updateData.maxSeatsPerBatch) || 60;
    }

    const updated = await SettingModel.findOneAndUpdate(
      { key: "system_settings" },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "সিস্টেম সেটিংস ডাটাবেসে সফলভাবে আপডেট করা হয়েছে!",
      settings: updated,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Alias to PUT or handle reset
  try {
    const { action } = await request.json().catch(() => ({}));
    if (action === "reset") {
      await dbConnect();
      const resetSettings = await SettingModel.findOneAndUpdate(
        { key: "system_settings" },
        { $set: DEFAULT_SETTINGS },
        { new: true, upsert: true }
      ).lean();

      return NextResponse.json({
        success: true,
        message: "ডিফল্ট সেটিংস সফলভাবে পুনরুদ্ধার করা হয়েছে!",
        settings: resetSettings,
      });
    }

    return PUT(request);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
