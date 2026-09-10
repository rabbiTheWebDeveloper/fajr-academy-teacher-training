import Link from "next/link";
import { Video, Calendar, Clock, ArrowLeft, ExternalLink, MessageCircle, PlayCircle, ShieldCheck, Sparkles, GraduationCap } from "lucide-react";

export const metadata = {
  title: "লাইভ ক্লাস ও শিডিউল | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের লাইভ ক্লাস এক্সেস, শিডিউল ও রেকর্ডেড লেকচার হাব।",
};

export default function ClassesPage() {
  const classes = [
    {
      batch: "TRAINING OF TRAINERS (TOT) — MEN",
      subBatch: "BATCH 013",
      orientation: "২০ আগস্ট ২০২৬ (বৃহস্পতিবার, রাত ৮:০০ টা)",
      schedule: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "Kazi Shakhawat Hossain (Senior Operation Executive)",
      meetUrl: "https://meet.google.com/tot-fajr-men-2026",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-men-batch",
      badgeColor: "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40",
    },
    {
      batch: "TOT FOR WOMEN",
      subBatch: "FIRST BATCH",
      orientation: "২৩ আগস্ট ২০২৬ (রবিবার, রাত ৮:০০ টা)",
      schedule: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "Kazi Shakhawat Hossain & Senior Female Trainer Panel",
      meetUrl: "https://meet.google.com/tot-fajr-women-014",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-women-batch014",
      badgeColor: "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> LIVE CLASS PORTAL
        </span>
      </div>

      <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Better Teachers, Brighter Generations
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            লাইভ ক্লাসরুম ও ব্যাচ শিডিউল
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            আপনার নির্ধারিত ব্যাচ অনুযায়ী সরাসরি গুগল মিট বা জুম লাইভ সেশনে যুক্ত হোন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((c, idx) => (
            <div
              key={idx}
              className="bg-[#051329] border border-[#C59B27]/30 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-[#C59B27]/60 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${c.badgeColor}`}>
                    {c.batch}
                  </span>
                  <span className="text-[10px] font-bold text-[#D4AF37] border border-[#C59B27]/30 px-2 py-0.5 rounded-md">
                    {c.subBatch}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ওরিয়েন্টেশন:</strong>
                      <span>{c.orientation}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ক্লাস শিডিউল:</strong>
                      <span>{c.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">সেশন ট্রেইনার:</strong>
                      <span>{c.trainer}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#C59B27]/20 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={c.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center justify-center gap-1.5 shadow-md border border-[#FDFBF7]/30"
                >
                  <Video className="w-4 h-4" /> লাইভ ক্লাস লিঙ্ক
                </a>
                <a
                  href={c.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#C59B27]/30"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" /> হোয়াটসঅ্যাপ
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
