import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { NoticeModel } from "@/model/notice-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");

    const query = {};
    if (track && track !== "all") {
      query.$or = [{ track: "all" }, { track }];
    }

    const notices = await NoticeModel.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(30)
      .lean();

    const sanitized = notices.map((n) => ({
      ...n,
      _id: n._id.toString(),
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
      updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      announcements: sanitized,
    });
  } catch (error) {
    console.error("Instructor Announcements GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      title,
      content,
      track = "all",
      instructorName = "ফজর একাডেমি ফ্যাকাল্টি",
      instructorEmail = "instructor@fajracademy.io",
      priority = "normal",
      isPinned = false,
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "শিরোনাম এবং নোটিশের বিবরণ আবশ্যক।" },
        { status: 400 }
      );
    }

    const notice = await NoticeModel.create({
      title: title.trim(),
      content: content.trim(),
      track,
      instructorName,
      instructorEmail,
      priority,
      isPinned: Boolean(isPinned),
    });

    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে সম্প্রচারিত (Broadcast) হয়েছে!",
      announcement: {
        ...notice.toObject(),
        _id: notice._id.toString(),
        createdAt: notice.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Instructor Announcements POST Error:", error);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "নোটিশ ID আবশ্যক।" },
        { status: 400 }
      );
    }

    await NoticeModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Instructor Announcements DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
