import Link from "next/link";
import { CreditCard, Lock, Clock } from "lucide-react";
import { checkoutHref, formatAmount, formatDate, paymentStatusInfo, TONE_BADGE } from "./format";

/**
 * Shown instead of class links / materials / ID card while the trainee has not paid.
 * `lastAttempt` is the trainee's most recent non-VALID payment (if any).
 */
export default function PaymentRequiredCard({ courseId, lastAttempt = null, compact = false }) {
  const pending = lastAttempt?.status === "PENDING";
  const info = lastAttempt ? paymentStatusInfo(lastAttempt.status) : null;

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border-2 border-amber-500/40 shadow-2xl ${
        compact ? "p-5" : "p-6 sm:p-8"
      } space-y-4`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 shrink-0">
          {pending ? <Clock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-white">
            {pending ? "আপনার পেমেন্ট যাচাই প্রক্রিয়াধীন" : "কোর্স ফি এখনো পরিশোধ করা হয়নি"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {pending
              ? "পেমেন্ট গেটওয়ে থেকে নিশ্চিতকরণ এলে আপনার অ্যাক্সেস স্বয়ংক্রিয়ভাবে সক্রিয় হবে। কয়েক মিনিট পর পেজটি রিফ্রেশ করুন। টাকা কেটে গেলেও অ্যাক্সেস না পেলে হেল্পলাইনে ট্রানজেকশন আইডিসহ যোগাযোগ করুন।"
              : "পেমেন্ট সম্পন্ন হলে লাইভ ক্লাসের লিংক, হোয়াটসঅ্যাপ গ্রুপ, স্টাডি ম্যাটেরিয়াল ও ডিজিটাল আইডি কার্ড সক্রিয় হবে।"}
          </p>
        </div>
      </div>

      {lastAttempt && (
        <div className="bg-[#051329]/80 border border-slate-700/60 rounded-2xl p-3.5 text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-slate-400">সর্বশেষ পেমেন্ট চেষ্টা:</span>
          <span className="font-mono font-bold text-[#D4AF37]">{lastAttempt.tranId}</span>
          <span>{formatAmount(lastAttempt.amount, lastAttempt.currency)}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${TONE_BADGE[info.tone]}`}>
            {info.en} • {info.label}
          </span>
          {lastAttempt.createdAt && <span className="text-slate-500">{formatDate(lastAttempt.createdAt, { time: true })}</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={checkoutHref(courseId)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          <CreditCard className="w-4 h-4" /> {pending ? "আবার পেমেন্ট করুন" : "পেমেন্ট সম্পন্ন করুন"} →
        </Link>
        <Link href="/payments" className="text-xs font-bold text-slate-300 hover:text-[#D4AF37]">
          পেমেন্ট হিস্টোরি দেখুন
        </Link>
      </div>
    </div>
  );
}

/**
 * Latest non-VALID payment for the course the card asks the trainee to pay for
 * (payments without a course code — older registrations — count as that course).
 */
export function latestUnpaidAttempt(payments = [], courseId = "") {
  return payments.find((p) => p.status !== "VALID" && (!courseId || !p.courseId || p.courseId === courseId)) || null;
}
