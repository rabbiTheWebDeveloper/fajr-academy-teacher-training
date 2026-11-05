import AdminCoursesClient from "./AdminCoursesClient";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { InstructorModel } from "@/model/instructor-model";
import { ensureDefaultCourses, withLiveEnrolment } from "@/service/course-service";
import { toPlain } from "@/lib/query-helpers";
import { withCourseState } from "@/lib/course-state";
import { requireAdminPage } from "../../_shared/server";

export const metadata = {
  title: "কোর্স, কারিকুলাম ও রিসোর্স কনফিগারেশন | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Course, Batch Timetable, Modules Curriculum & Study Resources Manager.",
};

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdminPage("courses"); // redirects when the role may not open this page

  let courses = [];
  let instructors = [];
  let loadError = null;

  try {
    await dbConnect();
    // Inserts only the official TOT batches that are missing — never overwrites admin edits.
    await ensureDefaultCourses();
    // Courses are shown exactly as stored: an emptied curriculum/resource list stays empty.
    const [courseDocs, instructorDocs] = await Promise.all([
      CourseModel.find().sort({ createdAt: 1 }).lean(),
      // Trainer selector: only active instructors, with the designation used as the default role.
      InstructorModel.find({ isActive: { $ne: false } })
        .select("fullName designation track")
        .sort({ fullName: 1 })
        .lean(),
    ]);
    courses = toPlain((await withLiveEnrolment(courseDocs)).map(withCourseState));
    instructors = toPlain(instructorDocs);
  } catch (err) {
    console.error("Error fetching courses for admin page:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — কোর্স তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return <AdminCoursesClient initialBatches={courses} loadError={loadError} instructors={instructors} />;
}
