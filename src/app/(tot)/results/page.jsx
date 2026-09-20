import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import ResultsClient from "./ResultsClient";

export const metadata = {
  title: "মূল্যায়ন ফলাফল ও সনদপত্র | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের চূড়ান্ত মূল্যায়ন স্কোরকার্ড, গ্রেড ও সার্টিফিকেট পোর্টাল।",
};

export default async function TraineeResultsPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;
  const emailParam = params?.email || session?.email;
  const tranIdParam = params?.tran_id;

  let trainee = null;
  let evaluation = null;

  try {
    await dbConnect();
    if (emailParam) {
      trainee = await UserModel.findOne({ email: emailParam.toLowerCase().trim() }).lean();
    }
    if (!trainee && tranIdParam) {
      trainee = await UserModel.findOne({ tranId: tranIdParam }).lean();
    }
    if (!trainee) {
      trainee = await UserModel.findOne({ role: { $in: ["teacher", "student"] } }).lean();
    }

    if (trainee) {
      evaluation = await EvaluationModel.findOne({ traineeId: trainee._id })
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (error) {
    console.error("Error loading trainee results:", error);
  }

  const sanitizedTrainee = trainee
    ? {
        fullName: trainee.fullName,
        email: trainee.email,
        phone: trainee.phone,
        track: trainee.track || "TOT-MEN",
        tranId: trainee.tranId || "TOT-TR-014",
        designation: trainee.designation || "TOT Trainee Teacher",
        enrolledAt: trainee.enrolledAt ? new Date(trainee.enrolledAt).toISOString() : "",
      }
    : null;

  const sanitizedEvaluation = evaluation
    ? {
        _id: evaluation._id.toString(),
        totalScore: evaluation.totalScore,
        grade: evaluation.grade,
        qualificationStatus: evaluation.qualificationStatus,
        scores: evaluation.scores,
        remarks: evaluation.remarks,
        instructorName: evaluation.instructorName || "ফজর একাডেমি ফ্যাকাল্টি",
        evaluatedAt: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toISOString() : "",
      }
    : null;

  return (
    <ResultsClient
      trainee={sanitizedTrainee}
      evaluation={sanitizedEvaluation}
    />
  );
}
