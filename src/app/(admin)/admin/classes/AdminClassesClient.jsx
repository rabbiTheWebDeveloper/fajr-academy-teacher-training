'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Hourglass,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserCheck,
  Video,
  X,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { useAdminAccess } from "../../AdminAccessContext";
import { AdminToast, DbErrorBanner, callApi, useConfirm, useToast } from "../../_shared/admin-ui";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatSessionDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const month = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `${m[3]} ${month} ${m[1]}, ${weekday}`;
}

function isoFromSessionDate(text) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text || "");
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(text || "");
  if (!m) return "";
  const mi = MONTH_NAMES.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  if (mi < 0) return "";
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
}

function formatSessionTime(start, end) {
  const one = (hhmm) => {
    const m = /^(\d{2}):(\d{2})$/.exec(hhmm || "");
    if (!m) return "";
    const h24 = Number(m[1]);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${m[2]} ${h24 >= 12 ? "PM" : "AM"}`;
  };
  const from = one(start);
  if (!from) return "";
  const to = one(end);
  return to ? `${from} - ${to}` : from;
}

function timesFromSessionTime(text) {
  const to24 = (part) => {
    const m = /(\d{1,2})[:.](\d{2})\s*(AM|PM)/i.exec(part || "");
    if (!m) return "";
    let h = Number(m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return `${String(h).padStart(2, "0")}:${m[2]}`;
  };
  const parts = String(text || "").split(/\s*[-–—]\s*/);
  return { start: to24(parts[0]), end: parts[1] ? to24(parts[1]) : "" };
}

const STATUS_OPTIONS = [
  { value: "", label: "স্বয়ংক্রিয় (তারিখ অনুযায়ী)" },
  { value: "scheduled", label: "নির্ধারিত (Scheduled)" },
  { value: "live", label: "চলমান (LIVE)" },
  { value: "completed", label: "সম্পন্ন (Completed)" },
  { value: "postponed", label: "স্থগিত (Postponed)" },
  { value: "cancelled", label: "বাতিল (Cancelled)" },
];

const FILTER_TABS = [
  { key: "all", label: "সব" },
  { key: "scheduled", label: "নির্ধারিত" },
  { key: "live", label: "চলমান LIVE" },
  { key: "completed", label: "সম্পন্ন" },
  { key: "postponed", label: "স্থগিত" },
  { key: "cancelled", label: "বাতিল" },
];

function statusStyle(status, isLight) {
  switch (status) {
    case "live":
      return {
        label: "চলমান (LIVE)",
        Icon: Radio,
        cls: isLight
          ? "bg-rose-50 text-rose-800 border-rose-300"
          : "bg-rose-500/20 text-rose-300 border-rose-500/40",
      };
    case "completed":
      return {
        label: "সম্পন্ন",
        Icon: CheckCircle2,
        cls: isLight
          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      };
    case "postponed":
      return {
        label: "স্থগিত",
        Icon: PauseCircle,
        cls: isLight
          ? "bg-amber-50 text-amber-900 border-amber-300"
          : "bg-amber-500/20 text-amber-300 border-amber-500/40",
      };
    case "cancelled":
      return {
        label: "বাতিল",
        Icon: Ban,
        cls: isLight
          ? "bg-slate-100 text-slate-600 border-slate-300"
          : "bg-slate-800 text-slate-400 border-slate-700",
      };
    default:
      return {
        label: "নির্ধারিত",
        Icon: Calendar,
        cls: isLight
          ? "bg-indigo-50 text-indigo-800 border-indigo-200"
          : "bg-indigo-500/15 text-indigo-300 border-indigo-500/35",
      };
  }
}

const emptyForm = (courseId = "", nextNo = 1) => ({
  mode: "create",
  classId: "",
  targetModuleNo: null,
  courseId,
  moduleNo: nextNo,
  sessionBadge: `SESSION ${String(nextNo).padStart(2, "0")}`,
  title: "",
  subtitle: "",
  description: "",
  trainerName: "",
  trainerRole: "",
  sessionIso: "",
  sessionDate: "",
  sessionStart: "",
  sessionEnd: "",
  sessionTime: "",
  duration: "১ ঘণ্টা",
  meetLink: "",
  recordingUrl: "",
  sessionStatus: "",
  topicsText: "",
});

export default function AdminClassesClient({
  initialCourses = [],
  initialClasses = [],
  instructors = [],
  loadError: initialLoadError = null,
}) {
  const { isLight } = useAdminTheme();
  const { can, isSuper } = useAdminAccess();
  const mayCreate = can("courses", "create");
  const mayUpdate = can("courses", "update");
  const { toast, showToast, hideToast } = useToast();
  const { confirm, confirmDialog } = useConfirm();

  const [courses, setCourses] = useState(initialCourses);
  const [classes, setClasses] = useState(initialClasses);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);

  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Add / Edit class modal
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Course-level logistics editor
  const [editingLogistics, setEditingLogistics] = useState(null);
  const [savingLogistics, setSavingLogistics] = useState(false);

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/classes");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setCourses(data.courses || []);
    setClasses(data.classes || []);
    setLoadError(null);
    showToast("সর্বশেষ ক্লাস শিডিউল লোড হয়েছে।");
  };

  const selectedCourse = useMemo(
    () => (courseFilter === "all" ? null : courses.find((c) => c.courseId === courseFilter) || null),
    [courses, courseFilter]
  );

  const counts = useMemo(() => {
    const out = { all: 0, scheduled: 0, live: 0, completed: 0, postponed: 0, cancelled: 0 };
    for (const c of classes) {
      if (courseFilter !== "all" && c.courseId !== courseFilter) continue;
      out.all += 1;
      const st = c.sessionStatus || "scheduled";
      if (out[st] !== undefined) out[st] += 1;
    }
    return out;
  }, [classes, courseFilter]);

  const visibleClasses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.filter((item) => {
      if (courseFilter !== "all" && item.courseId !== courseFilter) return false;
      const st = item.sessionStatus || "scheduled";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (
        q &&
        ![item.title, item.subtitle, item.sessionBadge, item.trainerName, item.courseName, item.courseId, item.sessionDate, item.liveDate].some(
          (v) => String(v || "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [classes, courseFilter, statusFilter, search]);

  const nextModuleNoFor = (cid) => {
    const matching = classes.filter((c) => c.courseId === cid);
    return matching.reduce((max, c) => Math.max(max, Number(c.moduleNo) || 0), 0) + 1;
  };

  const openCreateModal = () => {
    const cid = courseFilter !== "all" ? courseFilter : courses[0]?.courseId || "";
    setForm(emptyForm(cid, nextModuleNoFor(cid)));
  };

  const openEditModal = (item) => {
    const times = timesFromSessionTime(item.sessionTime);
    setForm({
      mode: "edit",
      classId: item._id || "",
      targetModuleNo: item.moduleNo,
      courseId: item.courseId,
      moduleNo: item.moduleNo,
      sessionBadge: item.sessionBadge || "",
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      trainerName: item.trainerName || "",
      trainerRole: item.trainerRole || "",
      sessionIso: isoFromSessionDate(item.sessionDate || item.liveDate),
      sessionDate: item.sessionDate || item.liveDate || "",
      sessionStart: times.start,
      sessionEnd: times.end,
      sessionTime: item.sessionTime || "",
      duration: item.duration || "১ ঘণ্টা",
      meetLink: item.meetLink || "",
      recordingUrl: item.recordingUrl || "",
      sessionStatus: item.sessionStatus || "",
      topicsText: (item.topics || []).join(", "),
    });
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    if (!form) return;
    if (!form.courseId) {
      showToast("কোর্স নির্বাচন করুন।", "error");
      return;
    }
    if (!form.title.trim()) {
      showToast("ক্লাসের শিরোনাম আবশ্যক।", "error");
      return;
    }

    const payload = {
      courseId: form.courseId,
      moduleNo: Number(form.moduleNo) || 1,
      sessionBadge: form.sessionBadge.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      trainerName: form.trainerName.trim(),
      trainerRole: form.trainerRole.trim(),
      sessionDate: form.sessionDate.trim(),
      liveDate: form.sessionDate.trim(),
      sessionTime: form.sessionTime.trim(),
      duration: form.duration.trim() || "১ ঘণ্টা",
      meetLink: form.meetLink.trim(),
      recordingUrl: form.recordingUrl.trim(),
      sessionStatus: form.sessionStatus,
      topics: form.topicsText
        .split(/\r?\n|,/)
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setSaving(true);
    const isEdit = form.mode === "edit";
    const { ok, data, message } = await callApi("/api/admin/classes", {
      method: isEdit ? "PATCH" : "POST",
      body: isEdit
        ? { ...payload, classId: form.classId, targetModuleNo: form.targetModuleNo }
        : payload,
    });
    setSaving(false);

    if (!ok) {
      showToast(message, "error");
      return;
    }

    if (data.classItem) {
      if (isEdit) {
        setClasses((prev) =>
          prev
            .map((c) =>
              c.courseId === form.courseId &&
              ((form.classId && c._id === form.classId) || c.moduleNo === form.targetModuleNo)
                ? data.classItem
                : c
            )
            .sort((a, b) => a.courseId.localeCompare(b.courseId) || a.moduleNo - b.moduleNo)
        );
      } else {
        setClasses((prev) =>
          [...prev, data.classItem].sort((a, b) => a.courseId.localeCompare(b.courseId) || a.moduleNo - b.moduleNo)
        );
      }
    }
    if (data.course) {
      setCourses((prev) => prev.map((c) => (c.courseId === data.course.courseId ? data.course : c)));
    }
    setForm(null);
    showToast(message || (isEdit ? "ক্লাস শিডিউল আপডেট হয়েছে!" : "নতুন ক্লাস শিডিউল যুক্ত হয়েছে!"));
  };

  const handleQuickStatus = async (item, nextStatus) => {
    setBusyId(item.id);
    const { ok, data, message } = await callApi("/api/admin/classes", {
      method: "PATCH",
      body: {
        courseId: item.courseId,
        classId: item._id,
        targetModuleNo: item.moduleNo,
        sessionStatus: nextStatus,
      },
    });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.classItem) {
      setClasses((prev) => prev.map((c) => (c.id === item.id ? data.classItem : c)));
    }
    showToast("ক্লাসের অবস্থা আপডেট হয়েছে।");
  };

  const handleDeleteClass = async (item) => {
    if (
      !(await confirm(
        `"${item.title}" (${item.courseId}) ক্লাস সেশনটি স্থায়ীভাবে মুছে ফেলতে চান?`,
        { tone: "danger", title: "ক্লাস সেশন মুছে ফেলবেন?" }
      ))
    ) {
      return;
    }
    setBusyId(item.id);
    const qs = new URLSearchParams({ courseId: item.courseId });
    if (item._id) qs.set("classId", item._id);
    else qs.set("moduleNo", String(item.moduleNo));

    const { ok, data, message } = await callApi(`/api/admin/classes?${qs.toString()}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setClasses((prev) => prev.filter((c) => c.id !== item.id));
    if (data.course) {
      setCourses((prev) => prev.map((c) => (c.courseId === data.course.courseId ? data.course : c)));
    }
    showToast(message || "ক্লাস সেশন মুছে ফেলা হয়েছে।");
  };

  const handleSaveLogistics = async (e) => {
    e.preventDefault();
    if (!editingLogistics) return;
    setSavingLogistics(true);
    const { ok, data, message } = await callApi("/api/admin/classes", {
      method: "PATCH",
      body: {
        scope: "course",
        courseId: editingLogistics.courseId,
        meetLink: editingLogistics.meetLink,
        whatsappLink: editingLogistics.whatsappLink,
        routine: editingLogistics.routine,
        orientationDate: editingLogistics.orientationDate,
        orientationTime: editingLogistics.orientationTime,
      },
    });
    setSavingLogistics(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.course) {
      setCourses((prev) => prev.map((c) => (c.courseId === data.course.courseId ? data.course : c)));
    }
    if (Array.isArray(data.classes)) {
      setClasses((prev) => {
        const others = prev.filter((c) => c.courseId !== editingLogistics.courseId);
        return [...others, ...data.classes].sort((a, b) => a.courseId.localeCompare(b.courseId) || a.moduleNo - b.moduleNo);
      });
    }
    setEditingLogistics(null);
    showToast(message || "ব্যাচের ক্লাস লিংক ও রুটিন আপডেট হয়েছে!");
  };

  const cardCls = isLight
    ? "bg-white border-slate-200 shadow-sm"
    : "bg-slate-900 border-slate-800 shadow-xl";
  const inputCls = `w-full px-3 py-2 rounded-xl border text-xs font-medium outline-hidden ${
    isLight
      ? "bg-white border-slate-300 text-slate-900 focus:border-amber-500"
      : "bg-slate-950 border-slate-700 text-white focus:border-amber-500"
  }`;
  const labelCls = `block text-[11px] font-bold mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`;

  return (
    <div className="space-y-6">
      {confirmDialog}
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            Class Schedule &amp; Live Links API
          </div>
          <h1 className={`text-xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            ক্লাস শিডিউল ম্যানেজার
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            প্রতিটি ব্যাচের ক্লাসের তারিখ, সময়, ট্রেইনার, লাইভ মিট লিংক, রেকর্ডিং ও স্ট্যাটাস নিয়ন্ত্রণ করুন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/admin/courses"
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
              isLight
                ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> কোর্স তালিকা
          </Link>
          <button
            type="button"
            onClick={reload}
            disabled={reloading}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isLight
                ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          {mayCreate && (
            <button
              type="button"
              onClick={openCreateModal}
              disabled={courses.length === 0}
              className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> নতুন ক্লাস শিডিউল
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className={`rounded-2xl border p-4 space-y-3 ${cardCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Course filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                setEditingLogistics(null);
              }}
              aria-label="কোর্স ফিল্টার"
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold outline-hidden ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900"
                  : "bg-slate-950 border-slate-800 text-white"
              }`}
            >
              <option value="all">সকল কোর্স ({classes.length} ক্লাস)</option>
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.name} ({c.courseId})
                </option>
              ))}
            </select>

            {/* Status filter tabs */}
            <div
              role="tablist"
              aria-label="স্ট্যাটাস ফিল্টার"
              className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto max-w-full ${
                isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"
              }`}
            >
              {FILTER_TABS.map((t) => {
                const active = statusFilter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(t.key)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                      active
                        ? "bg-amber-500 text-slate-950 font-black"
                        : isLight
                          ? "text-slate-700 hover:bg-white"
                          : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-mono text-[10px] ${
                        active
                          ? "bg-slate-950/15 text-slate-950"
                          : isLight
                            ? "bg-white text-slate-600"
                            : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {counts[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="সেশন, ট্রেইনার বা তারিখ খুঁজুন..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-hidden ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                  : "bg-slate-950 border-slate-800 text-white focus:border-amber-500"
              }`}
            />
          </div>
        </div>

        {/* Selected course quick logistics panel */}
        {selectedCourse && (
          <div
            className={`mt-2 pt-3 border-t flex flex-col gap-3 ${
              isLight ? "border-slate-200" : "border-slate-800"
            }`}
          >
            {editingLogistics ? (
              <form onSubmit={handleSaveLogistics} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>ব্যাচ Google Meet / Zoom লিংক</label>
                    <input
                      type="url"
                      value={editingLogistics.meetLink}
                      onChange={(e) => setEditingLogistics({ ...editingLogistics, meetLink: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp গ্রুপ লিংক</label>
                    <input
                      type="url"
                      value={editingLogistics.whatsappLink}
                      onChange={(e) => setEditingLogistics({ ...editingLogistics, whatsappLink: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>ক্লাস রুটিন</label>
                    <input
                      type="text"
                      value={editingLogistics.routine}
                      onChange={(e) => setEditingLogistics({ ...editingLogistics, routine: e.target.value })}
                      placeholder="রবিবার ও বৃহস্পতিবার (রাত ৮:০০)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>ওরিয়েন্টেশন তারিখ</label>
                    <input
                      type="text"
                      value={editingLogistics.orientationDate}
                      onChange={(e) => setEditingLogistics({ ...editingLogistics, orientationDate: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>ওরিয়েন্টেশন সময়</label>
                    <input
                      type="text"
                      value={editingLogistics.orientationTime}
                      onChange={(e) => setEditingLogistics({ ...editingLogistics, orientationTime: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLogistics(null)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      isLight ? "bg-white border-slate-300 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingLogistics}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {savingLogistics ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="font-bold">
                    রুটিন: <span className="font-medium opacity-80">{selectedCourse.routine || "—"}</span>
                  </span>
                  <span className="font-bold">
                    ওরিয়েন্টেশন:{" "}
                    <span className="font-medium opacity-80">
                      {selectedCourse.orientationDate || "—"}
                      {selectedCourse.orientationTime ? ` (${selectedCourse.orientationTime})` : ""}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                    {selectedCourse.meetLink ? (
                      <a
                        href={selectedCourse.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-blue-500 hover:underline truncate max-w-52"
                      >
                        {selectedCourse.meetLink}
                      </a>
                    ) : (
                      <span className="opacity-60">ব্যাচ মিট লিংক নেই</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedCourse.whatsappLink ? (
                      <a
                        href={selectedCourse.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:underline"
                      >
                        WhatsApp গ্রুপ
                      </a>
                    ) : (
                      <span className="opacity-60">WhatsApp লিংক নেই</span>
                    )}
                  </span>
                </div>

                {mayUpdate && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLogistics({
                        courseId: selectedCourse.courseId,
                        meetLink: selectedCourse.meetLink || "",
                        whatsappLink: selectedCourse.whatsappLink || "",
                        routine: selectedCourse.routine || "",
                        orientationDate: selectedCourse.orientationDate || "",
                        orientationTime: selectedCourse.orientationTime || "",
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" /> ব্যাচ লিংক ও রুটিন সম্পাদনা
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule List */}
      {visibleClasses.length === 0 ? (
        <div className={`rounded-3xl border p-12 text-center space-y-2 ${cardCls}`}>
          <CalendarDays className="w-10 h-10 mx-auto text-slate-500" />
          <p className={`text-sm font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
            কোনো ক্লাস শিডিউল পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-500">
            ফিল্টার পরিবর্তন করুন অথবা “নতুন ক্লাস শিডিউল” বাটনে ক্লিক করে নতুন সেশন যুক্ত করুন।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleClasses.map((item) => {
            const st = statusStyle(item.sessionStatus, isLight);
            const StatusIcon = st.Icon;
            const working = busyId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${cardCls} ${
                  item.sessionStatus === "live" ? "ring-1 ring-rose-500/50" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-black bg-amber-500 text-slate-950">
                        {item.courseId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          isLight
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-slate-950 text-amber-300 border-slate-700"
                        }`}
                      >
                        #{item.moduleNo} · {item.sessionBadge}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}`}
                      >
                        <StatusIcon className="w-3 h-3" /> {st.label}
                      </span>
                    </div>

                    <div>
                      <h3 className={`text-sm sm:text-base font-black leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                        {item.title}
                      </h3>
                      {item.subtitle && item.subtitle !== item.title && (
                        <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{item.subtitle}</p>
                      )}
                    </div>

                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {item.sessionDate || item.liveDate || "তারিখ নির্ধারিত নয়"}
                      </span>
                      {item.sessionTime && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {item.sessionTime}
                        </span>
                      )}
                      {item.duration && (
                        <span className="inline-flex items-center gap-1 text-[11px] opacity-80">
                          <Hourglass className="w-3.5 h-3.5" /> {item.duration}
                        </span>
                      )}
                      {item.trainerName && (
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold">{item.trainerName}</span>
                          {item.trainerRole && <span className="opacity-70">({item.trainerRole})</span>}
                        </span>
                      )}
                    </div>

                    {/* Links strip */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                      {item.meetLink ? (
                        <a
                          href={item.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" /> সেশন মিট লিংক <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : item.courseMeetLink ? (
                        <a
                          href={item.courseMeetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" /> ব্যাচ মিট লিংক ব্যবহার হবে <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Video className="w-3.5 h-3.5" /> মিট লিংক যুক্ত নেই
                        </span>
                      )}

                      {item.recordingUrl && (
                        <a
                          href={item.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-emerald-500 hover:underline"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> রেকর্ডিং লিংক <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {mayUpdate && (
                      <select
                        value={item.sessionStatus || ""}
                        disabled={working}
                        aria-label="ক্লাস স্ট্যাটাস পরিবর্তন"
                        onChange={(e) => handleQuickStatus(item, e.target.value)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer disabled:opacity-50 ${
                          isLight
                            ? "bg-slate-50 border-slate-300 text-slate-800"
                            : "bg-slate-950 border-slate-700 text-slate-200"
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {mayUpdate && (
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        disabled={working}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          isLight
                            ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                            : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" /> এডিট
                      </button>
                    )}

                    {isSuper && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(item)}
                        disabled={working}
                        title="ক্লাস মুছুন"
                        className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT CLASS MODAL */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className={`rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h2 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                {form.mode === "edit" ? "ক্লাস শিডিউল সম্পাদনা করুন" : "নতুন ক্লাস শিডিউল যুক্ত করুন"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>কোর্স / ব্যাচ *</label>
                  <select
                    value={form.courseId}
                    disabled={form.mode === "edit"}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const n = nextModuleNoFor(cid);
                      setForm({
                        ...form,
                        courseId: cid,
                        moduleNo: n,
                        sessionBadge: `SESSION ${String(n).padStart(2, "0")}`,
                      });
                    }}
                    className={inputCls}
                    required
                  >
                    <option value="">— কোর্স নির্বাচন করুন —</option>
                    {courses.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.name} ({c.courseId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>সেশন নম্বর *</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={form.moduleNo}
                    onChange={(e) => setForm({ ...form, moduleNo: e.target.value })}
                    className={`${inputCls} font-mono font-bold`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>সেশন ব্যাজ</label>
                  <input
                    type="text"
                    value={form.sessionBadge}
                    onChange={(e) => setForm({ ...form, sessionBadge: e.target.value })}
                    placeholder="SESSION 01 / ORIENTATION"
                    className={`${inputCls} font-mono font-bold`}
                  />
                </div>
                <div>
                  <label className={labelCls}>স্ট্যাটাস</label>
                  <select
                    value={form.sessionStatus}
                    onChange={(e) => setForm({ ...form, sessionStatus: e.target.value })}
                    className={inputCls}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>ক্লাসের শিরোনাম *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="যেমন: Modern Tajweed & Visual Makhraj Delivery Techniques"
                  className={`${inputCls} font-bold`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>ক্লাসের তারিখ (Date)</label>
                  <input
                    type="date"
                    value={form.sessionIso}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sessionIso: e.target.value,
                        sessionDate: formatSessionDate(e.target.value),
                      })
                    }
                    className={inputCls}
                  />
                  {form.sessionDate && <p className="text-[11px] text-slate-500 mt-1">সংরক্ষিত হবে: {form.sessionDate}</p>}
                </div>

                <div>
                  <label className={labelCls}>ক্লাসের সময় (শুরু ও শেষ)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      aria-label="শুরুর সময়"
                      value={form.sessionStart}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sessionStart: e.target.value,
                          sessionTime: formatSessionTime(e.target.value, form.sessionEnd),
                        })
                      }
                      className={inputCls}
                    />
                    <input
                      type="time"
                      aria-label="শেষ সময়"
                      value={form.sessionEnd}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sessionEnd: e.target.value,
                          sessionTime: formatSessionTime(form.sessionStart, e.target.value),
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                  {form.sessionTime && <p className="text-[11px] text-slate-500 mt-1">সংরক্ষিত হবে: {form.sessionTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>ট্রেইনার</label>
                  <select
                    value={form.trainerName}
                    onChange={(e) => {
                      const picked = instructors.find((i) => i.fullName === e.target.value);
                      setForm({
                        ...form,
                        trainerName: e.target.value,
                        trainerRole: picked?.designation || form.trainerRole,
                      });
                    }}
                    className={inputCls}
                  >
                    <option value="">— নির্বাচন করুন —</option>
                    {instructors.map((i) => (
                      <option key={i._id} value={i.fullName}>
                        {i.fullName}
                      </option>
                    ))}
                    {form.trainerName && !instructors.some((i) => i.fullName === form.trainerName) && (
                      <option value={form.trainerName}>{form.trainerName}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>ট্রেইনার পদবি</label>
                  <input
                    type="text"
                    value={form.trainerRole}
                    onChange={(e) => setForm({ ...form, trainerRole: e.target.value })}
                    placeholder="Senior Trainer"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>সময়কাল</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="১ ঘণ্টা ৩০ মিনিট"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>আলাদা ক্লাস মিট লিংক (ঐচ্ছিক, https://)</label>
                  <input
                    type="url"
                    value={form.meetLink}
                    onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                    placeholder="খালি রাখলে ব্যাচের ডিফল্ট লিংক ব্যবহৃত হবে"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>রেকর্ডেড ক্লাস লিংক (ঐচ্ছিক, https://)</label>
                  <input
                    type="url"
                    value={form.recordingUrl}
                    onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
                    placeholder="https://drive.google.com/... বা YouTube"
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>টপিকসমূহ (কমা বা নতুন লাইন দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={form.topicsText}
                  onChange={(e) => setForm({ ...form, topicsText: e.target.value })}
                  placeholder="Online Pedagogy, Student Psychology, Tajweed"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="এই ক্লাসে কী কী আলোচনা হবে..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className={`pt-3 border-t flex justify-end gap-2 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    isLight ? "bg-white border-slate-300 text-slate-700" : "bg-slate-800 border-slate-700 text-slate-300"
                  }`}
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : form.mode === "edit" ? "✓ আপডেট করুন" : "✓ শিডিউল যুক্ত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
