'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Video,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  Award,
  BookOpen,
  MessageCircle,
  Send,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Search,
  Filter,
  Radio,
  Trash2,
  Star,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Sliders,
  ChevronRight
} from "lucide-react";

export default function InstructorDashboardClient({
  instructor,
  stats,
  initialNotices = [],
  courses = [],
}) {
  const [selectedBatch, setSelectedBatch] = useState("TOT-MEN");
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState("normal");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [notices, setNotices] = useState(initialNotices);

  // Quick evaluation modal state
  const [evalModalTrainee, setEvalModalTrainee] = useState(null);
  const [scores, setScores] = useState({
    makhrajTajweed: 22,
    childPsychologyPedagogy: 21,
    digitalClassroomTools: 23,
    microTeachingDemo: 22,
  });
  const [evalRemarks, setEvalRemarks] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState(null);

  const isMen = selectedBatch === "TOT-MEN";

  // Match course from activeCourses or fallback
  const currentCourse = courses.find((c) =>
    isMen ? c.courseId === "TOT-MEN" || c.track === "men" : c.courseId === "TOT-WOMEN-014" || c.track === "women"
  );

  const batchConfig = isMen
    ? {
        name: "TOT – MEN BATCH",
        schedule: currentCourse?.routine || "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ টা - ৯:৩০ টা)",
        orientation: currentCourse?.orientationDate
          ? `${currentCourse.orientationDate} (${currentCourse.orientationTime || "রাত ৮:০০ টা"})`
          : "২০ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
        meetHostUrl: currentCourse?.meetLink || "https://meet.google.com/tot-fajr-men-2026",
        whatsappUrl: currentCourse?.whatsappLink || "https://chat.whatsapp.com/tot-fajr-men-batch",
        coTrainers: ["উস্তাদ আব্দুল্লাহ আল-মাহমুদ", "মাওলানা তারিকুল ইসলাম"],
        accent: "from-blue-600 to-indigo-700",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        trackTag: "TOT-MEN",
      }
    : {
        name: "TOT – WOMEN (BATCH 014)",
        schedule: currentCourse?.routine || "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ টা - ৯:৩০ টা)",
        orientation: currentCourse?.orientationDate
          ? `${currentCourse.orientationDate} (${currentCourse.orientationTime || "রাত ৮:০০ টা"})`
          : "২১ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
        meetHostUrl: currentCourse?.meetLink || "https://meet.google.com/tot-fajr-women-014",
        whatsappUrl: currentCourse?.whatsappLink || "https://chat.whatsapp.com/tot-fajr-women-batch014",
        coTrainers: ["উস্তাজা ফারহানা চৌধুরী", "উস্তাজা সাদিয়া আক্তার"],
        accent: "from-emerald-600 to-teal-700",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        trackTag: "TOT-WOMEN-014",
      };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(batchConfig.meetHostUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Broadcast announcement via API
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;

    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/instructor/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          content: announcementText.trim(),
          track: isMen ? "TOT-MEN" : "TOT-WOMEN-014",
          priority: announcementPriority,
          instructorName: instructor.fullName,
          instructorEmail: instructor.email,
        }),
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setNotices([data.announcement, ...notices]);
        setBroadcastMessage("নোটিশ সফলভাবে সম্প্রচারিত হয়েছে!");
        setAnnouncementTitle("");
        setAnnouncementText("");
        setTimeout(() => setBroadcastMessage(null), 3000);
      } else {
        alert(data.message || "সম্প্রচার ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("নোটিশ পাঠানোর সময় সমস্যা হয়েছে");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!confirm("আপনি কি নিশ্চিত এই নোটিশটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/instructor/announcements?id=${noticeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotices(notices.filter((n) => n._id !== noticeId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick evaluation submit
  const handleQuickEvalSubmit = async (e) => {
    e.preventDefault();
    if (!evalModalTrainee) return;
    setIsSubmittingEval(true);

    try {
      const res = await fetch("/api/instructor/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traineeId: evalModalTrainee._id,
          scores,
          remarks: evalRemarks,
          instructorName: instructor.fullName,
          instructorEmail: instructor.email,
          courseId: isMen ? "TOT-MEN" : "TOT-WOMEN-014",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvalSuccessMsg(data.message);
        setTimeout(() => {
          setEvalSuccessMsg(null);
          setEvalModalTrainee(null);
        }, 1500);
      } else {
        alert(data.message || "মূল্যায়ন সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("মূল্যায়ন সাবমিট করতে সমস্যা হয়েছে");
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const filteredTrainees = (stats?.recentTrainees || []).filter((t) => {
    const matchesSearch =
      (t.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.phone || "").includes(searchQuery);

    const matchesBatch = isMen
      ? t.track === "TOT-MEN" || t.gender === "male"
      : t.track?.includes("WOMEN") || t.gender === "female";

    return matchesSearch && matchesBatch;
  });

  const totalScoreCalc =
    (Number(scores.makhrajTajweed) || 0) +
    (Number(scores.childPsychologyPedagogy) || 0) +
    (Number(scores.digitalClassroomTools) || 0) +
    (Number(scores.microTeachingDemo) || 0);

  return (
    <div className="space-y-8">
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
                  {instructor.fullName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" /> {instructor.designation}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                <span>ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ফ্যাকাল্টি ড্যাশবোর্ড</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="text-indigo-400 font-semibold">{instructor.email}</span>
              </p>
            </div>
          </div>

          {/* Batch Selector Switcher */}
          <div className="bg-[#0A0E1A] p-1.5 rounded-2xl border border-indigo-900/50 flex items-center gap-1 text-xs shadow-inner">
            <button
              onClick={() => setSelectedBatch("TOT-MEN")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                isMen
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👨</span> TOT MEN BATCH
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md text-blue-200">
                {stats.menTraineesCount || 0}
              </span>
            </button>
            <button
              onClick={() => setSelectedBatch("TOT-WOMEN-014")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                !isMen
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🧕</span> TOT WOMEN (014)
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-md text-emerald-200">
                {stats.womenTraineesCount || 0}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Dynamic Key Stat Counters */}
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
            {stats.totalTrainees || 0} <span className="text-sm font-semibold text-slate-400">জন</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {stats.paidTraineesCount || 0} পেইড
            </span>
            <span className="text-slate-400">{stats.pendingTraineesCount || 0} বকেয়া</span>
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
            {isMen ? stats.menTraineesCount || 0 : stats.womenTraineesCount || 0}{" "}
            <span className="text-sm font-semibold text-slate-400">জন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" />
            {isMen ? "২০ সেপ্টেম্বর ওরিয়েন্টেশন" : "২১ সেপ্টেম্বর ওরিয়েন্টেশন"}
          </p>
        </div>

        {/* Evaluations & Hired Count */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মূল্যায়ন ও নিয়োগ অনুমোদন</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {stats.totalEvaluated || 0} <span className="text-sm font-semibold text-slate-400">মূল্যায়নকৃত</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold">{stats.hiredCount || 0} সরাসরি জব অফার</span>
            <span className="text-slate-400">গড় {stats.avgScore || 0}%</span>
          </div>
        </div>

        {/* Curriculum Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">কারিকুলাম ও সেশন</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            ৪টি <span className="text-sm font-semibold text-slate-400">মডিউল (১২ সেশন)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-indigo-300 font-semibold">৬টি স্টাডি রিসোর্স</span>
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
            <div className="flex items-center gap-2">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${batchConfig.badge}`}>
                {batchConfig.name}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                <Radio className="w-3 h-3 text-rose-400" /> লাইভ হোস্ট কন্ট্রোল
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ইনস্ট্রাক্টর লাইভ ক্লাসরুম হোস্ট হাব
            </h2>
            <div className="space-y-1 text-xs sm:text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                শিডিউল: <strong>{batchConfig.schedule}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                ওরিয়েন্টেশন: <strong>{batchConfig.orientation}</strong>
              </p>
              <p className="text-xs text-slate-400">
                কো-ট্রেইনার প্যানেল: {batchConfig.coTrainers.join(", ")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={batchConfig.meetHostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" /> হোস্ট হিসেবে সেশন শুরু করুন
            </a>

            <button
              onClick={handleCopyLink}
              className="px-4 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? "লিঙ্ক কপি হয়েছে!" : "স্টুডেন্ট মিট লিঙ্ক কপি"}
            </button>

            <a
              href={batchConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3.5 rounded-2xl bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-emerald-500/30"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" /> ব্যাচ WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Grid: Announcement Broadcaster + Recent Trainees Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Live Announcement Broadcaster */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">ইনস্ট্যান্ট নোটিশ ও আপডেট</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {isMen ? "TOT-MEN" : "TOT-WOMEN"}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {batchConfig.name}-এর নিবন্ধিত সকল শিক্ষকের ড্যাশবোর্ড ও নোটিশ বোর্ডে তাৎক্ষণিক বার্তা পাঠান।
            </p>

            <form onSubmit={handleSendAnnouncement} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  নোটিশের বিষয় / শিরোনাম:
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="যেমন: আজকের লাইভ ক্লাসের প্রস্তুতি ও তাজবীদ শিট..."
                  required
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
                  placeholder="সকল ট্রেইনিকে রাত ৮টার সেশনে সময়মতো যুক্ত হতে অনুরোধ করা যাচ্ছে..."
                  required
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={announcementPriority}
                  onChange={(e) => setAnnouncementPriority(e.target.value)}
                  className="bg-slate-950 text-xs text-slate-300 rounded-xl border border-slate-800 px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="normal">সাধারণ নোটিশ</option>
                  <option value="important">গুরুত্বপূর্ণ</option>
                  <option value="urgent">জরুরি অ্যালার্ট</option>
                </select>

                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isBroadcasting ? "পাঠানো হচ্ছে..." : "ব্রডকাস্ট করুন"}
                </button>
              </div>

              {broadcastMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {broadcastMessage}
                </div>
              )}
            </form>
          </div>

          {/* Recent Notices Feed */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              সাম্প্রতিক সম্প্রচারিত নোটিশ ({notices.length}):
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notices.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-2">কোনো সাম্প্রতিক নোটিশ নেই।</p>
              ) : (
                notices.map((n) => (
                  <div
                    key={n._id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate max-w-[180px]">
                        {n.title}
                      </span>
                      <button
                        onClick={() => handleDeleteNotice(n._id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{n.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString("bn-BD") : ""}</span>
                      <span className="text-indigo-400 font-semibold uppercase">{n.track}</span>
                    </div>
                  </div>
                ))
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
                  {batchConfig.name} — ট্রেইনি শিক্ষক তালিকা
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {filteredTrainees.length} জন
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                সরাসরি প্রোফাইল ও মূল্যায়ন নিয়ন্ত্রণ প্যানেল
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <Link
                href="/instructor/trainees"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap"
              >
                সকল ট্রেইনি →
              </Link>
            </div>
          </div>

          {/* Trainees List Table */}
          <div className="divide-y divide-slate-800/80 overflow-x-auto">
            {filteredTrainees.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">এই ফিল্টারে কোনো ট্রেইনি পাওয়া যায়নি।</p>
              </div>
            ) : (
              filteredTrainees.map((t) => (
                <div
                  key={t._id}
                  className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-950 text-indigo-200 font-bold flex items-center justify-center text-xs border border-indigo-500/20">
                      {t.fullName ? t.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white">{t.fullName}</h4>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            t.paymentStatus === "paid"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {t.paymentStatus === "paid" ? "PAID" : "PENDING"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.phone} • {t.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Evaluation Status & Actions */}
                  <div className="flex items-center gap-3">
                    {t.evaluation ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.evaluation.qualificationStatus === "hired"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        ✓ {t.evaluation.grade} ({t.evaluation.totalScore}/১০০)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        মূল্যায়ন বাকি
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setEvalModalTrainee(t);
                        setScores({
                          makhrajTajweed: 22,
                          childPsychologyPedagogy: 21,
                          digitalClassroomTools: 23,
                          microTeachingDemo: 22,
                        });
                        setEvalRemarks("");
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" /> গ্রেডিং
                    </button>

                    <Link
                      href={`/id-card?tran_id=${t.tranId}`}
                      className="text-slate-400 hover:text-white text-xs font-medium p-1 hover:bg-slate-800 rounded transition-colors hidden sm:inline"
                      title="আইডি কার্ড"
                    >
                      আইডি কার্ড
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Quick Evaluation Modal Dialog */}
      {evalModalTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setEvalModalTrainee(null)}
          />

          <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-400">TOT MASTER EVALUATION</span>
                <h3 className="text-lg font-black text-white">{evalModalTrainee.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {evalModalTrainee.phone} • {evalModalTrainee.track || "TOT Batch"}
                </p>
              </div>
              <button
                onClick={() => setEvalModalTrainee(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickEvalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Makhraj */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">সহীহ মাখরাজ ও তাজবীদ</span>
                    <span className="font-bold text-indigo-400">{scores.makhrajTajweed} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.makhrajTajweed}
                    onChange={(e) =>
                      setScores({ ...scores, makhrajTajweed: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Pedagogy */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">শিশু সাইকোলজি ও পেডাগজি</span>
                    <span className="font-bold text-indigo-400">{scores.childPsychologyPedagogy} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.childPsychologyPedagogy}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        childPsychologyPedagogy: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Digital Tools */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">ডিজিটাল ক্লাসরুম ও এডটেক</span>
                    <span className="font-bold text-indigo-400">{scores.digitalClassroomTools} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.digitalClassroomTools}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        digitalClassroomTools: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Micro-Teaching Demo */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">মাইক্রো-টিচিং ডেমো ক্লাস</span>
                    <span className="font-bold text-indigo-400">{scores.microTeachingDemo} / ২৫</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.microTeachingDemo}
                    onChange={(e) =>
                      setScores({
                        ...scores,
                        microTeachingDemo: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">মোট স্কোর ও ফলাফল:</span>
                  <div className="text-xl font-black text-white">
                    {totalScoreCalc} / ১০০
                    <span className="ml-2 text-xs font-bold text-indigo-400">
                      {totalScoreCalc >= 85
                        ? "Grade A+ (সরাসরি নিয়োগ প্রাপ্ত)"
                        : totalScoreCalc >= 75
                        ? "Grade A (সার্টিফাইড)"
                        : totalScoreCalc >= 50
                        ? "Grade B (পাস)"
                        : "পুনরায় পরীক্ষা প্রয়োজন"}
                    </span>
                  </div>
                </div>
                <Award className="w-8 h-8 text-amber-400" />
              </div>

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  ইনস্ট্রাক্টরের মন্তব্য ও সুপারিশ:
                </label>
                <textarea
                  rows={2}
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  placeholder="উচ্চারণ চমৎকার, ক্লাসরুম প্রেজেন্টেশনে আরও কনফিডেন্স প্রয়োজন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {evalSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {evalSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalModalTrainee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEval}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isSubmittingEval ? "সংরক্ষণ হচ্ছে..." : "মূল্যায়ন সম্পন্ন করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
