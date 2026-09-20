import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { CourseModel, DEFAULT_TOT_CURRICULUM, DEFAULT_TOT_RESOURCES } from "@/model/course-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";
import InstructorDashboardClient from "./InstructorDashboardClient";

export const metadata = {
  title: "ইনস্ট্রাক্টর ড্যাশবোর্ড ও হাব | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ইনস্ট্রাক্টর সেন্ট্রাল কন্ট্রোল প্যানেল।",
};

export default async function InstructorPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;

  let totalTrainees = 0;
  let menTraineesCount = 0;
  let womenTraineesCount = 0;
  let paidTraineesCount = 0;
  let pendingTraineesCount = 0;
  let totalEvaluated = 0;
  let hiredCount = 0;
  let avgScore = 0;
  let recentTrainees = [];
  let recentNotices = [];
  let activeCourses = [];

  try {
    await dbConnect();

    const [
      total,
      men,
      women,
      paid,
      pending,
      recents,
      evals,
      notices,
      courses,
    ] = await Promise.all([
      UserModel.countDocuments({ role: { $in: ["teacher", "student"] } }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        $or: [{ track: "TOT-MEN" }, { gender: "male" }],
      }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        $or: [{ track: { $regex: /WOMEN/i } }, { gender: "female" }],
      }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        paymentStatus: "paid",
      }),
      UserModel.countDocuments({
        role: { $in: ["teacher", "student"] },
        paymentStatus: { $ne: "paid" },
      }),
      UserModel.find({ role: { $in: ["teacher", "student"] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("fullName email phone track gender paymentStatus paidAmount tranId hasLaptop quranSkill createdAt")
        .lean(),
      EvaluationModel.find().lean(),
      NoticeModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      CourseModel.find({ isPublished: true }).lean(),
    ]);

    totalTrainees = total;
    menTraineesCount = men;
    womenTraineesCount = women;
    paidTraineesCount = paid;
    pendingTraineesCount = pending;
    totalEvaluated = evals.length;
    hiredCount = evals.filter((e) => e.qualificationStatus === "hired").length;
    avgScore =
      totalEvaluated > 0
        ? Math.round(
            (evals.reduce((sum, e) => sum + (e.totalScore || 0), 0) /
              totalEvaluated) *
              10
          ) / 10
        : 0;

    // Attach evaluation to recent trainees
    const evalMap = {};
    evals.forEach((e) => {
      evalMap[e.traineeId.toString()] = e;
    });

    recentTrainees = recents.map((r) => {
      const idStr = r._id.toString();
      const evaluation = evalMap[idStr] || null;
      return {
        ...r,
        _id: idStr,
        createdAt: r.createdAt ? r.createdAt.toISOString() : "",
        evaluation: evaluation
          ? {
              totalScore: evaluation.totalScore,
              grade: evaluation.grade,
              qualificationStatus: evaluation.qualificationStatus,
            }
          : null,
      };
    });

    recentNotices = notices.map((n) => ({
      ...n,
      _id: n._id.toString(),
      createdAt: n.createdAt ? n.createdAt.toISOString() : "",
    }));

    activeCourses = (courses || []).map((c) => ({
      ...c,
      _id: c._id.toString(),
    }));
  } catch (error) {
    console.error("Instructor dashboard data fetch error:", error);
  }

  const instructorProfile = {
    fullName: session?.fullName || "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
    email: session?.email || "instructor@fajracademy.io",
    designation: "Lead Master Trainer (TOT)",
    role: "instructor",
    track: "TOT-MEN",
  };

  return (
    <InstructorDashboardClient
      instructor={instructorProfile}
      stats={{
        totalTrainees,
        menTraineesCount,
        womenTraineesCount,
        paidTraineesCount,
        pendingTraineesCount,
        totalEvaluated,
        hiredCount,
        avgScore,
        recentTrainees,
      }}
      initialNotices={recentNotices}
      courses={activeCourses}
    />
  );
}
