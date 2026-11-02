import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { isAdminRole } from "@/lib/api-auth";
import { TRAINEE_ROLE_LIST, toPlain } from "@/lib/query-helpers";
import EvaluationsClient from "./EvaluationsClient";
import { DB_ERROR_MESSAGE, getInstructorProfile, requireInstructorPage } from "../../_shared/server";

export const metadata = {
  title: "মূল্যায়ন ও গ্রেডিং হাব | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মাইক্রো-টিচিং ও ফাইনাল অ্যাসেসমেন্ট এবং সনদ অনুমোদন পোর্টাল।",
};

export default async function EvaluationsPage({ searchParams }) {
  await requireInstructorPage("/instructor/evaluations");
  const params = await searchParams;
  const { profile } = await getInstructorProfile();

  let initialEvaluations = [];
  let trainees = [];
  let loadError = null;

  try {
    await dbConnect();
    const [evals, users] = await Promise.all([
      EvaluationModel.find().sort({ evaluatedAt: -1 }).lean(),
      UserModel.find({ role: { $in: TRAINEE_ROLE_LIST } })
        .select("fullName email phone track paymentStatus")
        .sort({ fullName: 1 })
        .lean(),
    ]);
    initialEvaluations = toPlain(evals);
    trainees = toPlain(users);
  } catch (error) {
    console.error("Error loading evaluations page:", error?.message || error);
    loadError = DB_ERROR_MESSAGE;
  }

  const preselect = typeof params?.trainee === "string" ? params.trainee : "";

  return (
    <EvaluationsClient
      initialEvaluations={initialEvaluations}
      trainees={trainees}
      currentUser={{ id: profile?.id || "", email: profile?.email || "", isAdmin: isAdminRole(profile?.role) }}
      initialTraineeId={trainees.some((t) => t._id === preselect) ? preselect : ""}
      loadError={loadError}
    />
  );
}
