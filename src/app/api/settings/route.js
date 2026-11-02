import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";
import { publicSettings } from "@/lib/public-settings";

/** Public, read-only settings (no gateway credentials or internal switches). */
export async function GET() {
  try {
    await dbConnect();
    const settings = await SettingModel.findOne({ key: "system_settings" }).lean();
    return NextResponse.json({ success: true, settings: publicSettings(settings) });
  } catch (error) {
    console.error("Public settings GET error:", error.message);
    return NextResponse.json({ success: false, settings: publicSettings() });
  }
}
