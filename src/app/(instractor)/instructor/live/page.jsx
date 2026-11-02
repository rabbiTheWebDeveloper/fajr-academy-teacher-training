import LiveClient from "./LiveClient";
import { DB_ERROR_MESSAGE, loadPublishedCourses, requireInstructorPage } from "../../_shared/server";

export const metadata = {
  title: "লাইভ ক্লাসরুম হোস্ট হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ সেশন হোস্টিং ও প্রি-ক্লাস চেকলিস্ট।",
};

export default async function InstructorLivePage() {
  await requireInstructorPage("/instructor/live");

  let courses = [];
  let loadError = null;
  try {
    const docs = await loadPublishedCourses();
    courses = docs.map((c) => ({
      _id: c._id,
      courseId: c.courseId,
      name: c.name,
      tag: c.tag,
      track: c.track,
      status: c.status,
      routine: c.routine || "",
      orientationDate: c.orientationDate || "",
      orientationTime: c.orientationTime || "",
      meetLink: c.meetLink || "",
      whatsappLink: c.whatsappLink || "",
      instructor: c.instructor || "",
      enrolledCount: c.enrolledCount ?? 0,
      maxSeats: c.maxSeats ?? null,
      curriculum: (c.curriculum || []).map((m) => ({
        moduleNo: m.moduleNo,
        title: m.title,
        trainerName: m.trainerName || "",
        liveDate: m.liveDate || "",
        sessionDate: m.sessionDate || "",
        sessionTime: m.sessionTime || "",
      })),
    }));
  } catch (error) {
    console.error("Error fetching courses for live hub:", error?.message || error);
    loadError = DB_ERROR_MESSAGE;
  }

  return <LiveClient initialCourses={courses} loadError={loadError} />;
}
