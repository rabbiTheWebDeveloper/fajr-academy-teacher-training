'use client';

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Check, Copy, Loader2, RefreshCw, Search, Sparkles, Trash2, UserCheck, Users } from "lucide-react";
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

const noticeMatchesBatch = (notice, batch) => {
  if (!notice.track || notice.track === "all") return true;
  return batch === "TOT-MEN" ? notice.track === "TOT-MEN" : /WOMEN/i.test(notice.track);
};

const num = (v) => (v === null || v === undefined ? "—" : bn(v));

// Icon tile tints: translucent, so they read on both the white (light) and violet-black (dark) cards.
const TILE_TONE = {
  violet: "bg-violet-500/15 text-violet-500",
  sky: "bg-sky-500/15 text-sky-500",
  amber: "bg-amber-500/15 text-amber-500",
  emerald: "bg-emerald-500/15 text-emerald-500",
};

function StatCard({ label, value, unit, note, icon: Icon, tone = "violet" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${TILE_TONE[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">
        {value} {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

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

  // Notices
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState("batch");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const broadcastFlash = useFlash();
  const noticeFlash = useFlash();
  const [notices, setNotices] = useState(initialNotices);
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
    // A pending debounced search would otherwise reload the previous batch.
    if (searchTimer.current) clearTimeout(searchTimer.current);
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
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      linkFlash.show("error", `লিঙ্ক কপি করা যায়নি। নিজে কপি করুন: ${meetLink}`);
    }
  };

  // Author is taken from the session on the server.
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
          priority: "normal",
          isPinned: false,
        },
      });
      if (data.announcement) setNotices((list) => [data.announcement, ...list]);
      broadcastFlash.show("success", data.message || "নোটিশ পাঠানো হয়েছে।");
      setAnnouncementTitle("");
      setAnnouncementText("");
    } catch (err) {
      broadcastFlash.show("error", err.message || "নোটিশ পাঠানো যায়নি।");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("এই নোটিশটি মুছে ফেলতে চান?")) return;
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

  const visibleNotices = notices.filter((n) => noticeMatchesBatch(n, selectedBatch));
  const canDelete = (n) => instructor.isAdmin || (n.instructorEmail && n.instructorEmail === instructor.email);
  const designation = instructor.designation || roleLabel(instructor.role);

  return (
    <div className="space-y-6">
      {noAccess && (
        <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          এই পেজটি দেখার অনুমতি আপনার অ্যাকাউন্টে নেই। প্রয়োজনে অ্যাডমিনের সাথে যোগাযোগ করুন।
        </div>
      )}

      <ErrorBanner message={loadError} />

      {/* Welcome card (gradient): greeting + batch switch */}
      <section className="panel-hero rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="panel-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold">
              <Sparkles className="h-3.5 w-3.5" /> ইনস্ট্রাক্টর পোর্টাল
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{instructor.fullName || instructor.email}</h1>
            <p className="text-sm font-medium text-white/80">
              {designation}
              {instructor.track && <> · নিজস্ব ব্যাচ: {trackLabel(instructor.track)}</>}
            </p>
          </div>

          <div className="panel-glass inline-flex self-start rounded-xl p-1 text-sm sm:self-auto">
            {[
              { key: "TOT-MEN", label: "MEN", count: stats?.menCount },
              { key: "TOT-WOMEN-014", label: "WOMEN (014)", count: stats?.womenCount },
            ].map((b) => {
              const active = selectedBatch === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => switchBatch(b.key)}
                  aria-pressed={active}
                  className={`cursor-pointer rounded-lg px-3.5 py-1.5 font-bold transition-colors ${
                    active ? "bg-white text-violet-700 shadow-sm" : "text-white/80 hover:text-white"
                  }`}
                >
                  {b.label} <span className={`ml-1 text-xs ${active ? "text-violet-500" : "text-white/60"}`}>{num(b.count)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} tone="violet" label="মোট ট্রেইনি" value={num(stats?.totalTrainees)} unit="জন" note={`${num(stats?.paidCount)} পেইড · ${num(stats?.pendingCount)} বকেয়া`} />
        <StatCard icon={UserCheck} tone="sky" label={isMen ? "পুরুষ ব্যাচ" : "মহিলা ব্যাচ (014)"} value={num(batchCount)} unit="জন" note={`ওরিয়েন্টেশন: ${currentCourse?.orientationDate || NOT_SET}`} />
        <StatCard icon={Award} tone="amber" label="মূল্যায়িত" value={num(stats?.totalEvaluated)} unit="জন" note={`${num(stats?.hiredCount)} জন নিয়োগ · গড় ${num(stats?.avgScore)}/১০০`} />
        <StatCard
          icon={BookOpen}
          tone="emerald"
          label="কারিকুলাম"
          value={courseNumbers ? bn(courseNumbers.modules) : "—"}
          unit="মডিউল"
          note={courseNumbers ? `${bn(courseNumbers.lessons)} লেসন · ${bn(courseNumbers.resources)} রিসোর্স` : "তথ্য নেই"}
        />
      </div>

      {/* Live class */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-violet-500">{batchName}</p>
            <p className="text-slate-300">
              শিডিউল: <span className="text-white">{currentCourse?.routine || NOT_SET}</span>
            </p>
            <p className="text-slate-300">
              ওরিয়েন্টেশন: <span className="text-white">{orientation}</span>
            </p>
            <p className="text-slate-400">ট্রেইনার: {trainers.length > 0 ? trainers.join(", ") : NOT_SET}</p>
            {!currentCourse && <p className="text-amber-300">এই ব্যাচের কোর্স তথ্য পাওয়া যায়নি।</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {meetLink ? (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="panel-cta rounded-xl px-5 py-2.5 text-sm"
              >
                সেশন শুরু করুন
              </a>
            ) : (
              <Link href="/instructor/live" className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:text-white">
                মিট লিঙ্ক যুক্ত করুন
              </Link>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              disabled={!meetLink}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "কপি হয়েছে" : "মিট লিঙ্ক কপি"}
            </button>

            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:text-white"
              >
                WhatsApp গ্রুপ
              </a>
            ) : (
              <span className="rounded-lg border border-slate-800 px-4 py-2.5 text-sm text-slate-600">WhatsApp: {NOT_SET}</span>
            )}
          </div>
        </div>
        <FlashMessage flash={linkFlash.flash} onClose={linkFlash.clear} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Notices */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-white">নোটিশ পাঠান</h2>

          <form onSubmit={handleSendAnnouncement} className="space-y-3">
            <input
              type="text"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="শিরোনাম"
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="বিস্তারিত"
              required
              maxLength={5000}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2">
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-slate-300 focus:outline-none"
                aria-label="কোন ব্যাচে পাঠাবেন"
              >
                <option value="batch">শুধু {batch.short}</option>
                <option value="all">সকল ব্যাচ</option>
              </select>
              <button
                type="submit"
                disabled={isBroadcasting}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-violet-700 disabled:opacity-50"
              >
                {isBroadcasting ? "পাঠানো হচ্ছে..." : "পাঠান"}
              </button>
            </div>
            <FlashMessage flash={broadcastFlash.flash} onClose={broadcastFlash.clear} />
          </form>

          <div className="space-y-2 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">সাম্প্রতিক নোটিশ ({bn(visibleNotices.length)})</p>
            <FlashMessage flash={noticeFlash.flash} onClose={noticeFlash.clear} />

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {visibleNotices.length === 0 ? (
                <p className="py-2 text-xs text-slate-500">কোনো নোটিশ নেই।</p>
              ) : (
                visibleNotices.map((n) => (
                  <div key={n._id} className="group rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">{n.title}</p>
                      {canDelete(n) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(n._id)}
                          disabled={deletingId === n._id}
                          className="shrink-0 p-0.5 text-slate-600 hover:text-rose-400 disabled:opacity-50"
                          aria-label="নোটিশ মুছে ফেলুন"
                          title="মুছে ফেলুন"
                        >
                          {deletingId === n._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{n.content}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {formatDate(n.createdAt)}
                      {n.instructorName ? ` · ${n.instructorName}` : ""}
                      {" · "}
                      {n.track === "all" ? "সকল ব্যাচ" : n.track}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Trainees */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {batch.label} <span className="font-normal text-slate-400">· {bn(roster.total)} জন</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">সর্বশেষ {bn(Math.min(roster.trainees.length, rosterLimit))} জন</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative sm:w-56">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="নাম, ফোন বা ইমেইল"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-8 pr-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
                {roster.loading ? (
                  <Loader2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400" />
                ) : (
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                )}
              </div>
              <Link href="/instructor/trainees" className="whitespace-nowrap rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:text-white">
                সকল ট্রেইনি
              </Link>
            </div>
          </div>

          {roster.error && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              <span>{roster.error}</span>
              <button type="button" onClick={() => loadRoster(selectedBatch, searchQuery)} className="flex items-center gap-1 font-medium hover:text-white">
                <RefreshCw className="h-3.5 w-3.5" /> আবার চেষ্টা
              </button>
            </div>
          )}

          <div className={`mt-1 divide-y divide-slate-800 ${roster.loading ? "opacity-60" : ""}`}>
            {roster.trainees.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                {roster.loading ? "লোড হচ্ছে..." : "কোনো ট্রেইনি পাওয়া যায়নি।"}
              </p>
            ) : (
              roster.trainees.map((t) => {
                const pay = paymentMeta(t.paymentStatus);
                const st = t.evaluation ? statusMeta(t.evaluation.qualificationStatus) : null;
                return (
                  <div key={t._id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">{t.fullName}</p>
                        <span className="shrink-0 text-[11px] text-slate-500">{pay.label}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{[t.phone, t.email].filter(Boolean).join(" · ")}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {t.evaluation ? (
                        <span className="hidden text-xs text-slate-400 sm:inline" title={st.label}>
                          {t.evaluation.grade} · {bn(t.evaluation.totalScore)}/১০০
                        </span>
                      ) : (
                        <span className="hidden text-xs text-slate-600 sm:inline">মূল্যায়ন বাকি</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEvalModalTrainee(t)}
                        className="rounded-md border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-violet-500 hover:text-white"
                      >
                        গ্রেডিং
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

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
