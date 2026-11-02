'use client';

/**
 * Enrolment manager (Admin → /api/admin/participants).
 *   mode="trainee": one trainee's courses — enrol into a course, change status, edit details, remove.
 *   mode="course":  one course's roster   — add a trainee by e-mail, change status, edit details, remove.
 * The page owns the toast and the confirm dialog and passes them in, so every message and
 * question looks the same as the rest of the page.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Award, BookOpen, ChevronDown, ChevronUp, Loader2, Search, Trash2, UserPlus, Users, X } from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";
import { callApi, formatDate, formatMoney } from "./admin-ui";
import { COURSE_STATE_LABEL, courseState } from "@/lib/course-state";

export const ENROLMENT_STATUS = {
  active: { label: "সক্রিয়", tone: "emerald" },
  enrolled: { label: "এনরোলড", tone: "blue" },
  pending: { label: "অপেক্ষমান", tone: "amber" },
  completed: { label: "সম্পন্ন", tone: "violet" },
  dropped: { label: "ঝরে পড়েছেন", tone: "slate" },
};
const PAYMENT = {
  paid: { label: "পরিশোধিত", tone: "emerald" },
  free: { label: "ফ্রি", tone: "violet" },
  pending: { label: "পেন্ডিং", tone: "amber" },
  failed: { label: "ব্যর্থ", tone: "rose" },
};

const TONES = {
  emerald: ["bg-emerald-50 text-emerald-800 border-emerald-300", "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"],
  blue: ["bg-blue-50 text-blue-800 border-blue-300", "bg-blue-500/20 text-blue-300 border-blue-500/30"],
  amber: ["bg-amber-50 text-amber-900 border-amber-300", "bg-amber-500/20 text-amber-300 border-amber-500/30"],
  violet: ["bg-violet-50 text-violet-800 border-violet-300", "bg-violet-500/20 text-violet-300 border-violet-500/30"],
  rose: ["bg-rose-50 text-rose-800 border-rose-300", "bg-rose-500/20 text-rose-300 border-rose-500/30"],
  slate: ["bg-slate-100 text-slate-600 border-slate-300", "bg-slate-800 text-slate-400 border-slate-700"],
};

const DETAIL_FIELDS = ["progress", "attendanceCount", "evaluationScore", "grade", "certificateIssued", "certificateUrl", "notes"];

function detailsOf(row) {
  return {
    progress: String(row.progress ?? 0),
    attendanceCount: String(row.attendanceCount ?? 0),
    evaluationScore: String(row.evaluationScore ?? 0),
    grade: row.grade || "",
    certificateIssued: Boolean(row.certificateIssued),
    certificateUrl: row.certificateUrl || "",
    notes: row.notes || "",
  };
}

export default function EnrolmentManager({ mode, subject, courses = [], closedReason = "", onClose, onChanged, showToast, confirm }) {
  const { isLight } = useAdminTheme();
  const isTrainee = mode === "trainee";

  const [rows, setRows] = useState(null); // null while loading
  const [loadError, setLoadError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [details, setDetails] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const [addOpen, setAddOpen] = useState(null); // null = automatic (open only when there are no enrolments yet)
  const [form, setForm] = useState({ courseId: "", userEmail: "", status: "active", paymentStatus: "free", paidAmount: "", notes: "" });
  const closeRef = useRef(null);
  const changedRef = useRef(onChanged);
  useEffect(() => {
    changedRef.current = onChanged;
  });

  const query = isTrainee ? `userId=${encodeURIComponent(subject._id)}` : `courseId=${encodeURIComponent(subject.courseId)}`;

  // Fetch inside the effect (with a cancel guard); bumping `retryKey` re-runs it for the retry button.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { ok, data, message } = await callApi(`/api/admin/participants?${query}`);
      if (cancelled) return;
      if (!ok) {
        setLoadError(message);
        setRows([]);
        return;
      }
      setLoadError("");
      setRows(data.participants || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [query, retryKey]);

  const retry = () => {
    setRows(null);
    setRetryKey((k) => k + 1);
  };

  // Tell the page the new head-count whenever the list changes (after the first load).
  useEffect(() => {
    if (rows) changedRef.current?.(rows.length);
  }, [rows]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const replaceRow = (next) => setRows((prev) => (prev || []).map((r) => (r._id === next._id ? { ...r, ...next } : r)));

  const patchRow = async (row, body, successText) => {
    setBusyId(row._id);
    const { ok, data, message } = await callApi("/api/admin/participants", { method: "PATCH", body: { participantId: row._id, ...body } });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return false;
    }
    if (data.participant) replaceRow(data.participant);
    showToast(successText || message);
    return true;
  };

  const changeStatus = async (row, status) => {
    if (status === row.status) return;
    if (status === "dropped" || status === "completed") {
      const yes = await confirm(
        status === "dropped"
          ? `"${rowOwner(row)}"-কে "${rowCourse(row)}" থেকে ঝরে পড়া (dropped) হিসেবে চিহ্নিত করবেন?`
          : `"${rowOwner(row)}"-এর "${rowCourse(row)}" কোর্সটি সম্পন্ন (completed) হিসেবে চিহ্নিত করবেন?`,
        { tone: status === "dropped" ? "warning" : "primary", title: status === "dropped" ? "ঝরে পড়া হিসেবে চিহ্নিত করবেন?" : "কোর্স সম্পন্ন করবেন?" }
      );
      if (!yes) return;
    }
    await patchRow(row, { status }, `স্ট্যাটাস: ${ENROLMENT_STATUS[status]?.label || status}`);
  };

  const saveDetails = async (row) => {
    const draft = details[row._id] || detailsOf(row);
    const original = detailsOf(row);
    const body = {};
    for (const k of DETAIL_FIELDS) if (draft[k] !== original[k]) body[k] = draft[k];
    if (!Object.keys(body).length) {
      showToast("কোনো পরিবর্তন করা হয়নি।");
      return;
    }
    await patchRow(row, body, "এনরোলমেন্টের তথ্য সংরক্ষিত হয়েছে।");
  };

  const removeRow = async (row) => {
    const paid = row.paymentStatus === "paid";
    const yes = await confirm(
      `"${rowOwner(row)}"-কে "${rowCourse(row)}" থেকে সরাবেন?\n\nএনরোলমেন্ট রেকর্ডটি মুছে যাবে এবং একটি আসন খালি হবে। পেমেন্ট রেকর্ড অক্ষত থাকবে।${
        paid ? "\n\n⚠ এটি একটি পরিশোধিত এনরোলমেন্ট — সরালে ট্রেইনি কোর্সটি আর দেখতে পারবেন না, কিন্তু টাকা ফেরত যাবে না। ফেরত দিতে চাইলে পেমেন্ট পেজ ব্যবহার করুন।" : ""
      }`,
      { tone: "danger", title: "কোর্স থেকে সরাবেন?", confirmLabel: "হ্যাঁ, সরিয়ে দিন" }
    );
    if (!yes) return;
    setBusyId(row._id);
    const { ok, message } = await callApi(`/api/admin/participants?id=${encodeURIComponent(row._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setRows((prev) => (prev || []).filter((r) => r._id !== row._id));
    showToast(message);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const body = {
      courseId: isTrainee ? form.courseId : subject.courseId,
      status: form.status,
      paymentStatus: form.paymentStatus,
      paidAmount: form.paymentStatus === "paid" ? Number(form.paidAmount) || 0 : 0,
      notes: form.notes,
      ...(isTrainee ? { userId: subject._id } : { userEmail: form.userEmail.trim() }),
    };
    setAdding(true);
    const { ok, data, message } = await callApi("/api/admin/participants", { method: "POST", body });
    setAdding(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setRows((prev) => {
      const list = prev || [];
      return list.some((r) => r._id === data.participant._id) ? list.map((r) => (r._id === data.participant._id ? data.participant : r)) : [data.participant, ...list];
    });
    setForm((f) => ({ ...f, courseId: "", userEmail: "", notes: "", paidAmount: "" }));
    setAddOpen(false); // collapse so the new row is what the admin sees
    showToast(message);
  };

  const rowOwner = (r) => r.userName || r.user?.fullName || r.userEmail || "ট্রেইনি";
  const rowCourse = (r) => r.course?.name || r.courseName || r.courseId;

  const enrolledIds = useMemo(() => new Set((rows || []).map((r) => r.courseId)), [rows]);
  const available = useMemo(() => courses.filter((c) => !enrolledIds.has(c.courseId)), [courses, enrolledIds]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows || []).filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.userName, r.userEmail, r.phone, r.courseName, r.courseId].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const tone = (key) => TONES[key][isLight ? 0 : 1];
  const fieldCls = `w-full rounded-xl px-3 py-2 border outline-hidden font-medium text-xs ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500" : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
  }`;
  const labelCls = `font-bold block mb-1 text-[11px] ${isLight ? "text-slate-700" : "text-slate-400"}`;
  const muted = isLight ? "text-slate-500" : "text-slate-400";
  const heading = isLight ? "text-slate-900" : "text-white";
  const panel = isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800";

  const title = isTrainee ? subject.fullName : subject.name;
  const formOpen = addOpen ?? (rows !== null && rows.length === 0);
  const needsAmount = form.paymentStatus === "paid";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isTrainee ? "ট্রেইনির কোর্স এনরোলমেন্ট" : "কোর্সের ট্রেইনি তালিকা"}
        className={`w-full max-w-3xl my-4 rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] ${
          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-100"
        }`}
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-3 p-5 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-amber-500">
              {isTrainee ? <BookOpen className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              <span className="text-[11px] font-black uppercase tracking-wider">{isTrainee ? "কোর্স এনরোলমেন্ট" : "ট্রেইনি তালিকা"}</span>
            </div>
            <h2 className={`text-lg font-black mt-1 truncate ${heading}`}>{title}</h2>
            <p className={`text-[11px] mt-0.5 ${muted}`}>
              {isTrainee ? subject.email : `${subject.courseId} · ${rows ? rows.length : "…"} জন`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className={`p-1.5 rounded-lg cursor-pointer ${isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {loadError && (
            <div role="alert" className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 ${tone("rose")}`}>
              <span>{loadError}</span>
              <button type="button" onClick={retry} className="underline cursor-pointer shrink-0">
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {/* Add form (not offered for draft / archived courses) */}
          {closedReason ? (
            <p className={`p-3 rounded-xl border text-xs font-bold ${tone("amber")}`}>{closedReason}</p>
          ) : (
            <form onSubmit={handleAdd} className={`p-4 rounded-2xl border space-y-3 ${panel}`}>
              {/* Collapsed while there is a list to look at; open by default on an empty one */}
              <button
                type="button"
                onClick={() => setAddOpen(!formOpen)}
                aria-expanded={formOpen}
                className={`w-full flex items-center justify-between gap-2 text-xs font-black cursor-pointer ${heading}`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  {isTrainee ? "নতুন কোর্সে ভর্তি করুন" : "ট্রেইনি যোগ করুন"}
                </span>
                {formOpen ? <ChevronUp className={`w-4 h-4 ${muted}`} /> : <ChevronDown className={`w-4 h-4 ${muted}`} />}
              </button>

              {!formOpen ? null : isTrainee && available.length === 0 && rows ? (
                <p className={`text-xs font-medium ${muted}`}>এই ট্রেইনি এখন চালু থাকা সব কোর্সেই ভর্তি আছেন (ড্রাফট ও আর্কাইভড কোর্সে ভর্তি করা যায় না)।</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {isTrainee ? (
                      <div className="sm:col-span-2">
                        <label className={labelCls}>কোর্স *</label>
                        <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={fieldCls}>
                          <option value="">— কোর্স নির্বাচন করুন —</option>
                          {available.map((c) => {
                            const st = courseState(c);
                            const full = c.maxSeats && (c.enrolledCount || 0) >= c.maxSeats;
                            return (
                              <option key={c.courseId} value={c.courseId}>
                                {c.name} ({c.courseId}){st !== "published" ? ` · ${COURSE_STATE_LABEL[st]}` : ""}
                                {c.maxSeats ? ` · ${c.enrolledCount || 0}/${c.maxSeats} আসন${full ? " (পূর্ণ)" : ""}` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className={labelCls}>ট্রেইনির ইমেইল *</label>
                        <input
                          type="email"
                          required
                          value={form.userEmail}
                          onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                          placeholder="trainee@example.com (TOT ট্রেইনি অ্যাকাউন্ট)"
                          className={fieldCls}
                        />
                      </div>
                    )}
                    <div>
                      <label className={labelCls}>এনরোলমেন্ট স্ট্যাটাস</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={fieldCls}>
                        {Object.entries(ENROLMENT_STATUS).map(([value, s]) => (
                          <option key={value} value={value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>পেমেন্ট অবস্থা</label>
                      <select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className={fieldCls}>
                        <option value="free">ফ্রি (কমপ্লিমেন্টারি)</option>
                        <option value="pending">পেন্ডিং</option>
                        <option value="paid">পরিশোধিত (রেকর্ড ছাড়া)</option>
                      </select>
                    </div>
                    {needsAmount && (
                      <div>
                        <label className={labelCls}>পরিশোধিত টাকা</label>
                        <input type="number" min="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} className={fieldCls} />
                      </div>
                    )}
                    <div className={needsAmount ? "" : "sm:col-span-2"}>
                      <label className={labelCls}>নোট (ঐচ্ছিক)</label>
                      <input type="text" maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="যেমন: স্কলারশিপ / ক্যাশ নিয়েছেন" className={fieldCls} />
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${muted}`}>
                    💡 ফি আদায় করে ভর্তি করতে চাইলে পেমেন্ট পেজের “ম্যানুয়াল পেমেন্ট” ব্যবহার করুন — তাতে পেমেন্ট রেকর্ড ও রেভিনিউ হিসাবও ঠিক থাকে।
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={adding || (isTrainee && !form.courseId)}
                      className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isTrainee ? "কোর্সে ভর্তি করুন" : "রোস্টারে যোগ করুন"}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Course roster filters */}
          {!isTrainee && rows && rows.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন…" className={`${fieldCls} pl-9`} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${fieldCls} sm:w-44`} aria-label="স্ট্যাটাস ফিল্টার">
                <option value="all">সকল স্ট্যাটাস</option>
                {Object.entries(ENROLMENT_STATUS).map(([value, s]) => (
                  <option key={value} value={value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* List */}
          {rows === null ? (
            <div className={`flex items-center justify-center gap-2 py-10 text-xs font-bold ${muted}`}>
              <Loader2 className="w-4 h-4 animate-spin" /> লোড হচ্ছে…
            </div>
          ) : visible.length === 0 ? (
            <p className={`text-center text-xs font-medium py-8 ${muted}`}>
              {rows.length === 0
                ? isTrainee
                  ? "এই ট্রেইনি এখনো কোনো কোর্সে ভর্তি নন।"
                  : "এই কোর্সে এখনো কোনো ট্রেইনি নেই।"
                : "ফিল্টারের সাথে মেলে এমন কোনো এনরোলমেন্ট নেই।"}
            </p>
          ) : (
            <ul className="space-y-3">
              {visible.map((row) => {
                const busy = busyId === row._id;
                const st = ENROLMENT_STATUS[row.status] || { label: row.status, tone: "slate" };
                const pay = PAYMENT[row.paymentStatus] || { label: row.paymentStatus, tone: "slate" };
                const open = openId === row._id;
                const draft = details[row._id] || detailsOf(row);
                const setDraft = (patch) => setDetails((d) => ({ ...d, [row._id]: { ...(d[row._id] || detailsOf(row)), ...patch } }));
                const cState = row.course ? courseState(row.course) : "published";
                return (
                  <li key={row._id} className={`rounded-2xl border p-4 space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"} ${busy ? "opacity-60" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`font-black text-sm truncate ${heading}`}>{isTrainee ? rowCourse(row) : rowOwner(row)}</div>
                        <div className={`text-[11px] mt-0.5 ${muted}`}>
                          {isTrainee ? (
                            <>
                              <span className="font-mono">{row.courseId}</span>
                              {cState !== "published" && <span className={`ml-2 px-1.5 py-0.5 rounded border text-[10px] font-bold ${tone("slate")}`}>{COURSE_STATE_LABEL[cState]}</span>}
                            </>
                          ) : (
                            <>
                              {row.userEmail}
                              {row.phone ? ` · ${row.phone}` : ""}
                            </>
                          )}
                          {" · ভর্তি: "}
                          {formatDate(row.enrolledAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${tone(pay.tone)}`}>
                          {pay.label}
                          {row.paymentStatus === "paid" && row.paidAmount ? ` · ${formatMoney(row.paidAmount, row.currency)}` : ""}
                        </span>
                        <select
                          value={row.status}
                          disabled={busy}
                          onChange={(e) => changeStatus(row, e.target.value)}
                          aria-label="এনরোলমেন্ট স্ট্যাটাস"
                          className={`border rounded-full px-2.5 py-1 text-[10px] font-extrabold cursor-pointer outline-hidden disabled:opacity-50 ${tone(st.tone)}`}
                        >
                          {Object.entries(ENROLMENT_STATUS).map(([value, s]) => (
                            <option key={value} value={value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="flex items-center gap-3">
                      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`} aria-hidden="true">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, row.progress || 0))}%` }} />
                      </div>
                      <span className={`text-[11px] font-bold tabular-nums ${muted}`}>{row.progress || 0}%</span>
                      {row.certificateIssued && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${tone("violet")}`}>
                          <Award className="w-3 h-3" /> সার্টিফিকেট
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : row._id)}
                        aria-expanded={open}
                        className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${isLight ? "text-indigo-700 hover:text-indigo-900" : "text-indigo-300 hover:text-indigo-200"}`}
                      >
                        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        অগ্রগতি, স্কোর ও সার্টিফিকেট
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(row)}
                        disabled={busy}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40 ${
                          isLight ? "text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200" : "text-rose-400 hover:bg-rose-950/40"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> কোর্স থেকে সরান
                      </button>
                    </div>

                    {open && (
                      <div className={`pt-3 border-t space-y-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className={labelCls}>অগ্রগতি (%)</label>
                            <input type="number" min="0" max="100" value={draft.progress} onChange={(e) => setDraft({ progress: e.target.value })} className={fieldCls} />
                          </div>
                          <div>
                            <label className={labelCls}>উপস্থিতি (দিন)</label>
                            <input type="number" min="0" step="1" value={draft.attendanceCount} onChange={(e) => setDraft({ attendanceCount: e.target.value })} className={fieldCls} />
                          </div>
                          <div>
                            <label className={labelCls}>স্কোর (০–১০০)</label>
                            <input type="number" min="0" max="100" value={draft.evaluationScore} onChange={(e) => setDraft({ evaluationScore: e.target.value })} className={fieldCls} />
                          </div>
                          <div>
                            <label className={labelCls}>গ্রেড</label>
                            <input type="text" maxLength={20} value={draft.grade} onChange={(e) => setDraft({ grade: e.target.value })} className={fieldCls} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-end">
                          <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer pb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                            <input type="checkbox" checked={draft.certificateIssued} onChange={(e) => setDraft({ certificateIssued: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                            সার্টিফিকেট দেওয়া হয়েছে
                          </label>
                          <div>
                            <label className={labelCls}>সার্টিফিকেট লিংক (https://…)</label>
                            <input type="url" value={draft.certificateUrl} onChange={(e) => setDraft({ certificateUrl: e.target.value })} placeholder="https://" className={fieldCls} />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>নোট</label>
                          <textarea rows={2} maxLength={1000} value={draft.notes} onChange={(e) => setDraft({ notes: e.target.value })} className={`${fieldCls} resize-y`} />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => saveDetails(row)}
                            disabled={busy}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
