import TraineesClient from "./TraineesClient";
import { DB_ERROR_MESSAGE, loadTraineesPage, requireInstructorPage } from "../../_shared/server";

export const metadata = {
  title: "ট্রেইনি শিক্ষক ডিরেক্টরি | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের নিবন্ধিত ও পেমেন্টকৃত ট্রেইনি শিক্ষক তালিকা ও প্রোফাইল।",
};

const PAGE_SIZE = 25;

export default async function TraineesPage() {
  await requireInstructorPage("/instructor/trainees");

  let initialData = null;
  let loadError = null;
  try {
    // First page only — further pages, filters and search go through GET /api/instructor/trainees.
    initialData = await loadTraineesPage({ page: 1, limit: PAGE_SIZE });
  } catch (error) {
    console.error("Error fetching trainees:", error?.message || error);
    loadError = DB_ERROR_MESSAGE;
  }

  return <TraineesClient initialData={initialData} pageSize={PAGE_SIZE} loadError={loadError} />;
}
