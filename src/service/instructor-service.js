import { dbConnect } from "@/service/mongo";
import { TotModel } from "@/model/tot-model";
import { CourseModel } from "@/model/course-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";

/**
 * Instructor dashboard numbers, all computed from the database.
 * Shared by GET /api/instructor/stats and the server-rendered dashboard page.
 */
export async function getInstructorStats() {
  await dbConnect();

  const [totalTrainees, menCount, womenCount, paidCount, pendingCount, evalAgg, courses, noticesCount] = await Promise.all([
    TotModel.countDocuments({}),
    TotModel.countDocuments({ track: "TOT-MEN" }),
    TotModel.countDocuments({ track: { $regex: /WOMEN/i } }),
    TotModel.countDocuments({ paymentStatus: { $in: ["paid", "free"] } }),
    TotModel.countDocuments({ paymentStatus: { $in: ["pending", "failed"] } }),
    EvaluationModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ["$qualificationStatus", "hired"] }, 1, 0] } },
          certified: { $sum: { $cond: [{ $in: ["$qualificationStatus", ["hired", "certified"]] }, 1, 0] } },
          retake: { $sum: { $cond: [{ $eq: ["$qualificationStatus", "retake-needed"] }, 1, 0] } },
          avg: { $avg: "$totalScore" },
        },
      },
    ]),
    CourseModel.find({ isPublished: true }).select("courseId curriculum resources").lean(),
    NoticeModel.countDocuments(),
  ]);

  const e = evalAgg[0] || { total: 0, hired: 0, certified: 0, retake: 0, avg: 0 };
  let modulesCount = 0;
  let lessonsCount = 0;
  let resourcesCount = 0;
  const perCourse = {};
  for (const c of courses) {
    const modules = c.curriculum || [];
    const lessons = modules.reduce((n, m) => n + (m.lessons || []).length, 0);
    modulesCount += modules.length;
    lessonsCount += lessons;
    resourcesCount += (c.resources || []).length;
    perCourse[c.courseId] = { modules: modules.length, lessons, resources: (c.resources || []).length };
  }

  return {
    totalTrainees,
    menCount,
    womenCount,
    paidCount,
    pendingCount,
    totalEvaluated: e.total,
    hiredCount: e.hired,
    certifiedCount: e.certified,
    retakeCount: e.retake,
    avgScore: e.total ? Math.round(e.avg * 10) / 10 : 0,
    coursesCount: courses.length,
    modulesCount,
    totalLessonsCount: lessonsCount,
    totalResourcesCount: resourcesCount,
    perCourse,
    recentNoticesCount: noticesCount,
  };
}
