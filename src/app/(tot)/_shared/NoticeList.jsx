import { Bell, Pin } from "lucide-react";
import { formatDate } from "./format";

const PRIORITY = {
  urgent: { label: "জরুরি", cls: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
  important: { label: "গুরুত্বপূর্ণ", cls: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
};

/** Instructor notices for the trainee's own batch (already filtered on the server). */
export default function NoticeList({ notices = [], title = "ইনস্ট্রাক্টরের নোটিশ ও গুরুত্বপূর্ণ আপডেট", limit }) {
  const list = limit ? notices.slice(0, limit) : notices;
  if (list.length === 0) return null;

  return (
    <div className="p-4 rounded-3xl bg-[#081A3A]/90 border border-[#C59B27]/40 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-[#C59B27]/20">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#D4AF37]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            {title} ({notices.length})
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C59B27]/20 text-[#D4AF37]">LATEST NOTICES</span>
      </div>

      <div className="space-y-2">
        {list.map((n) => {
          const priority = PRIORITY[n.priority];
          return (
            <div
              key={n._id}
              className="p-3 rounded-2xl bg-[#051329] border border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {n.isPinned && <Pin className="w-3 h-3 text-[#D4AF37]" />}
                  <span className="font-bold text-[#D4AF37]">{n.title}</span>
                  {priority && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${priority.cls}`}>{priority.label}</span>
                  )}
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5 whitespace-pre-line break-words">{n.content}</p>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {[n.instructorName, formatDate(n.createdAt)].filter(Boolean).join(" • ")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
