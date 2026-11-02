"use client";

import { useState } from "react";
import Link from "next/link";
import { OfficialIDCard, OfficialIDCardBack, downloadIDCardElement } from "@/components/TeacherOfficialIDCard";
import { CreditCard, Download, ArrowLeft, ShieldCheck, Printer, Sparkles, AlertTriangle, Loader2, UserX, Eye } from "lucide-react";
import PaymentRequiredCard from "../_shared/PaymentRequiredCard";
import { ACCOUNT_PAYMENT_STATUS, TONE_BADGE } from "../_shared/format";

const FRONT_ID = "trainee-id-card-front";
const BACK_ID = "trainee-id-card-back";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #id-card-print-area, #id-card-print-area * { visibility: visible !important; }
  #id-card-print-area { position: absolute; left: 0; top: 0; width: 100%; display: flex !important; gap: 24px; justify-content: center; }
}`;

export default function TraineeIDCardClient({
  missing = false,
  missingText = "এই ব্যবহারকারীকে খুঁজে পাওয়া যায়নি। লিংকটি পুরোনো বা ভুল হতে পারে।",
  profile = {},
  trackName = "",
  email = "",
  phone = "",
  paid = false,
  paymentStatus = "",
  primaryCourseId = "",
  viewingOther = false,
  notice = null,
  backHref = "/dashboard",
  helpline = "",
}) {
  const [downloading, setDownloading] = useState(null); // "front" | "back" | null
  const [feedback, setFeedback] = useState(null); // { type, message }

  if (missing) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-4">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> ফিরে যান
        </Link>
        <div className="bg-[#081A3A] border border-rose-500/40 rounded-3xl p-8 text-center space-y-3">
          <UserX className="w-10 h-10 text-rose-300 mx-auto" />
          <h1 className="text-lg font-black text-white">আইডি কার্ড দেখানো যাচ্ছে না</h1>
          <p className="text-xs text-slate-300">{missingText}</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (side) => {
    if (downloading) return;
    setDownloading(side);
    setFeedback(null);
    try {
      await downloadIDCardElement(side === "front" ? FRONT_ID : BACK_ID, profile.teacherId || "Trainee", side);
      setFeedback({ type: "success", message: "আইডি কার্ডের ছবি (PNG) ডাউনলোড শুরু হয়েছে।" });
    } catch (err) {
      console.error("ID card download failed:", err);
      setFeedback({ type: "error", message: "কার্ড ডাউনলোড করা যায়নি। প্রিন্ট অপশন থেকে PDF হিসেবে সেভ করে দেখুন।" });
    } finally {
      setDownloading(null);
    }
  };

  const account = ACCOUNT_PAYMENT_STATUS[paymentStatus];
  // A trainee's own card exists only after payment; staff may still inspect an unpaid trainee.
  const showCard = paid || viewingOther;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors">
          <ArrowLeft className="w-4 h-4" /> {viewingOther ? "তালিকায় ফিরে যান" : "ড্যাশবোর্ডে ফিরে যান"}
        </Link>
        {viewingOther ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/40 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> স্টাফ ভিউ — ট্রেইনির আইডি কার্ড
          </span>
        ) : (
          paid && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> VERIFIED TRAINEE ID
            </span>
          )
        )}
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-100 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" /> {notice}
        </div>
      )}

      {viewingOther && !paid && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-100 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          এই ট্রেইনির পেমেন্ট এখনো সম্পন্ন হয়নি ({account?.label || paymentStatus || "অজানা"}) — কার্ডটি এখনো বৈধ নয়।
        </div>
      )}

      {!showCard ? (
        <PaymentRequiredCard courseId={primaryCourseId} />
      ) : (
        <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <style>{PRINT_CSS}</style>
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
              <Sparkles className="w-3.5 h-3.5" /> Better Teachers, Brighter Generations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">অফিসিয়াল ডিজিটাল ট্রেইনি কার্ড</h1>
            <p className="text-xs sm:text-sm text-slate-300">ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল ট্রেইনি পরিচিতিপত্র</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
            <div id="id-card-print-area" className="flex flex-col sm:flex-row items-center gap-6">
              <OfficialIDCard cardId={FRONT_ID} profile={profile} />
              <OfficialIDCardBack cardId={BACK_ID} profile={profile} helpline={helpline} />
            </div>

            <div className="space-y-4 max-w-sm w-full text-xs text-slate-300">
              <div className="bg-[#051329] p-5 rounded-2xl border border-[#C59B27]/30 space-y-3 shadow-lg">
                <h3 className="font-bold text-[#D4AF37] text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> কার্ডের বিবরণ
                </h3>
                <div className="space-y-1.5 text-slate-300">
                  <p>
                    <strong>নাম:</strong> {profile.fullName}
                  </p>
                  <p>
                    <strong>আইডি:</strong> {profile.teacherId}
                  </p>
                  <p>
                    <strong>ট্র্যাক:</strong> {trackName}
                  </p>
                  <p>
                    <strong>রক্তের গ্রুপ:</strong> {profile.bloodGroup || "দেওয়া হয়নি"}
                  </p>
                  {viewingOther && (
                    <>
                      <p>
                        <strong>ইমেইল:</strong> {email}
                      </p>
                      <p>
                        <strong>মোবাইল:</strong> {phone || "—"}
                      </p>
                    </>
                  )}
                  {account && (
                    <p className="flex items-center gap-2">
                      <strong>পেমেন্ট:</strong>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${TONE_BADGE[account.tone]}`}>{account.label}</span>
                    </p>
                  )}
                  {profile.validity && (
                    <p>
                      <strong>মেয়াদ:</strong> {profile.validity}
                    </p>
                  )}
                  <p>
                    <strong>ইস্যু অথরিটি:</strong> ফজর একাডেমি টিচার্স ট্রেনিং বোর্ড
                  </p>
                </div>
                {!viewingOther && !profile.bloodGroup && (
                  <p className="text-[11px] text-amber-300">
                    কার্ডে রক্তের গ্রুপ দেখাতে{" "}
                    <Link href="/dashboard" className="underline font-bold">
                      ড্যাশবোর্ড থেকে প্রোফাইল আপডেট করুন
                    </Link>
                    ।
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["front", "back"].map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => handleDownload(side)}
                    disabled={Boolean(downloading)}
                    className="py-2.5 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] border border-[#C59B27]/40 text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {downloading === side ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {side === "front" ? "সামনের অংশ (PNG)" : "পেছনের অংশ (PNG)"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C59B27]/25 transition-all border border-[#FDFBF7]/30"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট / PDF সেভ করুন
              </button>

              {feedback && (
                <p
                  role="status"
                  className={`p-3 rounded-xl border text-[11px] font-semibold ${
                    feedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/40 text-rose-300"
                  }`}
                >
                  {feedback.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
