import { dbConnect } from "@/service/mongo";
import { CourseModel, DEFAULT_TOT_RESOURCES } from "@/model/course-model";
import MaterialsClient from "./MaterialsClient";

export const metadata = {
  title: "কোর্স ম্যাটেরিয়ালস ও বুকস | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল স্টাডি বুকস, লেসন প্ল্যান ও রিসোর্স ফাইলসমূহ।",
};

export default async function MaterialsPage() {
  let materials = [];

  try {
    await dbConnect();
    const course = await CourseModel.findOne({ isPublished: true }).lean();
    materials = (course?.resources && course.resources.length > 0)
      ? course.resources
      : DEFAULT_TOT_RESOURCES;
  } catch (error) {
    console.error("MaterialsPage error:", error);
    materials = DEFAULT_TOT_RESOURCES;
  }

  const sanitized = materials.map((m, index) => ({
    resourceId: m.resourceId || `RES-${index + 101}`,
    title: m.title,
    category: m.category,
    format: m.format || "PDF",
    size: m.size || "2.5 MB",
    desc: m.desc || "",
    fileUrl: m.fileUrl || "https://drive.google.com",
    isDownloadable: m.isDownloadable ?? true,
  }));

  return <MaterialsClient initialMaterials={sanitized} />;
}
