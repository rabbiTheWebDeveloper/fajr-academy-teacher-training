import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      courseId = "all",
      title,
      category = "কুরআন শিক্ষা ও তাজবীদ",
      format = "PDF",
      size = "2.5 MB",
      desc = "",
      fileUrl,
      isDownloadable = true,
    } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { success: false, message: "রিসোর্সের শিরোনাম এবং ফাইল লিঙ্ক আবশ্যক।" },
        { status: 400 }
      );
    }

    const newResource = {
      resourceId: `RES-${Date.now().toString().slice(-5)}`,
      title: title.trim(),
      category: category.trim(),
      format: format.toUpperCase().trim(),
      size: size.trim(),
      desc: desc.trim(),
      fileUrl: fileUrl.trim(),
      isDownloadable: Boolean(isDownloadable),
    };

    let query = {};
    if (courseId !== "all") {
      query.courseId = courseId;
    }

    await CourseModel.updateMany(query, {
      $push: { resources: newResource },
    });

    return NextResponse.json({
      success: true,
      message: "নতুন স্টাডি মেটেরিয়াল / রিসোর্স সফলভাবে যুক্ত হয়েছে!",
      resource: newResource,
    });
  } catch (error) {
    console.error("Instructor Resource POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      return NextResponse.json(
        { success: false, message: "Resource ID is required." },
        { status: 400 }
      );
    }

    await CourseModel.updateMany(
      {},
      { $pull: { resources: { resourceId } } }
    );

    return NextResponse.json({
      success: true,
      message: "রিসোর্স সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Instructor Resource DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
