import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getTraineeDashboard } from "@/service/trainee-service";
import { courseIdForUserTrack } from "@/service/course-service";
import { dbConnect } from "@/service/mongo";
import { CourseModel } from "@/model/course-model";
import { SettingModel } from "@/model/setting-model";
import { publicSettings } from "@/lib/public-settings";
import { toPlain } from "@/lib/query-helpers";

/**
 * Server-side loaders shared by the trainee pages. Every page reads data for the
 * signed-in session user ONLY — never ?email=, ?tran_id= or a "first teacher" fallback.
 */

/** Session or redirect to /login. Must stay outside try/catch (redirect throws). */
export async function requireSession() {
  const session = await getSessionUser();
  if (!session?.id) redirect("/login");
  return session;
}

/**
 * { session, data, error } — data is getTraineeDashboard() (plain JSON) or null with
 * error "not_found" (account deleted) / "load_failed" (database unavailable etc.).
 */
export async function loadTraineeDashboard() {
  const session = await requireSession();
  try {
    const data = await getTraineeDashboard(session.id);
    if (!data) return { session, data: null, error: "not_found" };
    return { session, data, error: null };
  } catch (error) {
    // A malformed user id in an old token can never match an account.
    if (error?.name === "CastError") return { session, data: null, error: "not_found" };
    console.error("[TOT] trainee data load failed:", error?.message || error);
    return { session, data: null, error: "load_failed" };
  }
}

// Catalogue fields only — class links never leave the server through this list.
const CATALOG_FIELDS =
  "courseId name tag track summary fee regularFee currency orientationDate orientationTime routine duration instructor maxSeats status";

/** Published courses for the "buy another course" catalogue. Throws on DB errors. */
export async function getCourseCatalog() {
  await dbConnect();
  const courses = await CourseModel.find({ isPublished: true }).select(CATALOG_FIELDS).sort({ createdAt: 1 }).lean();
  return toPlain(courses);
}

/** Public settings (certificate prefix, helpline …); falls back to defaults if the DB is down. */
export async function loadPublicSettings() {
  try {
    await dbConnect();
    const doc = await SettingModel.findOne({ key: "system_settings" }).lean();
    return publicSettings(doc);
  } catch (error) {
    console.error("[TOT] settings load failed:", error?.message || error);
    return publicSettings();
  }
}

/** The course a trainee's own registration fee is for. */
export const primaryCourseIdFor = (user) => courseIdForUserTrack(user?.track);

/** courseId → course name, from the enrolled courses plus (optionally) the catalogue. */
export function courseNameMap(...lists) {
  const map = {};
  for (const list of lists) for (const c of list || []) if (c?.courseId && c.name) map[c.courseId] = c.name;
  return map;
}

/** Adds courseId/courseName to each payment (registration payments carry only a track). */
export function withCourseNames(payments, names) {
  return (payments || []).map((p) => {
    const courseId = p.courseId || (p.purpose === "registration" ? courseIdForUserTrack(p.track) : "");
    return { ...p, courseId, courseName: names[courseId] || courseId || "" };
  });
}
