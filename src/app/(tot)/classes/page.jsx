import Link from "next/link";
import { Video, Calendar, Clock, ArrowLeft, ExternalLink, MessageCircle, PlayCircle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "লাইভ ক্লাস ও শিডিউল | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ ক্লাস এক্সেস, শিডিউল ও রেকর্ডেড লেকচার হাব।",
};

export default function ClassesPage() {
  const classes = [
    {
      batch: "TOT MEN (পুরুষ ব্যাচ)",
      orientation: "২০ সেপ্টেম্বর ২০২৬ (রবিবার, রাত ৮:০০ টা)",
      schedule: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "উস্তাদ আব্দুল্লাহ মাহমুদ ও সিনিয়র ট্রেইনার প্যানেল",
      meetUrl: "https://meet.google.com/tot-fajr-men-2026",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-men-batch",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      batch: "TOT WOMEN - BATCH 014 (মহিলা ব্যাচ)",
      orientation: "২১ সেপ্টেম্বর ২০২৬ (সোমবার, রাত ৮:০০ টা)",
      schedule: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "উস্তাজা ফারহানা চৌধুরী ও সিনিয়র ফিমেল ট্রেইনার প্যানেল",
      meetUrl: "https://meet.google.com/tot-fajr-women-014",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-women-batch014",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> LIVE CLASS PORTAL
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            লাইভ ক্লাসরুম ও ব্যাচ শিডিউল
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            আপনার নির্ধারিত ব্যাচ অনুযায়ী সরাসরি গুগল মিট বা জুম সেশনে যুক্ত হোন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((c, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${c.badgeColor}`}>
                  {c.batch}
                </span>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ওরিয়েন্টেশন:</strong>
                      <span>{c.orientation}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ক্লাস শিডিউল:</strong>
                      <span>{c.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ট্রেইনার:</strong>
                      <span>{c.trainer}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={c.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Video className="w-4 h-4" /> লাইভ ক্লাস লিঙ্ক
                </a>
                <a
                  href={c.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-green-400" /> হোয়াটসঅ্যাপ
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
