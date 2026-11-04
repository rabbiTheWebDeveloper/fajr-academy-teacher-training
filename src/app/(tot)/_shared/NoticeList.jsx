import { Bell, Pin } from "lucide-react";
import { formatDate } from "./format";

const PRIORITY = {
  urgent: { label: "জরুরি", cls: "bg-rose-500/15 text-rose-300" },
  important: { label: "গুরুত্বপূর্ণ", cls: "bg-amber-500/15 text-amber-300" },
};

/** Instructor notices for the trainee's own batch (already filtered on the server). */
export default function NoticeList({ notices = [], title = "ইনস্ট্রাক্টরের নোটিশ", limit }) {
  const list = limit ? notices.slice(0, limit) : notices;
  if (list.length === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Bell className="h-4 w-4 text-indigo-400" />
        {title} <span className="font-normal text-slate-500">({notices.length})</span>
      </h4>

      <div className="space-y-2">
        {list.map((n) => {
          const priority = PRIORITY[n.priority];
          return (
            <div key={n._id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {n.isPinned && <Pin className="h-3 w-3 text-indigo-400" />}
                <span className="font-semibold text-white">{n.title}</span>
                {priority && <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priority.cls}`}>{priority.label}</span>}
              </div>
              <p className="mt-1 whitespace-pre-line break-words text-slate-400">{n.content}</p>
              <p className="mt-1.5 text-[11px] text-slate-500">{[n.instructorName, formatDate(n.createdAt)].filter(Boolean).join(" · ")}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
