/**
 * Pure display helpers for the trainee (TOT) panel. No database / browser access,
 * so they are safe in both server and client components.
 */

export const TZ = "Asia/Dhaka";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** "2026" → "২০২৬" */
export const toBn = (value) => String(value ?? "").replace(/\d/g, (d) => BN_DIGITS[d]);

/** "০১২" → "012" */
export const fromBnDigits = (value) => String(value ?? "").replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** ৳ ১,০০০ (BDT) or "১,০০০ USD" for other currencies. */
export function formatAmount(amount, currency = "BDT") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const num = n.toLocaleString("bn-BD", { maximumFractionDigits: 2 });
  return !currency || currency === "BDT" ? `৳ ${num}` : `${num} ${currency}`;
}

/** Bengali date (optionally with time), always in Bangladesh time so server and browser agree. */
export function formatDate(value, { time = false } = {}) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const opts = { timeZone: TZ, year: "numeric", month: "long", day: "numeric" };
  if (time) Object.assign(opts, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleString("bn-BD", opts);
}

/* ------------------------------------------------------------------ */
/* Tones (Tailwind classes kept as full literals so they are compiled) */
/* ------------------------------------------------------------------ */

export const TONE_BADGE = {
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  gold: "bg-[#C59B27]/20 text-[#D4AF37] border-[#C59B27]/40",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  sky: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  slate: "bg-slate-700/40 text-slate-300 border-slate-600/50",
};

export const TONE_DOT = {
  emerald: "bg-emerald-400",
  gold: "bg-[#D4AF37]",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
  slate: "bg-slate-400",
};

/* ------------------------------ Payments ------------------------------ */

export const PAYMENT_STATUS = {
  VALID: { label: "পরিশোধিত", en: "PAID", tone: "emerald" },
  PENDING: { label: "অপেক্ষমাণ / যাচাই চলছে", en: "PENDING", tone: "amber" },
  FAILED: { label: "ব্যর্থ", en: "FAILED", tone: "rose" },
  CANCELLED: { label: "বাতিলকৃত", en: "CANCELLED", tone: "rose" },
  UNATTEMPTED: { label: "পেমেন্ট করা হয়নি", en: "UNATTEMPTED", tone: "slate" },
  EXPIRED: { label: "মেয়াদোত্তীর্ণ", en: "EXPIRED", tone: "slate" },
  INVALID: { label: "যাচাইয়ে ব্যর্থ", en: "INVALID", tone: "rose" },
  REFUNDED: { label: "টাকা ফেরত দেওয়া হয়েছে", en: "REFUNDED", tone: "sky" },
};

export function paymentStatusInfo(status) {
  const key = String(status || "").toUpperCase();
  return PAYMENT_STATUS[key] || { label: status || "অজানা", en: key || "UNKNOWN", tone: "slate" };
}

/** Payment attempts that can simply be retried from the checkout page. */
export const RETRYABLE_PAYMENT = ["FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED", "INVALID"];

export const PAYMENT_PURPOSE = {
  registration: "রেজিস্ট্রেশন ও কোর্স ফি",
  "course-purchase": "নতুন কোর্স ক্রয়",
  manual: "ম্যানুয়াল পেমেন্ট (অফিস কর্তৃক রেকর্ডকৃত)",
};

export const ACCOUNT_PAYMENT_STATUS = {
  paid: { label: "পরিশোধিত ও সক্রিয়", tone: "emerald" },
  free: { label: "ফ্রি এনরোলমেন্ট (সক্রিয়)", tone: "emerald" },
  pending: { label: "পেমেন্ট বাকি", tone: "amber" },
  failed: { label: "পেমেন্ট ব্যর্থ হয়েছে", tone: "rose" },
};

export function paymentMethodText(p) {
  const method = p?.paymentMethod || (p?.purpose === "manual" ? "MANUAL" : "SSLCOMMERZ");
  return p?.cardType ? `${method} • ${p.cardType}` : method;
}

/** Checkout link for a course. The checkout page charges the server-side course fee. */
export const checkoutHref = (courseId) =>
  courseId ? `/payment/ssl-checkout?course=${encodeURIComponent(courseId)}` : "/payment/ssl-checkout";

/* ----------------------------- Evaluations ---------------------------- */

export const EVAL_STATUS = {
  hired: {
    label: "নিয়োগপ্রাপ্ত",
    tone: "emerald",
    passed: true,
    title: "অভিনন্দন! আপনি ফজর একাডেমিতে শিক্ষক হিসেবে নিয়োগপ্রাপ্ত",
    message:
      "আপনার মূল্যায়নের ভিত্তিতে আপনাকে ফজর একাডেমির শিক্ষক প্যানেলে নিয়োগের জন্য নির্বাচন করা হয়েছে এবং সার্টিফাইড ট্রেইনার হিসেবে সনদ প্রদান করা হয়েছে।",
  },
  certified: {
    label: "সার্টিফাইড",
    tone: "gold",
    passed: true,
    title: "সফলভাবে উত্তীর্ণ ও সনদপ্রাপ্ত (Certified Trainer)",
    message: "মাশাআল্লাহ! আপনি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মূল্যায়নে সফলভাবে উত্তীর্ণ হয়ে সনদ অর্জন করেছেন।",
  },
  "in-review": {
    label: "পর্যালোচনাধীন",
    tone: "amber",
    passed: false,
    title: "আপনার ফলাফল পর্যালোচনাধীন",
    message:
      "আপনার মূল্যায়ন সম্পন্ন হয়েছে, তবে চূড়ান্ত সিদ্ধান্ত এখনো পর্যালোচনাধীন। পর্যালোচনা শেষে সনদ সংক্রান্ত সিদ্ধান্ত জানানো হবে।",
  },
  "retake-needed": {
    label: "পুনরায় মূল্যায়ন প্রয়োজন",
    tone: "rose",
    passed: false,
    title: "পুনরায় মূল্যায়ন প্রয়োজন",
    message:
      "এবারের মূল্যায়নে প্রয়োজনীয় নম্বর অর্জিত হয়নি। ইনস্ট্রাক্টরের পরামর্শ অনুযায়ী অনুশীলন করে পুনরায় মূল্যায়নে অংশ নিন।",
  },
};

export function evalStatusInfo(status) {
  return (
    EVAL_STATUS[status] || {
      label: status || "অজানা",
      tone: "slate",
      passed: false,
      title: "মূল্যায়নের অবস্থা",
      message: "আপনার মূল্যায়নের অবস্থা সম্পর্কে জানতে ইনস্ট্রাক্টরের সাথে যোগাযোগ করুন।",
    }
  );
}

/** Certificates exist only for hired / certified trainees. */
export const canHaveCertificate = (status) => status === "hired" || status === "certified";

export const GRADE_SCALE = [
  { grade: "A+", min: 85, status: "hired", label: "অসাধারণ (Outstanding)" },
  { grade: "A", min: 75, status: "certified", label: "চমৎকার (Excellent)" },
  { grade: "B+", min: 65, status: "certified", label: "খুব ভালো (Very Good)" },
  { grade: "B", min: 50, status: "in-review", label: "সন্তোষজনক (Satisfactory)" },
  { grade: "C", min: 40, status: "retake-needed", label: "উন্নতি প্রয়োজন (Needs Improvement)" },
  { grade: "F", min: 0, status: "retake-needed", label: "অকৃতকার্য (Not Passed)" },
];

export const gradeLabel = (grade) => GRADE_SCALE.find((g) => g.grade === grade)?.label || "";

/** Lowest score that earns a certificate (B+). */
export const CERTIFICATE_MIN_SCORE = 65;

/* ------------------------------ Trainee ------------------------------ */

export const STAFF_ROLES = ["admin", "super-admin", "instructor"];

export function trackLabel(track) {
  if (/WOMEN/i.test(track || "")) return "TOT – মহিলা ব্যাচ (WOMEN)";
  if (track === "TOT-MEN") return "TOT – পুরুষ ব্যাচ (MEN)";
  return track || "—";
}

/** Same trainee-ID convention as the instructor panel (TOT-PAID-… → TOT-TR-…). */
export function traineeIdOf(user) {
  if (!user) return "—";
  if (user.employeeId) return user.employeeId;
  if (user.tranId) return String(user.tranId).replace(/^TOT-PAID-/, "TOT-TR-");
  return user._id ? `TOT-TR-${String(user._id).slice(-6).toUpperCase()}` : "—";
}

export const QURAN_SKILLS = [
  { value: "fluent", label: "শুদ্ধ ও সুন্দরভাবে তিলাওয়াত করতে পারি" },
  { value: "tajweed", label: "তাজবীদ ও মাখরাজসহ পারি" },
  { value: "hafez", label: "আমি হাফেজ / হিফজ সম্পন্ন" },
  { value: "basic", label: "মাঝারি মানের (ইমপ্রুভমেন্ট দরকার)" },
];

export const ENGLISH_SKILLS = [
  { value: "basic", label: "বেসিক ইংরেজি জানি ও বুঝি" },
  { value: "good", label: "সাবলীলভাবে কথা বলতে ও বোঝাতে পারি" },
  { value: "fluent", label: "ফ্লুয়েন্ট (আন্তর্জাতিক শিক্ষার্থীদের পড়াতে সক্ষম)" },
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* ------------------------------- Links ------------------------------- */

// Seed / model-default values that look like links but lead nowhere.
const PLACEHOLDER_LINKS = new Set([
  "https://meet.google.com/tot-fajr-room",
  "https://meet.google.com/tot-fajr-men-2026",
  "https://meet.google.com/tot-fajr-women-014",
  "https://chat.whatsapp.com/tot-fajr-community",
  "https://chat.whatsapp.com/tot-fajr-men-batch",
  "https://chat.whatsapp.com/tot-fajr-women-batch014",
  "https://drive.google.com",
  "https://drive.google.com/drive/folders/tot-fajr-resources",
]);

/** The URL if it is a real http(s) link, otherwise "" (not set / placeholder / unsafe scheme). */
export function usableLink(url) {
  const u = String(url || "").trim();
  if (!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(u)) return "";
  if (u.includes("...")) return "";
  if (PLACEHOLDER_LINKS.has(u.replace(/\/+$/, "").toLowerCase())) return "";
  if (/drive\.google\.com\/file\/d\/fajr-[a-z-]+-2026(\/|$)/i.test(u)) return "";
  return u;
}
