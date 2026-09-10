import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";

// GET all courses for Admin
export async function GET() {
  try {
    await dbConnect();
    let courses = await CourseModel.find().sort({ createdAt: 1 }).lean();

    if (!courses || courses.length === 0) {
      // Trigger default seeding if empty
      const defaultCourses = [
        {
          courseId: "TOT-MEN",
          name: "Training of Trainers (TOT) – MEN BATCH",
          tag: "পুরুষ ব্যাচ",
          track: "men",
          summary: "ছেলেদের জন্য ঘরে বসে হালাল ক্যারিয়ার গড়ার বিশেষ সুযোগ।",
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
        },
      ];
      await CourseModel.insertMany(defaultCourses);
      courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Admin Courses GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST new course
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      courseId,
      name,
      tag = "কোর্স ব্যাচ",
      track = "general",
      summary = "",
      fee = 1000,
      regularFee = 2500,
      orientationDate = "শীঘ্রই ঘোষিত হবে",
      orientationTime = "রাত ৮:০০ টা",
      routine = "সপ্তাহে ৩ দিন (রাত ৮:০০)",
      duration = "১ মাস (৪টি প্রফেশনাল সেশন)",
      meetLink = "",
      whatsappLink = "",
      instructor = "ফজর একাডেমি ফ্যাকাল্টি",
      maxSeats = 60,
      status = "Active & Enrolling",
      perks = [],
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "কোর্সের নাম আবশ্যক।" },
        { status: 400 }
      );
    }

    const finalCourseId =
      courseId?.trim() ||
      `COURSE-${Date.now().toString().slice(-4)}`;

    // Check unique courseId
    const existing = await CourseModel.findOne({ courseId: finalCourseId });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "এই কোর্স আইডি ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 400 }
      );
    }

    const course = await CourseModel.create({
      courseId: finalCourseId,
      name,
      tag,
      track,
      summary,
      fee: Number(fee) || 1000,
      regularFee: Number(regularFee) || 2500,
      orientationDate,
      orientationTime,
      routine,
      duration,
      meetLink,
      whatsappLink,
      instructor,
      maxSeats: Number(maxSeats) || 60,
      status,
      perks: Array.isArray(perks) ? perks : [],
      isPublished: true,
    });

    return NextResponse.json({
      success: true,
      message: "নতুন কোর্স সফলভাবে যুক্ত হয়েছে!",
      course,
    });
  } catch (error) {
    console.error("Admin Courses POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT update course
export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { _id, courseId, ...updateFields } = body;

    let query = {};
    if (_id) query._id = _id;
    else if (courseId) query.courseId = courseId;
    else {
      return NextResponse.json(
        { success: false, message: "কোর্স আইডি বা _id প্রদান করুন।" },
        { status: 400 }
      );
    }

    const updatedCourse = await CourseModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: "কোর্স পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "কোর্স তথ্য সফলভাবে আপডেট করা হয়েছে!",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Admin Courses PUT Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE course
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const courseId = searchParams.get("courseId");

    let query = {};
    if (id) query._id = id;
    else if (courseId) query.courseId = courseId;
    else {
      return NextResponse.json(
        { success: false, message: "কোর্স ID আবশ্যক।" },
        { status: 400 }
      );
    }

    await CourseModel.findOneAndDelete(query);

    return NextResponse.json({
      success: true,
      message: "কোর্স সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Admin Courses DELETE Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
