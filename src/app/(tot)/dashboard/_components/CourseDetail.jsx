"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  FolderOpen,
  Hourglass,
  Layers,
  Link2Off,
  MessageCircle,
  Play,
  Receipt,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import CopyButton from "../../_shared/CopyButton";
import SessionCountdown from "../../_shared/SessionCountdown";
import MaterialCard from "../../_shared/MaterialCard";
import CurriculumTab from "./CurriculumTab";
import { formatAmount, formatDate, toBn, usableLink } from "../../_shared/format";

const STATUS_LABEL = { "Active & Enrolling": "চলমান", Upcoming: "শীঘ্রই শুরু", Closed: "ভর্তি বন্ধ" };
const STATUS_CLS = {
  "Active & Enrolling": "bg-emerald-500/15 text-emerald-300",
  Upcoming: "bg-amber-500/15 text-amber-300",
  Closed: "bg-slate-800 text-slate-400",
};

/** Every trainer on the course: the main instructor plus the trainer of each session. */
function trainersOf(course) {
  const byName = new Map();
  if (course.instructor?.trim()) byName.set(course.instructor.trim(), "");
  for (const m of course.curriculum || []) {
    const name = m.trainerName?.trim();
    if (name && !byName.get(name)) byName.set(name, m.trainerRole || "");
  }
  return [...byName].map(([name, role]) => ({ name, role }));
}

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug text-white">{children}</div>
    </div>
  );
}

function LinkRow({ icon: Icon, title, hint, url, actionLabel }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          {url ? (
            <p className="truncate text-xs text-slate-400">{url}</p>
          ) : (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Link2Off className="h-3.5 w-3.5" /> এখনো যুক্ত করা হয়নি
            </p>
          )}
          {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
        </div>
      </div>

      {url && (
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton
            text={url}
            label="কপি"
            copiedLabel="কপি হয়েছে"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {actionLabel} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Everything about ONE purchased course: facts, class links, modules (sessions + lessons)
 * and study resources. All data comes from the course record and the trainee's own
 * enrolment / payment — nothing is filled in by guess.
 */
export default function CourseDetail({ course, participant, materials = [], payments = [], onBack, initialSection = "overview" }) {
  const [section, setSection] = useState(initialSection);

  const meet = usableLink(course.meetLink);
  const whatsapp = usableLink(course.whatsappLink);
  const video = usableLink(course.videoUrl);
  const linkCount = [meet, whatsapp, video].filter(Boolean).length;

  const modules = course.curriculum || [];
  const lessonCount = modules.reduce((n, m) => n + (m.lessons || []).length, 0);
  const courseMaterials = materials.filter((m) => m.courseId === course.courseId);
  const trainers = trainersOf(course);
  const payment = payments.find((p) => p.status === "VALID" && p.courseId === course.courseId) || null;

  const progress = Number(participant?.progress);
  const hasProgress = Number.isFinite(progress) && progress > 0;

  const groups = Object.entries(
    courseMaterials.reduce((acc, m) => {
      const key = m.category || "স্টাডি ম্যাটেরিয়াল";
      (acc[key] ||= []).push(m);
      return acc;
    }, {})
  );

  const SECTIONS = [
    { id: "overview", label: "কোর্সের তথ্য" },
    { id: "links", label: "লিংক", count: linkCount },
    { id: "modules", label: "মডিউল", count: modules.length },
    { id: "resources", label: "রিসোর্স", count: courseMaterials.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-3">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> সব কোর্স
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {course.tag && <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 font-semibold text-indigo-300">{course.tag}</span>}
          {course.status && (
            <span className={`rounded-full px-2.5 py-1 font-medium ${STATUS_CLS[course.status] || "bg-slate-800 text-slate-300"}`}>
              {STATUS_LABEL[course.status] || course.status}
            </span>
          )}
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-300">ভর্তি নিশ্চিত</span>
        </div>
        <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">{course.name}</h2>
        {course.summary && <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{course.summary}</p>}
      </div>

      {/* Section switcher */}
      <div role="tablist" className="-mb-px flex items-center gap-6 overflow-x-auto border-b border-slate-800">
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm transition-colors ${
                active ? "border-indigo-500 font-semibold text-white" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.label}
              {s.count !== undefined && (
                <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"}`}>
                  {toBn(s.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- Course info ---------- */}
      {section === "overview" && (
        <div className="space-y-5">
          <SessionCountdown course={course} />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Fact icon={Calendar} label="ওরিয়েন্টেশন">
              {course.orientationDate || "ঘোষণা করা হবে"}
              {course.orientationTime && <span className="block text-xs font-normal text-slate-400">{course.orientationTime}</span>}
            </Fact>
            <Fact icon={Clock} label="ক্লাস রুটিন">
              {course.routine || "ঘোষণা করা হবে"}
            </Fact>
            <Fact icon={Hourglass} label="কোর্সের মেয়াদ">
              {course.duration || "—"}
            </Fact>
            <Fact icon={Layers} label="কনটেন্ট">
              {toBn(modules.length)}টি মডিউল
              <span className="block text-xs font-normal text-slate-400">
                {toBn(lessonCount)}টি লেসন · {toBn(courseMaterials.length)}টি রিসোর্স
              </span>
            </Fact>
            <Fact icon={CalendarDays} label="ভর্তির তারিখ">
              {participant?.enrolledAt ? formatDate(participant.enrolledAt) : "—"}
            </Fact>
            <Fact icon={Users} label="উপস্থিতি">
              {participant ? `${toBn(participant.attendanceCount || 0)}টি সেশন` : "—"}
            </Fact>
            <Fact icon={Check} label="অগ্রগতি">
              {hasProgress ? (
                <>
                  {toBn(Math.round(progress))}%
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, progress)}%` }} />
                  </span>
                </>
              ) : (
                "শুরু হয়নি"
              )}
            </Fact>
            <Fact icon={Receipt} label="পরিশোধিত ফি">
              {payment ? formatAmount(payment.amount, payment.currency) : "—"}
              {payment && (
                <Link
                  href={`/payments?invoice=${encodeURIComponent(payment.tranId)}`}
                  className="block text-xs font-normal text-indigo-400 hover:text-indigo-300"
                >
                  ইনভয়েস দেখুন →
                </Link>
              )}
            </Fact>
          </div>

          {trainers.length > 0 && (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-white">ইনস্ট্রাক্টর ও ট্রেইনার প্যানেল</h3>
              {/* grid-cols-1 (= minmax(0,1fr)) lets long, truncated names shrink instead of widening the page */}
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trainers.map((t) => (
                  <div key={t.name} className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-950/60 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{t.name}</p>
                      {t.role && <p className="truncate text-xs text-slate-400">{t.role}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {course.perks?.length > 0 && (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-sm font-semibold text-white">এই কোর্সে যা যা পাচ্ছেন</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                {course.perks.map((perk, i) => (
                  <li key={`${i}-${perk}`} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* ---------- Links ---------- */}
      {section === "links" && (
        <div className="space-y-3">
          <LinkRow
            icon={Video}
            title="লাইভ ক্লাস (Google Meet)"
            hint="ক্লাসের সময় এই লিংকে যুক্ত হোন"
            url={meet}
            actionLabel="প্রবেশ করুন"
          />
          <LinkRow
            icon={MessageCircle}
            title="অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ"
            hint="নোটিশ ও আলোচনার জন্য ব্যাচ গ্রুপ"
            url={whatsapp}
            actionLabel="গ্রুপে যোগ দিন"
          />
          {video && <LinkRow icon={Play} title="কোর্স পরিচিতি ভিডিও" url={video} actionLabel="দেখুন" />}
          {linkCount === 0 && (
            <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-xs text-slate-400">
              এই কোর্সের লিংক এখনো যুক্ত করা হয়নি। যুক্ত হলে এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে।
            </p>
          )}
        </div>
      )}

      {/* ---------- Modules ---------- */}
      {section === "modules" && <CurriculumTab course={course} />}

      {/* ---------- Resources ---------- */}
      {section === "resources" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">{toBn(courseMaterials.length)}টি স্টাডি রিসোর্স এই কোর্সের জন্য প্রকাশিত।</p>
            <Link href="/materials" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              সব ম্যাটেরিয়াল পেজ →
            </Link>
          </div>

          {courseMaterials.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-400">
              <FolderOpen className="h-7 w-7 text-slate-600" />
              <p>এই কোর্সের জন্য এখনো কোনো স্টাডি রিসোর্স প্রকাশ করা হয়নি।</p>
            </div>
          ) : (
            groups.map(([category, items]) => (
              <section key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  {category} <span className="font-normal text-slate-500">({toBn(items.length)})</span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MaterialCard key={item.key} item={item} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
