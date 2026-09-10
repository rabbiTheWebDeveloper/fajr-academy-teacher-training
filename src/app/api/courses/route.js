import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";

const DEFAULT_COURSES = [
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
    videoUrl: "https://youtube.com/shorts/UxzqLHfjrGc",
    perks: [
      "মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা অফার",
      "১ মাসে ৪টি প্রফেশনাল ট্রেনিং ও পেডাগোজি",
      "ল্যাপটপ / ডিভাইস সহায়তা সুবিধা",
      "হাফিজ/আলেম হওয়া বাধ্যতামূলক নয়",
      "কন্টিনিউয়াস ট্রেনিং ও স্কিল গ্রুমিং",
    ],
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
    videoUrl: "https://youtube.com/shorts/zPXTzup-2ok",
    perks: [
      "মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত জব অপরচুনিটি",
      "১ মাসে ৪টি প্রফেশনাল ট্রেনিং ও ক্লাস ম্যানেজমেন্ট",
      "স্বীকৃত সার্টিফিকেট প্রদান",
      "ফজর একাডেমির অফিশিয়াল টিচার নেটওয়ার্কে অন্তর্ভুক্তি",
      "পর্দা বজায় রেখে সম্পূর্ণ অনলাইন পাঠদান ব্যবস্থা",
    ],
  },
];

export async function GET(request) {
  try {
    await dbConnect();

    let courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();

    // Auto-seed default courses if none exist
    if (!courses || courses.length === 0) {
      await CourseModel.insertMany(DEFAULT_COURSES);
      courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "কোর্স তথ্য লোড করতে ব্যর্থ হয়েছে",
        courses: DEFAULT_COURSES, // Fallback gracefully
      },
      { status: 500 }
    );
  }
}
