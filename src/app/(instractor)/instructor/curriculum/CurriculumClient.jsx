'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  UserCircle2,
  Tag,
  Video,
  MessageCircle,
} from "lucide-react";
import CourseSettingsForm from "../../_shared/CourseSettingsForm";
import ErrorBanner from "../../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../../_shared/Flash";
import { apiFetch } from "../../_shared/api";
import { NOT_SET, bn, courseAccent } from "../../_shared/utils";

const MODULE_FIELDS = [
  { key: "liveDate", label: "লাইভ সেশন (প্রদর্শিত তারিখ)", placeholder: "যেমন: ২০ সেপ্টেম্বর ২০২৬ (রবিবার)" },
  { key: "sessionDate", label: "সেশন তারিখ", placeholder: "যেমন: 20 September 2026, Sunday" },
  { key: "sessionTime", label: "সেশন সময়", placeholder: "যেমন: 8:00 PM - 9:00 PM" },
  { key: "trainerName", label: "ট্রেইনারের নাম", placeholder: "ট্রেইনারের পূর্ণ নাম" },
  { key: "trainerRole", label: "ট্রেইনারের পদবি", placeholder: "যেমন: Senior Teacher & Trainer" },
];

const moduleSchedule = (m) =>
  m.liveDate || [m.sessionDate, m.sessionTime].filter(Boolean).join(" • ") || "শিডিউল নির্ধারিত হয়নি";

/** Inline editor for one module's schedule fields. Keyed per course+module by the parent. */
function ModuleEditor({ courseId, module, onSaved, onCancel }) {
  const [values, setValues] = useState(() => ({
    ...Object.fromEntries(MODULE_FIELDS.map((f) => [f.key, module[f.key] || ""])),
    topics: (module.topics || []).join("\n"),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const { flash, show, clear } = useFlash();

  const handleSave = async (e) => {
    e.preventDefault();
    clear();
    setIsSaving(true);
    try {
      const patch = { moduleNo: module.moduleNo };
      for (const f of MODULE_FIELDS) patch[f.key] = values[f.key].trim();
      patch.topics = values.topics
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
      const data = await apiFetch("/api/instructor/courses", {
        method: "PATCH",
        body: { courseId, curriculum: [patch] },
      });
      onSaved(data.course, data.message);
    } catch (err) {
      show("error", err.message || "মডিউল আপডেট ব্যর্থ হয়েছে");
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-slate-950 p-4 sm:p-5 border-t border-slate-800 space-y-3">
      <p className="text-xs font-bold text-indigo-300">মডিউল {bn(module.moduleNo)} — শিডিউল ও ট্রেইনার সম্পাদনা</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODULE_FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">{f.label}</span>
            <input
              type="text"
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">টপিকসমূহ (প্রতি লাইনে একটি)</span>
          <textarea
            rows={4}
            value={values.topics}
            onChange={(e) => setValues((v) => ({ ...v, topics: e.target.value }))}
            placeholder={"Student Psychology\nEffective Online Classrooms"}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      <FlashMessage flash={flash} onClose={clear} />

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> {isSaving ? "সেভ হচ্ছে..." : "সেভ"}
        </button>
      </div>
    </form>
  );
}

export default function CurriculumClient({ initialCourses = [], initialCourseId = "TOT-MEN", loadError = null }) {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialCourses.some((c) => c.courseId === initialCourseId) ? initialCourseId : initialCourses[0]?.courseId || ""
  );
  const [editingKey, setEditingKey] = useState(null);
  const [expanded, setExpanded] = useState({});
  const { flash, show, clear } = useFlash();

  const activeCourse = courses.find((c) => c.courseId === selectedCourseId) || null;
  const modules = activeCourse?.curriculum || [];
  const lessonsCount = modules.reduce((n, m) => n + (m.lessons || []).length, 0);

  const replaceCourse = (updated) => {
    if (!updated?.courseId) return;
    setCourses((list) => list.map((c) => (c.courseId === updated.courseId ? { ...c, ...updated } : c)));
  };

  const toggleModule = (key) => setExpanded((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            কোর্স কারিকুলাম ও উইকলি সেশন ম্যানেজার
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeCourse
              ? `${bn(modules.length)}টি মডিউল, ${bn(lessonsCount)}টি লেসন — লাইভ সেশনের শিডিউল, ট্রেইনার ও টপিক নিয়ন্ত্রণ করুন`
              : "কোর্সের মডিউল ও লাইভ সেশনের শিডিউল নিয়ন্ত্রণ করুন"}
          </p>
        </div>

        {/* Batch / Course Selector (every published course from the DB) */}
        {courses.length > 0 && (
          <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-1 text-xs">
            {courses.map((c) => {
              const accent = courseAccent(c);
              const active = c.courseId === selectedCourseId;
              return (
                <button
                  key={c.courseId}
                  type="button"
                  onClick={() => {
                    setSelectedCourseId(c.courseId);
                    setEditingKey(null);
                    clear();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    active ? `${accent.button} text-white shadow-md` : "text-slate-400 hover:text-white"
                  }`}
                  title={c.name}
                >
                  {accent.emoji} {c.courseId}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ErrorBanner message={loadError} />
      <FlashMessage flash={flash} onClose={clear} />

      {!activeCourse ? (
        !loadError && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400">
            কোনো প্রকাশিত কোর্স পাওয়া যায়নি।
          </div>
        )
      ) : (
        <>
          {/* Course Live Link Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">ব্যাচ সেটিংস</span>
                <h3 className="text-base font-bold text-white mt-0.5">{activeCourse.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3 text-indigo-400" />
                    {activeCourse.meetLink ? "মিট লিঙ্ক যুক্ত আছে" : `মিট লিঙ্ক ${NOT_SET}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-400" />
                    {activeCourse.whatsappLink ? "WhatsApp লিঙ্ক যুক্ত আছে" : `WhatsApp ${NOT_SET}`}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                {activeCourse.routine || `রুটিন ${NOT_SET}`}
              </span>
            </div>

            <CourseSettingsForm
              key={activeCourse.courseId}
              course={activeCourse}
              fields={["meetLink", "whatsappLink"]}
              onSaved={replaceCourse}
              submitLabel="লিঙ্ক আপডেট"
            />
          </div>

          {/* Curriculum Modules */}
          <div className="space-y-4">
            {modules.length === 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400">
                এই কোর্সে এখনো কোনো মডিউল যুক্ত করা হয়নি। মডিউল যোগ করতে অ্যাডমিনের সাথে যোগাযোগ করুন।
              </div>
            )}

            {modules.map((m) => {
              const key = `${activeCourse.courseId}:${m.moduleNo}`;
              const isExpanded = expanded[key] ?? true;
              const isEditing = editingKey === key;
              return (
                <div
                  key={key}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all"
                >
                  {/* Module Header Bar */}
                  <div
                    onClick={() => toggleModule(key)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          মডিউল {bn(String(m.moduleNo).padStart(2, "0"))}
                        </span>
                        {m.sessionBadge && <span className="text-[10px] font-bold text-slate-500">{m.sessionBadge}</span>}
                        {m.duration && <span className="text-xs text-slate-400">{m.duration}</span>}
                      </div>
                      <h3 className="text-base font-black text-white">{m.title}</h3>
                      {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">লাইভ সেশন শিডিউল:</span>
                        <span className="text-xs font-bold text-emerald-400">{moduleSchedule(m)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingKey(isEditing ? null : key);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          isEditing ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        }`}
                        title="শিডিউল ও ট্রেইনার সম্পাদনা"
                        aria-label="মডিউল সম্পাদনা"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <div className="p-1.5 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <ModuleEditor
                      key={key}
                      courseId={activeCourse.courseId}
                      module={m}
                      onCancel={() => setEditingKey(null)}
                      onSaved={(course, message) => {
                        replaceCourse(course);
                        setEditingKey(null);
                        show("success", message || `মডিউল ${bn(m.moduleNo)}-এর শিডিউল সফলভাবে আপডেট হয়েছে!`);
                      }}
                    />
                  )}

                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/50 p-5 space-y-4">
                      {/* Session details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> সেশন তারিখ
                          </span>
                          <span className="text-white font-semibold">{m.sessionDate || NOT_SET}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> সময়
                          </span>
                          <span className="text-white font-semibold">{m.sessionTime || NOT_SET}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <UserCircle2 className="w-3 h-3" /> ট্রেইনার
                          </span>
                          <span className="text-white font-semibold block">{m.trainerName || NOT_SET}</span>
                          {m.trainerRole && <span className="text-[11px] text-slate-400">{m.trainerRole}</span>}
                        </div>
                      </div>

                      {(m.topics || []).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-400" />
                          {m.topics.map((t, i) => (
                            <span
                              key={`${t}-${i}`}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-400">এই মডিউলের লেসন ও ক্লাস সূচি:</h4>
                        {(m.lessons || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500">এই মডিউলে কোনো লেসন যুক্ত নেই।</p>
                        ) : (
                          m.lessons.map((les, idx) => (
                            <div
                              key={les._id || idx}
                              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/20 shrink-0">
                                  {bn(les.lessonNo || idx + 1)}
                                </div>
                                <div>
                                  <h5 className="font-bold text-white">{les.title}</h5>
                                  {les.duration && (
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3 h-3 text-slate-500" /> সময়কাল: {les.duration}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {les.isFreePreview ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                  ফ্রি প্রিভিউ
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-medium shrink-0">লাইভ সেশন</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            মডিউল যোগ/মুছে ফেলা বা বিষয়বস্তু পরিবর্তন অ্যাডমিন প্যানেল থেকে করা যায়; এখানে শিডিউল, ট্রেইনার ও টপিক হালনাগাদ করা যায়।
          </p>
        </>
      )}
    </div>
  );
}
