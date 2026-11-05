'use client';

import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ShieldCheck, GraduationCap, Radio, HelpCircle, Hourglass, Info } from "lucide-react";
import ClassLinks from "../_shared/ClassLinks";
import SessionCountdown from "../_shared/SessionCountdown";
import NoticeList from "../_shared/NoticeList";
import PaymentRequiredCard from "../_shared/PaymentRequiredCard";
import { useNow } from "../_shared/use-now";
import { moduleSchedule, sessionState } from "../_shared/schedule";
import { toBn } from "../_shared/format";

const STATE_LABEL = {
  held: { text: "অনুষ্ঠিত", cls: "text-emerald-300" },
  live: { text: "চলমান", cls: "text-rose-300" },
  upcoming: { text: "আসন্ন", cls: "text-[#D4AF37]" },
};

/** Live classes for the trainee's OWN enrolled course(s) — no other batch's links. */
export default function ClassesClient({ courses = [], notices = [], paid = false, primaryCourseId = "", lastAttempt = null }) {
  const now = useNow();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">লাইভ ক্লাসরুম ও ব্যাচ শিডিউল</h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-rose-400" /> LIVE PORTAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">আপনার এনরোল করা ব্যাচের লাইভ সেশনে সরাসরি যুক্ত হোন</p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> OFFICIAL TOT LIVE ROOM
        </span>
      </div>

      <NoticeList notices={notices} title="ইনস্ট্রাক্টরের লাইভ ক্লাস সংক্রান্ত নোটিশ" />

      {!paid ? (
        <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} />
      ) : courses.length === 0 ? (
        <div className="p-6 rounded-3xl bg-[#081A3A]/80 border border-[#C59B27]/30 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <p>আপনার এনরোল করা কোর্সের তথ্য এখনো পাওয়া যায়নি। কিছুক্ষণ পর আবার দেখুন অথবা হেল্পলাইনে যোগাযোগ করুন।</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${courses.length > 1 ? "md:grid-cols-2" : ""} gap-6`}>
          {courses.map((c) => {
            const schedule = moduleSchedule(c);
            return (
              <div
                key={c.courseId}
                className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-[#C59B27]/70 transition-all shadow-2xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40">
                      {c.name}
                    </span>
                    {c.tag && (
                      <span className="text-[10px] font-bold text-[#D4AF37] border border-[#C59B27]/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {c.tag}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <Fact icon={Calendar} label="ওরিয়েন্টেশন:">
                      {c.orientationDate ? `${c.orientationDate}${c.orientationTime ? ` (${c.orientationTime})` : ""}` : "ঘোষণা করা হবে"}
                    </Fact>
                    <Fact icon={Clock} label="ক্লাস শিডিউল:">
                      {c.routine || "ঘোষণা করা হবে"}
                    </Fact>
                    <Fact icon={GraduationCap} label="প্রধান ইন্সট্রাক্টর:">
                      {c.instructor || "ঘোষণা করা হবে"}
                    </Fact>
                    <Fact icon={Hourglass} label="কোর্সের মেয়াদ:">
                      {c.duration || "—"}
                    </Fact>
                  </div>

                  <SessionCountdown course={c} />

                  {schedule.length > 0 && (
                    <div className="bg-[#051329]/80 border border-[#C59B27]/20 rounded-2xl p-4 space-y-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37]">
                        সেশন শিডিউল ({toBn(schedule.length)}টি)
                      </h4>
                      <ul className="space-y-1.5">
                        {schedule.map(({ key, module: m, when }) => {
                          const state = STATE_LABEL[sessionState(when, now)];
                          return (
                            <li key={key} className="text-[11px] flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                              <span className="text-slate-200">
                                <strong className="text-[#D4AF37]">{m.sessionBadge || `সেশন ${toBn(m.moduleNo ?? "")}`}:</strong> {m.title}
                                {m.trainerName && <span className="text-slate-500"> — {m.trainerName}</span>}
                              </span>
                              {/* phones: the date goes under the title instead of pushing the page wider */}
                              <span className="text-slate-400 sm:text-right sm:whitespace-nowrap">
                                {m.liveDate || m.sessionDate || "তারিখ ঘোষণা হয়নি"}
                                {m.sessionTime ? `, ${m.sessionTime}` : ""}
                                {state && <span className={`block font-bold ${state.cls}`}>{state.text}</span>}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#C59B27]/20">
                  <ClassLinks meetLink={c.meetLink} whatsappLink={c.whatsappLink} layout="stack" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-[#081A3A]/80 border border-[#C59B27]/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">লাইভ ক্লাসে অংশগ্রহণের নিয়মাবলী:</h3>
        </div>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li>ক্লাস শুরুর অন্তত ৫ মিনিট পূর্বে ক্লাসের লিংকে প্রবেশ করুন।</li>
          <li>নাম্বার বা ডিভাইসের নামের পরিবর্তে আপনার রেজিস্ট্রেশনকৃত পূর্ণ নাম দিয়ে যুক্ত হোন।</li>
          <li>মাইক্রো-টিচিং অনুশীলনের সময় ক্যামেরা অন রাখা এবং ইনস্ট্রাক্টরের নির্দেশনা সক্রিয়ভাবে অনুসরণ করা বাধ্যতামূলক।</li>
          <li>ক্লাসের লিংক বা গ্রুপ লিংক কারো সাথে শেয়ার করবেন না।</li>
        </ul>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
      <div>
        <strong className="text-white block">{label}</strong>
        <span>{children}</span>
      </div>
    </div>
  );
}
