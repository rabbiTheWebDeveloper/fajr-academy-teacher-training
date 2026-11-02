import ClassesClient from "./ClassesClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import { latestUnpaidAttempt } from "../_shared/PaymentRequiredCard";
import { loadTraineeDashboard, primaryCourseIdFor } from "../_shared/load-trainee";

export const metadata = {
  title: "লাইভ ক্লাস ও শিডিউল | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ ক্লাস এক্সেস, শিডিউল ও রেকর্ডেড লেকচার হাব।",
};

export default async function ClassesPage() {
  const { data, error } = await loadTraineeDashboard();
  if (!data) return <TraineeLoadError error={error} retryHref="/classes" />;

  return (
    <ClassesClient
      courses={data.courses}
      notices={data.notices}
      paid={data.paid}
      primaryCourseId={primaryCourseIdFor(data.user)}
      lastAttempt={latestUnpaidAttempt(data.payments)}
    />
  );
}
