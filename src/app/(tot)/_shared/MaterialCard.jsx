import { Download, Eye, Link2Off, FileText } from "lucide-react";
import { usableLink } from "./format";

/** One study resource. Respects isDownloadable and never renders a dead/placeholder link. */
export default function MaterialCard({ item, showCourse = false }) {
  const url = usableLink(item.fileUrl);
  const downloadable = item.isDownloadable !== false;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
            {item.category || "স্টাডি ম্যাটেরিয়াল"}
          </span>
          {(item.format || item.size) && (
            <span className="whitespace-nowrap text-[11px] text-slate-500">{[item.format, item.size].filter(Boolean).join(" · ")}</span>
          )}
        </div>

        <h3 className="flex items-start gap-2 text-sm font-semibold leading-snug text-white">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <span>{item.title}</span>
        </h3>
        {item.desc && <p className="line-clamp-3 text-xs leading-relaxed text-slate-400">{item.desc}</p>}
        {showCourse && item.courseName && <p className="text-[11px] text-slate-500">কোর্স: {item.courseName}</p>}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
        {!url ? (
          <>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Link2Off className="h-3.5 w-3.5" /> ফাইলের লিংক এখনো যুক্ত করা হয়নি
            </span>
            <span className="cursor-not-allowed rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-500">অনুপলব্ধ</span>
          </>
        ) : downloadable ? (
          <>
            <span className="text-[11px] text-emerald-400">ডাউনলোডযোগ্য</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <Download className="h-3.5 w-3.5" /> ডাউনলোড
            </a>
          </>
        ) : (
          <>
            <span className="text-[11px] text-amber-300">শুধু দেখা যাবে</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
            >
              <Eye className="h-3.5 w-3.5" /> অনলাইনে দেখুন
            </a>
          </>
        )}
      </div>
    </div>
  );
}
