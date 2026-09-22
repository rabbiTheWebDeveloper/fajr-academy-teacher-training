import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import {
  CourseModel,
  DEFAULT_TOT_CURRICULUM,
  WOMEN_TOT_CURRICULUM,
  MEN_TOT_CURRICULUM,
  DEFAULT_TOT_RESOURCES,
} from "@/model/course-model";

// GET all courses for Admin with populated Curriculum and Resources
export async function GET() {
  try {
    await dbConnect();
    let courses = await CourseModel.find().sort({ createdAt: 1 }).lean();

    // Auto-seed default courses if empty
    if (!courses || courses.length === 0) {
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
          orientationTime: "রাত ৮:৩০ টা – ৯:৪৫ টা",
          routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "https://meet.google.com/tot-fajr-men-2026",
          whatsappLink: "https://chat.whatsapp.com/tot-fajr-men-batch",
          instructor: "হাফেজ মাওলানা মুহাম্মদ ফারাবী চৌধুরী",
          enrolledCount: 42,
          maxSeats: 60,
          status: "Active & Enrolling",
          isPublished: true,
          curriculum: MEN_TOT_CURRICULUM,
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
          orientationDate: "২৩ আগস্ট ২০২৬",
          orientationTime: "রাত ৮:০০ টা – ৯:০০ টা",
          routine: "রবিবার (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "https://meet.google.com/tot-fajr-women-014",
          whatsappLink: "https://chat.whatsapp.com/tot-fajr-women-batch014",
          instructor: "ফজর একাডেমি স্পেশাল ফ্যাকাল্টি টিম",
          enrolledCount: 58,
          maxSeats: 60,
          status: "Active & Enrolling",
          isPublished: true,
          curriculum: WOMEN_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        },
      ];
      await CourseModel.insertMany(defaultCourses);
      courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
    } else {
      // Ensure existing courses have official poster curriculum and resources
      let needsUpdate = false;
      for (const c of courses) {
        const isMen = c.track === "men" || c.courseId === "TOT-MEN";
        const officialCurriculum = isMen ? MEN_TOT_CURRICULUM : WOMEN_TOT_CURRICULUM;
        const hasOutdatedCurriculum =
          !c.curriculum ||
          c.curriculum.length === 0 ||
          !c.curriculum[0]?.sessionBadge;

        if (hasOutdatedCurriculum || !c.resources || c.resources.length === 0) {
          await CourseModel.updateOne(
            { _id: c._id },
            {
              $set: {
                curriculum: hasOutdatedCurriculum ? officialCurriculum : c.curriculum,
                resources: (!c.resources || c.resources.length === 0) ? DEFAULT_TOT_RESOURCES : c.resources,
              },
            }
          );
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        courses = await CourseModel.find().sort({ createdAt: 1 }).lean();
      }
    }

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Admin Courses GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST new course with curriculum and resources
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
      curriculum,
      resources,
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
      curriculum: (curriculum && curriculum.length > 0) ? curriculum : DEFAULT_TOT_CURRICULUM,
      resources: (resources && resources.length > 0) ? resources : DEFAULT_TOT_RESOURCES,
    });

    return NextResponse.json({
      success: true,
      message: "নতুন কোর্স ও কারিকুলাম সফলভাবে যুক্ত হয়েছে!",
      course,
    });
  } catch (error) {
    console.error("Admin Courses POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT update course (including Curriculum & Resources)
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

    // If numerical fields present, cast safely
    if (updateFields.fee !== undefined) updateFields.fee = Number(updateFields.fee) || 1000;
    if (updateFields.regularFee !== undefined) updateFields.regularFee = Number(updateFields.regularFee) || 2500;
    if (updateFields.maxSeats !== undefined) updateFields.maxSeats = Number(updateFields.maxSeats) || 60;
    if (updateFields.enrolledCount !== undefined) updateFields.enrolledCount = Number(updateFields.enrolledCount) || 0;

    const updatedCourse = await CourseModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: "কোর্স পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "কোর্স, কারিকুলাম ও রিসোর্স সফলভাবে আপডেট করা হয়েছে!",
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
