import { dbConnect } from "@/service/mongo";
import { EvaluationModel } from "@/model/evaluation-model";
import AdminEvaluationsClient from "./AdminEvaluationsClient";

export const metadata = {
  title: "ট্রেইনি মূল্যায়ন ও সনদপত্র ব্যবস্থাপনা | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Training of Trainers (TOT) Trainee Evaluations, Rubrics & Certification Master Console.",
};

export const dynamic = "force-dynamic";

export default async function AdminEvaluationsPage() {
  let initialEvaluations = [];
  let stats = {
    totalEvaluated: 0,
    certifiedAndHired: 0,
    certifiedOnly: 0,
    needsImprovement: 0,
    averageScore: 0,
  };

  try {
    await dbConnect();
    const data = await EvaluationModel.find()
      .sort({ createdAt: -1 })
      .lean();

    initialEvaluations = data.map((e) => ({
      ...e,
      _id: e._id.toString(),
      traineeId: e.traineeId ? e.traineeId.toString() : "",
      evaluatedAt: e.evaluatedAt
        ? new Date(e.evaluatedAt).toISOString()
        : e.createdAt
        ? new Date(e.createdAt).toISOString()
        : "",
    }));

    const total = initialEvaluations.length;
    const hired = initialEvaluations.filter(
      (e) => e.qualificationStatus === "certified_and_hired"
    ).length;
    const cert = initialEvaluations.filter(
      (e) => e.qualificationStatus === "certified"
    ).length;
    const needsImp = initialEvaluations.filter(
      (e) => e.qualificationStatus === "needs_improvement"
    ).length;
    const avg =
      total > 0
        ? Math.round(
            initialEvaluations.reduce(
              (acc, curr) => acc + (curr.totalScore || 0),
              0
            ) / total
          )
        : 0;

    stats = {
      totalEvaluated: total,
      certifiedAndHired: hired,
      certifiedOnly: cert,
      needsImprovement: needsImp,
      averageScore: avg,
    };
  } catch (error) {
    console.error("Admin Evaluations fetch error:", error);
  }

  return (
    <AdminEvaluationsClient
      initialEvaluations={initialEvaluations}
      initialStats={stats}
    />
  );
}
