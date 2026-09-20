import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { SettingModel } from "@/model/setting-model";

export async function GET() {
  try {
    await dbConnect();
    const settings = await SettingModel.findOne({ key: "system_settings" })
      .select("-sslStorePassword -adminNotificationEmail -__v")
      .lean();

    return NextResponse.json({
      success: true,
      settings: settings || {
        coursePrice: 1000,
        regularCoursePrice: 2500,
        currency: "BDT",
        helplinePhone: "01410764581",
        whatsappSupport: "https://wa.me/8801410764581",
        admissionStatus: "open",
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      settings: {
        coursePrice: 1000,
        regularCoursePrice: 2500,
        currency: "BDT",
        helplinePhone: "01410764581",
        whatsappSupport: "https://wa.me/8801410764581",
        admissionStatus: "open",
      },
    });
  }
}
