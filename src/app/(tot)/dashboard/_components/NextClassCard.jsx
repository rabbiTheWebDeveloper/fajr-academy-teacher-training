"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, UserCheck } from "lucide-react";
import ClassLinks from "../../_shared/ClassLinks";
import SessionCountdown from "../../_shared/SessionCountdown";
import { useNow } from "../../_shared/use-now";
import { nextEvent, sessionState } from "../../_shared/schedule";

/**
 * The one thing a trainee opens the dashboard for: "when is my next class and how do I
 * join?". Picks the soonest upcoming (or running) session across all enrolled courses and
 * puts its countdown and join buttons at the very top — no tab to open first.
 */
export default function NextClassCard({ courses = [] }) {
  const now = useNow();

  let pick = null;
  for (const course of courses) {
    const event = nextEvent(course, now); // null until the clock is known
    if (event && (!pick || event.when.at < pick.event.when.at)) pick = { course, event };
  }

  const course = pick?.course || courses[0];
  if (!course) return null;

  const event = pick?.event || null;
  const isOrientation = event?.kind === "orientation";
  const mod = event?.module || null;
  const live = event ? sessionState(event.when, now) === "live" : false;

  const title = !event ? course.name : isOrientation ? "ওরিয়েন্টেশন ক্লাস" : mod?.title || course.name;
  const dateText = !event ? "" : isOrientation ? course.orientationDate : mod?.liveDate || mod?.sessionDate;
  const timeText = !event ? "" : isOrientation ? course.orientationTime : mod?.sessionTime;
  const trainer = (!isOrientation && mod?.trainerName) || course.instructor || "";
  const showCourseName = Boolean(event) && (courses.length > 1 || isOrientation);

  return (
    <section
      aria-label="পরবর্তী ক্লাস"
      className={`rounded-2xl border bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 p-5 sm:p-6 ${
        live ? "border-rose-500/50" : "border-indigo-500/30"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className={`flex items-center gap-2 text-xs font-bold ${live ? "text-rose-300" : "text-indigo-300"}`}>
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
              </span>
            )}
            {live ? "এখন ক্লাস চলছে" : event ? "আপনার পরবর্তী ক্লাস" : "আপনার ক্লাস"}
          </p>
          <h2 className="text-lg font-bold leading-snug text-white sm:text-xl">{title}</h2>
          {showCourseName && <p className="text-xs text-slate-400">{course.name}</p>}
        </div>

        <Link
          href="/classes"
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg py-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
        >
          সম্পূর্ণ শিডিউল <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {(dateText || timeText || trainer) && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
          {dateText && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-indigo-400" /> {dateText}
            </span>
          )}
          {timeText && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-indigo-400" /> {timeText}
            </span>
          )}
          {trainer && (
            <span className="flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 shrink-0 text-indigo-400" /> {trainer}
            </span>
          )}
        </div>
      )}

      <div className="mt-4">
        <SessionCountdown course={course} />
      </div>

      <div className="mt-4">
        <ClassLinks meetLink={course.meetLink} whatsappLink={course.whatsappLink} />
      </div>
    </section>
  );
}
