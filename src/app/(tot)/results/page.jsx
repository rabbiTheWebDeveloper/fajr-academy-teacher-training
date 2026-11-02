import ResultsClient from "./ResultsClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import { loadTraineeDashboard, loadPublicSettings } from "../_shared/load-trainee";

export const metadata = {
  title: "মূল্যায়ন ফলাফল ও সনদপত্র | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের চূড়ান্ত মূল্যায়ন স্কোরকার্ড, গ্রেড ও সার্টিফিকেট পোর্টাল।",
};

/** The signed-in trainee's own results only (no ?email= / ?tran_id= / first-teacher fallback). */
export default async function TraineeResultsPage() {
  const { data, error } = await loadTraineeDashboard();
  if (!data) return <TraineeLoadError error={error} retryHref="/results" />;

  const settings = await loadPublicSettings();
  const names = Object.fromEntries(data.courses.map((c) => [c.courseId, c.name]));

  return (
    <ResultsClient
      trainee={data.user}
      paid={data.paid}
      evaluation={data.evaluation}
      evaluations={data.evaluations}
      courseNames={names}
      settings={{
        certificatePrefix: settings.certificatePrefix || "",
        instituteName: settings.instituteName || "Fajr Academy",
      }}
    />
  );
}
