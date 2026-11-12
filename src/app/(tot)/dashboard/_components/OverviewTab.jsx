"use client";

import { Calendar, Clock, Users, CalendarDays, Hourglass, UserCheck, BookOpen } from "lucide-react";
import ClassLinks from "../../_shared/ClassLinks";
import SessionCountdown from "../../_shared/SessionCountdown";
import { useNow } from "../../_shared/use-now";
import { nextEvent } from "../../_shared/schedule";
import { formatDate, toBn } from "../../_shared/format";

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

/**
 * "Live session" for one enrolled course: the next (or last) session from the
 * course's own curriculum, its trainer and time, a real countdown and the course links.
 */
export default function OverviewTab({ course, participant, onOpenDetails, showJoin = true }) {
  const now = useNow();
  const modules = course.curriculum || [];
  const event = nextEvent(course, now);

  // Next dated session → otherwise the last module once the clock is known → first module.
  let focus = modules[0] || null;
  let isOrientation = false;
  if (event) {
    focus = event.module;
    isOrientation = event.kind === "orientation";
  } else if (now != null && modules.length) {
    focus = modules[modules.length - 1];
  }
  if (!focus) isOrientation = true;

  const badge = isOrientation ? "ওরিয়েন্টেশন" : focus.sessionBadge || `সেশন ${String(focus.moduleNo ?? "").padStart(2, "0")}`;
  const title = isOrientation ? "ওরিয়েন্টেশন ক্লাস" : focus.title;
  const subtitle = isOrientation ? course.name : focus.subtitle;
  const trainerName = (!isOrientation && focus.trainerName) || course.instructor || "";
  const trainerRole = !isOrientation ? focus.trainerRole : "";
  const dateText = isOrientation ? course.orientationDate : focus.liveDate || focus.sessionDate;
  const timeText = isOrientation ? course.orientationTime : focus.sessionTime;

  return (
    <div className="space-y-5">
      {/* Hero: next session */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 font-semibold text-indigo-300">{badge}</span>
          {course.tag && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-300">{course.tag}</span>}
          <span className="text-slate-500">{course.name}</span>
        </div>

        <h2 className="mt-4 text-xl font-bold leading-snug text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">ট্রেইনার</p>
              <p className="truncate text-sm font-semibold text-white">{trainerName || "ঘোষণা করা হবে"}</p>
              {trainerRole && <p className="truncate text-xs text-slate-500">{trainerRole}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3.5">
            <Calendar className="h-5 w-5 shrink-0 text-indigo-400" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">তারিখ</p>
              <p className="text-sm font-semibold text-white">{dateText || "ঘোষণা করা হবে"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950/60 p-3.5">
            <Clock className="h-5 w-5 shrink-0 text-indigo-400" />
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">সময়</p>
              <p className="text-sm font-semibold text-white">{timeText || "ঘোষণা করা হবে"}</p>
            </div>
          </div>
        </div>

        {!isOrientation && focus.description && (
          <div className="mt-5 border-t border-slate-800 pt-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> এই সেশনে যা থাকছে
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{focus.description}</p>
            {focus.topics?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {focus.topics.map((t, i) => (
                  <span key={`${i}-${t}`} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Countdown + join (hidden when the dashboard's "next class" card already shows them) */}
      {showJoin && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <SessionCountdown course={course} />
          <div className="mt-4 border-t border-slate-800 pt-4">
            <ClassLinks meetLink={course.meetLink} whatsappLink={course.whatsappLink} />
          </div>
        </section>
      )}

      {/* Enrolment facts */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Fact icon={CalendarDays} label="ভর্তির তারিখ" value={participant?.enrolledAt ? formatDate(participant.enrolledAt) : "—"} />
        <Fact icon={Users} label="উপস্থিতি" value={participant ? `${toBn(participant.attendanceCount || 0)}টি সেশন` : "—"} />
        <Fact icon={Clock} label="ক্লাস রুটিন" value={course.routine || "—"} />
        <Fact icon={Hourglass} label="কোর্সের মেয়াদ" value={course.duration || "—"} />
      </section>

      {onOpenDetails && (
        <button
          type="button"
          onClick={onOpenDetails}
          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-indigo-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-200"
        >
          কোর্সের সব তথ্য, লিংক, মডিউল ও রিসোর্স দেখুন →
        </button>
      )}
    </div>
  );
}
