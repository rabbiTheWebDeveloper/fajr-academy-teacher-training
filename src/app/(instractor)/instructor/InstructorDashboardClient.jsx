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
  Layers,
  Search,
  Filter
} from "lucide-react";

export default function InstructorDashboardClient({ instructor, stats }) {
  const [selectedBatch, setSelectedBatch] = useState("TOT-MEN");
  const [copiedLink, setCopiedLink] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementSent, setAnnouncementSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isMen = selectedBatch === "TOT-MEN";

  const batchConfig = isMen
    ? {
        name: "TOT – MEN BATCH",
        schedule: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ টা - ৯:৩০ টা)",
        orientation: "২০ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
        meetHostUrl: "https://meet.google.com/tot-fajr-men-2026",
        whatsappUrl: "https://chat.whatsapp.com/tot-fajr-men-batch",
        coTrainers: ["উস্তাদ আব্দুল্লাহ আল-মাহমুদ", "মাওলানা তারিকুল ইসলাম"],
        accent: "from-blue-600 to-indigo-700",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      }
    : {
        name: "TOT – WOMEN (BATCH 014)",
        schedule: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ টা - ৯:৩০ টা)",
        orientation: "২১ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
        meetHostUrl: "https://meet.google.com/tot-fajr-women-014",
        whatsappUrl: "https://chat.whatsapp.com/tot-fajr-women-batch014",
        coTrainers: ["উস্তাজা ফারহানা চৌধুরী", "উস্তাজা সাদিয়া আক্তার"],
        accent: "from-emerald-600 to-teal-700",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(batchConfig.meetHostUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementText("");
    }, 2500);
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

  return (
    <div className="space-y-6">
      {/* Instructor Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-indigo-900/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-indigo-600/30 border-2 border-indigo-400">
              {instructor.fullName ? instructor.fullName[0].toUpperCase() : "I"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  {instructor.fullName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {instructor.designation}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) সিনিয়র ফ্যাকাল্টি ড্যাশবোর্ড
              </p>
            </div>
          </div>

          {/* Batch Selector */}
          <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedBatch("TOT-MEN")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                isMen ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              👨 TOT MEN BATCH
            </button>
            <button
              onClick={() => setSelectedBatch("TOT-WOMEN-014")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                !isMen ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              🧕 TOT WOMEN (014)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মোট ট্রেইনি শিক্ষক</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalTrainees || 0} জন</div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">✓ সক্রিয় ব্যাচ রেজিস্ট্রেশন</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">পুরুষ ব্যাচ (MEN)</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{stats.menTraineesCount || 0} জন</div>
          <p className="text-[11px] text-slate-400 mt-1">২০ সেপ্টেম্বর ওরিয়েন্টেশন</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">মহিলা ব্যাচ (WOMEN 014)</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.womenTraineesCount || 0} জন</div>
          <p className="text-[11px] text-slate-400 mt-1">২১ সেপ্টেম্বর ওরিয়েন্টেশন</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">সার্টিফিকেশন প্রগ্রেস</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">১০টি মডিউল</div>
          <p className="text-[11px] text-slate-400 mt-1">প্র্যাকটিকাম ও মূল্যায়ন</p>
        </div>
      </div>

      {/* Live Class Host Launchpad */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${batchConfig.badge}`}>
              {batchConfig.name}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ইনস্ট্রাক্টর লাইভ ক্লাসরুম হোস্ট হাব
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              শিডিউল: <strong>{batchConfig.schedule}</strong> • ওরিয়েন্টেশন: <strong>{batchConfig.orientation}</strong>
            </p>
            <p className="text-xs text-slate-400">
              কো-ট্রেইনার্স: {batchConfig.coTrainers.join(", ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={batchConfig.meetHostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" /> হোস্ট হিসেবে লাইভ শুরু করুন
            </a>

            <button
              onClick={handleCopyLink}
              className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? "কপি হয়েছে" : "স্টুডেন্ট লিঙ্ক কপি"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Announcement Tool + Trainee Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Announcement Broadcaster */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">ইনস্ট্যান্ট নোটিশ ও আপডেট</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {batchConfig.name}-এর সমস্ত ট্রেইনি শিক্ষকের ড্যাশবোর্ড ও নোটিশ বোর্ডে নোটিফিকেশন পাঠান।
          </p>

          <form onSubmit={handleSendAnnouncement} className="space-y-3">
            <textarea
              rows={4}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="আজকের লাইভ ক্লাসের প্রস্তুতি ও তাজবীদ শিট পড়ে আসার নির্দেশ..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {announcementSent ? (
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" /> নোটিশ সফলভাবে পাঠানো হয়েছে!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> নোটিশ ব্রডকাস্ট করুন
                </span>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">কমিউনিটি লিঙ্ক:</span>
            <a
              href={batchConfig.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              WhatsApp গ্রুপ <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right 2 Cols: Trainee Roster */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                {batchConfig.name} — ট্রেইনি শিক্ষক তালিকা
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                সর্বশেষ নিবন্ধিত শিক্ষকগণ ({filteredTrainees.length} জন)
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা মোবাইল দিয়ে সার্চ..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-x-auto">
            {filteredTrainees.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                এই ফিল্টারে কোনো ট্রেইনি পাওয়া যায়নি।
              </div>
            ) : (
              filteredTrainees.map((t) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs">
                      {t.fullName ? t.fullName[0].toUpperCase() : "T"}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{t.fullName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {t.phone} • {t.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.paymentStatus === "paid"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {t.paymentStatus === "paid" ? "✓ Paid" : "Pending"}
                    </span>

                    <Link
                      href={`/id-card?tran_id=${t.tranId}`}
                      className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
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
    </div>
  );
}
