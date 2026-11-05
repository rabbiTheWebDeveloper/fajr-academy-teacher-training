import { dbConnect } from "@/service/mongo";
import { NoticeModel } from "@/model/notice-model";
import { getInstructorStats } from "@/service/instructor-service";
import { toPlain } from "@/lib/query-helpers";
import InstructorDashboardClient from "./InstructorDashboardClient";
import {
  DB_ERROR_MESSAGE,
  getInstructorProfile,
  loadPublishedCourses,
  loadTraineesPage,
  requireInstructorPage,
} from "../_shared/server";
import { BATCHES, batchForTrack } from "../_shared/utils";

export const metadata = {
  title: "ইনস্ট্রাক্টর ড্যাশবোর্ড ও হাব | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ইনস্ট্রাক্টর সেন্ট্রাল কন্ট্রোল প্যানেল।",
};

const ROSTER_LIMIT = 10;

async function loadNotices() {
  await dbConnect();
  const notices = await NoticeModel.find().sort({ isPinned: -1, createdAt: -1 }).limit(50).lean();
  return toPlain(notices);
}

export default async function InstructorPage({ searchParams }) {
  await requireInstructorPage("/instructor");
  const params = await searchParams;
  const noAccess = params?.error === "no_access";

  const { profile, error: profileError } = await getInstructorProfile();
  // The batch toggle starts on the instructor's own track.
  const initialBatch = batchForTrack(profile.track);

  const [statsRes, coursesRes, noticesRes, rosterRes] = await Promise.allSettled([
    getInstructorStats(),
    loadPublishedCourses(),
    loadNotices(),
    loadTraineesPage({ track: BATCHES[initialBatch].apiTrack, limit: ROSTER_LIMIT }),
  ]);

  const failed = [statsRes, coursesRes, noticesRes, rosterRes].filter((r) => r.status === "rejected");
  for (const f of failed) console.error("Instructor dashboard load error:", f.reason?.message || f.reason);
  const loadError = failed.length > 0 || profileError ? DB_ERROR_MESSAGE : null;

  return (
    <InstructorDashboardClient
      // `isAdmin` only decides who may delete other people's notices — super-admin only.
      instructor={{ ...profile, isAdmin: profile.role === "super-admin" }}
      initialBatch={initialBatch}
      initialStats={statsRes.status === "fulfilled" ? toPlain(statsRes.value) : null}
      courses={coursesRes.status === "fulfilled" ? coursesRes.value : []}
      initialNotices={noticesRes.status === "fulfilled" ? noticesRes.value : []}
      initialRoster={
        rosterRes.status === "fulfilled"
          ? { trainees: rosterRes.value.trainees, total: rosterRes.value.total }
          : null
      }
      rosterLimit={ROSTER_LIMIT}
      loadError={loadError}
      noAccess={noAccess}
    />
  );
}
