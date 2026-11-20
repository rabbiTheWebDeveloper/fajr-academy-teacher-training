'use client';

import { useMemo, useState } from "react";
import {
  Ban,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Hourglass,
  Info,
  PauseCircle,
  PlayCircle,
  Radio,
  RefreshCw,
  UserCheck,
  Video,
} from "lucide-react";
import ClassLinks from "../_shared/ClassLinks";
import CopyButton from "../_shared/CopyButton";
import SessionCountdown from "../_shared/SessionCountdown";
import NoticeList from "../_shared/NoticeList";
import PaymentRequiredCard from "../_shared/PaymentRequiredCard";
import { useNow } from "../_shared/use-now";
import { moduleSchedule, nextEvent, sessionState } from "../_shared/schedule";
import { toBn, usableLink } from "../_shared/format";

const STATE_META = {
  live: {
    text: "এখন চলছে (LIVE)",
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    border: "border-rose-500/50",
    icon: Radio,
    iconCls: "text-rose-400 animate-pulse",
  },
  upcoming: {
    text: "আসন্ন ক্লাস",
    chip: "bg-indigo-500/15 text-indigo-300 border-indigo-500/35",
    border: "border-slate-800 hover:border-indigo-500/40",
    icon: Circle,
    iconCls: "text-indigo-400",
  },
  held: {
    text: "অনুষ্ঠিত",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
    border: "border-slate-800",
    icon: CheckCircle2,
    iconCls: "text-emerald-400",
  },
  postponed: {
    text: "স্থগিত (নতুন তারিখ শীঘ্রই)",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/35",
    border: "border-amber-500/30",
    icon: PauseCircle,
    iconCls: "text-amber-400",
  },
  cancelled: {
    text: "বাতিলকৃত",
    chip: "bg-slate-800 text-slate-400 border-slate-700",
    border: "border-slate-800 opacity-75",
    icon: Ban,
    iconCls: "text-slate-500",
  },
};

const FILTERS = [
  { id: "all", label: "সব ক্লাস" },
  { id: "upcoming", label: "আসন্ন ও চলমান" },
  { id: "held", label: "অনুষ্ঠিত" },
];

/** Live classes and full class schedule for the trainee's OWN enrolled course(s). */
export default function ClassesClient({
  courses: initialCourses = [],
  notices: initialNotices = [],
  paid: initialPaid = false,
  primaryCourseId = "",
  lastAttempt = null,
}) {
  const now = useNow();
  const [courses, setCourses] = useState(initialCourses);
  const [notices, setNotices] = useState(initialNotices);
  const [paid, setPaid] = useState(initialPaid);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0]?.courseId || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const activeCourse =
    courses.find((c) => c.courseId === selectedCourseId) || courses[0] || null;

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshError("");
    try {
      const res = await fetch("/api/tot/classes", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setRefreshError(data?.message || "সর্বশেষ ক্লাস শিডিউল লোড করা যায়নি।");
      } else {
        setPaid(Boolean(data.paid));
        setCourses(data.courses || []);
        setNotices(data.notices || []);
        if (data.courses?.length && !data.courses.some((c) => c.courseId === selectedCourseId)) {
          setSelectedCourseId(data.courses[0].courseId);
        }
      }
    } catch {
      setRefreshError("সার্ভারের সাথে সংযোগ করা যায়নি।");
    } finally {
      setRefreshing(false);
    }
  };

  const schedule = useMemo(() => (activeCourse ? moduleSchedule(activeCourse) : []), [activeCourse]);

  const enriched = useMemo(
    () =>
      schedule.map((item) => ({
        ...item,
        state: sessionState(item.when, now, item.statusOverride),
      })),
    [schedule, now]
  );

  const counts = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let held = 0;
    for (const item of enriched) {
      if (item.state === "live") live += 1;
      else if (item.state === "upcoming") upcoming += 1;
      else if (item.state === "held") held += 1;
    }
    return { total: enriched.length, live, upcoming, held, active: live + upcoming };
  }, [enriched]);

  const filteredSchedule = useMemo(() => {
    if (statusFilter === "upcoming") {
      return enriched.filter((item) => item.state === "live" || item.state === "upcoming" || item.state === null);
    }
    if (statusFilter === "held") {
      return enriched.filter((item) => item.state === "held");
    }
    return enriched;
  }, [enriched, statusFilter]);

  const activeNext = activeCourse ? nextEvent(activeCourse, now) : null;
  const activeMeetLink = activeNext?.meetLink || activeCourse?.meetLink || "";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            লাইভ ক্লাস ও ক্লাস শিডিউল
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            আপনার এনরোল করা ব্যাচের প্রতিটি সেশনের তারিখ, সময়, ট্রেইনার এবং সরাসরি লাইভ ক্লাসে যুক্ত হওয়ার লিংক
          </p>
        </div>

        {paid && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-indigo-500/60 hover:text-white disabled:opacity-60 sm:self-center"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "আপডেট হচ্ছে..." : "শিডিউল রিফ্রেশ"}
          </button>
        )}
      </div>

      {refreshError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200">
          {refreshError}
        </div>
      )}

      <NoticeList notices={notices} title="ইনস্ট্রাক্টরের লাইভ ক্লাস সংক্রান্ত নোটিশ" />

      {!paid ? (
        <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} />
      ) : !activeCourse ? (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
          <p>আপনার এনরোল করা কোর্সের তথ্য এখনো পাওয়া যায়নি। কিছুক্ষণ পর আবার দেখুন অথবা হেল্পলাইনে যোগাযোগ করুন।</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Course switcher when enrolled in multiple batches */}
          {courses.length > 1 && (
            <div
              role="tablist"
              aria-label="এনরোল করা কোর্স নির্বাচন"
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5"
            >
              {courses.map((c) => {
                const active = c.courseId === activeCourse.courseId;
                return (
                  <button
                    key={c.courseId}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedCourseId(c.courseId);
                      setStatusFilter("all");
                    }}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active course hero: batch info + next-class countdown + join links */}
          <section className="space-y-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {activeCourse.tag && (
                    <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 font-semibold text-indigo-300">
                      {activeCourse.tag}
                    </span>
                  )}
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-300">
                    {activeCourse.courseId}
                  </span>
                </div>
                <h2 className="text-lg font-bold leading-snug text-white sm:text-xl">{activeCourse.name}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-slate-300">
                  মোট <strong className="text-white">{toBn(counts.total)}</strong>টি ক্লাস
                </span>
                {counts.live > 0 && (
                  <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 font-semibold text-rose-300">
                    চলমান {toBn(counts.live)}
                  </span>
                )}
                {counts.upcoming > 0 && (
                  <span className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 font-semibold text-indigo-300">
                    আসন্ন {toBn(counts.upcoming)}
                  </span>
                )}
                {counts.held > 0 && (
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-300">
                    অনুষ্ঠিত {toBn(counts.held)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Fact icon={Calendar} label="ওরিয়েন্টেশন">
                {activeCourse.orientationDate || "ঘোষণা করা হবে"}
                {activeCourse.orientationTime && (
                  <span className="block text-xs font-normal text-slate-400">{activeCourse.orientationTime}</span>
                )}
              </Fact>
              <Fact icon={Clock} label="ক্লাস রুটিন">
                {activeCourse.routine || "ঘোষণা করা হবে"}
              </Fact>
              <Fact icon={GraduationCap} label="প্রধান ইনস্ট্রাক্টর">
                {activeCourse.instructor || "ঘোষণা করা হবে"}
              </Fact>
              <Fact icon={Hourglass} label="কোর্সের মেয়াদ">
                {activeCourse.duration || "—"}
              </Fact>
            </div>

            <SessionCountdown course={activeCourse} />

            <div className="border-t border-slate-800 pt-4">
              <ClassLinks meetLink={activeMeetLink} whatsappLink={activeCourse.whatsappLink} />
            </div>
          </section>

          {/* Class Schedule List */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-white sm:text-lg">
                  সম্পূর্ণ ক্লাস শিডিউল{" "}
                  <span className="text-sm font-normal text-slate-400">({toBn(enriched.length)}টি সেশন)</span>
                </h3>
                <p className="text-xs text-slate-400">প্রতিটি সেশনের তারিখ, সময়, ট্রেইনার ও ক্লাস লিংক</p>
              </div>

              {enriched.length > 0 && (
                <div
                  role="tablist"
                  aria-label="ক্লাস ফিল্টার"
                  className="inline-flex items-center gap-1 self-start rounded-xl border border-slate-800 bg-slate-900 p-1 sm:self-auto"
                >
                  {FILTERS.map((f) => {
                    const active = statusFilter === f.id;
                    const count =
                      f.id === "all" ? counts.total : f.id === "upcoming" ? counts.active : counts.held;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setStatusFilter(f.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f.label}
                        <span
                          className={`rounded-full px-1.5 text-[10px] ${
                            active ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {toBn(count)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {enriched.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                <CalendarClock className="h-8 w-8 text-slate-600" />
                <p className="text-sm font-semibold text-slate-200">এই কোর্সের ক্লাস শিডিউল এখনো যুক্ত করা হয়নি</p>
                <p className="max-w-md text-xs text-slate-400">
                  অ্যাডমিন বা ইনস্ট্রাক্টর ক্লাসের সময়সূচি যুক্ত করলেই এখানে প্রতিটি সেশনের তারিখ ও লিংক দেখা যাবে।
                </p>
              </div>
            ) : filteredSchedule.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <p className="text-sm text-slate-300">এই ফিল্টারে কোনো ক্লাস নেই।</p>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  সব ক্লাস দেখুন
                </button>
              </div>
            ) : (
              <ol className="space-y-3">
                {filteredSchedule.map(({ key, module: m, displayDate, state, meetLink, hasOwnMeetLink, recordingUrl }) => {
                  const meta = state ? STATE_META[state] : null;
                  const StatusIcon = meta?.icon || CalendarClock;
                  const canJoin = Boolean(meetLink) && state !== "cancelled" && state !== "postponed";
                  const isLive = state === "live";
                  const lessons = m.lessons || [];
                  const badge = m.sessionBadge || `সেশন ${toBn(String(m.moduleNo ?? "").padStart(2, "0"))}`;

                  return (
                    <li
                      key={key}
                      className={`rounded-2xl border bg-slate-900 p-4 transition-colors sm:p-5 ${
                        meta?.border || "border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        {/* Left: Session details */}
                        <div className="flex min-w-0 flex-1 items-start gap-3.5">
                          <div
                            className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border text-center ${
                              isLive
                                ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                                : state === "held"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-slate-800 bg-slate-950 text-indigo-300"
                            }`}
                          >
                            <span className="text-[9px] font-bold uppercase leading-none opacity-75">ক্লাস</span>
                            <span className="mt-0.5 text-sm font-black leading-none">
                              {toBn(String(m.moduleNo ?? "").padStart(2, "0"))}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                                {badge}
                              </span>
                              {meta ? (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}
                                >
                                  <StatusIcon className={`h-3 w-3 ${meta.iconCls}`} />
                                  {meta.text}
                                </span>
                              ) : (
                                <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] text-slate-400">
                                  তারিখ ঘোষণা হয়নি
                                </span>
                              )}
                              {hasOwnMeetLink && (
                                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                                  আলাদা ক্লাস লিংক
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold leading-snug text-white sm:text-base">{m.title}</h4>
                              {m.subtitle && m.subtitle !== m.title && (
                                <p className="mt-0.5 text-xs text-slate-400">{m.subtitle}</p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                {displayDate || <span className="text-slate-500">তারিখ ঘোষণা করা হবে</span>}
                              </span>
                              {m.sessionTime && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                                  {m.sessionTime}
                                </span>
                              )}
                              {m.duration && (
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <Hourglass className="h-3.5 w-3.5 text-slate-500" />
                                  {m.duration}
                                </span>
                              )}
                            </div>

                            {m.trainerName && (
                              <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                                <UserCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="font-medium text-slate-200">{m.trainerName}</span>
                                {m.trainerRole && <span className="text-slate-500">· {m.trainerRole}</span>}
                              </p>
                            )}

                            {m.topics?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {m.topics.map((t, i) => (
                                  <span
                                    key={`${i}-${t}`}
                                    className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-300"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Per-class join / recording actions */}
                        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                          {canJoin && (state !== "held" || hasOwnMeetLink) && (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-colors ${
                                  isLive
                                    ? "bg-rose-600 hover:bg-rose-500"
                                    : "bg-indigo-600 hover:bg-indigo-500"
                                }`}
                              >
                                <Video className="h-3.5 w-3.5" />
                                {isLive ? "লাইভে যোগ দিন" : "ক্লাস লিংক"}
                              </a>
                              <CopyButton
                                text={meetLink}
                                iconOnly
                                title="ক্লাস লিংক কপি করুন"
                                className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                              />
                            </div>
                          )}

                          {recordingUrl && (
                            <a
                              href={recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                            >
                              <PlayCircle className="h-3.5 w-3.5" /> রেকর্ডিং দেখুন
                            </a>
                          )}

                          {!canJoin && !recordingUrl && state !== "cancelled" && state !== "postponed" && (
                            <span className="text-[11px] text-slate-500">
                              {state === "held" ? "রেকর্ডিং যুক্ত হয়নি" : "লিংক শীঘ্রই যুক্ত হবে"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable details & lessons */}
                      {(m.description || lessons.length > 0) && (
                        <details className="group mt-3.5 border-t border-slate-800/80 pt-3">
                          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300">
                            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                            বিস্তারিত{lessons.length ? ` ও ${toBn(lessons.length)}টি লেসন` : ""}
                          </summary>
                          <div className="mt-2.5 space-y-2.5">
                            {m.description && (
                              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">{m.description}</p>
                            )}
                            {lessons.length > 0 && (
                              <ol className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60">
                                {lessons.map((l, i) => {
                                  const video = usableLink(l.videoUrl);
                                  return (
                                    <li
                                      key={l._id || i}
                                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-slate-300"
                                    >
                                      <span>
                                        {toBn(l.lessonNo ?? i + 1)}. {l.title}
                                      </span>
                                      <span className="flex shrink-0 items-center gap-2">
                                        {l.duration && <span className="text-slate-500">{l.duration}</span>}
                                        {video && (
                                          <a
                                            href={video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300"
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
                          </div>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      )}

      {/* Guidelines */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <HelpCircle className="h-5 w-5" />
          <h3 className="text-sm font-bold text-white">লাইভ ক্লাসে অংশগ্রহণের নিয়মাবলী</h3>
        </div>
        <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-slate-300">
          <li>ক্লাস শুরুর অন্তত ৫ মিনিট পূর্বে ক্লাসের লিংকে প্রবেশ করুন।</li>
          <li>নাম্বার বা ডিভাইসের নামের পরিবর্তে আপনার রেজিস্ট্রেশনকৃত পূর্ণ নাম দিয়ে যুক্ত হোন।</li>
          <li>মাইক্রো-টিচিং অনুশীলনের সময় ক্যামেরা অন রাখা এবং ইনস্ট্রাক্টরের নির্দেশনা সক্রিয়ভাবে অনুসরণ করা বাধ্যতামূলক।</li>
          <li>ক্লাসের লিংক বা গ্রুপ লিংক কারো সাথে শেয়ার করবেন না।</li>
        </ul>
      </section>
    </div>
  );
}

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5 text-indigo-400" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug text-white">{children}</div>
    </div>
  );
}
