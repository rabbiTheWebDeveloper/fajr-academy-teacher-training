import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { NoticeModel } from "@/model/notice-model";
import { requireAuth, INSTRUCTOR_ROLES, deleteScope, MSG_DELETE_DENIED, serverError, isAdminRole } from "@/lib/api-auth";
import { isObjectId } from "@/lib/query-helpers";
import { notifyNoticePosted } from "@/service/push-service";

const TRACKS = ["all", "TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN"];
const PRIORITIES = ["normal", "important", "urgent"];

const serialize = (n) => ({
  ...n,
  _id: n._id.toString(),
  createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : "",
  updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : "",
});

export async function GET(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const track = new URL(request.url).searchParams.get("track");
    const query = track && track !== "all" ? { track: { $in: ["all", track] } } : {};
    const notices = await NoticeModel.find(query).sort({ isPinned: -1, createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ success: true, count: notices.length, announcements: notices.map(serialize) });
  } catch (error) {
    return serverError(error, "Instructor announcements GET");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await dbConnect();
    const { title, content, track = "all", priority = "normal", isPinned = false } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, message: "শিরোনাম এবং নোটিশের বিবরণ আবশ্যক।" }, { status: 400 });
    }
    if (!TRACKS.includes(track) || !PRIORITIES.includes(priority)) {
      return NextResponse.json({ success: false, message: "ব্যাচ বা গুরুত্বের মান সঠিক নয়।" }, { status: 400 });
    }

    // Author always comes from the signed session.
    const notice = await NoticeModel.create({
      title: title.trim().slice(0, 200),
      content: content.trim().slice(0, 5000),
      track,
      priority,
      isPinned: Boolean(isPinned),
      instructorName: session.fullName || "ফজর একাডেমি ফ্যাকাল্টি",
      instructorEmail: session.email || "",
    });

    // Push to that batch's trainees (and, when an admin posts from here, the instructors too).
    notifyNoticePosted(notice.toObject(), { fromAdmin: isAdminRole(session.role) });
    return NextResponse.json({
      success: true,
      message: "নোটিশ সফলভাবে সম্প্রচারিত (Broadcast) হয়েছে!",
      announcement: serialize(notice.toObject()),
    });
  } catch (error) {
    return serverError(error, "Instructor announcements POST");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, INSTRUCTOR_ROLES);
  if (auth.error) return auth.error;
  const { session } = auth;

  // Instructors may delete only their own notices; among admins only a super-admin may delete.
  // Checked before touching the database, so a refused admin learns nothing about the record.
  const scope = await deleteScope(session);
  if (scope === "none") {
    return NextResponse.json({ success: false, message: MSG_DELETE_DENIED }, { status: 403 });
  }

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, message: "নোটিশ ID আবশ্যক।" }, { status: 400 });
    }

    const notice = await NoticeModel.findById(id).select("instructorEmail").lean();
    if (!notice) {
      return NextResponse.json({ success: false, message: "নোটিশটি পাওয়া যায়নি।" }, { status: 404 });
    }
    if (scope === "own" && notice.instructorEmail !== session.email) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র নোটিশ প্রদানকারী বা সুপার-অ্যাডমিন এটি মুছতে পারবেন।" },
        { status: 403 }
      );
    }

    await NoticeModel.deleteOne({ _id: id });
    return NextResponse.json({ success: true, message: "নোটিশ সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Instructor announcements DELETE");
  }
}
