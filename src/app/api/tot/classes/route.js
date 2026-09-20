import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { NoticeModel } from "@/model/notice-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");

    const courseQuery = { isPublished: true };
    if (track && track !== "all") {
      if (track === "men") courseQuery.track = "men";
      else if (track === "women") courseQuery.track = "women";
      else courseQuery.courseId = track;
    }

    const noticeQuery = {};
    if (track && track !== "all") {
      noticeQuery.$or = [{ track: "all" }, { track }];
    }

    const [courses, notices] = await Promise.all([
      CourseModel.find(courseQuery).sort({ createdAt: 1 }).lean(),
      NoticeModel.find(noticeQuery).sort({ isPinned: -1, createdAt: -1 }).limit(10).lean(),
    ]);

    const sanitizedCourses = courses.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));

    const sanitizedNotices = notices.map((n) => ({
      ...n,
      _id: n._id.toString(),
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      courses: sanitizedCourses,
      notices: sanitizedNotices,
    });
  } catch (error) {
    console.error("TOT Classes GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
