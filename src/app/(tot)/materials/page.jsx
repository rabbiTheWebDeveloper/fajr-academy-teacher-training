import MaterialsClient from "./MaterialsClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import { latestUnpaidAttempt } from "../_shared/PaymentRequiredCard";
import { loadTraineeDashboard, primaryCourseIdFor } from "../_shared/load-trainee";

export const metadata = {
  title: "কোর্স ম্যাটেরিয়ালস ও বুকস | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল স্টাডি বুকস, লেসন প্ল্যান ও রিসোর্স ফাইলসমূহ।",
};

export default async function MaterialsPage() {
  const { data, error } = await loadTraineeDashboard();
  if (!data) return <TraineeLoadError error={error} retryHref="/materials" />;

  return (
    <MaterialsClient
      materials={data.materials}
      courses={data.courses.map((c) => ({ courseId: c.courseId, name: c.name }))}
      paid={data.paid}
      primaryCourseId={primaryCourseIdFor(data.user)}
      lastAttempt={latestUnpaidAttempt(data.payments, primaryCourseIdFor(data.user))}
    />
  );
}
