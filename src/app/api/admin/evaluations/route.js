import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { EvaluationModel } from "@/model/evaluation-model";
import { UserModel } from "@/model/user-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");
    const grade = searchParams.get("grade");
    const qualificationStatus = searchParams.get("qualificationStatus");
    const search = searchParams.get("search");

    const query = {};
    if (track && track !== "all") query.track = track;
    if (grade && grade !== "all") query.grade = grade;
    if (qualificationStatus && qualificationStatus !== "all") {
      query.qualificationStatus = qualificationStatus;
    }

    if (search) {
      query.$or = [
        { traineeName: { $regex: search, $options: "i" } },
        { traineeEmail: { $regex: search, $options: "i" } },
        { instructorName: { $regex: search, $options: "i" } },
        { remarks: { $regex: search, $options: "i" } },
      ];
    }

    const evaluations = await EvaluationModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate aggregated statistics
    const totalCount = evaluations.length;
    const certifiedHiredCount = evaluations.filter(
      (e) => e.qualificationStatus === "certified_and_hired"
    ).length;
    const certifiedCount = evaluations.filter(
      (e) => e.qualificationStatus === "certified"
    ).length;
    const needsImprovementCount = evaluations.filter(
      (e) => e.qualificationStatus === "needs_improvement"
    ).length;
    const avgScore =
      totalCount > 0
        ? Math.round(
            evaluations.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) /
              totalCount
          )
        : 0;

    const sanitized = evaluations.map((e) => ({
      ...e,
      _id: e._id.toString(),
      traineeId: e.traineeId ? e.traineeId.toString() : "",
      evaluatedAt: e.evaluatedAt
        ? new Date(e.evaluatedAt).toISOString()
        : e.createdAt
        ? new Date(e.createdAt).toISOString()
        : "",
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalEvaluated: totalCount,
        certifiedAndHired: certifiedHiredCount,
        certifiedOnly: certifiedCount,
        needsImprovement: needsImprovementCount,
        averageScore: avgScore,
      },
      count: sanitized.length,
      evaluations: sanitized,
    });
  } catch (error) {
    console.error("Admin Evaluations GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "মূল্যায়ন ID প্রদান করুন।" },
        { status: 400 }
      );
    }

    await EvaluationModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "মূল্যায়ন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
