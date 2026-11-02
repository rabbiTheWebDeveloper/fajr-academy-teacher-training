/**
 * Server-only data helpers for the instructor pages (imported by page.jsx / layout.jsx only).
 * Queries mirror /api/instructor/* so the first paint and later client fetches agree.
 */
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { INSTRUCTOR_ROLES } from "@/lib/api-auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { CourseModel } from "@/model/course-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { ensureDefaultCourses } from "@/service/course-service";
import { TRAINEE_ROLE_LIST, isObjectId, searchFilter, toPlain, trackFilter } from "@/lib/query-helpers";

export const DB_ERROR_MESSAGE =
  "ডাটাবেজ থেকে তথ্য আনা যায়নি। ইন্টারনেট / ডাটাবেজ সংযোগ পরীক্ষা করে পেজটি রিফ্রেশ করুন। (নিচের সংখ্যাগুলো সঠিক নাও হতে পারে)";

/** Session guard for every instructor page (proxy.js also checks; this is defence in depth). */
export async function requireInstructorPage(path) {
  const session = await getSessionUser();
  if (!session?.id) redirect(`/login?redirect=${encodeURIComponent(path)}`);
  if (!INSTRUCTOR_ROLES.includes(session.role)) redirect("/dashboard?error=no_access");
  return session;
}

/** Logged-in staff member's real profile (deduped per request for layout + page). */
export const getInstructorProfile = cache(async () => {
  const session = await getSessionUser();
  if (!session?.id) return { profile: null, error: null };

  let user = null;
  let error = null;
  try {
    if (isObjectId(session.id)) {
      await dbConnect();
      user = await UserModel.findById(session.id)
        .select("fullName email phone designation role track gender avatar specialization")
        .lean();
    }
  } catch (err) {
    console.error("Instructor profile load error:", err?.message || err);
    error = DB_ERROR_MESSAGE;
  }

  return {
    error,
    profile: {
      id: String(session.id),
      fullName: user?.fullName || session.fullName || session.email || "",
      email: user?.email || session.email || "",
      phone: user?.phone || "",
      designation: user?.designation || "",
      specialization: user?.specialization || "",
      role: user?.role || session.role || "",
      track: user?.track ?? session.track ?? "",
      foundInDb: Boolean(user),
    },
  };
});

/** Published courses, seeding the two default TOT batches on an empty database. */
export async function loadPublishedCourses() {
  await ensureDefaultCourses();
  const courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean();
  return toPlain(courses);
}

const TRAINEE_FIELDS =
  "fullName email phone track gender designation bloodGroup paymentStatus paidAmount tranId hasLaptop quranSkill englishSkill education bio avatar createdAt";

/** One page of trainees with their latest evaluation — same shape as GET /api/instructor/trainees. */
export async function loadTraineesPage({ track = "all", paymentStatus = "all", search = "", page = 1, limit = 25 } = {}) {
  await dbConnect();
  const filters = [{ role: { $in: TRAINEE_ROLE_LIST } }];
  const byTrack = trackFilter(track);
  if (byTrack) filters.push(byTrack);
  if (paymentStatus && paymentStatus !== "all") filters.push({ paymentStatus });
  const bySearch = searchFilter(search, ["fullName", "email", "phone", "tranId"]);
  if (bySearch) filters.push(bySearch);
  const query = { $and: filters };
  const skip = (Math.max(page, 1) - 1) * limit;

  const [total, trainees] = await Promise.all([
    UserModel.countDocuments(query),
    UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select(TRAINEE_FIELDS).lean(),
  ]);

  const evaluations = await EvaluationModel.find({ traineeId: { $in: trainees.map((t) => t._id) } })
    .sort({ evaluatedAt: -1 })
    .select("traineeId totalScore grade qualificationStatus evaluatedAt scores")
    .lean();
  const latest = new Map();
  for (const e of evaluations) {
    const key = e.traineeId.toString();
    if (!latest.has(key)) latest.set(key, e);
  }

  return toPlain({
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    trainees: trainees.map((t) => {
      const e = latest.get(t._id.toString());
      return {
        ...t,
        evaluation: e
          ? {
              totalScore: e.totalScore,
              grade: e.grade,
              qualificationStatus: e.qualificationStatus,
              scores: e.scores,
              evaluatedAt: e.evaluatedAt,
            }
          : null,
      };
    }),
  });
}
