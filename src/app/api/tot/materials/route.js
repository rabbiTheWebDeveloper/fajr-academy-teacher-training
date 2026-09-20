import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel, DEFAULT_TOT_RESOURCES } from "@/model/course-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const course = await CourseModel.findOne({ isPublished: true }).lean();
    let resources = (course?.resources && course.resources.length > 0)
      ? course.resources
      : DEFAULT_TOT_RESOURCES;

    if (category && category !== "all") {
      resources = resources.filter((r) => r.category === category);
    }

    const sanitized = resources.map((r, index) => ({
      resourceId: r.resourceId || `RES-${index + 101}`,
      title: r.title,
      category: r.category,
      format: r.format || "PDF",
      size: r.size || "2.5 MB",
      desc: r.desc || "",
      fileUrl: r.fileUrl || "https://drive.google.com",
      isDownloadable: r.isDownloadable ?? true,
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      materials: sanitized,
    });
  } catch (error) {
    console.error("TOT Materials GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
