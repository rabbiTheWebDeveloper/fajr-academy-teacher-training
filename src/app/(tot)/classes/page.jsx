import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { NoticeModel } from "@/model/notice-model";
import ClassesClient from "./ClassesClient";

export const metadata = {
  title: "লাইভ ক্লাস ও শিডিউল | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ ক্লাস এক্সেস, শিডিউল ও রেকর্ডেড লেকচার হাব।",
};

export default async function ClassesPage() {
  let courses = [];
  let notices = [];

  try {
    await dbConnect();
    const [rawCourses, rawNotices] = await Promise.all([
      CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean(),
      NoticeModel.find().sort({ isPinned: -1, createdAt: -1 }).limit(6).lean(),
    ]);

    courses = (rawCourses || []).map((c) => ({
      courseId: c.courseId,
      name: c.name,
      tag: c.tag,
      track: c.track,
      routine: c.routine,
      orientationDate: c.orientationDate,
      orientationTime: c.orientationTime,
      duration: c.duration,
      meetLink: c.meetLink,
      whatsappLink: c.whatsappLink,
      instructor: c.instructor,
    }));

    notices = (rawNotices || []).map((n) => ({
      ...n,
      _id: n._id.toString(),
      createdAt: n.createdAt ? n.createdAt.toISOString() : "",
    }));
  } catch (error) {
    console.error("ClassesPage data fetch error:", error);
  }

  return <ClassesClient initialCourses={courses} notices={notices} />;
}
