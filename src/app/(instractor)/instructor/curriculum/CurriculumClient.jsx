'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Check,
  Save,
  PlayCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function CurriculumClient({ initialCourses = [] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedBatch, setSelectedBatch] = useState("TOT-MEN");
  const [editingModule, setEditingModule] = useState(null);
  const [editLiveDate, setEditLiveDate] = useState("");
  const [editMeetLink, setEditMeetLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);
  const [expandedModules, setExpandedModules] = useState({ 1: true, 2: true, 3: true, 4: true });

  const activeCourse = courses.find((c) =>
    selectedBatch === "TOT-MEN" ? c.courseId === "TOT-MEN" || c.track === "men" : c.courseId === "TOT-WOMEN-014" || c.track === "women"
  ) || courses[0];

  const modules = activeCourse?.curriculum || [];

  const toggleModule = (moduleNo) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleNo]: !prev[moduleNo],
    }));
  };

  // Update course meet link & routine
  const handleUpdateCourseDetails = async (e) => {
    e.preventDefault();
    if (!activeCourse) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/instructor/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: activeCourse.courseId,
          meetLink: editMeetLink || activeCourse.meetLink,
        }),
      });
      const data = await res.json();
      if (data.success && data.course) {
        setSaveToast("কোর্সের লাইভ লিঙ্ক সফলভাবে আপডেট করা হয়েছে!");
        setCourses(
          courses.map((c) =>
            c.courseId === activeCourse.courseId ? { ...c, meetLink: data.course.meetLink } : c
          )
        );
        setTimeout(() => setSaveToast(null), 3000);
      } else {
        alert(data.message || "আপডেট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  // Save module live date update
  const handleSaveModuleDate = async (moduleNo) => {
    if (!editLiveDate.trim() || !activeCourse) return;

    setIsSaving(true);
    const updatedCurriculum = modules.map((m) =>
      m.moduleNo === moduleNo ? { ...m, liveDate: editLiveDate.trim() } : m
    );

    try {
      const res = await fetch("/api/instructor/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: activeCourse.courseId,
          curriculum: updatedCurriculum,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveToast(`মডিউল ${moduleNo}-এর শিডিউল সফলভাবে আপডেট হয়েছে!`);
        setCourses(
          courses.map((c) =>
            c.courseId === activeCourse.courseId ? { ...c, curriculum: updatedCurriculum } : c
          )
        );
        setEditingModule(null);
        setTimeout(() => setSaveToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            কোর্স কারিকুলাম ও উইকলি সেশন ম্যানেজার
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ৪টি প্রফেশনাল মডিউল, ১২টি সেশন এবং লাইভ ক্লাসের শিডিউল নিয়ন্ত্রণ করুন
          </p>
        </div>

        {/* Batch Selector */}
        <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedBatch("TOT-MEN")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              selectedBatch === "TOT-MEN"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            👨 TOT MEN
          </button>
          <button
            onClick={() => setSelectedBatch("TOT-WOMEN-014")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              selectedBatch === "TOT-WOMEN-014"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🧕 TOT WOMEN (014)
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {saveToast}
        </div>
      )}

      {/* Course Live Link & Routine Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              ব্যাচ সেটিংস
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {activeCourse?.name || "TOT Course Batch"}
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
            {activeCourse?.routine || "সপ্তাহে ৩ দিন (রাত ৮:০০)"}
          </span>
        </div>

        <form onSubmit={handleUpdateCourseDetails} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="url"
              defaultValue={activeCourse?.meetLink || ""}
              onChange={(e) => setEditMeetLink(e.target.value)}
              placeholder="গুগল মিট অথবা জুম ক্লাসরুম লিঙ্ক..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Video className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "আপডেট হচ্ছে..." : "মিট লিঙ্ক আপডেট"}
          </button>
        </form>
      </div>

      {/* 4 Curriculum Modules */}
      <div className="space-y-4">
        {modules.map((m) => {
          const isExpanded = expandedModules[m.moduleNo];
          return (
            <div
              key={m.moduleNo}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all"
            >
              {/* Module Header Bar */}
              <div
                onClick={() => toggleModule(m.moduleNo)}
                className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      মডিউল ০{m.moduleNo}
                    </span>
                    <span className="text-xs text-slate-400">{m.duration || "১ সপ্তাহ"}</span>
                  </div>
                  <h3 className="text-base font-black text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400">{m.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">লাইভ সেশন শিডিউল:</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {m.liveDate || "১ম সপ্তাহ"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModule(m.moduleNo);
                      setEditLiveDate(m.liveDate || "");
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="তারিখ পরিবর্তন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-1.5 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Editing Module Inline Bar */}
              {editingModule === m.moduleNo && (
                <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center gap-3">
                  <span className="text-xs text-slate-300 whitespace-nowrap">নতুন সেশন সময়:</span>
                  <input
                    type="text"
                    value={editLiveDate}
                    onChange={(e) => setEditLiveDate(e.target.value)}
                    placeholder="যেমন: ২২ সেপ্টেম্বর (রাত ৮:০০)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleSaveModuleDate(m.moduleNo)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> সেভ
                  </button>
                  <button
                    onClick={() => setEditingModule(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                </div>
              )}

              {/* Lessons List in Module */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/50 p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 mb-2">এই মডিউলের লেসন ও ক্লাস সূচি:</h4>
                  {(m.lessons || []).map((les, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/20">
                          {les.lessonNo || idx + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-white">{les.title}</h5>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" /> সময়কাল: {les.duration || "৪৫ মিনিট"}
                          </span>
                        </div>
                      </div>

                      {les.isFreePreview ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ফ্রি প্রিভিউ
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">
                          লাইভ সেশন
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
