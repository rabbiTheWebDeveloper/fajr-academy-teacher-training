import CurriculumClient from "./CurriculumClient";
import {
  DB_ERROR_MESSAGE,
  getInstructorProfile,
  loadPublishedCourses,
  requireInstructorPage,
} from "../../_shared/server";
import { batchForTrack } from "../../_shared/utils";

export const metadata = {
  title: "কারিকুলাম ও মডিউল নিয়ন্ত্রণ | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মডিউল, উইকলি সেশন ও শিডিউল নিয়ন্ত্রণ কনসোল।",
};

export default async function InstructorCurriculumPage() {
  await requireInstructorPage("/instructor/curriculum");
  const { profile } = await getInstructorProfile();

  let courses = [];
  let loadError = null;
  try {
    // Seeds the default batches on an empty DB so every save hits a real document.
    courses = await loadPublishedCourses();
  } catch (error) {
    console.error("Error fetching courses for curriculum:", error?.message || error);
    loadError = DB_ERROR_MESSAGE;
  }

  return (
    <CurriculumClient
      initialCourses={courses}
      initialCourseId={batchForTrack(profile?.track)}
      loadError={loadError}
    />
  );
}
