import AdminClassesClient from "./AdminClassesClient";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { InstructorModel } from "@/model/instructor-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { withCourseState } from "@/lib/course-state";
import { toPlain } from "@/lib/query-helpers";
import { requireAdminPage } from "../../_shared/server";

export const metadata = {
  title: "ক্লাস শিডিউল ম্যানেজার | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Class Schedule, Live Meet Links, Trainers & Recordings Manager.",
};

export const dynamic = "force-dynamic";

function shapeCourse(c) {
  const s = withCourseState(c);
  return {
    _id: String(s._id),
    courseId: s.courseId,
    name: s.name,
    tag: s.tag || "",
    track: s.track || "general",
    orientationDate: s.orientationDate || "",
    orientationTime: s.orientationTime || "",
    routine: s.routine || "",
    duration: s.duration || "",
    instructor: s.instructor || "",
    meetLink: s.meetLink || "",
    whatsappLink: s.whatsappLink || "",
    status: s.status || "",
    publishState: s.publishState,
    sessionCount: (s.curriculum || []).length,
  };
}

function shapeClasses(courses) {
  const rows = [];
  for (const c of courses) {
    const sorted = [...(c.curriculum || [])]
      .map((m, idx) => ({ m, idx }))
      .sort((a, b) => (Number(a.m?.moduleNo) || a.idx + 1) - (Number(b.m?.moduleNo) || b.idx + 1) || a.idx - b.idx);

    for (const { m, idx } of sorted) {
      const moduleNo = Number(m.moduleNo) || idx + 1;
      rows.push({
        id: String(m._id || `${c.courseId}-${moduleNo}-${idx}`),
        _id: m._id ? String(m._id) : "",
        courseDbId: String(c._id),
        courseId: c.courseId,
        courseName: c.name,
        courseTag: c.tag || "",
        courseTrack: c.track || "general",
        courseMeetLink: c.meetLink || "",
        courseWhatsappLink: c.whatsappLink || "",
        moduleNo,
        sessionBadge: m.sessionBadge || `SESSION ${String(moduleNo).padStart(2, "0")}`,
        title: m.title || "",
        subtitle: m.subtitle || "",
        description: m.description || "",
        trainerName: m.trainerName || "",
        trainerRole: m.trainerRole || "",
        sessionDate: m.sessionDate || "",
        liveDate: m.liveDate || "",
        sessionTime: m.sessionTime || "",
        duration: m.duration || "১ ঘণ্টা",
        meetLink: m.meetLink || "",
        effectiveMeetLink: m.meetLink || c.meetLink || "",
        recordingUrl: m.recordingUrl || "",
        sessionStatus: m.sessionStatus || "",
        topics: Array.isArray(m.topics) ? m.topics : [],
        lessonsCount: Array.isArray(m.lessons) ? m.lessons.length : 0,
      });
    }
  }
  return rows;
}

export default async function AdminClassesPage() {
  await requireAdminPage("classes");

  let courses = [];
  let classes = [];
  let instructors = [];
  let loadError = null;

  try {
    await dbConnect();
    await ensureDefaultCourses();
    const [courseDocs, instructorDocs] = await Promise.all([
      CourseModel.find().sort({ createdAt: 1 }).lean(),
      InstructorModel.find({ isActive: { $ne: false } })
        .select("fullName designation track")
        .sort({ fullName: 1 })
        .lean(),
    ]);
    courses = toPlain(courseDocs.map(shapeCourse));
    classes = toPlain(shapeClasses(courseDocs));
    instructors = toPlain(instructorDocs);
  } catch (err) {
    console.error("Error fetching class schedules for admin page:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — ক্লাস শিডিউল লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminClassesClient
      initialCourses={courses}
      initialClasses={classes}
      instructors={instructors}
      loadError={loadError}
    />
  );
}
