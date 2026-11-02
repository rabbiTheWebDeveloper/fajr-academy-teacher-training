import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { requireAuth, INSTRUCTOR_ROLES, serverError } from "@/lib/api-auth";

const FORMATS = ["PDF", "DOCX", "SLIDES", "VIDEO", "DRIVE", "ZIP", "LINK"];

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const courses = await CourseModel.find({}).select("courseId name track isPublished status resources").sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, courses: JSON.parse(JSON.stringify(courses)) });
  } catch (error) {
    return serverError(error, "Instructor resources GET");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const {
      courseId,
      title,
      category = "কুরআন শিক্ষা ও তাজবীদ",
      format = "PDF",
      size = "",
      desc = "",
      fileUrl,
      isDownloadable = true,
    } = await request.json();

    if (!title?.trim() || !fileUrl?.trim()) {
      return NextResponse.json({ success: false, message: "রিসোর্সের শিরোনাম এবং ফাইল লিঙ্ক আবশ্যক।" }, { status: 400 });
    }
    if (!/^https:\/\/[^\s]+$/i.test(fileUrl.trim())) {
      return NextResponse.json({ success: false, message: "ফাইল লিঙ্কটি অবশ্যই https:// দিয়ে শুরু হতে হবে।" }, { status: 400 });
    }
    if (!courseId) {
      return NextResponse.json({ success: false, message: "কোন ব্যাচের জন্য রিসোর্স, তা নির্বাচন করুন।" }, { status: 400 });
    }

    const resource = {
      // Random suffix: the old "last 5 digits of the timestamp" IDs collided.
      resourceId: `RES-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`,
      title: title.trim().slice(0, 200),
      category: String(category).trim().slice(0, 100),
      format: FORMATS.includes(String(format).toUpperCase()) ? String(format).toUpperCase() : "LINK",
      size: String(size).trim().slice(0, 30),
      desc: String(desc).trim().slice(0, 1000),
      fileUrl: fileUrl.trim(),
      isDownloadable: Boolean(isDownloadable),
    };

    const query = courseId === "all" ? {} : { courseId: String(courseId) };
    const result = await CourseModel.updateMany(query, { $push: { resources: resource } });
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "নির্বাচিত কোর্সটি পাওয়া যায়নি।" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `নতুন স্টাডি মেটেরিয়াল ${result.modifiedCount}টি ব্যাচে সফলভাবে যুক্ত হয়েছে!`,
      resource,
      courseIds: courseId === "all" ? "all" : [courseId],
    });
  } catch (error) {
    return serverError(error, "Instructor resources POST");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    const courseId = searchParams.get("courseId");

    if (!resourceId) {
      return NextResponse.json({ success: false, message: "রিসোর্স ID আবশ্যক।" }, { status: 400 });
    }

    // Scope to one course when given: older default resources share IDs across both batches.
    const query = courseId && courseId !== "all" ? { courseId } : {};
    const result = await CourseModel.updateMany(query, { $pull: { resources: { resourceId } } });
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "রিসোর্সটি ডাটাবেজে পাওয়া যায়নি (হয়তো আগেই মুছে ফেলা হয়েছে)।" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "রিসোর্স সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Instructor resources DELETE");
  }
}
