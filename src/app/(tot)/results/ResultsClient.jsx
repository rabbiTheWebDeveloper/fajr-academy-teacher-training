'use client';

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  BookOpen,
  Sparkles,
  UserCheck,
  FileText,
  BadgeCheck,
  Info,
  History,
} from "lucide-react";
import CopyButton from "../_shared/CopyButton";
import {
  canHaveCertificate,
  CERTIFICATE_MIN_SCORE,
  evalStatusInfo,
  formatDate,
  formatDateEn,
  gradeLabel,
  GRADE_SCALE,
  EVAL_STATUS,
  toBn,
  traineeIdOf,
  trackLabel,
  TONE_BADGE,
} from "../_shared/format";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #official-certificate-container, #official-certificate-container * { visibility: visible !important; }
  #official-certificate-container { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 20px !important; }
  .no-print { display: none !important; }
}`;

const STATUS_ICON = {
  emerald: Sparkles,
  gold: Award,
  amber: Clock,
  rose: AlertCircle,
  slate: Info,
};

const RUBRIC = [
  {
    id: "makhrajTajweed",
    name: "মাখরাজ ও তাজবীদ বিশুদ্ধতা",
    englishName: "Makhraj & Tajweed Precision",
    desc: "হরফের বিশুদ্ধ উচ্চারণ, মাদ্দ, গুন্নাহ্‌ এবং কিরাত উপস্থাপনার সঠিক নিয়মাবলি।",
    color: "from-amber-400 to-[#D4AF37]",
  },
  {
    id: "childPsychologyPedagogy",
    name: "শিশু মনোবিজ্ঞান ও শিক্ষাদান পদ্ধতি",
    englishName: "Child Psychology & Modern Pedagogy",
    desc: "শিশুবান্ধব আনন্দময় ক্লাস পরিচালনা, ধৈর্যশীল আচরণ ও মোটিভেশনাল টেকনিক।",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "digitalClassroomTools",
    name: "ডিজিটাল ক্লাসরুম ও সফটওয়্যার দক্ষতা",
    englishName: "Digital Classroom & Interactive Tools",
    desc: "জুম/গুগল মিট, ডিজিটাল হোয়াইটবোর্ড ও অডিও-ভিজ্যুয়াল উপকরণের সাবলীল ব্যবহার।",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "microTeachingDemo",
    name: "মাইক্রো-টিচিং লাইভ ডেমো ক্লাস",
    englishName: "Micro-Teaching Live Demo",
    desc: "বাস্তব ক্লাস সিমিউলেশনে পাঠদান, সময় ব্যবস্থাপনা ও আত্মবিশ্বাসী প্রেজেন্টেশন।",
    color: "from-purple-400 to-pink-500",
  },
];
const RUBRIC_MAX = 25;

export default function ResultsClient({ trainee, paid = false, evaluation = null, evaluations = [], courseNames = {}, settings = {} }) {
  const traineeId = traineeIdOf(trainee);
  const status = evaluation?.qualificationStatus;
  const statusInfo = evalStatusInfo(status);
  const StatusIcon = STATUS_ICON[statusInfo.tone] || Info;
  const eligible = Boolean(evaluation) && canHaveCertificate(status);
  const totalScore = Number(evaluation?.totalScore) || 0;
  const grade = evaluation?.grade || "—";
  const scores = evaluation?.scores || {};
  const idPart = String(evaluation?._id || "").slice(-8).toUpperCase();
  const certificateNo = eligible ? [settings.certificatePrefix, idPart].filter(Boolean).join("-") : "";
  const courseName = evaluation?.courseId ? courseNames[evaluation.courseId] || evaluation.courseId : "";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {eligible && <style>{PRINT_CSS}</style>}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Fajr Academy • TOT Evaluation Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-[#D4AF37]" />
            কোর্স মূল্যায়ন ও ফলাফল
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {eligible && (
            <>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                সনদপত্র প্রিন্ট / PDF
              </button>
              <CopyButton
                text={certificateNo}
                label="সনদ নম্বর কপি"
                copiedLabel="সনদ নম্বর কপি হয়েছে!"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#081A3A] border border-[#C59B27]/40 text-slate-200 hover:text-[#D4AF37] text-xs font-semibold transition-all"
              />
            </>
          )}
        </div>
      </div>

      {/* Trainee meta bar */}
      <div className="bg-gradient-to-r from-[#081A3A] via-[#051329] to-[#081A3A] border border-[#C59B27]/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/40 flex items-center justify-center font-bold text-[#D4AF37] text-lg shadow-inner">
            {(trainee.fullName || "T").trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">{trainee.fullName}</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                {trackLabel(trainee.track)}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {trainee.email} • ট্রেইনি আইডি: <span className="font-mono text-[#D4AF37] font-semibold">{traineeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">মূল্যায়নের অবস্থা</div>
            <div
              className={`text-xs font-bold flex items-center justify-end gap-1 ${
                evaluation ? (statusInfo.passed ? "text-emerald-400" : "text-amber-300") : "text-slate-300"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" /> {evaluation ? statusInfo.label : "মূল্যায়ন বাকি"}
            </div>
          </div>
        </div>
      </div>

      {evaluation ? (
        <>
          {/* Results showcase */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 shadow-2xl no-print">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />

            <div className={`flex items-start gap-3.5 p-4 rounded-2xl border mb-6 ${TONE_BADGE[statusInfo.tone]}`}>
              <StatusIcon className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-1">{statusInfo.title}</h3>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{statusInfo.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Score */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">মোট অর্জিত স্কোর (Total Score)</span>
                <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#C59B27] py-2">
                  {toBn(totalScore)}
                  <span className="text-xl sm:text-2xl text-slate-400 font-medium ml-1">/১০০</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-[#D4AF37] to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(Math.max(totalScore, 0), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-2 gap-2">
                  <span>সনদের ন্যূনতম নম্বর: {toBn(CERTIFICATE_MIN_SCORE)}</span>
                  <span className={`font-semibold ${statusInfo.passed ? "text-emerald-400" : "text-amber-300"}`}>
                    {status === "hired" ? "উত্তীর্ণ ও নিয়োগপ্রাপ্ত" : statusInfo.passed ? "উত্তীর্ণ" : statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Grade */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-[#D4AF37]" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">ফাইনাল লেটার গ্রেড (Grade)</span>
                <div className={`text-5xl sm:text-6xl font-black py-2 ${statusInfo.passed ? "text-emerald-400" : "text-amber-300"}`}>{grade}</div>
                <p className="text-xs text-slate-300 mt-1">{gradeLabel(grade)}</p>
                <div
                  className={`inline-flex items-center gap-1 text-[11px] mt-3 px-3 py-1 rounded-full ${
                    eligible ? "text-emerald-300 bg-emerald-500/10" : "text-slate-400 bg-slate-800/60"
                  }`}
                >
                  {eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  {eligible
                    ? "ডিজিটাল সনদপত্র ইস্যু হয়েছে"
                    : status === "in-review"
                    ? "পর্যালোচনা শেষে সনদের সিদ্ধান্ত"
                    : "এই ফলাফলে সনদ প্রযোজ্য নয়"}
                </div>
              </div>

              {/* Evaluator */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                  <UserCheck className="w-4 h-4" /> মূল্যায়নকারী
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{evaluation.instructorName || "ফজর একাডেমি ফ্যাকাল্টি"}</div>
                  <div className="text-xs text-slate-400">মূল্যায়নকারী ইনস্ট্রাক্টর</div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>
                    মূল্যায়নের তারিখ:{" "}
                    <span className="text-slate-200 font-medium">{formatDate(evaluation.evaluatedAt || evaluation.createdAt) || "—"}</span>
                  </div>
                  {courseName && (
                    <div>
                      কোর্স: <span className="text-slate-200 font-medium">{courseName}</span>
                    </div>
                  )}
                  {eligible && (
                    <div>
                      সনদ নম্বর: <span className="text-[#D4AF37] font-mono text-[11px]">{certificateNo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {evaluation.remarks && (
              <div className="mt-6 bg-[#0B2545]/60 border border-[#C59B27]/25 rounded-2xl p-5">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  ইনস্ট্রাক্টরের মূল্যায়ন মন্তব্য ও পর্যবেক্ষণ:
                </span>
                <p className="text-sm text-slate-200 italic leading-relaxed pl-3 border-l-2 border-[#D4AF37] whitespace-pre-line">
                  &ldquo;{evaluation.remarks}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Rubric */}
          <div className="space-y-4 no-print">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                ৪-স্তরীয় মূল্যায়ন রুব্রিক স্কোরকার্ড (Rubric Breakdown)
              </h3>
              <p className="text-xs text-slate-400">প্রতিটি বিষয়ের পূর্ণমান ২৫, মোট ১০০ নম্বর</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RUBRIC.map((item) => {
                const score = Math.min(Math.max(Number(scores[item.id]) || 0, 0), RUBRIC_MAX);
                const percentage = Math.round((score / RUBRIC_MAX) * 100);
                return (
                  <div key={item.id} className="bg-[#051329] border border-slate-800 hover:border-[#C59B27]/40 rounded-2xl p-5 shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[11px] text-slate-400 block">{item.englishName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#D4AF37]">{toBn(score)}</span>
                        <span className="text-xs text-slate-500 font-medium">/{toBn(RUBRIC_MAX)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">{item.desc}</p>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>দক্ষতা মাত্রা</span>
                      <span className="font-semibold text-slate-200">{toBn(percentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History */}
          {evaluations.length > 1 && (
            <div className="bg-[#051329] border border-[#C59B27]/25 rounded-3xl p-5 shadow-xl space-y-3 no-print">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" /> মূল্যায়নের ইতিহাস ({toBn(evaluations.length)}টি)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] uppercase text-[#D4AF37] border-b border-[#C59B27]/20">
                    <tr>
                      <th className="py-2 px-3">তারিখ</th>
                      <th className="py-2 px-3">কোর্স</th>
                      <th className="py-2 px-3">স্কোর</th>
                      <th className="py-2 px-3">গ্রেড</th>
                      <th className="py-2 px-3">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59B27]/10">
                    {evaluations.map((ev) => {
                      const info = evalStatusInfo(ev.qualificationStatus);
                      return (
                        <tr key={ev._id}>
                          <td className="py-2 px-3 whitespace-nowrap">{formatDate(ev.evaluatedAt || ev.createdAt)}</td>
                          <td className="py-2 px-3">{courseNames[ev.courseId] || ev.courseId || "—"}</td>
                          <td className="py-2 px-3 font-bold text-[#D4AF37]">{toBn(ev.totalScore ?? 0)}/১০০</td>
                          <td className="py-2 px-3 font-bold">{ev.grade}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${TONE_BADGE[info.tone]}`}>{info.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Certificate (hired / certified only) */}
          {eligible ? (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between no-print">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#D4AF37]" />
                    অফিসিয়াল সনদপত্র (Official Digital Certificate)
                  </h3>
                  <p className="text-xs text-slate-400">সরাসরি প্রিন্ট অথবা PDF হিসেবে সংরক্ষণ করতে পারেন।</p>
                </div>
              </div>

              <div
                id="official-certificate-container"
                className="relative bg-gradient-to-b from-[#061938] via-[#081F44] to-[#041226] border-8 border-double border-[#D4AF37]/60 rounded-3xl p-6 sm:p-12 text-center text-white shadow-2xl overflow-hidden"
              >
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                  <Award className="w-96 h-96 text-[#D4AF37]" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="text-amber-300 font-serif text-base sm:text-lg tracking-wider">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] tracking-widest uppercase bg-[#C59B27]/15 px-4 py-1 rounded-full border border-[#C59B27]/30">
                      {(settings.instituteName || "Fajr Academy").toUpperCase()} • TEACHER TRAINING DIVISION
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-300 font-serif">
                      {status === "hired" ? "CERTIFICATE OF EXCELLENCE" : "CERTIFICATE OF ACHIEVEMENT"}
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-100/70 uppercase tracking-widest font-semibold">ট্রেনিং অব ট্রেইনার্স (TOT) সনদপত্র</p>
                  </div>

                  <div className="py-4">
                    <p className="text-xs sm:text-sm text-slate-300 italic mb-2">This certificate is proudly awarded to</p>
                    <div className="text-2xl sm:text-4xl font-black text-white font-serif tracking-wide border-b-2 border-[#D4AF37]/40 pb-2 inline-block px-8">
                      {trainee.fullName}
                    </div>
                    <p className="text-xs text-[#D4AF37] mt-2 font-mono">
                      Trainee ID: {traineeId} • Track: {trainee.track || "—"}
                    </p>
                  </div>

                  <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                    for successfully completing the evaluation in{" "}
                    <strong className="text-[#D4AF37] font-semibold">
                      Tajweed Precision, Child Psychology &amp; Modern Qur&apos;anic Pedagogy, Digital Classroom Management, and Live Micro-Teaching
                    </strong>{" "}
                    under the Training of Trainers (TOT) curriculum{courseName ? ` (${courseName})` : ""}, achieving Final Grade:{" "}
                    <strong className="text-emerald-400 font-bold">{grade}</strong> (Score: <strong className="text-[#D4AF37] font-bold">{totalScore}/100</strong>).
                  </p>

                  <div className="pt-8 sm:pt-12 grid grid-cols-3 items-end gap-4 text-center">
                    <div className="space-y-1">
                      <div className="h-10 flex items-center justify-center">
                        <span className="font-serif italic text-amber-200 text-sm border-b border-slate-500/50 pb-0.5 px-3">
                          {evaluation.instructorName || "Faculty Lead"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">মূল্যায়নকারী প্রশিক্ষক</div>
                      <div className="text-[10px] text-slate-400">TOT Examination Board</div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-[#D4AF37] to-yellow-300 p-1 shadow-xl flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-[#051329] flex flex-col items-center justify-center text-center p-1 border border-amber-300/40">
                          <Award className="w-5 h-5 text-[#D4AF37] mb-0.5" />
                          <span className="text-[7px] font-black text-amber-200 uppercase tracking-tighter">OFFICIAL SEAL</span>
                          <span className="text-[6px] text-slate-300">VERIFIED</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="h-10 flex items-center justify-center">
                        <span className="font-serif italic text-amber-200 text-sm border-b border-slate-500/50 pb-0.5 px-3">
                          {settings.instituteName || "Fajr Academy"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white">কোর্স ডিরেক্টর</div>
                      <div className="text-[10px] text-slate-400">ফজর একাডেমি বাংলাদেশ</div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                    <span>Issue Date: {formatDateEn(evaluation.evaluatedAt || evaluation.createdAt) || "—"}</span>
                    <span className="font-mono text-[#D4AF37]">Certificate No: {certificateNo}</span>
                    <span>www.fajracademy.io</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#081A3A]/80 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3 no-print">
              <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <p>
                সনদপত্র শুধুমাত্র “{EVAL_STATUS.certified.label}” অথবা “{EVAL_STATUS.hired.label}” ফলাফলের জন্য ইস্যু করা হয় (ন্যূনতম{" "}
                {toBn(CERTIFICATE_MIN_SCORE)} নম্বর)। আপনার বর্তমান অবস্থা: <strong className="text-white">{statusInfo.label}</strong>।
              </p>
            </div>
          )}

          <GradeScale />
        </>
      ) : (
        /* No evaluation yet */
        <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#D4AF37] shadow-xl">
            <Clock className="w-10 h-10" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D4AF37] bg-[#C59B27]/20 px-3 py-1 rounded-full border border-[#C59B27]/30 uppercase">
              Evaluation Pending
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">আপনার মূল্যায়ন এখনো প্রকাশিত হয়নি</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {paid
                ? "লাইভ ক্লাস ও মাইক্রো-টিচিং ডেমো সম্পন্ন হওয়ার পর ইনস্ট্রাক্টর আপনার মূল্যায়ন প্রকাশ করবেন। প্রকাশিত হলে ফলাফল এখানে দেখা যাবে।"
                : "মূল্যায়নে অংশ নিতে প্রথমে কোর্স ফি পরিশোধ করে ক্লাসে যুক্ত হতে হবে।"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left pt-4">
            {[
              { title: "ধাপ ১: ক্লাস", text: "লাইভ ট্রেনিং সেশনে অংশগ্রহণ।" },
              { title: "ধাপ ২: ডেমো", text: "মাইক্রো-টিচিং লাইভ ডেমো ক্লাস উপস্থাপন।" },
              { title: "ধাপ ৩: মার্কিং", text: "৪টি রুব্রিকে ১০০ নম্বরের মূল্যায়ন।" },
              { title: "ধাপ ৪: সনদ", text: "উত্তীর্ণদের সনদপত্র ও শিক্ষক নিয়োগ।" },
            ].map((s) => (
              <div key={s.title} className="bg-[#051329] p-4 rounded-xl border border-slate-800">
                <div className="text-[#D4AF37] font-bold text-xs mb-1">{s.title}</div>
                <p className="text-[11px] text-slate-300">{s.text}</p>
              </div>
            ))}
          </div>

          <GradeScale />

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {paid ? (
              <>
                <Link
                  href="/classes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:scale-105 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  লাইভ ক্লাসে যোগ দিন
                </Link>
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#081A3A] border border-[#C59B27]/40 text-slate-200 hover:text-[#D4AF37] font-semibold text-xs transition-colors"
                >
                  কোর্স ম্যাটেরিয়াল পড়ুন
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg"
              >
                পেমেন্ট সম্পন্ন করতে ড্যাশবোর্ডে যান →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** How scores map to grades / outcomes (the same table the instructors grade with). */
function GradeScale() {
  return (
    <div className="bg-[#051329]/80 border border-slate-800 rounded-2xl p-5 text-left max-w-3xl mx-auto space-y-3 no-print">
      <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">গ্রেডিং পদ্ধতি (১০০ নম্বর):</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
        {GRADE_SCALE.map((g, i) => {
          const upper = i === 0 ? 100 : GRADE_SCALE[i - 1].min - 1;
          const info = evalStatusInfo(g.status);
          return (
            <div key={g.grade} className="flex items-center justify-between gap-2 bg-[#081A3A]/70 rounded-lg px-3 py-2 border border-slate-800">
              <span>
                <strong className="text-white">{g.grade}</strong> ({toBn(g.min)}–{toBn(upper)})
              </span>
              <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${TONE_BADGE[info.tone]}`}>{info.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
