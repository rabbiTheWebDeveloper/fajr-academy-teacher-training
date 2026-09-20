import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { NoticeModel } from "@/model/notice-model";

// GET: Retrieve all announcements
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
      .lean();

    const sanitized = notices.map((n) => ({
      ...n,
      _id: n._id.toString(),
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      announcements: sanitized,
    });
  } catch (error) {
    console.error("Admin Announcements GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Broadcast new announcement
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      title,
      content,
      track = "all",
      priority = "normal",
      isPinned = false,
      instructorName = "ফজর একাডেমি অ্যাডমিন বোর্ড",
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "শিরোনাম এবং নোটিশের বিবরণ আবশ্যক।" },
        { status: 400 }
      );
    }

    const notice = await NoticeModel.create({
      title: title.trim(),
      content: content.trim(),
      track,
      priority,
      isPinned: Boolean(isPinned),
      instructorName: instructorName.trim(),
      instructorEmail: "admin@fajracademy.io",
    });

    return NextResponse.json({
      success: true,
      message: "ঘোষণা সফলভাবে ব্রডকাস্ট করা হয়েছে!",
      announcement: {
        ...notice.toObject(),
        _id: notice._id.toString(),
        createdAt: notice.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin Announcements POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove announcement
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "নোটিশ ID প্রদান করুন।" },
        { status: 400 }
      );
    }

    await NoticeModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
