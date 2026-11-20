"use client";

import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Radio,
  UserCheck,
  Video,
} from "lucide-react";
import { useNow } from "../../_shared/use-now";
import { moduleSchedule, sessionState } from "../../_shared/schedule";
import { toBn, usableLink } from "../../_shared/format";

const STATE_CHIP = {
  held: { label: "অনুষ্ঠিত হয়েছে", cls: "bg-emerald-500/15 text-emerald-300", icon: CheckCircle2 },
  live: { label: "চলমান", cls: "bg-rose-500/15 text-rose-300", icon: Radio },
  upcoming: { label: "আসন্ন", cls: "bg-indigo-500/15 text-indigo-300", icon: Circle },
  postponed: { label: "স্থগিত", cls: "bg-amber-500/15 text-amber-300", icon: PauseCircle },
  cancelled: { label: "বাতিল", cls: "bg-slate-800 text-slate-400", icon: Ban },
};

/**
 * The enrolled course's real curriculum: every session with its date, time, trainer, topics,
 * links and lessons. Status comes from explicit status overrides or each session's date.
 */
export default function CurriculumTab({ course }) {
  const now = useNow();
  const items = moduleSchedule(course);
  const lessonTotal = items.reduce((n, { module: m }) => n + (m.lessons || []).length, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        {toBn(items.length)}টি মডিউল · {toBn(lessonTotal)}টি লেসন{course.duration ? ` · মেয়াদ ${course.duration}` : ""}
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
          এই কোর্সের কারিকুলাম এখনো প্রকাশ করা হয়নি।
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ key, module: m, when, displayDate, statusOverride, meetLink, hasOwnMeetLink, recordingUrl }) => {
            const state = sessionState(when, now, statusOverride);
            const chip = state ? STATE_CHIP[state] : null;
            const ChipIcon = chip?.icon || CalendarClock;
            const lessons = m.lessons || [];
            const dateText = displayDate || "তারিখ ঘোষণা করা হবে";
            const canJoin = Boolean(meetLink) && state !== "cancelled" && state !== "postponed";

            return (
              <div
                key={key}
                className={`rounded-xl border bg-slate-900 p-4 sm:p-5 ${
                  state === "live" ? "border-rose-500/40" : state === "cancelled" ? "border-slate-800 opacity-75" : "border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <ChipIcon
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        state === "held"
                          ? "text-emerald-400"
                          : state === "live"
                            ? "text-rose-400 animate-pulse"
                            : state === "postponed"
                              ? "text-amber-400"
                              : state === "cancelled"
                                ? "text-slate-500"
                                : "text-indigo-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
                        {m.sessionBadge || `মডিউল ${toBn(m.moduleNo ?? "")}`}
                      </p>
                      <h4 className="text-sm font-semibold leading-snug text-white sm:text-base">{m.title}</h4>
                      {m.subtitle && m.subtitle !== m.title && <p className="mt-0.5 text-xs text-slate-400">{m.subtitle}</p>}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" /> {dateText}
                        </span>
                        {m.sessionTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {m.sessionTime}
                          </span>
                        )}
                        {m.duration && <span>সময়কাল: {m.duration}</span>}
                      </div>

                      {m.trainerName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                          <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                          {m.trainerName}
                          {m.trainerRole && <span className="text-slate-500">· {m.trainerRole}</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  {chip ? (
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${chip.cls}`}>{chip.label}</span>
                  ) : (
                    !when && (
                      <span className="whitespace-nowrap rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-400">
                        তারিখ ঘোষণা হয়নি
                      </span>
                    )
                  )}
                </div>

                {((canJoin && (state !== "held" || hasOwnMeetLink)) || recordingUrl) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                    {canJoin && (state !== "held" || hasOwnMeetLink) && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors ${
                          state === "live" ? "bg-rose-600 hover:bg-rose-500" : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        {state === "live" ? "লাইভে যোগ দিন" : "ক্লাস লিংক"}
                      </a>
                    )}
                    {recordingUrl && (
                      <a
                        href={recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> রেকর্ডিং দেখুন
                      </a>
                    )}
                  </div>
                )}

                {m.topics?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
                    {m.topics.map((t, i) => (
                      <span key={`${i}-${t}`} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {(m.description || lessons.length > 0) && (
                  <details className="group mt-3 pl-8">
                    <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-indigo-400">
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                      বিস্তারিত{lessons.length ? ` ও ${toBn(lessons.length)}টি লেসন` : ""}
                    </summary>
                    {m.description && <p className="mt-2 text-sm leading-relaxed text-slate-300">{m.description}</p>}
                    {lessons.length > 0 && (
                      <ol className="mt-3 divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-950/60">
                        {lessons.map((l, i) => {
                          const video = usableLink(l.videoUrl);
                          return (
                            <li key={l._id || i} className="flex items-start justify-between gap-3 px-3 py-2 text-xs text-slate-300">
                              <span>
                                {toBn(l.lessonNo ?? i + 1)}. {l.title}
                              </span>
                              <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                                {l.duration && <span className="text-slate-500">{l.duration}</span>}
                                {video && (
                                  <a
                                    href={video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                                  >
                                    ভিডিও <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </span>
                            </li>
                          );
                        })}
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
