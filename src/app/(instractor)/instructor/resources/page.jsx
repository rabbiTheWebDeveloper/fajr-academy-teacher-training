import { dbConnect } from "@/service/mongo";
import { CourseModel, DEFAULT_TOT_RESOURCES } from "@/model/course-model";
import ResourcesClient from "./ResourcesClient";

export const metadata = {
  title: "স্টাডি রিসোর্স ও শিট হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের তাজবীদ গাইড, পেডাগজি ম্যানুয়াল ও লেসন শিট হাব।",
};

export default async function InstructorResourcesPage() {
  let resources = [];
  try {
    await dbConnect();
    const course = await CourseModel.findOne({ isPublished: true }).lean();
    resources = (course?.resources && course.resources.length > 0)
      ? course.resources
      : DEFAULT_TOT_RESOURCES;
  } catch (error) {
    console.error("Error fetching resources:", error);
    resources = DEFAULT_TOT_RESOURCES;
  }

  const sanitized = (resources || []).map((r, index) => ({
    resourceId: r.resourceId || `RES-${index + 101}`,
    title: r.title,
    category: r.category,
    format: r.format || "PDF",
    size: r.size || "2.5 MB",
    desc: r.desc || "",
    fileUrl: r.fileUrl || "https://drive.google.com",
    isDownloadable: r.isDownloadable ?? true,
  }));

  return <ResourcesClient initialResources={sanitized} />;
}
