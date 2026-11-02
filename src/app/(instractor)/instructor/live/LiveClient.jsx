'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  Mic,
  Monitor,
  Edit,
  Edit3,
  Sparkles,
  Layers,
  Users,
  UserCircle2,
  RotateCcw,
  Info,
} from "lucide-react";
import CourseSettingsForm from "../../_shared/CourseSettingsForm";
import ErrorBanner from "../../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../../_shared/Flash";
import { NOT_SET, bn, courseAccent, courseTrainers } from "../../_shared/utils";

const CHECKLIST = [
  { key: "mic", label: "মাইক্রোফোন ও সাউন্ড কোয়ালিটি টেস্ট সম্পন্ন", icon: Mic },
  { key: "camera", label: "এইচডি ক্যামেরা ও পর্যাপ্ত ফ্রন্ট লাইটিং নিশ্চিত", icon: Video },
  { key: "tablet", label: "ডিজিটাল পেন ও ড্রয়িং প্যাড কানেক্টেড", icon: Edit },
  { key: "slides", label: "তাজবীদ স্লাইড ও লেসন শিট ওপেন রাখা হয়েছে", icon: Layers },
  { key: "audioShare", label: "কম্পিউটার অডিও শেয়ারিং টেস্ট করা হয়েছে", icon: Monitor },
];

const LOGISTIC_FIELDS = ["meetLink", "whatsappLink", "routine", "orientationDate", "orientationTime"];

export default function LiveClient({ initialCourses = [], loadError = null }) {
  const [courses, setCourses] = useState(initialCourses);
  const [editingId, setEditingId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  // Personal pre-class checklist: local to this tab only, never saved.
  const [checklist, setChecklist] = useState({});
  const { flash, show, clear } = useFlash();

  const handleCopy = async (link, id) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(id);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {
      show("error", `লিঙ্ক কপি করা যায়নি। নিজে কপি করুন: ${link}`);
    }
  };

  const handleSaved = (updated) => {
    if (!updated?.courseId) return;
    setCourses((list) =>
      list.map((c) =>
        c.courseId === updated.courseId
          ? { ...c, ...Object.fromEntries(LOGISTIC_FIELDS.map((f) => [f, updated[f] ?? ""])) }
          : c
      )
    );
  };

  const toggleCheck = (key) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  const doneCount = CHECKLIST.filter((i) => checklist[i.key]).length;

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">লাইভ ক্লাসরুম কন্ট্রোল হাব</h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-rose-400" /> LIVE HUB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            হোস্ট হিসেবে লাইভ রুম খুলুন, স্টুডেন্ট লিঙ্ক কপি করুন এবং প্রতিটি ব্যাচের লিঙ্ক, রুটিন ও ওরিয়েন্টেশন হালনাগাদ করুন
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> MASTER HOST CONSOLE
        </span>
      </div>

      <ErrorBanner message={loadError} />
      <FlashMessage flash={flash} onClose={clear} />

      {courses.length === 0 && !loadError && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400">
          কোনো প্রকাশিত ব্যাচ / কোর্স পাওয়া যায়নি।
        </div>
      )}

      {/* Batch Live Cards Grid — one per published course */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((b) => {
          const accent = courseAccent(b);
          const trainers = courseTrainers(b);
          const isEditing = editingId === b.courseId;
          const sessions = (b.curriculum || []).filter((m) => m.liveDate || m.sessionDate);
          return (
            <div
              key={b.courseId}
              className={`bg-slate-900/95 border border-indigo-950/80 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between gap-6 hover:border-indigo-500/40 transition-all relative overflow-hidden group ${
                isEditing ? "md:col-span-2" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${accent.badge}`}>
                    {accent.emoji} {b.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">{b.courseId}</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : b.courseId)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isEditing ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                      title="লিঙ্ক, রুটিন ও ওরিয়েন্টেশন সম্পাদনা"
                      aria-label="ব্যাচ সেটিংস সম্পাদনা"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ক্লাস শিডিউল:</strong>
                      <span className={b.routine ? "" : "text-slate-500"}>{b.routine || NOT_SET}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ওরিয়েন্টেশন:</strong>
                      <span className={b.orientationDate ? "" : "text-slate-500"}>
                        {b.orientationDate
                          ? `${b.orientationDate}${b.orientationTime ? ` (${b.orientationTime})` : ""}`
                          : NOT_SET}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <UserCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">ইনস্ট্রাক্টর ও ট্রেইনার:</strong>
                      <span className={trainers.length ? "" : "text-slate-500"}>
                        {trainers.length ? trainers.join(", ") : NOT_SET}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    এনরোলড: <strong className="text-white">{bn(b.enrolledCount ?? 0)}</strong>
                    {b.maxSeats ? <span>/ {bn(b.maxSeats)} আসন</span> : null}
                    {b.status && <span className="ml-auto text-slate-500">{b.status}</span>}
                  </div>

                  {sessions.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <strong className="text-white block text-[11px]">সেশন সূচি:</strong>
                      {sessions.map((m) => (
                        <div key={m.moduleNo} className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-slate-400 truncate">
                            {bn(m.moduleNo)}. {m.title}
                          </span>
                          <span className="text-emerald-400 font-semibold shrink-0">
                            {m.liveDate || m.sessionDate}
                            {m.sessionTime ? ` • ${m.sessionTime}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-2">
                  <p className="text-xs font-bold text-indigo-300">ব্যাচ সেটিংস সম্পাদনা — {b.courseId}</p>
                  <CourseSettingsForm
                    key={b.courseId}
                    course={b}
                    fields={LOGISTIC_FIELDS}
                    onSaved={handleSaved}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              )}

              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                {b.meetLink ? (
                  <a
                    href={b.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Video className="w-4 h-4" /> হোস্ট হিসেবে লাইভ রুম ওপেন করুন
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(b.courseId)}
                    className="w-full py-3 rounded-2xl bg-slate-800/80 border border-dashed border-indigo-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4 text-indigo-400" /> মিট লিঙ্ক {NOT_SET} — যুক্ত করুন
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(b.meetLink, b.courseId)}
                    disabled={!b.meetLink}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    {copiedLink === b.courseId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedLink === b.courseId ? "কপি সম্পন্ন!" : "মিট লিঙ্ক কপি"}
                  </button>

                  {b.whatsappLink ? (
                    <a
                      href={b.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <span
                      className="py-2.5 px-3.5 rounded-xl bg-slate-800/60 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                      title={`WhatsApp লিঙ্ক ${NOT_SET}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp: {NOT_SET}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Class Equipment Checklist (local only) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">লাইভ ক্লাস শুরুর পূর্বে প্রি-ফ্লাইট চেকলিস্ট</h3>
            <span className="text-[11px] font-bold text-slate-400">
              ({bn(doneCount)}/{bn(CHECKLIST.length)})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setChecklist({})}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> রিসেট
          </button>
        </div>
        <p className="text-xs text-slate-400 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          ব্যক্তিগত মনে রাখার তালিকা — শুধু এই ব্রাউজার ট্যাবে থাকে, কোথাও সংরক্ষিত হয় না এবং পেজ রিফ্রেশ করলে মুছে যায়।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHECKLIST.map((item) => {
            const Icon = item.icon;
            const isChecked = Boolean(checklist[item.key]);
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                aria-pressed={isChecked}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 text-xs text-left transition-all ${
                  isChecked ? "bg-indigo-950/30 border-indigo-500/40 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isChecked ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className="font-semibold">{item.label}</span>
                </span>
                <span
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                    isChecked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
