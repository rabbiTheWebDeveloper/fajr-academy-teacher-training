import { dbConnect } from "@/service/mongo";
import { EvaluationModel } from "@/model/evaluation-model";
import { toPlain } from "@/lib/query-helpers";
import AdminEvaluationsClient from "./AdminEvaluationsClient";

export const metadata = {
  title: "ট্রেইনি মূল্যায়ন ও সনদপত্র ব্যবস্থাপনা | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Training of Trainers (TOT) Trainee Evaluations, Rubrics & Certification Master Console.",
};

export const dynamic = "force-dynamic";

export default async function AdminEvaluationsPage() {
  let initialEvaluations = [];
  let loadError = null;

  try {
    await dbConnect();
    const data = await EvaluationModel.find().sort({ evaluatedAt: -1, createdAt: -1 }).lean();
    initialEvaluations = toPlain(data);
  } catch (error) {
    console.error("Admin Evaluations fetch error:", error);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — মূল্যায়ন তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  // Stats (hired / certified / in-review / retake-needed, average) are derived from this list on the client.
  return <AdminEvaluationsClient initialEvaluations={initialEvaluations} loadError={loadError} />;
}
