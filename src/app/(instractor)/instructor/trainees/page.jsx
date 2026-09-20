import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import TraineesClient from "./TraineesClient";

export const metadata = {
  title: "ট্রেইনি শিক্ষক ডিরেক্টরি | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের নিবন্ধিত ও পেমেন্টকৃত ট্রেইনি শিক্ষক তালিকা ও প্রোফাইল।",
};

export default async function TraineesPage() {
  let trainees = [];
  try {
    await dbConnect();
    const [data, evaluations] = await Promise.all([
      UserModel.find({ role: { $in: ["teacher", "student"] } })
        .sort({ createdAt: -1 })
        .select(
          "fullName email phone track gender designation bloodGroup paymentStatus paidAmount tranId hasLaptop quranSkill englishSkill education bio createdAt"
        )
        .lean(),
      EvaluationModel.find().lean(),
    ]);

    const evalMap = {};
    evaluations.forEach((e) => {
      evalMap[e.traineeId.toString()] = e;
    });

    trainees = data.map((t) => {
      const idStr = t._id.toString();
      const evaluation = evalMap[idStr] || null;
      return {
        ...t,
        _id: idStr,
        createdAt: t.createdAt ? t.createdAt.toISOString() : "",
        evaluation: evaluation
          ? {
              totalScore: evaluation.totalScore,
              grade: evaluation.grade,
              qualificationStatus: evaluation.qualificationStatus,
              scores: evaluation.scores,
              remarks: evaluation.remarks,
              evaluatedAt: evaluation.evaluatedAt
                ? new Date(evaluation.evaluatedAt).toISOString()
                : "",
            }
          : null,
      };
    });
  } catch (error) {
    console.error("Error fetching trainees:", error);
  }

  return <TraineesClient initialTrainees={trainees} />;
}
