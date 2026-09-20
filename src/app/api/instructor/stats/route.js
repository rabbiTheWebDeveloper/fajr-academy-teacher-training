import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { CourseModel } from "@/model/course-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");

    const traineeRoleFilter = { role: { $in: ["teacher", "student"] } };

    const [
      totalTrainees,
      menCount,
      womenCount,
      paidCount,
      pendingCount,
      evaluations,
      courses,
      recentNoticesCount,
    ] = await Promise.all([
      UserModel.countDocuments(traineeRoleFilter),
      UserModel.countDocuments({
        ...traineeRoleFilter,
        $or: [{ track: "TOT-MEN" }, { gender: "male" }],
      }),
      UserModel.countDocuments({
        ...traineeRoleFilter,
        $or: [{ track: { $regex: /WOMEN/i } }, { gender: "female" }],
      }),
      UserModel.countDocuments({
        ...traineeRoleFilter,
        paymentStatus: "paid",
      }),
      UserModel.countDocuments({
        ...traineeRoleFilter,
        paymentStatus: { $ne: "paid" },
      }),
      EvaluationModel.find().lean(),
      CourseModel.find({ isPublished: true }).lean(),
      NoticeModel.countDocuments(),
    ]);

    const totalEvaluated = evaluations.length;
    const hiredCount = evaluations.filter((e) => e.qualificationStatus === "hired").length;
    const certifiedCount = evaluations.filter(
      (e) => e.qualificationStatus === "certified" || e.qualificationStatus === "hired"
    ).length;
    const avgScore =
      totalEvaluated > 0
        ? Math.round(
            (evaluations.reduce((sum, e) => sum + (e.totalScore || 0), 0) /
              totalEvaluated) *
              10
          ) / 10
        : 0;

    let totalLessonsCount = 0;
    let totalResourcesCount = 0;
    (courses || []).forEach((c) => {
      (c.curriculum || []).forEach((m) => {
        totalLessonsCount += (m.lessons || []).length;
      });
      totalResourcesCount += (c.resources || []).length;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalTrainees,
        menCount,
        womenCount,
        paidCount,
        pendingCount,
        totalEvaluated,
        hiredCount,
        certifiedCount,
        avgScore,
        coursesCount: courses.length,
        totalLessonsCount,
        totalResourcesCount,
        recentNoticesCount,
      },
    });
  } catch (error) {
    console.error("Instructor Stats GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
