'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderDown,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  ExternalLink,
  PlayCircle,
  Loader2,
  RefreshCw,
  Lock,
} from "lucide-react";
import ErrorBanner from "../../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../../_shared/Flash";
import { apiFetch } from "../../_shared/api";
import { bn, courseAccent, isHttpsUrl } from "../../_shared/utils";
import { COURSE_STATE_LABEL, courseState } from "@/lib/course-state";

const CATEGORIES = [
  "কুরআন শিক্ষা ও তাজবীদ",
  "টিচিং পেডাগজি",
  "লেসন প্ল্যান",
  "ডিজিটাল স্কিলস",
  "লার্নার সাইকোলজি",
  "সার্টিফিকেশন ও পরীক্ষা",
];

const FORMATS = [
  { value: "PDF", label: "PDF ডকুমেন্ট" },
  { value: "DOCX", label: "Word (DOCX)" },
  { value: "SLIDES", label: "PowerPoint Slides" },
  { value: "VIDEO", label: "রেকর্ডেড ভিডিও" },
  { value: "DRIVE", label: "Google Drive ফোল্ডার" },
  { value: "ZIP", label: "ZIP আর্কাইভ" },
  { value: "LINK", label: "ওয়েব লিঙ্ক" },
];

function openLabel(item) {
  if (item.format === "VIDEO") return { text: "ভিডিও দেখুন", Icon: PlayCircle };
  if (item.format === "LINK" || item.format === "DRIVE") return { text: "লিঙ্ক খুলুন", Icon: ExternalLink };
  return { text: item.isDownloadable === false ? "ফাইল দেখুন" : "ডাউনলোড", Icon: Download };
}

const EMPTY_FORM = {
  courseId: "",
  title: "",
  category: CATEGORIES[0],
  format: "PDF",
  size: "",
  fileUrl: "",
  desc: "",
  isDownloadable: true,
};

export default function ResourcesClient({ initialCourses = [], loadError = null }) {
  const [courses, setCourses] = useState(initialCourses);
  const [pageError, setPageError] = useState(loadError);
  const [courseFilter, setCourseFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const pageFlash = useFlash();
  const formFlash = useFlash();

  const categories = [
    ...new Set([...CATEGORIES, ...courses.flatMap((c) => (c.resources || []).map((r) => r.category).filter(Boolean))]),
  ];
  const totalResources = courses.reduce((n, c) => n + (c.resources || []).length, 0);

  const q = search.trim().toLowerCase();
  const matches = (r) =>
    (!q || (r.title || "").toLowerCase().includes(q) || (r.desc || "").toLowerCase().includes(q)) &&
    (categoryFilter === "all" || r.category === categoryFilter);

  const visibleCourses = courses.filter((c) => courseFilter === "all" || c.courseId === courseFilter);

  const reload = async () => {
    setIsReloading(true);
    try {
      const data = await apiFetch("/api/instructor/resources");
      setCourses(data.courses || []);
      setPageError(null);
    } catch (err) {
      pageFlash.show("error", err.message || "রিসোর্স তালিকা রিফ্রেশ করা যায়নি।");
    } finally {
      setIsReloading(false);
    }
  };

  const openAddModal = () => {
    setForm({ ...EMPTY_FORM, courseId: courseFilter !== "all" ? courseFilter : "" });
    formFlash.clear();
    setIsAddModalOpen(true);
  };

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleAddResource = async (e) => {
    e.preventDefault();
    formFlash.clear();
    if (!form.courseId) {
      formFlash.show("error", "কোন ব্যাচের জন্য রিসোর্স, তা নির্বাচন করুন।");
      return;
    }
    if (!form.title.trim()) {
      formFlash.show("error", "রিসোর্সের শিরোনাম লিখুন।");
      return;
    }
    if (!isHttpsUrl(form.fileUrl)) {
      formFlash.show("error", "ফাইল লিঙ্কটি অবশ্যই https:// দিয়ে শুরু হতে হবে।");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch("/api/instructor/resources", {
        method: "POST",
        body: {
          courseId: form.courseId,
          title: form.title.trim(),
          category: form.category,
          format: form.format,
          size: form.size.trim(),
          fileUrl: form.fileUrl.trim(),
          desc: form.desc.trim(),
          isDownloadable: form.isDownloadable,
        },
      });
      if (data.resource) {
        setCourses((list) =>
          list.map((c) =>
            form.courseId === "all" || c.courseId === form.courseId
              ? { ...c, resources: [...(c.resources || []), data.resource] }
              : c
          )
        );
      }
      pageFlash.show("success", data.message || "নতুন স্টাডি মেটেরিয়াল সফলভাবে যুক্ত হয়েছে!");
      setIsAddModalOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      formFlash.show("error", err.message || "রিসোর্স যোগ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (course, item) => {
    if (!confirm(`"${item.title}" রিসোর্সটি ${course.courseId} ব্যাচ থেকে মুছে ফেলতে চান?`)) return;
    const key = `${course.courseId}:${item.resourceId}`;
    setDeletingKey(key);
    try {
      const qs = new URLSearchParams({ resourceId: item.resourceId, courseId: course.courseId });
      const data = await apiFetch(`/api/instructor/resources?${qs.toString()}`, { method: "DELETE" });
      setCourses((list) =>
        list.map((c) =>
          c.courseId === course.courseId
            ? { ...c, resources: (c.resources || []).filter((r) => r.resourceId !== item.resourceId) }
            : c
        )
      );
      pageFlash.show("success", data.message || "রিসোর্স সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err) {
      pageFlash.show("error", err.message || "রিসোর্স মুছে ফেলা যায়নি।");
      // 404 = the list on screen is stale; resync with the database.
      if (err.status === 404) reload();
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">স্টাডি রিসোর্স ও শিট ম্যানেজমেন্ট হাব</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ব্যাচভিত্তিক তাজবীদ গাইড, নূরানী পেডাগজি শিট ও লেসন প্ল্যানার — মোট {bn(totalResources)}টি রিসোর্স
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={reload}
            disabled={isReloading}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            title="ডাটাবেজ থেকে আবার লোড করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          <button
            type="button"
            onClick={openAddModal}
            disabled={courses.length === 0}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> নতুন রিসোর্স যোগ করুন
          </button>
        </div>
      </div>

      <ErrorBanner message={pageError} />
      <FlashMessage flash={pageFlash.flash} onClose={pageFlash.clear} />

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রিসোর্সের নাম বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="panel-grid2 flex flex-wrap items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            aria-label="ব্যাচ ফিল্টার"
          >
            <option value="all">সকল ব্যাচ</option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseId} ({bn((c.resources || []).length)})
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            aria-label="ক্যাটাগরি ফিল্টার"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {courses.length === 0 && !pageError && (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <FolderDown className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs">কোনো কোর্স পাওয়া যায়নি।</p>
        </div>
      )}

      {/* Per-course resource sections */}
      {visibleCourses.map((course) => {
        const accent = courseAccent(course);
        const all = course.resources || [];
        const list = all.filter(matches);
        return (
          <section key={course.courseId} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${accent.badge}`}>
                  {accent.emoji} {course.courseId}
                </span>
                <h2 className="text-sm font-bold text-white">{course.name}</h2>
                {courseState(course) !== "published" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {COURSE_STATE_LABEL[courseState(course)]}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {bn(list.length)} / {bn(all.length)}টি রিসোর্স
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-500 space-y-2 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
                  <FolderDown className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">
                    {all.length === 0
                      ? "এই ব্যাচে এখনো কোনো স্টাডি রিসোর্স যুক্ত করা হয়নি।"
                      : "এই সার্চ / ক্যাটাগরিতে কোনো রিসোর্স পাওয়া যায়নি।"}
                  </p>
                </div>
              ) : (
                list.map((item, idx) => {
                  const key = `${course.courseId}:${item.resourceId || item._id || idx}`;
                  const { text, Icon } = openLabel(item);
                  return (
                    <div
                      key={key}
                      className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-4 hover:border-indigo-500/40 transition-all shadow-xl group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate">
                            {item.category || "ক্যাটাগরি নেই"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                            {[item.format, item.size].filter(Boolean).join(" • ")}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm leading-snug group-hover:text-indigo-200 transition-colors">
                          {item.title}
                        </h3>
                        {item.desc && <p className="text-xs text-slate-400 line-clamp-2">{item.desc}</p>}
                        {item.isDownloadable === false && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300">
                            <Lock className="w-3 h-3" /> শুধু দেখা যাবে (ডাউনলোড বন্ধ)
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {item.fileUrl ? (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-white bg-slate-800 hover:bg-indigo-600 px-3.5 py-2 rounded-xl transition-all"
                          >
                            <Icon className="w-3.5 h-3.5" /> {text}
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">ফাইল লিঙ্ক নেই</span>
                        )}

                        {item.resourceId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(course, item)}
                            disabled={deletingKey === `${course.courseId}:${item.resourceId}`}
                            className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            title="এই ব্যাচ থেকে মুছে ফেলুন"
                            aria-label="রিসোর্স মুছে ফেলুন"
                          >
                            {deletingKey === `${course.courseId}:${item.resourceId}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">নতুন স্টাডি মেটেরিয়াল যুক্ত করুন</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">কোন ব্যাচের জন্য:</label>
                <select
                  value={form.courseId}
                  onChange={setField("courseId")}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">— ব্যাচ নির্বাচন করুন —</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseId} — {c.name}
                    </option>
                  ))}
                  <option value="all">সকল ব্যাচ ({bn(courses.length)}টি কোর্সে একসাথে)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">রিসোর্সের শিরোনাম:</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={setField("title")}
                  placeholder="যেমন: মাখরাজ ও সিফাত রঙিন চার্ট বুক..."
                  required
                  maxLength={200}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ক্যাটাগরি:</label>
                  <select
                    value={form.category}
                    onChange={setField("category")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফরম্যাট:</label>
                  <select
                    value={form.format}
                    onChange={setField("format")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফাইল সাইজ (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={setField("size")}
                    placeholder="যেমন: 3.5 MB"
                    maxLength={30}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফাইল / ড্রাইভ লিঙ্ক:</label>
                  <input
                    type="url"
                    value={form.fileUrl}
                    onChange={setField("fileUrl")}
                    placeholder="https://drive.google.com/..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">সংক্ষিপ্ত বিবরণ:</label>
                <textarea
                  rows={2}
                  value={form.desc}
                  onChange={setField("desc")}
                  maxLength={1000}
                  placeholder="এই মেটেরিয়ালটির বিষয়বস্তু ও ট্রেইনিদের জন্য নির্দেশনা..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDownloadable}
                  onChange={setField("isDownloadable")}
                  className="accent-indigo-500"
                />
                ট্রেইনিরা ফাইলটি ডাউনলোড করতে পারবে
              </label>

              <FlashMessage flash={formFlash.flash} onClose={formFlash.clear} />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md transition-all"
                >
                  {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "যুক্ত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
