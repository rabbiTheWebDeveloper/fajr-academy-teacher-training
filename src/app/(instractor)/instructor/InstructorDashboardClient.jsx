'use client';

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Award,
  BookOpen,
  MessageCircle,
  Send,
  ShieldCheck,
  Search,
  Radio,
  Trash2,
  Pin,
  Loader2,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import QuickEvalModal from "../_shared/QuickEvalModal";
import ErrorBanner from "../_shared/ErrorBanner";
import { FlashMessage, useFlash } from "../_shared/Flash";
import { apiFetch, isAbort } from "../_shared/api";
import {
  BATCHES,
  NOT_SET,
  bn,
  courseTrainers,
  formatDate,
  paymentMeta,
  roleLabel,
  statusMeta,
  trackLabel,
} from "../_shared/utils";

const PRIORITY_META = {
  urgent: { label: "জরুরি", badge: "bg-rose-500/20 text-rose-300" },
  important: { label: "গুরুত্বপূর্ণ", badge: "bg-amber-500/20 text-amber-300" },
  normal: { label: "সাধারণ", badge: "bg-slate-800 text-slate-400" },
};

const noticeMatchesBatch = (notice, batch) => {
  if (!notice.track || notice.track === "all") return true;
  return batch === "TOT-MEN" ? notice.track === "TOT-MEN" : /WOMEN/i.test(notice.track);
};

const num = (v) => (v === null || v === undefined ? "—" : bn(v));

export default function InstructorDashboardClient({
  instructor,
  initialBatch = "TOT-MEN",
  initialStats = null,
  courses = [],
  initialNotices = [],
  initialRoster = null,
  rosterLimit = 10,
  loadError = null,
  noAccess = false,
}) {
  const [selectedBatch, setSelectedBatch] = useState(initialBatch);
  const [stats, setStats] = useState(initialStats);
  const [copiedLink, setCopiedLink] = useState(false);
  const linkFlash = useFlash();

  // Roster (server-side search + per-batch query)
  const [searchQuery, setSearchQuery] = useState("");
  const [roster, setRoster] = useState({
    trainees: initialRoster?.trainees || [],
    total: initialRoster?.total ?? 0,
    loading: false,
    error: initialRoster ? null : "ট্রেইনি তালিকা লোড করা যায়নি।",
  });
  const rosterCtrl = useRef(null);
  const searchTimer = useRef(null);

  // Announcements
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");
  const [announcementTarget, setAnnouncementTarget] = useState("batch");
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const broadcastFlash = useFlash();
  const noticeFlash = useFlash();
  const [notices, setNotices] = useState(initialNotices);
  const [noticeFilter, setNoticeFilter] = useState("batch");
  const [deletingId, setDeletingId] = useState(null);

  // Quick evaluation modal
  const [evalModalTrainee, setEvalModalTrainee] = useState(null);

  const batch = BATCHES[selectedBatch] || BATCHES["TOT-MEN"];
  const isMen = selectedBatch === "TOT-MEN";
  const currentCourse =
    courses.find((c) => c.courseId === selectedBatch) ||
    courses.find((c) => c.track === (isMen ? "men" : "women")) ||
    null;
  const courseNumbers = currentCourse ? stats?.perCourse?.[currentCourse.courseId] : null;
  const trainers = courseTrainers(currentCourse);
  const meetLink = currentCourse?.meetLink || "";
  const whatsappLink = currentCourse?.whatsappLink || "";
  const orientation = currentCourse?.orientationDate
    ? `${currentCourse.orientationDate}${currentCourse.orientationTime ? ` (${currentCourse.orientationTime})` : ""}`
    : NOT_SET;
  const batchName = currentCourse?.name || batch.label;
  const batchCount = stats ? (isMen ? stats.menCount : stats.womenCount) : null;

  const refreshStats = useCallback(async () => {
    try {
      const data = await apiFetch("/api/instructor/stats");
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.warn("Stats refresh failed:", err.message);
    }
  }, []);

  const loadRoster = useCallback(
    async (batchKey, search) => {
      rosterCtrl.current?.abort();
      const ctrl = new AbortController();
      rosterCtrl.current = ctrl;
      setRoster((r) => ({ ...r, loading: true, error: null }));
      try {
        const qs = new URLSearchParams({
          track: (BATCHES[batchKey] || BATCHES["TOT-MEN"]).apiTrack,
          page: "1",
          limit: String(rosterLimit),
        });
        if (search.trim()) qs.set("search", search.trim());
        const data = await apiFetch(`/api/instructor/trainees?${qs.toString()}`, { signal: ctrl.signal });
        setRoster({ trainees: data.trainees || [], total: data.total ?? 0, loading: false, error: null });
      } catch (err) {
        if (isAbort(err)) return;
        setRoster((r) => ({ ...r, loading: false, error: err.message }));
      }
    },
    [rosterLimit]
  );

  const switchBatch = (key) => {
    if (key === selectedBatch) return;
    setSelectedBatch(key);
    setCopiedLink(false);
    loadRoster(key, searchQuery);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadRoster(selectedBatch, value), 400);
  };

  const handleCopyLink = async () => {
    if (!meetLink) return;
    try {
      await navigator.clipboard.writeText(meetLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      linkFlash.show("error", `লিঙ্ক কপি করা যায়নি। নিজে কপি করুন: ${meetLink}`);
    }
  };

  // Broadcast announcement (author is taken from the session on the server)
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) {
      broadcastFlash.show("error", "শিরোনাম এবং বিস্তারিত বার্তা দুটোই লিখুন।");
      return;
    }

    setIsBroadcasting(true);
    try {
      const data = await apiFetch("/api/instructor/announcements", {
        method: "POST",
        body: {
          title: announcementTitle.trim(),
          content: announcementText.trim(),
          track: announcementTarget === "all" ? "all" : selectedBatch,
          priority: announcementPriority,
          isPinned: announcementPinned,
        },
      });
      if (data.announcement) setNotices((list) => [data.announcement, ...list]);
      broadcastFlash.show("success", data.message || "নোটিশ সফলভাবে সম্প্রচারিত হয়েছে!");
      setAnnouncementTitle("");
      setAnnouncementText("");
      setAnnouncementPinned(false);
    } catch (err) {
      broadcastFlash.show("error", err.message || "সম্প্রচার ব্যর্থ হয়েছে");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("আপনি কি নিশ্চিত এই নোটিশটি মুছে ফেলতে চান?")) return;
    setDeletingId(noticeId);
    try {
      const data = await apiFetch(`/api/instructor/announcements?id=${encodeURIComponent(noticeId)}`, {
        method: "DELETE",
      });
      setNotices((list) => list.filter((n) => n._id !== noticeId));
      noticeFlash.show("success", data.message || "নোটিশ মুছে ফেলা হয়েছে।");
    } catch (err) {
      noticeFlash.show("error", err.message || "নোটিশ মুছে ফেলা যায়নি।");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEvalSaved = (evaluation) => {
    if (!evaluation) return;
    setRoster((r) => ({
      ...r,
      trainees: r.trainees.map((t) =>
        t._id === evaluation.traineeId
          ? {
              ...t,
              evaluation: {
                totalScore: evaluation.totalScore,
                grade: evaluation.grade,
                qualificationStatus: evaluation.qualificationStatus,
                scores: evaluation.scores,
                evaluatedAt: evaluation.evaluatedAt,
              },
            }
          : t
      ),
    }));
    refreshStats();
  };

  const visibleNotices = notices.filter((n) => noticeFilter === "all" || noticeMatchesBatch(n, selectedBatch));
  const canDelete = (n) => instructor.isAdmin || (n.instructorEmail && n.instructorEmail === instructor.email);
  const designation = instructor.designation || roleLabel(instructor.role);

  return (
    <div className="space-y-8">
      {noAccess && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3"
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="leading-relaxed">
            আপনি যে পেজটি খুলতে চেয়েছিলেন সেটি দেখার অনুমতি আপনার অ্যাকাউন্টে নেই। তাই আপনাকে ইনস্ট্রাক্টর ড্যাশবোর্ডে আনা হয়েছে।
            প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>
      )}

      <ErrorBanner message={loadError} />

      {/* 1. Instructor Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/95 border border-indigo-900/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-indigo-600/30 border-2 border-indigo-400/50 shrink-0">
              {instructor.fullName ? instructor.fullName[0].toUpperCase() : "I"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  {instructor.fullName || instructor.email}
                </h1>
                {designation && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" /> {designation}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                <span>ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ফ্যাকাল্টি ড্যাশবোর্ড</span>
                {instructor.email && (
                  <>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span className="text-indigo-400 font-semibold">{instructor.email}</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-500">
                নিজস্ব ব্যাচ: <strong className="text-slate-300">{instructor.track ? trackLabel(instructor.track) : "নির্ধারিত নয়"}</strong>
              </p>
            </div>
          </div>

          {/* Batch Selector Switcher */}
          <div className="bg-[#0A0E1A] p-1.5 rounded-2xl border border-indigo-900/50 flex items-center gap-1 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => switchBatch("TOT-MEN")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                isMen
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👨</span> TOT MEN BATCH
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md text-blue-200">
                {num(stats?.menCount)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchBatch("TOT-WOMEN-014")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                !isMen
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🧕</span> TOT WOMEN (014)
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md text-emerald-200">
                {num(stats?.womenCount)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Stat Counters (all from the database) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trainees */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মোট ট্রেইনি শিক্ষক</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {num(stats?.totalTrainees)} <span className="text-sm font-semibold text-slate-400">জন</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] gap-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1" title="পরিশোধিত ও ফ্রি এনরোলমেন্ট">
              <CheckCircle2 className="w-3 h-3" /> {num(stats?.paidCount)} পেইড/ফ্রি
            </span>
            <span className="text-slate-400" title="বকেয়া ও ব্যর্থ পেমেন্ট">{num(stats?.pendingCount)} বকেয়া</span>
          </div>
        </div>

        {/* Selected Batch Enrolled */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">{isMen ? "পুরুষ ব্যাচ (MEN)" : "মহিলা ব্যাচ (WOMEN 014)"}</span>
            <div className={`p-2 rounded-xl ${isMen ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${isMen ? "text-blue-400" : "text-emerald-400"}`}>
            {num(batchCount)} <span className="text-sm font-semibold text-slate-400">জন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">
              ওরিয়েন্টেশন: {currentCourse?.orientationDate || NOT_SET}
            </span>
          </p>
        </div>

        {/* Evaluations & Hired Count */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মূল্যায়ন ও নিয়োগ অনুমোদন</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {num(stats?.totalEvaluated)} <span className="text-sm font-semibold text-slate-400">মূল্যায়নকৃত</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] gap-2">
            <span className="text-emerald-400 font-bold">{num(stats?.hiredCount)} সরাসরি জব অফার</span>
            <span className="text-slate-400">গড় {num(stats?.avgScore)}/১০০</span>
          </div>
        </div>

        {/* Curriculum Status (selected batch) */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">কারিকুলাম ও সেশন</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {courseNumbers ? `${bn(courseNumbers.modules)}টি` : "—"}{" "}
            <span className="text-sm font-semibold text-slate-400">
              মডিউল{courseNumbers ? ` (${bn(courseNumbers.lessons)} লেসন)` : ""}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-300 font-semibold">
              {courseNumbers ? `${bn(courseNumbers.resources)}টি স্টাডি রিসোর্স` : "রিসোর্স তথ্য নেই"}
            </span>
            <Link href="/instructor/curriculum" className="text-indigo-400 hover:underline">
              দেখুন →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Live Classroom Host Launchpad */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${batch.badge}`}>
                {batchName}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-400" /> লাইভ হোস্ট কন্ট্রোল
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ইনস্ট্রাক্টর লাইভ ক্লাসরুম হোস্ট হাব
            </h2>
            <div className="space-y-1 text-xs sm:text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                শিডিউল: <strong>{currentCourse?.routine || NOT_SET}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                ওরিয়েন্টেশন: <strong>{orientation}</strong>
              </p>
              <p className="text-xs text-slate-400">
                ট্রেইনার প্যানেল: {trainers.length > 0 ? trainers.join(", ") : NOT_SET}
              </p>
              {!currentCourse && (
                <p className="text-xs text-amber-300">এই ব্যাচের কোর্স তথ্য ডাটাবেজে পাওয়া যায়নি।</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {meetLink ? (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Video className="w-4 h-4" /> হোস্ট হিসেবে সেশন শুরু করুন
              </a>
            ) : (
              <Link
                href="/instructor/live"
                className="px-6 py-3.5 rounded-2xl bg-slate-800/90 border border-dashed border-indigo-500/40 text-slate-300 font-bold text-sm flex items-center gap-2.5 hover:text-white"
                title="মিট লিঙ্ক যুক্ত করতে লাইভ ক্লাসরুম পেজে যান"
              >
                <Video className="w-4 h-4 text-indigo-400" /> মিট লিঙ্ক {NOT_SET} — যুক্ত করুন
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!meetLink}
              className="px-4 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? "লিঙ্ক কপি হয়েছে!" : "স্টুডেন্ট মিট লিঙ্ক কপি"}
            </button>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-2xl bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" /> ব্যাচ WhatsApp
              </a>
            ) : (
              <span className="px-4 py-3.5 rounded-2xl bg-slate-800/60 text-slate-500 font-semibold text-xs flex items-center gap-1.5 border border-slate-700">
                <MessageCircle className="w-4 h-4" /> WhatsApp: {NOT_SET}
              </span>
            )}
          </div>
        </div>
        <FlashMessage flash={linkFlash.flash} onClose={linkFlash.clear} />
      </div>

      {/* 4. Two-Column Grid: Announcement Broadcaster + Trainee Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Announcement Broadcaster */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">ইনস্ট্যান্ট নোটিশ ও আপডেট</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {announcementTarget === "all" ? "সকল ব্যাচ" : selectedBatch}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {announcementTarget === "all" ? "সকল ব্যাচের" : `${batchName}-এর`} নিবন্ধিত শিক্ষকদের ড্যাশবোর্ড ও নোটিশ বোর্ডে বার্তা পাঠান।
            </p>

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  নোটিশের বিষয় / শিরোনাম:
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="যেমন: আজকের লাইভ ক্লাসের প্রস্তুতি ও তাজবীদ শিট..."
                  required
                  maxLength={200}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  বিস্তারিত বার্তা:
                </label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="সকল ট্রেইনিকে রাত ৮টার সেশনে সময়মতো যুক্ত হতে অনুরোধ করা যাচ্ছে..."
                  required
                  maxLength={5000}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={announcementTarget}
                  onChange={(e) => setAnnouncementTarget(e.target.value)}
                  className="bg-slate-950 text-xs text-slate-300 rounded-xl border border-slate-800 px-2.5 py-1.5 focus:outline-none"
                  aria-label="কোন ব্যাচে পাঠাবেন"
                >
                  <option value="batch">শুধু {batch.short}</option>
                  <option value="all">সকল ব্যাচ</option>
                </select>
                <select
                  value={announcementPriority}
                  onChange={(e) => setAnnouncementPriority(e.target.value)}
                  className="bg-slate-950 text-xs text-slate-300 rounded-xl border border-slate-800 px-2.5 py-1.5 focus:outline-none"
                  aria-label="নোটিশের গুরুত্ব"
                >
                  <option value="normal">সাধারণ নোটিশ</option>
                  <option value="important">গুরুত্বপূর্ণ</option>
                  <option value="urgent">জরুরি অ্যালার্ট</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementPinned}
                    onChange={(e) => setAnnouncementPinned(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  উপরে পিন করুন
                </label>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isBroadcasting ? "পাঠানো হচ্ছে..." : "ব্রডকাস্ট করুন"}
                </button>
              </div>

              <FlashMessage flash={broadcastFlash.flash} onClose={broadcastFlash.clear} />
            </form>
          </div>

          {/* Recent Notices Feed */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                সম্প্রচারিত নোটিশ ({bn(visibleNotices.length)}):
              </h4>
              <select
                value={noticeFilter}
                onChange={(e) => setNoticeFilter(e.target.value)}
                className="bg-slate-950 text-[11px] text-slate-300 rounded-lg border border-slate-800 px-2 py-1 focus:outline-none"
                aria-label="নোটিশ ফিল্টার"
              >
                <option value="batch">{batch.short} + সকল</option>
                <option value="all">সব নোটিশ</option>
              </select>
            </div>

            <FlashMessage flash={noticeFlash.flash} onClose={noticeFlash.clear} />

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {visibleNotices.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-2">এই ফিল্টারে কোনো নোটিশ নেই।</p>
              ) : (
                visibleNotices.map((n) => {
                  const pr = PRIORITY_META[n.priority] || PRIORITY_META.normal;
                  return (
                    <div
                      key={n._id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate flex items-center gap-1 min-w-0">
                          {n.isPinned && <Pin className="w-3 h-3 text-indigo-400 shrink-0" />}
                          <span className="truncate">{n.title}</span>
                        </span>
                        {canDelete(n) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(n._id)}
                            disabled={deletingId === n._id}
                            className="text-slate-600 hover:text-rose-400 disabled:opacity-50 transition-colors p-1 shrink-0"
                            title="মুছে ফেলুন"
                            aria-label="নোটিশ মুছে ফেলুন"
                          >
                            {deletingId === n._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{n.content}</p>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
                        <span className="truncate">
                          {formatDate(n.createdAt)}
                          {n.instructorName ? ` • ${n.instructorName}` : ""}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {n.priority && n.priority !== "normal" && (
                            <span className={`px-1.5 rounded ${pr.badge}`}>{pr.label}</span>
                          )}
                          <span className="text-indigo-400 font-semibold uppercase">
                            {n.track === "all" ? "সকল" : n.track}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (2 Cols): Trainee Roster & Quick Action */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {batch.label} — ট্রেইনি শিক্ষক তালিকা
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {bn(roster.total)} জন
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                সর্বশেষ নিবন্ধিত {bn(Math.min(roster.trainees.length, rosterLimit))} জন দেখানো হচ্ছে — সরাসরি প্রোফাইল ও মূল্যায়ন নিয়ন্ত্রণ
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {roster.loading ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              <Link
                href="/instructor/trainees"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap"
              >
                সকল ট্রেইনি →
              </Link>
            </div>
          </div>

          {roster.error && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <span>{roster.error}</span>
              <button
                type="button"
                onClick={() => loadRoster(selectedBatch, searchQuery)}
                className="flex items-center gap-1 font-bold hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" /> আবার চেষ্টা
              </button>
            </div>
          )}

          {/* Trainees List */}
          <div className={`divide-y divide-slate-800/80 overflow-x-auto ${roster.loading ? "opacity-60" : ""}`}>
            {roster.trainees.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  {roster.loading ? "লোড হচ্ছে..." : "এই ব্যাচ / সার্চে কোনো ট্রেইনি পাওয়া যায়নি।"}
                </p>
              </div>
            ) : (
              roster.trainees.map((t) => {
                const pay = paymentMeta(t.paymentStatus);
                const st = t.evaluation ? statusMeta(t.evaluation.qualificationStatus) : null;
                return (
                  <div
                    key={t._id}
                    className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-950 text-indigo-200 font-bold flex items-center justify-center text-xs border border-indigo-500/20 shrink-0">
                        {t.fullName ? t.fullName[0].toUpperCase() : "T"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white truncate">{t.fullName}</h4>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${pay.badge}`}>
                            {pay.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {[t.phone, t.email].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </div>

                    {/* Right: Evaluation Status & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {t.evaluation ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badge}`}
                          title={st.label}
                        >
                          {t.evaluation.grade} ({bn(t.evaluation.totalScore)}/১০০) • {st.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                          মূল্যায়ন বাকি
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setEvalModalTrainee(t)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" /> গ্রেডিং
                      </button>

                      <Link
                        href={`/id-card?user=${encodeURIComponent(t._id)}`}
                        prefetch={false}
                        className="text-slate-400 hover:text-white text-xs font-medium p-1 hover:bg-slate-800 rounded transition-colors hidden sm:inline"
                        title="আইডি কার্ড"
                      >
                        আইডি কার্ড
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Quick Evaluation Modal Dialog */}
      {evalModalTrainee && (
        <QuickEvalModal
          key={evalModalTrainee._id}
          trainee={evalModalTrainee}
          onClose={() => setEvalModalTrainee(null)}
          onSaved={handleEvalSaved}
        />
      )}
    </div>
  );
}
