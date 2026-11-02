import { Download, Eye, Link2Off, FileText } from "lucide-react";
import { usableLink } from "./format";

/** One study resource. Respects isDownloadable and never renders a dead/placeholder link. */
export default function MaterialCard({ item, showCourse = false }) {
  const url = usableLink(item.fileUrl);
  const downloadable = item.isDownloadable !== false;

  return (
    <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/30 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-[#C59B27]/70 transition-all shadow-xl group">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/30 truncate">
            {item.category || "স্টাডি ম্যাটেরিয়াল"}
          </span>
          {(item.format || item.size) && (
            <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
              {[item.format, item.size].filter(Boolean).join(" • ")}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors flex items-start gap-2">
          <FileText className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <span>{item.title}</span>
        </h3>
        {item.desc && <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{item.desc}</p>}
        {showCourse && item.courseName && <p className="text-[11px] text-slate-500">কোর্স: {item.courseName}</p>}
      </div>

      <div className="pt-4 border-t border-[#C59B27]/20 flex items-center justify-between gap-2">
        {!url ? (
          <>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Link2Off className="w-3.5 h-3.5" /> ফাইলের লিংক এখনো যুক্ত করা হয়নি
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/70 text-slate-500 text-xs font-bold cursor-not-allowed">অনুপলব্ধ</span>
          </>
        ) : downloadable ? (
          <>
            <span className="text-[11px] text-emerald-400 font-semibold">ডাউনলোডযোগ্য</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-1.5 transition-all shadow border border-[#FDFBF7]/30"
            >
              <Download className="w-3.5 h-3.5" /> ডাউনলোড
            </a>
          </>
        ) : (
          <>
            <span className="text-[11px] text-amber-300 font-semibold">শুধু দেখা যাবে</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs flex items-center gap-1.5 transition-all border border-[#C59B27]/40"
            >
              <Eye className="w-3.5 h-3.5" /> অনলাইনে দেখুন
            </a>
          </>
        )}
      </div>
    </div>
  );
}
