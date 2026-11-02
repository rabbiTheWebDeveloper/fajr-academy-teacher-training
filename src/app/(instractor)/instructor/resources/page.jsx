import { CourseModel } from "@/model/course-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { toPlain } from "@/lib/query-helpers";
import ResourcesClient from "./ResourcesClient";
import { DB_ERROR_MESSAGE, requireInstructorPage } from "../../_shared/server";

export const metadata = {
  title: "স্টাডি রিসোর্স ও শিট হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের তাজবীদ গাইড, পেডাগজি ম্যানুয়াল ও লেসন শিট হাব।",
};

export default async function InstructorResourcesPage() {
  await requireInstructorPage("/instructor/resources");

  let courses = [];
  let loadError = null;
  try {
    // Same data as GET /api/instructor/resources: every course with its own resources.
    await ensureDefaultCourses();
    const docs = await CourseModel.find({})
      .select("courseId name track isPublished publishState resources")
      .sort({ createdAt: 1 })
      .lean();
    courses = toPlain(docs);
  } catch (error) {
    console.error("Error fetching resources:", error?.message || error);
    loadError = DB_ERROR_MESSAGE;
  }

  return <ResourcesClient initialCourses={courses} loadError={loadError} />;
}
