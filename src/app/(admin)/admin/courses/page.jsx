import AdminCoursesClient from "./AdminCoursesClient";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { toPlain } from "@/lib/query-helpers";
import { withCourseState } from "@/lib/course-state";

export const metadata = {
  title: "কোর্স, কারিকুলাম ও রিসোর্স কনফিগারেশন | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Course, Batch Timetable, Modules Curriculum & Study Resources Manager.",
};

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  let courses = [];
  let loadError = null;

  try {
    await dbConnect();
    // Inserts only the official TOT batches that are missing — never overwrites admin edits.
    await ensureDefaultCourses();
    // Courses are shown exactly as stored: an emptied curriculum/resource list stays empty.
    courses = toPlain((await CourseModel.find().sort({ createdAt: 1 }).lean()).map(withCourseState));
  } catch (err) {
    console.error("Error fetching courses for admin page:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — কোর্স তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminCoursesClient initialBatches={courses} loadError={loadError} />;
}
