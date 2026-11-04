"use client";

import { CheckCircle2, Circle, Radio, CalendarClock, ChevronDown } from "lucide-react";
import { useNow } from "../../_shared/use-now";
import { moduleSchedule, sessionState } from "../../_shared/schedule";
import { toBn } from "../../_shared/format";

const STATE_CHIP = {
  held: { label: "অনুষ্ঠিত হয়েছে", cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", icon: CheckCircle2 },
  live: { label: "চলমান", cls: "bg-rose-500/20 text-rose-300 border border-rose-500/30", icon: Radio },
  upcoming: { label: "আসন্ন", cls: "bg-indigo-500/15 text-indigo-300 border border-slate-800", icon: Circle },
};

/**
 * The enrolled course's real curriculum. Status comes from each session's date
 * (held / upcoming) — not from an unsaved "completed" checkbox.
 */
export default function CurriculumTab({ course }) {
  const now = useNow();
  const items = moduleSchedule(course);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-white">{course.name} — কোর্স কারিকুলাম</h2>
        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-slate-800">
          {toBn(items.length)}টি সেশন{course.duration ? ` • ${course.duration}` : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          এই কোর্সের কারিকুলাম এখনো প্রকাশ করা হয়নি।
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ key, module: m, when }) => {
            const state = sessionState(when, now);
            const chip = state ? STATE_CHIP[state] : null;
            const ChipIcon = chip?.icon || CalendarClock;
            const lessons = m.lessons || [];
            return (
              <div
                key={key}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  state === "held" ? "bg-slate-950 border-slate-800 shadow-md" : "bg-slate-900 border-slate-800 hover:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <ChipIcon className={`w-5 h-5 mt-0.5 shrink-0 ${state === "held" ? "text-emerald-400" : "text-indigo-300"}`} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                        {m.sessionBadge || `মডিউল ${toBn(m.moduleNo ?? "")}`}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{m.title}</h4>
                      {m.subtitle && m.subtitle !== m.title && <p className="text-[11px] text-slate-300 mt-0.5">{m.subtitle}</p>}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1.5">
                        <span>তারিখ: {m.liveDate || m.sessionDate || "ঘোষণা করা হবে"}</span>
                        {m.sessionTime && <span>• সময়: {m.sessionTime}</span>}
                        {m.duration && <span>• সময়কাল: {m.duration}</span>}
                        {m.trainerName && <span>• ট্রেইনার: {m.trainerName}</span>}
                      </div>
                    </div>
                  </div>

                  {chip ? (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${chip.cls}`}>{chip.label}</span>
                  ) : (
                    !when && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-slate-800 text-slate-400">
                        তারিখ ঘোষণা হয়নি
                      </span>
                    )
                  )}
                </div>

                {(m.description || lessons.length > 0) && (
                  <details className="group mt-3 pl-8">
                    <summary className="cursor-pointer list-none text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                      <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
                      বিস্তারিত{lessons.length ? ` ও ${toBn(lessons.length)}টি লেসন` : ""}
                    </summary>
                    {m.description && <p className="text-xs text-slate-300 leading-relaxed mt-2">{m.description}</p>}
                    {lessons.length > 0 && (
                      <ol className="mt-2 space-y-1">
                        {lessons.map((l, i) => (
                          <li key={l._id || i} className="text-[11px] text-slate-300 flex items-start justify-between gap-3">
                            <span>
                              {toBn(l.lessonNo ?? i + 1)}. {l.title}
                            </span>
                            {l.duration && <span className="text-slate-500 whitespace-nowrap">{l.duration}</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
