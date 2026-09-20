import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import LiveClient from "./LiveClient";

export const metadata = {
  title: "লাইভ ক্লাসরুম হোস্ট হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ সেশন হোস্টিং ও প্রি-ক্লাস চেকলিস্ট।",
};

export default async function InstructorLivePage() {
  let courses = [];
  try {
    await dbConnect();
    courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();
  } catch (error) {
    console.error("Error fetching courses for live hub:", error);
  }

  const sanitized = (courses || []).map((c) => ({
    courseId: c.courseId,
    name: c.name,
    track: c.track,
    routine: c.routine,
    orientationDate: c.orientationDate,
    orientationTime: c.orientationTime,
    meetLink: c.meetLink,
    whatsappLink: c.whatsappLink,
    instructor: c.instructor,
    enrolledCount: c.enrolledCount,
  }));

  return <LiveClient courses={sanitized} />;
}
