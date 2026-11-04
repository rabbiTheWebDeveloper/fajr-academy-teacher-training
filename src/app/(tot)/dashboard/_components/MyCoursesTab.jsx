"use client";

import { BookOpen, Calendar, Clock, FolderOpen, GraduationCap, Layers } from "lucide-react";
import PaymentRequiredCard from "../../_shared/PaymentRequiredCard";
import CourseDetail from "./CourseDetail";
import { toBn } from "../../_shared/format";

const STATUS_LABEL = { "Active & Enrolling": "চলমান", Upcoming: "শীঘ্রই শুরু", Closed: "ভর্তি বন্ধ" };

/**
 * "My courses": the courses this trainee has bought. Open one to see its details, links,
 * modules and resources. With a single course the detail opens straight away.
 */
export default function MyCoursesTab({
  paid,
  courses = [],
  participants = [],
  materials = [],
  payments = [],
  primaryCourseId = "",
  lastAttempt = null,
  openId = null,
  onOpen,
  onBrowse,
}) {
  if (!paid) return <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} compact />;

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
        <GraduationCap className="h-8 w-8 text-slate-600" />
        <p className="max-w-md text-sm text-slate-400">
          আপনার পেমেন্ট সক্রিয় আছে, কিন্তু এনরোল করা কোর্সের তথ্য এখনো পাওয়া যায়নি। কিছুক্ষণ পর আবার দেখুন অথবা হেল্পলাইনে যোগাযোগ করুন।
        </p>
        <button
          type="button"
          onClick={onBrowse}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-600 hover:text-white"
        >
          কোর্স ক্যাটালগ দেখুন
        </button>
      </div>
    );
  }

  const effectiveId = openId ?? (courses.length === 1 ? courses[0].courseId : null);
  const open = courses.find((c) => c.courseId === effectiveId);

  if (open) {
    return (
      <CourseDetail
        key={open.courseId}
        course={open}
        participant={participants.find((p) => p.courseId === open.courseId) || null}
        materials={materials}
        payments={payments}
        onBack={courses.length > 1 ? () => onOpen(null) : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          আমার কোর্স <span className="font-normal text-slate-500">({toBn(courses.length)})</span>
        </h2>
        <button type="button" onClick={onBrowse} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
          নতুন কোর্স দেখুন →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {courses.map((c) => {
          const modules = c.curriculum || [];
          const lessons = modules.reduce((n, m) => n + (m.lessons || []).length, 0);
          const resources = materials.filter((m) => m.courseId === c.courseId).length;
          return (
            <button
              key={c.courseId}
              type="button"
              onClick={() => onOpen(c.courseId)}
              className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 text-left transition-colors hover:border-indigo-500/50"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  {c.tag ? <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 font-semibold text-indigo-300">{c.tag}</span> : <span />}
                  {c.status && <span className="text-slate-400">{STATUS_LABEL[c.status] || c.status}</span>}
                </div>
                <h3 className="text-base font-semibold leading-snug text-white">{c.name}</h3>
                {c.summary && <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{c.summary}</p>}
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" /> ওরিয়েন্টেশন: {c.orientationDate || "ঘোষণা করা হবে"}
                  {c.orientationTime ? ` · ${c.orientationTime}` : ""}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" /> {c.routine || "রুটিন ঘোষণা করা হবে"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-300">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-slate-500" /> {toBn(modules.length)} মডিউল
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" /> {toBn(lessons)} লেসন
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="h-3.5 w-3.5 text-slate-500" /> {toBn(resources)} রিসোর্স
                  </span>
                </span>
                <span className="font-medium text-indigo-400">বিস্তারিত →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
