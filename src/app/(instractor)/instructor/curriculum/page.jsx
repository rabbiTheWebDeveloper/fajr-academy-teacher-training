import { dbConnect } from "@/service/mongo";
import { CourseModel, DEFAULT_TOT_CURRICULUM, DEFAULT_TOT_RESOURCES } from "@/model/course-model";
import CurriculumClient from "./CurriculumClient";

export const metadata = {
  title: "কারিকুলাম ও মডিউল নিয়ন্ত্রণ | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মডিউল, উইকলি সেশন ও শিডিউল নিয়ন্ত্রণ কনসোল।",
};

export default async function InstructorCurriculumPage() {
  let courses = [];
  try {
    await dbConnect();
    courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();

    if (!courses || courses.length === 0) {
      // Auto seed fallback
      courses = [
        {
          courseId: "TOT-MEN",
          name: "Training of Trainers (TOT) – MEN BATCH",
          tag: "পুরুষ ব্যাচ",
          track: "men",
          routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
          meetLink: "https://meet.google.com/tot-fajr-men-2026",
          curriculum: DEFAULT_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        },
        {
          courseId: "TOT-WOMEN-014",
          name: "Training of Trainers (TOT) – WOMEN (BATCH 014)",
          tag: "মহিলা এক্সক্লুসিভ ব্যাচ",
          track: "women",
          routine: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০)",
          meetLink: "https://meet.google.com/tot-fajr-women-014",
          curriculum: DEFAULT_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        },
      ];
    }
  } catch (error) {
    console.error("Error fetching courses for curriculum:", error);
  }

  const sanitized = courses.map((c) => ({
    ...c,
    _id: c._id ? c._id.toString() : c.courseId,
  }));

  return <CurriculumClient initialCourses={sanitized} />;
}
