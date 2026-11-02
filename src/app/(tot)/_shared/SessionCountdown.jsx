"use client";

import { Flame, Radio, CalendarClock, CheckCircle2 } from "lucide-react";
import { useNow } from "./use-now";
import { nextEvent, sessionState } from "./schedule";
import { toBn } from "./format";

/**
 * Countdown to the course's next dated session (or orientation), computed from the
 * course's real curriculum dates — never a hard-coded date.
 */
export default function SessionCountdown({ course }) {
  const now = useNow();
  const hasAnyDate = Boolean(course?.orientationDate) || (course?.curriculum || []).length > 0;

  if (now == null) {
    return (
      <Shell icon={CalendarClock} label="পরবর্তী সেশনের সময় হিসাব করা হচ্ছে…">
        <span className="text-xs text-slate-500">—</span>
      </Shell>
    );
  }

  const event = nextEvent(course, now);

  if (!event) {
    return (
      <Shell icon={hasAnyDate ? CheckCircle2 : CalendarClock} label="সময়সূচি">
        <span className="text-xs text-slate-300">
          {hasAnyDate
            ? "নির্ধারিত সকল সেশনের সময় পেরিয়ে গেছে, অথবা পরবর্তী সেশনের তারিখ এখনো ঘোষণা করা হয়নি।"
            : "পরবর্তী সেশনের সময়সূচি শীঘ্রই জানানো হবে।"}
        </span>
      </Shell>
    );
  }

  const what = event.kind === "orientation" ? "ওরিয়েন্টেশন ক্লাস" : event.module?.sessionBadge || `সেশন ${toBn(event.module?.moduleNo ?? "")}`;
  const state = sessionState(event.when, now);

  if (state === "live") {
    return (
      <Shell icon={Radio} label={`${what} — নির্ধারিত সময় অনুযায়ী এখন চলছে`} live>
        <span className="text-xs font-bold text-rose-300">লাইভ ক্লাসে যোগ দিন</span>
      </Shell>
    );
  }

  if (!event.when.hasTime) {
    return (
      <Shell icon={CalendarClock} label={`পরবর্তী: ${what}`}>
        <span className="text-xs text-slate-300">তারিখ নির্ধারিত, সময় এখনো ঘোষণা করা হয়নি।</span>
      </Shell>
    );
  }

  const diff = Math.max(0, event.when.at - now);
  const parts = [
    { label: "দিন", value: Math.floor(diff / 86400000) },
    { label: "ঘণ্টা", value: Math.floor((diff % 86400000) / 3600000) },
    { label: "মিনিট", value: Math.floor((diff % 3600000) / 60000) },
    { label: "সেকেন্ড", value: Math.floor((diff % 60000) / 1000) },
  ];

  return (
    <Shell icon={Flame} label={`${what} শুরু হতে বাকি:`}>
      <div className="flex items-center gap-2.5 text-center">
        {parts.map((p) => (
          <div
            key={p.label}
            className="bg-[#081A3A] border border-[#C59B27]/30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl min-w-[55px] sm:min-w-[65px]"
          >
            <div className="text-lg sm:text-xl font-black text-[#D4AF37] font-mono">{toBn(String(p.value).padStart(2, "0"))}</div>
            <div className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">{p.label}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ icon: Icon, label, live = false, children }) {
  return (
    <div
      className={`bg-[#051329]/90 border p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
        live ? "border-rose-500/40" : "border-[#C59B27]/25"
      }`}
    >
      <div className={`text-xs font-bold flex items-center gap-1.5 ${live ? "text-rose-300" : "text-[#D4AF37]"}`}>
        <Icon className={`w-4 h-4 ${live ? "animate-pulse" : ""}`} /> {label}
      </div>
      {children}
    </div>
  );
}
