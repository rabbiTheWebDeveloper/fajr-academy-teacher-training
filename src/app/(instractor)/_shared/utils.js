/**
 * Client-safe helpers shared by the instructor panel (no server / mongoose imports).
 * Grade thresholds MUST mirror calculateGradeAndStatus in src/model/evaluation-model.js.
 */

export const SCORE_KEYS = ["makhrajTajweed", "childPsychologyPedagogy", "digitalClassroomTools", "microTeachingDemo"];

export const SCORE_CRITERIA = [
  {
    key: "makhrajTajweed",
    short: "সহীহ মাখরাজ ও তাজবীদ",
    name: "সহীহ মাখরাজ ও সিফাত নির্ভুল উচ্চারণ",
    desc: "১৭টি মাখরাজের যথার্থ প্রয়োগ ও তাজবীদ নিয়মাবলী নির্ভুল ডেলিভারি।",
  },
  {
    key: "childPsychologyPedagogy",
    short: "শিশু সাইকোলজি ও পেডাগজি",
    name: "বাচ্চাদের সাইকোলজি ও পাঠদান পেডাগজি",
    desc: "মনোযোগ ধরে রাখা, ভীতিহীন পাঠদান ও আধুনিক নূরানী কৌশল।",
  },
  {
    key: "digitalClassroomTools",
    short: "ডিজিটাল ক্লাসরুম ও এডটেক",
    name: "ডিজিটাল ক্লাসরুম ও অনলাইন টুলস",
    desc: "Zoom, Google Meet, ডিজিটাল পেন, স্ক্রিন শেয়ার ও ক্লাস ইন্টারঅ্যাকশন।",
  },
  {
    key: "microTeachingDemo",
    short: "মাইক্রো-টিচিং ডেমো ক্লাস",
    name: "মাইক্রো-টিচিং ডেমো ও প্রেজেন্টেশন",
    desc: "লাইভ ডেমো ক্লাস ডেলিভারি, কণ্ঠের ওঠা-নামা ও প্রফেশনাল কনফিডেন্স।",
  },
];

export const EMPTY_SCORES = Object.freeze({
  makhrajTajweed: 0,
  childPsychologyPedagogy: 0,
  digitalClassroomTools: 0,
  microTeachingDemo: 0,
});

export const clampScore = (v) => Math.min(Math.max(Math.round(Number(v) || 0), 0), 25);

/** Existing scores (0 stays 0 — never `|| 20`), else all zeros. */
export function scoresFrom(evaluation) {
  const s = evaluation?.scores || {};
  return Object.fromEntries(SCORE_KEYS.map((k) => [k, clampScore(s[k] ?? 0)]));
}

export const totalOf = (scores) => SCORE_KEYS.reduce((sum, k) => sum + clampScore(scores?.[k]), 0);

export const STATUS_META = {
  hired: {
    label: "নিয়োগপ্রাপ্ত",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    color: "text-emerald-400",
  },
  certified: {
    label: "সার্টিফাইড",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    color: "text-blue-400",
  },
  "in-review": {
    label: "পর্যালোচনাধীন",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    color: "text-amber-400",
  },
  "retake-needed": {
    label: "পুনরায় মূল্যায়ন প্রয়োজন",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    color: "text-rose-400",
  },
};

export const statusMeta = (status) =>
  STATUS_META[status] || { label: status || "—", badge: "bg-slate-800 text-slate-300 border-slate-700", color: "text-slate-400" };

export const GRADES = ["A+", "A", "B+", "B", "C", "F"];

/** Same thresholds as calculateGradeAndStatus (server is still the authority). */
export function gradeFor(total) {
  let grade = "F";
  let status = "retake-needed";
  if (total >= 85) {
    grade = "A+";
    status = "hired";
  } else if (total >= 75) {
    grade = "A";
    status = "certified";
  } else if (total >= 65) {
    grade = "B+";
    status = "certified";
  } else if (total >= 50) {
    grade = "B";
    status = "in-review";
  } else if (total >= 40) {
    grade = "C";
    status = "retake-needed";
  }
  return { grade, status, ...statusMeta(status) };
}

/** Bengali digits for numbers shown inside Bengali sentences. */
export function bn(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
}

export const BATCHES = {
  "TOT-MEN": {
    key: "TOT-MEN",
    apiTrack: "men",
    label: "TOT MEN BATCH",
    short: "TOT MEN",
    emoji: "👨",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  "TOT-WOMEN-014": {
    key: "TOT-WOMEN-014",
    apiTrack: "women",
    label: "TOT WOMEN (014)",
    short: "TOT WOMEN",
    emoji: "🧕",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
};

/** Batch / course code for a user track ("TOT-WOMEN" → "TOT-WOMEN-014"). Mirrors courseIdForTrack. */
export const batchForTrack = (track) => (/WOMEN/i.test(track || "") ? "TOT-WOMEN-014" : "TOT-MEN");

export function trackLabel(track) {
  if (track === "TOT-MEN") return "TOT MEN";
  if (track === "TOT-WOMEN-014") return "TOT WOMEN (014)";
  if (track === "TOT-WOMEN") return "TOT WOMEN";
  return track || "ব্যাচ নির্ধারিত নয়";
}

export const trackBadge = (track) =>
  !track
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : /WOMEN/i.test(track)
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-blue-500/20 text-blue-300 border-blue-500/30";

/** Accent styles for a course card, from its track ("men" / "women" / other). */
export function courseAccent(course) {
  const t = `${course?.track || ""} ${course?.courseId || ""}`;
  if (/women/i.test(t)) return { badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", button: "bg-emerald-600", emoji: "🧕" };
  if (/men/i.test(t)) return { badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", button: "bg-blue-600", emoji: "👨" };
  return { badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", button: "bg-indigo-600", emoji: "📘" };
}

export const PAYMENT_META = {
  paid: { label: "পরিশোধিত", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  free: { label: "ফ্রি", badge: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  pending: { label: "বকেয়া", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  failed: { label: "ব্যর্থ", badge: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
};

export const paymentMeta = (status) =>
  PAYMENT_META[status] || { label: status || "—", badge: "bg-slate-800 text-slate-300 border-slate-700" };

export function formatTaka(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "৳—";
  return `৳${bn(n.toLocaleString("en-US"))}`;
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // Fixed time zone so the server render and the browser hydrate to the same text.
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}

export const NOT_SET = "এখনো যুক্ত করা হয়নি";

export const isHttpsUrl = (v) => /^https:\/\/[^\s]+$/i.test(String(v || "").trim());

/** Unique trainer names from a course's curriculum (plus the course instructor). */
export function courseTrainers(course) {
  const names = [course?.instructor, ...(course?.curriculum || []).map((m) => m.trainerName)]
    .map((n) => String(n || "").trim())
    .filter(Boolean);
  return [...new Set(names)];
}

export function roleLabel(role) {
  if (role === "super-admin") return "SUPER ADMIN";
  if (role === "admin") return "ADMIN";
  if (role === "instructor") return "INSTRUCTOR";
  return (role || "").toUpperCase();
}
