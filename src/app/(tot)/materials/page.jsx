import Link from "next/link";
import { BookOpen, Download, ArrowLeft, FileText, CheckCircle2, Sparkles, FolderDown } from "lucide-react";

export const metadata = {
  title: "কোর্স ম্যাটেরিয়ালস ও বুকস | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল স্টাডি বুকস, লেসন প্ল্যান ও রিসোর্স ফাইলসমূহ।",
};

export default function MaterialsPage() {
  const materials = [
    {
      title: "ফজর একাডেমি তাজবীদ ও মাখরাজ গাইডবুক (সম্পূর্ণ রঙিন)",
      category: "কুরআন শিক্ষা ও তাজবীদ",
      size: "4.2 MB",
      format: "PDF",
      desc: "মাখরাজের ১৭টি স্থান, সিফাত ও আধুনিক সাউন্ড অ্যানালিসিসসহ সম্পূর্ণ ডায়াগ্রাম শিট।",
    },
    {
      title: "নূরানী ও নাজেরা মেথডোলজি হ্যান্ডবুক",
      category: "টিচিং পেডাগজি",
      size: "3.5 MB",
      format: "PDF",
      desc: "বাচ্চাদের দ্রুততম সময়ে হরফ চেনানো ও জড়তা কাটানোর প্রমাণিত বৈজ্ঞানিক টেকনিক।",
    },
    {
      title: "স্মার্ট লেসন প্ল্যানিং ও উইকলি ট্র্যাকার টেমপ্লেট",
      category: "লেসন প্ল্যান",
      size: "1.1 MB",
      format: "DOCX / PDF",
      desc: "প্রতিটি ক্লাসের জন্য ৫০ মিনিটের প্রমিত টাইম ডিস্ট্রিবিউশন ফ্রেমওয়ার্ক।",
    },
    {
      title: "অনলাইন ক্লাস ম্যানেজমেন্ট ও ডিজিটাল পেন গাইড",
      category: "ডিজিটাল স্কিলস",
      size: "2.1 MB",
      format: "PDF",
      desc: "Zoom, Google Meet ও ডিজিটাল ড্রয়িং প্যাড দিয়ে আকর্ষণীয় স্ক্রিন প্রেজেন্টেশন।",
    },
    {
      title: "স্টুডেন্ট সাইকোলজি ও মোটিভেশন স্ট্র্যাটেজি",
      category: "লার্নার সাইকোলজি",
      size: "2.9 MB",
      format: "PDF",
      desc: "অবাধ্য বা অমনোযোগী শিক্ষার্থীদের কুরআন ক্লাসে নিবিষ্ট রাখার মনস্তাত্ত্বিক কৌশল।",
    },
    {
      title: "মাইক্রো-টিচিং ও প্র্যাকটিকাম অ্যাসেসমেন্ট রুব্রিক",
      category: "সার্টিফিকেশন ও পরীক্ষা",
      size: "950 KB",
      format: "PDF",
      desc: "ফজর একাডেমি গ্রেডিং সিস্টেম ও ফাইনাল ট্রেইনার মূল্যায়নের বিস্তারিত মানদণ্ড।",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> OFFICIAL TOT RESOURCES
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            কোর্স হ্যান্ডআউটস ও ডাউনলোড হাব
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সকল অনুমোদিত রেফারেন্স শিট ও বইসমূহ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{item.format} • {item.size}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ফ্রি এক্সেস
                </span>
                <a
                  href="#"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড ফাইল
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
