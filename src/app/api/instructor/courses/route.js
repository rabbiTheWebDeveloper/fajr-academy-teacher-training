import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import {
  CourseModel,
  DEFAULT_TOT_CURRICULUM,
  DEFAULT_TOT_RESOURCES,
} from "@/model/course-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");

    const query = { isPublished: true };
    if (track && track !== "all") {
      if (track === "men") query.track = "men";
      else if (track === "women") query.track = "women";
      else query.courseId = track;
    }

    let courses = await CourseModel.find(query).sort({ createdAt: 1 }).lean();

    // Auto-seed default courses if empty
    if (!courses || courses.length === 0) {
      const defaultCourses = [
        {
          courseId: "TOT-MEN",
          name: "Training of Trainers (TOT) – MEN BATCH",
          tag: "পুরুষ ব্যাচ",
          track: "men",
          summary: "ছেলেদের জন্য ঘরে বসে হালাল ক্যারিয়ার গড়ার বিশেষ সুযোগ। আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।",
          fee: 1000,
          regularFee: 2500,
          orientationDate: "২০ সেপ্টেম্বর ২০২৬",
          orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
          routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "https://meet.google.com/tot-fajr-men-2026",
          whatsappLink: "https://chat.whatsapp.com/tot-fajr-men-batch",
          instructor: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
          enrolledCount: 42,
          maxSeats: 60,
          status: "Active & Enrolling",
          isPublished: true,
          curriculum: DEFAULT_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        },
        {
          courseId: "TOT-WOMEN-014",
          name: "Training of Trainers (TOT) – WOMEN (BATCH 014)",
          tag: "মহিলা এক্সক্লুসিভ ব্যাচ",
          track: "women",
          summary: "দ্বীনে ফেরা বোনদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুবর্ণ সুযোগ।",
          fee: 1000,
          regularFee: 2500,
          orientationDate: "২১ সেপ্টেম্বর ২০২৬",
          orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
          routine: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "https://meet.google.com/tot-fajr-women-014",
          whatsappLink: "https://chat.whatsapp.com/tot-fajr-women-batch014",
          instructor: "উস্তাজা ফারহানা চৌধুরী",
          enrolledCount: 58,
          maxSeats: 60,
          status: "Active & Enrolling",
          isPublished: true,
          curriculum: DEFAULT_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        },
      ];
      await CourseModel.insertMany(defaultCourses);
      courses = await CourseModel.find(query).sort({ createdAt: 1 }).lean();
    }

    const sanitized = courses.map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      courses: sanitized,
    });
  } catch (error) {
    console.error("Instructor Courses GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { courseId, _id, ...updateFields } = body;

    let query = {};
    if (_id) query._id = _id;
    else if (courseId) query.courseId = courseId;
    else {
      return NextResponse.json(
        { success: false, message: "Course ID or _id is required." },
        { status: 400 }
      );
    }

    const updated = await CourseModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "কোর্স পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "কোর্স ও শিডিউল সফলভাবে আপডেট করা হয়েছে!",
      course: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("Instructor Courses PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
