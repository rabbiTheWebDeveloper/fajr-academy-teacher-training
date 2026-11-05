import webpush from "web-push";
import { after } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PushSubscriptionModel } from "@/model/push-subscription-model";
import { TotModel } from "@/model/tot-model";
import { InstructorModel } from "@/model/instructor-model";
import { UserModel } from "@/model/user-model";
import { resolveAdminAccess } from "@/service/access-service";
import { hasPermission } from "@/lib/rbac";

/**
 * Web Push (works while the app/browser tab is closed; on iPhone only for the app added to the
 * Home Screen). Needs a VAPID key pair in the environment — generate one with
 *   npx web-push generate-vapid-keys
 * and set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY (and optionally VAPID_SUBJECT=mailto:you@domain).
 * Without keys every function here is a silent no-op, so the rest of the app is unaffected.
 *
 * Senders never throw and never delay the API response: `schedulePush` runs them after the
 * response is sent (next/server `after`), falling back to a detached promise outside a request.
 */

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@fajracademy.io";

let configured = null;
export function pushConfigured() {
  if (configured === null) {
    configured = false;
    if (PUBLIC_KEY && PRIVATE_KEY) {
      try {
        webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
        configured = true;
      } catch (err) {
        console.error("[push] invalid VAPID settings — push notifications are off:", err.message);
      }
    }
  }
  return configured;
}

export const pushPublicKey = () => (pushConfigured() ? PUBLIC_KEY : "");

/** Run a push job after the response; never throws. */
export function schedulePush(label, job) {
  const run = () =>
    Promise.resolve()
      .then(job)
      .catch((err) => console.warn(`[push] ${label} skipped:`, err?.message || err));
  try {
    after(run);
  } catch {
    run(); // not inside a request (scripts, tests)
  }
}

const clip = (s, n) => {
  const v = String(s ?? "").replace(/\s+/g, " ").trim();
  return v.length > n ? `${v.slice(0, n - 1)}…` : v;
};

/** The JSON the service worker (public/sw.js) turns into a notification. Kept well under 4 KB. */
function buildPayload({ title, body, url = "/", tag, urgent = false }) {
  return JSON.stringify({
    title: clip(title, 80),
    body: clip(body, 180),
    url,
    tag: tag || undefined,
    urgent: Boolean(urgent),
  });
}

const BATCH = 50;

async function sendToSubscriptions(subs, payload, { urgency = "normal" } = {}) {
  if (!subs.length || !pushConfigured()) return { sent: 0, removed: 0 };
  let sent = 0;
  const gone = [];
  const delivered = [];
  for (let i = 0; i < subs.length; i += BATCH) {
    await Promise.all(
      subs.slice(i, i + BATCH).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 60 * 60 * 24, urgency });
          sent += 1;
          delivered.push(s._id);
        } catch (err) {
          // 404/410: the browser dropped this subscription (app uninstalled, permission revoked…)
          if (err?.statusCode === 404 || err?.statusCode === 410) gone.push(s._id);
          else console.warn("[push] delivery failed:", err?.statusCode || "", clip(err?.body || err?.message, 200));
        }
      })
    );
  }
  if (gone.length) await PushSubscriptionModel.deleteMany({ _id: { $in: gone } });
  if (delivered.length) await PushSubscriptionModel.updateMany({ _id: { $in: delivered } }, { $set: { lastSuccessAt: new Date() } });
  return { sent, removed: gone.length };
}

/** Send to every device of the given accounts. `ids` omitted → every account of that type. */
export async function pushToAccounts(accountType, ids, message) {
  if (!pushConfigured()) return { sent: 0, removed: 0 };
  await dbConnect();
  const query = { accountType };
  if (ids) {
    if (!ids.length) return { sent: 0, removed: 0 };
    query.accountId = { $in: ids };
  }
  const subs = await PushSubscriptionModel.find(query).select("endpoint keys").lean();
  return sendToSubscriptions(subs, buildPayload(message), { urgency: message.urgent ? "high" : "normal" });
}

/** Same batch matching the trainee notice board uses (src/service/trainee-service.js). */
function trackQuery(track) {
  if (!track || track === "all") return {};
  if (/WOMEN/i.test(track)) return { track: { $in: ["TOT-WOMEN", "TOT-WOMEN-014"] } };
  return { track };
}

async function subscribedIds(accountType) {
  return PushSubscriptionModel.distinct("accountId", { accountType });
}

// ---------------------------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------------------------

/**
 * A new notice: trainees of that batch; when an admin posted it, also the batch's instructors
 * (an instructor with no batch gets every admin notice).
 */
export function notifyNoticePosted(notice, { fromAdmin = false } = {}) {
  if (!pushConfigured() || !notice) return;
  schedulePush("notice", async () => {
    await dbConnect();
    const urgent = notice.priority === "urgent";
    const message = {
      title: `${urgent ? "🚨 জরুরি নোটিশ" : notice.priority === "important" ? "📢 গুরুত্বপূর্ণ নোটিশ" : "📢 নতুন নোটিশ"}: ${notice.title}`,
      body: notice.content,
      tag: `notice-${notice._id}`,
      urgent,
    };

    const traineeIds = await subscribedIds("tot");
    if (traineeIds.length) {
      const ids = await TotModel.find({ _id: { $in: traineeIds }, isActive: { $ne: false }, ...trackQuery(notice.track) }).distinct("_id");
      await pushToAccounts("tot", ids, { ...message, url: "/dashboard" });
    }

    if (fromAdmin) {
      const instructorIds = await subscribedIds("instructor");
      if (instructorIds.length) {
        const match = trackQuery(notice.track);
        const ids = await InstructorModel.find({
          _id: { $in: instructorIds },
          isActive: { $ne: false },
          ...(match.track ? { $or: [match, { track: "" }] } : {}),
        }).distinct("_id");
        await pushToAccounts("instructor", ids, { ...message, url: "/instructor" });
      }
    }
  });
}

/** The trainee's payment is verified (gateway or an admin's manual verification). */
export function notifyPaymentVerified(user, payment) {
  if (!pushConfigured() || !user?._id || !payment) return;
  schedulePush("payment-verified", () =>
    pushToAccounts("tot", [user._id], {
      title: "✅ পেমেন্ট সফল হয়েছে",
      body: `৳${Number(payment.amount || 0).toLocaleString("en-US")} পেমেন্ট যাচাই হয়েছে (${payment.tranId})। আপনার কোর্স এখন চালু।`,
      url: "/payments",
      tag: `payment-${payment.tranId}`,
    })
  );
}

/** A trainee paid online (SSLCommerz confirmed it): admins who can see payments. */
export function notifyAdminsNewPayment(payment, user) {
  if (!pushConfigured() || !payment) return;
  schedulePush("admin-new-payment", async () => {
    await dbConnect();
    const adminIds = await subscribedIds("admin");
    if (!adminIds.length) return;
    const admins = await UserModel.find({ _id: { $in: adminIds }, isActive: { $ne: false } }).select("role").lean();
    const allowed = [];
    for (const a of admins) {
      const { access } = await resolveAdminAccess({ id: String(a._id), role: a.role });
      if (access && hasPermission(access, "payments", "read")) allowed.push(a._id);
    }
    const name = user?.fullName || payment.userName || payment.userEmail || "একজন ট্রেইনি";
    await pushToAccounts("admin", allowed, {
      title: `💳 নতুন পেমেন্ট: ৳${Number(payment.amount || 0).toLocaleString("en-US")}`,
      body: `${name} — ${payment.courseId || payment.track || ""} (${payment.cardType || payment.paymentGateway || "SSLCommerz"})`,
      url: "/admin/payments",
      tag: `admin-payment-${payment.tranId}`,
    });
  });
}

/** An instructor saved (or updated) a trainee's evaluation. */
export function notifyEvaluationSaved(evaluation) {
  if (!pushConfigured() || !evaluation?.traineeId) return;
  schedulePush("evaluation", () =>
    pushToAccounts("tot", [evaluation.traineeId], {
      title: "🏅 আপনার মূল্যায়নের ফলাফল প্রকাশিত হয়েছে",
      body: `মোট স্কোর ${evaluation.totalScore}/১০০ • গ্রেড ${evaluation.grade}। বিস্তারিত দেখতে ট্যাপ করুন।`,
      url: "/results",
      tag: `evaluation-${evaluation.traineeId}`,
    })
  );
}
