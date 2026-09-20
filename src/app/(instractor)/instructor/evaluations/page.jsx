import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import EvaluationsClient from "./EvaluationsClient";

export const metadata = {
  title: "মূল্যায়ন ও গ্রেডিং হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মাইক্রো-টিচিং ও ফাইনাল অ্যাসেসমেন্ট এবং সনদ অনুমোদন পোর্টাল।",
};

export default async function EvaluationsPage() {
  let initialEvaluations = [];
  let trainees = [];

  try {
    await dbConnect();

    const [evals, users] = await Promise.all([
      EvaluationModel.find().sort({ createdAt: -1 }).lean(),
      UserModel.find({ role: { $in: ["teacher", "student"] } })
        .select("fullName email phone track gender designation paymentStatus")
        .sort({ fullName: 1 })
        .lean(),
    ]);

    initialEvaluations = evals.map((e) => ({
      ...e,
      _id: e._id.toString(),
      traineeId: e.traineeId ? e.traineeId.toString() : "",
      createdAt: e.createdAt ? e.createdAt.toISOString() : "",
      evaluatedAt: e.evaluatedAt ? e.evaluatedAt.toISOString() : "",
    }));

    trainees = users.map((u) => ({
      ...u,
      _id: u._id.toString(),
    }));
  } catch (error) {
    console.error("Error loading evaluations page:", error);
  }

  return (
    <EvaluationsClient
      initialEvaluations={initialEvaluations}
      trainees={trainees}
    />
  );
}
