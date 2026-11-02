"use client";

import { Calendar, Clock, BookOpen, Sparkles, UserCheck, GraduationCap, Users, CalendarDays, Hourglass } from "lucide-react";
import ClassLinks from "../../_shared/ClassLinks";
import SessionCountdown from "../../_shared/SessionCountdown";
import { useNow } from "../../_shared/use-now";
import { nextEvent } from "../../_shared/schedule";
import { formatDate, toBn } from "../../_shared/format";

/**
 * "Live session hub" for one enrolled course: the next (or last) session from the
 * course's own curriculum, its trainer and time, a real countdown and the course links.
 */
export default function OverviewTab({ course, participant }) {
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

  const badge = isOrientation ? "ORIENTATION" : focus.sessionBadge || `SESSION ${String(focus.moduleNo ?? "").padStart(2, "0")}`;
  const title = isOrientation ? "ওরিয়েন্টেশন ক্লাস" : focus.title;
  const subtitle = isOrientation ? course.name : focus.subtitle;
  const trainerName = (!isOrientation && focus.trainerName) || course.instructor || "";
  const trainerRole = !isOrientation ? focus.trainerRole : "";
  const dateText = isOrientation ? course.orientationDate : focus.liveDate || focus.sessionDate;
  const timeText = isOrientation ? course.orientationTime : focus.sessionTime;

  const stats = [
    { icon: CalendarDays, label: "ভর্তির তারিখ", value: participant?.enrolledAt ? formatDate(participant.enrolledAt) : "—" },
    {
      icon: Users,
      label: "উপস্থিতি",
      value: participant ? `${toBn(participant.attendanceCount || 0)}টি সেশন` : "—",
    },
    { icon: Clock, label: "ক্লাস রুটিন", value: course.routine || "—" },
    { icon: Hourglass, label: "কোর্সের মেয়াদ", value: course.duration || "—" },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border-2 border-[#C59B27]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Session tag & course */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#081A3A] text-white text-xs font-black uppercase tracking-wider border border-[#C59B27]/40 shadow-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> {badge}
          </span>
          {course.tag && (
            <span className="text-xs font-bold text-[#D4AF37] tracking-wide bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
              {course.tag}
            </span>
          )}
        </div>
        <div className="text-xs italic font-serif text-[#D4AF37] tracking-wide flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          {course.name}
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif">{title}</h2>
        {subtitle && <p className="text-base sm:text-lg font-bold text-[#D4AF37]">{subtitle}</p>}
      </div>

      {!isOrientation && focus.description && (
        <div className="bg-[#051329]/80 border-l-4 border-[#C59B27] p-5 sm:p-6 rounded-r-2xl border-y border-r border-[#C59B27]/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-[#C59B27]/20 text-[#D4AF37]">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            </span>
            <span className="text-[11px] uppercase tracking-widest font-black text-[#D4AF37]">SESSION OVERVIEW</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{focus.description}</p>
          {focus.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {focus.topics.map((t, i) => (
                <span key={`${i}-${t}`} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#081A3A] text-slate-300 border border-[#C59B27]/20">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trainer & date */}
      <div className="bg-[#051329] border border-[#C59B27]/35 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#0B2545] to-[#134074] border-2 border-[#C59B27] p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <UserCheck className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/30 text-[10px] font-bold">
              <GraduationCap className="w-3 h-3 text-[#D4AF37]" /> SESSION TRAINER
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white font-serif">{trainerName || "ঘোষণা করা হবে"}</h3>
            {trainerRole && <p className="text-xs text-[#D4AF37] font-semibold">{trainerRole}</p>}
          </div>
        </div>

        <div className="bg-[#081A3A] border border-[#C59B27]/30 rounded-2xl p-4 flex flex-col sm:items-end justify-center min-w-[200px] text-left sm:text-right space-y-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center sm:justify-end gap-1">
              <Calendar className="w-3 h-3 text-[#D4AF37]" /> SESSION DATE
            </div>
            <div className="text-sm font-black text-white">{dateText || "ঘোষণা করা হবে"}</div>
          </div>
          <div className="border-t border-[#C59B27]/20 pt-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center sm:justify-end gap-1">
              <Clock className="w-3 h-3 text-[#D4AF37]" /> TIME
            </div>
            <div className="text-sm font-black text-[#D4AF37]">{timeText || "ঘোষণা করা হবে"}</div>
          </div>
        </div>
      </div>

      <SessionCountdown course={course} />

      {/* Enrolment facts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#051329]/80 border border-[#C59B27]/20 rounded-2xl p-3.5 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Icon className="w-3 h-3 text-[#D4AF37]" /> {s.label}
              </div>
              <div className="text-xs font-bold text-white leading-snug">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[#C59B27]/25">
        <ClassLinks meetLink={course.meetLink} whatsappLink={course.whatsappLink} />
      </div>
    </div>
  );
}
