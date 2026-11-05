import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { NoticeModel } from "@/model/notice-model";
import { requirePermission, serverError } from "@/lib/api-auth";
import { isObjectId } from "@/lib/query-helpers";

const TRACKS = ["all", "TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN"];
const PRIORITIES = ["normal", "important", "urgent"];
const plain = (v) => JSON.parse(JSON.stringify(v));

export async function GET(request) {
  const auth = await requirePermission(request, "announcements", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const track = new URL(request.url).searchParams.get("track");
    const query = track && track !== "all" ? { track: { $in: ["all", track] } } : {};
    const notices = await NoticeModel.find(query).sort({ isPinned: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: notices.length, announcements: plain(notices) });
  } catch (error) {
    return serverError(error, "Admin announcements GET");
  }
}

export async function POST(request) {
  const auth = await requirePermission(request, "announcements", "create");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { title, content, track = "all", priority = "normal", isPinned = false, instructorName } = await request.json();
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, message: "শিরোনাম এবং নোটিশের বিবরণ আবশ্যক।" }, { status: 400 });
    }
    if (!TRACKS.includes(track) || !PRIORITIES.includes(priority)) {
      return NextResponse.json({ success: false, message: "ব্যাচ বা গুরুত্বের মান সঠিক নয়।" }, { status: 400 });
    }

    const notice = await NoticeModel.create({
      title: title.trim().slice(0, 200),
      content: content.trim().slice(0, 5000),
      track,
      priority,
      isPinned: Boolean(isPinned),
      instructorName: String(instructorName || auth.session.fullName || "ফজর একাডেমি অ্যাডমিন বোর্ড").trim().slice(0, 100),
      instructorEmail: auth.session.email || "",
    });

    return NextResponse.json({ success: true, message: "ঘোষণা সফলভাবে ব্রডকাস্ট করা হয়েছে!", announcement: plain(notice.toObject()) });
  } catch (error) {
    return serverError(error, "Admin announcements POST");
  }
}

export async function PATCH(request) {
  const auth = await requirePermission(request, "announcements", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { id, isPinned, priority } = await request.json();
    if (!isObjectId(id)) return NextResponse.json({ success: false, message: "নোটিশ ID আবশ্যক।" }, { status: 400 });
    const set = {};
    if (isPinned !== undefined) set.isPinned = Boolean(isPinned);
    if (priority !== undefined && PRIORITIES.includes(priority)) set.priority = priority;
    const updated = await NoticeModel.findByIdAndUpdate(id, { $set: set }, { returnDocument: "after" }).lean();
    if (!updated) return NextResponse.json({ success: false, message: "নোটিশটি পাওয়া যায়নি।" }, { status: 404 });
    return NextResponse.json({ success: true, message: "নোটিশ আপডেট হয়েছে।", announcement: plain(updated) });
  } catch (error) {
    return serverError(error, "Admin announcements PATCH");
  }
}

export async function DELETE(request) {
  const auth = await requirePermission(request, "announcements", "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return NextResponse.json({ success: false, message: "নোটিশ ID প্রদান করুন।" }, { status: 400 });
    const res = await NoticeModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) return NextResponse.json({ success: false, message: "নোটিশটি পাওয়া যায়নি।" }, { status: 404 });
    return NextResponse.json({ success: true, message: "নোটিশ সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin announcements DELETE");
  }
}
