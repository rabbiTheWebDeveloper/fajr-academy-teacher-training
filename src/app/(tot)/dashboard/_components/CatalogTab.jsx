"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, CheckCircle2, Video, MessageCircle, CreditCard, Clock, Lock, AlertTriangle } from "lucide-react";
import { checkoutHref, formatAmount, usableLink } from "../../_shared/format";

/**
 * Course catalogue. "Enrolled" is decided by the trainee's own enrolments only; the
 * buy button (→ /payment/ssl-checkout?course=…) appears only for courses they don't have.
 */
export default function CatalogTab({ catalog = [], catalogError = false, enrolledCourses = [], pendingIds = [], onOpenCourse }) {
  const enrolledById = Object.fromEntries(enrolledCourses.map((c) => [c.courseId, c]));
  // Enrolled courses that are not (or no longer) in the public catalogue are still listed.
  const list = [...catalog, ...enrolledCourses.filter((c) => !catalog.some((k) => k.courseId === c.courseId))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-400" /> ফজর একাডেমি কোর্স ক্যাটালগ ও ভর্তি পোর্টাল
          </h2>
          <p className="text-xs text-slate-300 mt-1">আপনার সক্রিয় কোর্সসমূহ দেখুন অথবা নতুন ব্যাচে সরাসরি ভর্তি হোন।</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> SSLCommerz ভেরিফাইড কোর্স পেমেন্ট
        </span>
      </div>

      {catalogError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          কোর্সের তালিকা এই মুহূর্তে লোড করা যায়নি। কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।
        </div>
      )}

      {list.length === 0 && !catalogError && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          এই মুহূর্তে কোনো কোর্সে ভর্তি চলছে না।
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map((course) => {
          const enrolled = enrolledById[course.courseId];
          const pending = !enrolled && pendingIds.includes(course.courseId);
          const closed = !enrolled && course.status === "Closed";
          const whatsapp = usableLink(enrolled?.whatsappLink);
          const hasFee = course.fee != null && Number.isFinite(Number(course.fee));

          return (
            <div
              key={course.courseId}
              className={`relative rounded-3xl p-6 border shadow-2xl transition-all flex flex-col justify-between ${
                enrolled
                  ? "bg-slate-900 border-indigo-500/40 shadow-indigo-900/20"
                  : "bg-slate-900 border-slate-700/60 hover:border-amber-500/50"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-800">
                    {course.tag || course.courseId}
                  </span>
                  {enrolled ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয় এনরোলমেন্ট
                    </span>
                  ) : pending ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> পেমেন্ট অসম্পূর্ণ
                    </span>
                  ) : closed ? (
                    <span className="text-xs font-bold text-slate-400">ভর্তি বন্ধ</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400">{course.status === "Upcoming" ? "শীঘ্রই শুরু হবে" : "ভর্তি চলমান"}</span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{course.name}</h3>
                  {course.summary && <p className="text-xs text-slate-300 mt-1 leading-relaxed">{course.summary}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ওরিয়েন্টেশন তারিখ:</span>
                    <strong className="text-slate-200">{course.orientationDate || "ঘোষণা করা হবে"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">সময়:</span>
                    <strong className="text-amber-300">{course.orientationTime || "ঘোষণা করা হবে"}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 block text-[11px]">ক্লাস রুটিন:</span>
                    <span className="text-slate-300 font-medium">{course.routine || "ঘোষণা করা হবে"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    ইন্সট্রাক্টর: <strong className="text-white">{course.instructor || "ঘোষণা করা হবে"}</strong>
                  </span>
                  {hasFee && (
                    <span className="text-sm font-black text-indigo-300">
                      {Number(course.regularFee) > Number(course.fee) && (
                        <span className="text-xs text-slate-500 line-through mr-1.5 font-semibold">
                          {formatAmount(course.regularFee, course.currency)}
                        </span>
                      )}
                      {formatAmount(course.fee, course.currency)}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80">
                {enrolled ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenCourse(course.courseId)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Video className="w-4 h-4" /> লাইভ ক্লাস হাবে যান
                    </button>
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp
                      </a>
                    )}
                  </div>
                ) : closed ? (
                  <span className="w-full py-3 rounded-xl bg-slate-800/70 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                    <Lock className="w-4 h-4" /> এই ব্যাচে ভর্তি বন্ধ আছে
                  </span>
                ) : (
                  <Link
                    href={checkoutHref(course.courseId)}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <CreditCard className="w-4 h-4 stroke-[2.5]" />
                    {pending ? "পেমেন্ট সম্পন্ন করুন" : "কোর্সটি কিনুন"}
                    {hasFee ? ` (${formatAmount(course.fee, course.currency)})` : ""} →
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
