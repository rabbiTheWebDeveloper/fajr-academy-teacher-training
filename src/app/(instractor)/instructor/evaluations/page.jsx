import Link from "next/link";
import { ClipboardCheck, Award, CheckCircle2, ArrowLeft, Star, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "মূল্যায়ন ও গ্রেডিং | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের মাইক্রো-টিচিং ও ফাইনাল অ্যাসেসমেন্ট পোর্টাল।",
};

export default function EvaluationsPage() {
  const criteria = [
    { name: "সহীহ মাখরাজ ও সিফাত নির্ভুল উচ্চারণ", maxScore: 25, desc: "১৭টি মাখরাজের যথার্থ প্রয়োগ ও তাজবীদ নিয়মাবলী।" },
    { name: "বাচ্চাদের সাইকোলজি ও পাঠদান পেডাগজি", maxScore: 25, desc: "মনোযোগ ধরে রাখা ও ভীতিহীন আধুনিক নূরানী কৌশল।" },
    { name: "ডিজিটাল ক্লাসরুম ও অনলাইন টুলস", maxScore: 25, desc: "Zoom, Google Meet, ডিজিটাল পেন ও স্ক্রিন ইন্টারঅ্যাকশন।" },
    { name: "মাইক্রো-টিচিং ডেমো ও স্পোকেন প্রেজেন্টেশন", maxScore: 25, desc: "লাইভ ১৫ মিনিটের ডেমো ক্লাস ও কনফিডেন্স লেভেল।" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/instructor"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> MASTER EVALUATION RUBRIC
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            টিচার মূল্যায়ন ও সার্টিফিকেশন ফ্রেমওয়ার্ক
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ১০০ নম্বরের প্রমিত মূল্যায়নের মাধ্যমে ফজর একাডেমির প্রফেশনাল শিক্ষক হিসেবে সনদ ও জব প্লেসমেন্ট অনুমোদন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">মানদণ্ড ০{idx + 1}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  সর্বোচ্চ ২৫ নম্বর
                </span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white">গ্রেডিং স্কেল ও জব কোয়ালিফিকেশন:</h4>
            <p className="text-slate-400">৮০+ নম্বর (A+ গ্রেড) = সরাসরি ফজর একাডেমি অনলাইন শিক্ষক নিয়োগ (১৫k–২২k৳ মাসিক)</p>
          </div>

          <Link
            href="/instructor/trainees"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            ট্রেইনিদের গ্রেডিং শুরু করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
