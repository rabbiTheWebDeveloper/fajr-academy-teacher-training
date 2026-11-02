import TraineeIDCardClient from "./TraineeIDCardClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import { requireSession, loadPublicSettings, primaryCourseIdFor } from "../_shared/load-trainee";
import { getTraineeUser, isPaidUser } from "@/service/trainee-service";
import { TRAINEE_ROLE_LIST } from "@/lib/query-helpers";
import { STAFF_ROLES, traineeIdOf, trackLabel } from "../_shared/format";

export const metadata = {
  title: "ট্রেইনি আইডি কার্ড | ফজর একাডেমি TOT",
  description: "অফিসিয়াল ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স ডিজিটাল ট্রেইনি আইডি কার্ড।",
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;

/**
 * Trainees always see their own card. Staff (admin / super-admin / instructor) may open
 * a trainee's card with ?user=<24-hex user id>. (The old ?tran_id= lookup exposed anyone's card.)
 */
export default async function TraineeIDCardPage({ searchParams }) {
  const session = await requireSession();
  const params = (await searchParams) || {};
  const requested = typeof params.user === "string" ? params.user.trim() : "";
  const isStaff = STAFF_ROLES.includes(session.role);

  let notice = null;
  let targetId = session.id;
  if (requested && requested !== session.id) {
    if (!isStaff) notice = "অন্য কারো আইডি কার্ড দেখার অনুমতি আপনার নেই — আপনার নিজের কার্ড দেখানো হচ্ছে।";
    else if (!OBJECT_ID.test(requested)) notice = "আইডি কার্ডের লিংকটি সঠিক নয় (ব্যবহারকারী আইডি ভুল) — আপনার নিজের কার্ড দেখানো হচ্ছে।";
    else targetId = requested;
  }
  const viewingOther = targetId !== session.id;
  const staffBackHref = session.role === "instructor" ? "/instructor/trainees" : "/admin/users";

  let user = null;
  try {
    user = await getTraineeUser(targetId);
  } catch (error) {
    console.error("[TOT] id-card load failed:", error?.message || error);
    return <TraineeLoadError error="load_failed" retryHref={viewingOther ? `/id-card?user=${targetId}` : "/id-card"} />;
  }

  if (!user) {
    if (!viewingOther) return <TraineeLoadError error="not_found" />;
    return <TraineeIDCardClient missing backHref={staffBackHref} />;
  }
  if (viewingOther && !TRAINEE_ROLE_LIST.includes(user.role)) {
    return (
      <TraineeIDCardClient
        missing
        missingText="এই অ্যাকাউন্টটি ট্রেইনি অ্যাকাউন্ট নয়, তাই এখানে এর আইডি কার্ড দেখানো হয় না।"
        backHref={staffBackHref}
      />
    );
  }

  const settings = await loadPublicSettings();
  const since = user.enrolledAt || user.createdAt;
  const year = since ? new Date(since).getFullYear() : NaN;

  return (
    <TraineeIDCardClient
      profile={{
        fullName: user.fullName,
        designation: user.designation || "TOT Trainee Teacher",
        teacherId: traineeIdOf(user),
        bloodGroup: user.bloodGroup || "",
        avatar: user.avatar || "",
        track: user.track || "",
        department: user.department || "",
        validity: Number.isFinite(year) ? `${year} Academic Session` : "",
      }}
      trackName={trackLabel(user.track)}
      email={user.email}
      phone={user.phone}
      paid={isPaidUser(user)}
      paymentStatus={user.paymentStatus}
      primaryCourseId={primaryCourseIdFor(user)}
      viewingOther={viewingOther}
      notice={notice}
      backHref={viewingOther ? staffBackHref : "/dashboard"}
      helpline={settings.helplinePhone || ""}
    />
  );
}
