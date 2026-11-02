import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { ParticipantModel } from "@/model/participant-model";
import { PaymentModel } from "@/model/payment-model";
import { CourseModel } from "@/model/course-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { NoticeModel } from "@/model/notice-model";
import { courseIdForUserTrack, getCourseForTrack } from "@/service/course-service";
import { toPlain } from "@/lib/query-helpers";

/**
 * Everything the trainee ("TOT") panel shows, always for ONE user id taken from the
 * signed session. No email / tran_id overrides, no "first teacher" fallbacks.
 */

export const USER_SAFE_FIELDS = "-password -resetPasswordToken -resetPasswordExpires -permissions";
const PAYMENT_SAFE_FIELDS = "-registrationData -rawResponse -loginIssuedAt";

export const isPaidUser = (user) =>
  ["paid", "free"].includes(user?.paymentStatus) || ["admin", "super-admin", "instructor"].includes(user?.role);

export async function getTraineeUser(userId) {
  await dbConnect();
  return toPlain(await UserModel.findById(userId).select(USER_SAFE_FIELDS).lean());
}

/** Courses this user is enrolled in (paid/free participants), with a track fallback for older accounts. */
export async function getEnrolledCourses(user) {
  await dbConnect();
  const participants = await ParticipantModel.find({ user: user._id }).sort({ enrolledAt: 1 }).lean();
  const paidCourseIds = participants.filter((p) => ["paid", "free"].includes(p.paymentStatus)).map((p) => p.courseId);

  // Accounts paid before enrolment records existed: use their track's course.
  if (paidCourseIds.length === 0 && isPaidUser(user)) paidCourseIds.push(courseIdForUserTrack(user.track));

  let courses = paidCourseIds.length ? await CourseModel.find({ courseId: { $in: paidCourseIds } }).lean() : [];
  if (paidCourseIds.length && courses.length === 0) {
    const fallback = await getCourseForTrack(user.track);
    courses = fallback ? [fallback] : [];
  }
  return { participants: toPlain(participants), courses: toPlain(courses) };
}

export async function getTraineePayments(user) {
  await dbConnect();
  const payments = await PaymentModel.find({ $or: [{ user: user._id }, { userEmail: user.email }] })
    .select(PAYMENT_SAFE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
  return toPlain(payments);
}

export async function getTraineeEvaluations(user) {
  await dbConnect();
  return toPlain(await EvaluationModel.find({ traineeId: user._id }).sort({ evaluatedAt: -1 }).lean());
}

export async function getTraineeNotices(user, limit = 30) {
  await dbConnect();
  const tracks = ["all", user.track].filter(Boolean);
  if (/WOMEN/i.test(user.track || "")) tracks.push("TOT-WOMEN", "TOT-WOMEN-014");
  return toPlain(
    await NoticeModel.find({ track: { $in: [...new Set(tracks)] } })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .lean()
  );
}

/** Class info for enrolled courses. Meeting links only for paid trainees. */
export function classView(course, paid) {
  return {
    _id: course._id,
    courseId: course.courseId,
    name: course.name,
    tag: course.tag,
    track: course.track,
    orientationDate: course.orientationDate,
    orientationTime: course.orientationTime,
    routine: course.routine,
    duration: course.duration,
    instructor: course.instructor,
    meetLink: paid ? course.meetLink || "" : "",
    whatsappLink: paid ? course.whatsappLink || "" : "",
    curriculum: (course.curriculum || []).map((m) => ({
      _id: m._id,
      moduleNo: m.moduleNo,
      sessionBadge: m.sessionBadge,
      title: m.title,
      subtitle: m.subtitle,
      description: m.description,
      trainerName: m.trainerName,
      trainerRole: m.trainerRole,
      sessionDate: m.sessionDate,
      sessionTime: m.sessionTime,
      liveDate: m.liveDate,
      duration: m.duration,
      topics: m.topics || [],
      lessons: (m.lessons || []).map((l) => ({ _id: l._id, lessonNo: l.lessonNo, title: l.title, duration: l.duration })),
    })),
  };
}

/** Downloadable materials of the enrolled courses (paid trainees only). */
export function materialsView(courses, paid) {
  if (!paid) return [];
  const seen = new Set();
  const out = [];
  for (const c of courses) {
    for (const r of c.resources || []) {
      const key = `${c.courseId}:${r.resourceId || r._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...r, key, courseId: c.courseId, courseName: c.name });
    }
  }
  return out;
}

/** Full dashboard payload for one user. */
export async function getTraineeDashboard(userId) {
  const user = await getTraineeUser(userId);
  if (!user) return null;
  const paid = isPaidUser(user);
  const [{ participants, courses }, payments, evaluations, notices] = await Promise.all([
    getEnrolledCourses(user),
    getTraineePayments(user),
    getTraineeEvaluations(user),
    getTraineeNotices(user),
  ]);
  return {
    user,
    paid,
    participants,
    courses: courses.map((c) => classView(c, paid)),
    materials: materialsView(courses, paid),
    payments,
    evaluations,
    evaluation: evaluations[0] || null,
    notices,
  };
}
