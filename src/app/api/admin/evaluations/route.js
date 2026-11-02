import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { EvaluationModel } from "@/model/evaluation-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { isObjectId, searchFilter, trackFilter } from "@/lib/query-helpers";

/** Status values as stored by the evaluation model (see calculateGradeAndStatus). */
export const QUALIFICATION_STATUSES = ["hired", "certified", "in-review", "retake-needed"];

export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const byTrack = trackFilter(searchParams.get("track"));
    if (byTrack) filters.push(byTrack);
    const grade = searchParams.get("grade");
    if (grade && grade !== "all") filters.push({ grade });
    const status = searchParams.get("qualificationStatus");
    if (status && status !== "all") filters.push({ qualificationStatus: status });
    const bySearch = searchFilter(searchParams.get("search"), ["traineeName", "traineeEmail", "instructorName", "remarks"]);
    if (bySearch) filters.push(bySearch);

    const evaluations = await EvaluationModel.find(filters.length ? { $and: filters } : {}).sort({ evaluatedAt: -1 }).lean();
    const count = (s) => evaluations.filter((e) => e.qualificationStatus === s).length;
    const total = evaluations.length;
    const stats = {
      totalEvaluated: total,
      hired: count("hired"),
      certified: count("certified"),
      inReview: count("in-review"),
      retakeNeeded: count("retake-needed"),
      averageScore: total ? Math.round((evaluations.reduce((a, e) => a + (e.totalScore || 0), 0) / total) * 10) / 10 : 0,
    };

    return NextResponse.json({ success: true, stats, count: total, evaluations: JSON.parse(JSON.stringify(evaluations)) });
  } catch (error) {
    return serverError(error, "Admin evaluations GET");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return NextResponse.json({ success: false, message: "মূল্যায়ন ID প্রদান করুন।" }, { status: 400 });
    const res = await EvaluationModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) return NextResponse.json({ success: false, message: "মূল্যায়নটি পাওয়া যায়নি।" }, { status: 404 });
    return NextResponse.json({ success: true, message: "মূল্যায়ন রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin evaluations DELETE");
  }
}
