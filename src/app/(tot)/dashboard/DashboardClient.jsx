'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Download,
  CheckCircle2,
  BookOpen,
  Sparkles,
  CreditCard,
  FileText,
  UserCheck,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Users,
  Copy,
  Check,
  Layers,
  HelpCircle,
  Flame,
  AlertCircle
} from "lucide-react";
import { OfficialIDCard } from "@/components/TeacherOfficialIDCard";

export default function DashboardClient({ trainee, isNewlyEnrolled }) {
  const [activeTrack, setActiveTrack] = useState(trainee.track || "TOT-MEN");
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [completedModules, setCompletedModules] = useState([1]);

  const isMen = activeTrack === "TOT-MEN" || activeTrack.toLowerCase().includes("men");

  // Track specific information
  const trackInfo = isMen
    ? {
        name: "Training of Trainers (TOT) – MEN",
        badge: "পুরুষদের ডেডিকেটেড ব্যাচ",
        orientationDateStr: "2026-09-20T20:00:00+06:00",
        orientationDisplay: "২০ সেপ্টেম্বর ২০২৬ (রবিবার)",
        orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
        days: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
        instructor: "উস্তাদ আব্দুল্লাহ মাহমুদ ও ট্রেইনার প্যানেল",
        coordinator: "উস্তাদ তারিকুল ইসলাম (01410-764581)",
        meetLink: "https://meet.google.com/tot-fajr-men-2026",
        whatsappGroup: "https://chat.whatsapp.com/tot-fajr-men-batch",
        whatsappDisplay: "Fajr TOT (Men) Official Community",
        accentColor: "from-blue-600 to-indigo-700",
        tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      }
    : {
        name: "Training of Trainers (TOT) – WOMEN (Batch 014)",
        badge: "মহিলাদের এক্সক্লুসিভ ব্যাচ (০১8)",
        orientationDateStr: "2026-09-21T20:00:00+06:00",
        orientationDisplay: "২১ সেপ্টেম্বর ২০২৬ (সোমবার)",
        orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
        days: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০)",
        instructor: "উস্তাজা ফারহানা চৌধুরী ও সিনিয়র ফিমেল ট্রেইনার প্যানেল",
        coordinator: "উস্তাজা সাদিয়া আক্তার (01410-764581)",
        meetLink: "https://meet.google.com/tot-fajr-women-014",
        whatsappGroup: "https://chat.whatsapp.com/tot-fajr-women-batch014",
        whatsappDisplay: "Fajr TOT (Sisters Only) Private Hub",
        accentColor: "from-emerald-600 to-teal-700",
        tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(trackInfo.orientationDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [trackInfo.orientationDateStr]);

  const copyMeetLink = () => {
    navigator.clipboard.writeText(trackInfo.meetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleModule = (id) => {
    setCompletedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Modules list
  const modules = [
    { id: 1, title: "মডিউল ১: আল-কুরআন শিক্ষকতার সম্মান ও নিয়ত শুদ্ধিকরণ", duration: "১ম সপ্তাহ", completed: true, docs: 3 },
    { id: 2, title: "মডিউল ২: মাখরাজ ও সিফাত নির্ভুল উচ্চারণ মেথডোলজি", duration: "১ম সপ্তাহ", completed: false, docs: 4 },
    { id: 3, title: "মডিউল ৩: নূরানী ও কায়দা পড়ানোর আধুনিক সাইকোলজি ও টেকনিক", duration: "২য় সপ্তাহ", completed: false, docs: 5 },
    { id: 4, title: "মডিউল ৪: বাচ্চাদের তাজবীদ শেখানোর সহজ ফর্মুলা", duration: "২য় সপ্তাহ", completed: false, docs: 2 },
    { id: 5, title: "মডিউল ৫: অ্যাডাল্ট লার্নার (বয়স্ক) কুরআন শিক্ষাদান পদ্ধতি", duration: "৩য় সপ্তাহ", completed: false, docs: 3 },
    { id: 6, title: "মডিউল ৬: অনলাইন ক্লাস ম্যানেজমেন্ট (Zoom/Meet ও ডিজিটাল পেন)", duration: "৩য় সপ্তাহ", completed: false, docs: 4 },
    { id: 7, title: "মডিউল ৭: স্টুডেন্ট রিটেনশন ও ক্লাসরুম সাইকোলজি", duration: "৪র্থ সপ্তাহ", completed: false, docs: 2 },
    { id: 8, title: "মডিউল ৮: স্মার্ট লেসন প্ল্যানিং ও উইকলি অ্যাসেসমেন্ট শিট", duration: "৪র্থ সপ্তাহ", completed: false, docs: 4 },
    { id: 9, title: "মডিউল ৯: মাইক্রো-টিচিং প্র্যাকটিকাম ও ওয়ান-টু-ওয়ান ফিডব্যাক", duration: "৫ম সপ্তাহ", completed: false, docs: 3 },
    { id: 10, title: "মডিউল ১০: ফাইনাল পরীক্ষা, সার্টিফিকেশন ও ফজর টিচার অনবোর্ডিং", duration: "৬ষ্ঠ সপ্তাহ", completed: false, docs: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Newly Enrolled Welcome Alert */}
      {isNewlyEnrolled && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-xl animate-fadeIn">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-emerald-200">
              🎉 অভিনন্দন! আপনার রেজিস্ট্রেশন ও ১,০০০ টাকা পেমেন্ট নিশ্চিত হয়েছে
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              আপনার টিচার আইডি এবং কোর্স এক্সেস সক্রিয় করা হয়েছে। নিচের লাইভ ক্লাস লিঙ্কে ক্লিক করে হোয়াটসঅ্যাপ গ্রুপে যুক্ত হয়ে নিন।
            </p>
          </div>
        </div>
      )}

      {/* Trainee Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-300">
              {trainee.fullName ? trainee.fullName[0].toUpperCase() : "T"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  {trainee.fullName}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${trackInfo.tagColor}`}>
                  {trackInfo.badge}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED TRAINEE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-3">
                <span><strong>ID:</strong> {trainee.tranId.replace("TOT-PAID-", "TOT-TR-")}</span>
                <span>•</span>
                <span><strong>Email:</strong> {trainee.email}</span>
                <span>•</span>
                <span><strong>Phone:</strong> {trainee.phone}</span>
              </p>
            </div>
          </div>

          {/* Track Switcher & Quick Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTrack("TOT-MEN")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isMen ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                👨 MEN Track
              </button>
              <button
                onClick={() => setActiveTrack("TOT-WOMEN-014")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  !isMen ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "text-slate-400 hover:text-white"
                }`}
              >
                🧕 WOMEN Track
              </button>
            </div>

            <button
              onClick={() => setActiveTab("idcard")}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-4 h-4" /> আইডি কার্ড ভিউ
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "overview", label: "লাইভ হাব ও ওভারভিউ", icon: Layers },
          { id: "curriculum", label: "কোর্স কারিকুলাম ও মডিউলস", icon: BookOpen },
          { id: "idcard", label: "ট্রেইনি আইডি কার্ড", icon: CreditCard },
          { id: "materials", label: "বুকস ও স্টাডি শিটস", icon: FileText },
          { id: "receipt", label: "ইনভয়েস ও ট্রানজেকশন", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Hero Live Orientation Countdown Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  গ্র্যান্ড ওরিয়েন্টেশন লাইভ ক্লাস
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {trackInfo.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  তারিখ: <strong className="text-amber-400">{trackInfo.orientationDisplay}</strong> • সময়:{" "}
                  <strong className="text-amber-400">{trackInfo.orientationTime}</strong>
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                  <span>প্রধান ট্রেইনার: <strong className="text-slate-200">{trackInfo.instructor}</strong></span>
                  <span>•</span>
                  <span>সমন্বয়ক: <strong className="text-slate-200">{trackInfo.coordinator}</strong></span>
                </div>
              </div>

              {/* Countdown Clocks */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-3 text-center">
                {[
                  { label: "দিন", value: timeLeft.days },
                  { label: "ঘণ্টা", value: timeLeft.hours },
                  { label: "মিনিট", value: timeLeft.minutes },
                  { label: "সেকেন্ড", value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-2 sm:px-4 sm:py-3 rounded-xl min-w-[55px] sm:min-w-[65px]">
                    <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3.5">
              <a
                href={trackInfo.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Video className="w-4 h-4" /> লাইভ ক্লাসরুমে প্রবেশ করুন
              </a>

              <a
                href={trackInfo.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" /> অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ
              </a>

              <button
                onClick={copyMeetLink}
                className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? "কপি করা হয়েছে!" : "ক্লাস লিঙ্ক কপি"}
              </button>
            </div>
          </div>

          {/* 3 Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Routine */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">সাপ্তাহিক ক্লাস রুটিন</h3>
                  <p className="text-[11px] text-slate-400">অনলাইন লাইভ সেশন</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                সপ্তাহে ৩ দিন: <strong className="text-blue-300">{trackInfo.days}</strong>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>মোট ক্লাস: ১৮টি লাইভ সেশন</span>
                <span className="text-emerald-400 font-bold">Zoom / Meet</span>
              </div>
            </div>

            {/* Card 2: Curriculum Progress */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">কারিকুলাম অগ্রগতি</h3>
                  <p className="text-[11px] text-slate-400">১০টি মূল মডিউল</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>সম্পূর্ণ: {completedModules.length}/১০ মডিউল</span>
                  <span className="text-amber-400">{Math.round((completedModules.length / 10) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${(completedModules.length / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between items-center">
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  মডিউলগুলো দেখুন <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 3: Certification */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">অফিসিয়াল সার্টিফিকেশন</h3>
                  <p className="text-[11px] text-slate-400">ফজর একাডেমি ট্রেইন্ড টিচার</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                কোর্স সমাপনী ও অ্যাসেসমেন্ট সম্পন্ন হলে ভেরিফায়েড কিউআর কোডসহ সার্টিফিকেট প্রদান করা হবে।
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex justify-between items-center text-slate-400">
                <span>স্ট্যাটাস: <strong className="text-amber-400">ইন-প্রগ্রেস</strong></span>
                <span className="text-emerald-400 font-bold">কোর্সের পর</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Curriculum */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              ট্রেইনিং অব ট্রেইনার্স (TOT) পূর্ণাঙ্গ কারিকুলাম ও মডিউলসমূহ
            </h2>
            <span className="text-xs text-slate-400">
              চেকবক্সে ক্লিক করে প্রগ্রেস ট্র্যাক করুন
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((mod) => {
              const isDone = completedModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isDone
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isDone
                          ? "bg-emerald-500 border-emerald-400 text-slate-950"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4 font-black" />}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">{mod.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        সময়কাল: {mod.duration} • রিসোর্স ম্যাটেরিয়াল: {mod.docs} টি ফাইল
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                      {isDone ? "সম্পন্ন" : "বাকি আছে"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ID Card */}
      {activeTab === "idcard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                অফিসিয়াল ডিজিটাল ট্রেইনি আইডি কার্ড
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ফজর একাডেমি ট্রেইনার ট্রেইনিং প্রোগ্রামের অফিসিয়াল শনাক্তকরণ কার্ড
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> কার্ড প্রিন্ট / সেভ করুন
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
            <OfficialIDCard
              profile={{
                fullName: trainee.fullName,
                designation: isMen ? "TOT TRAINEE (MEN)" : "TOT TRAINEE (WOMEN)",
                teacherId: trainee.tranId.replace("TOT-PAID-", "TOT-TR-"),
                bloodGroup: "B+",
                department: "Teacher Training Division",
                role: "Trainee Teacher",
                gender: trainee.gender,
              }}
            />

            <div className="max-w-sm space-y-4 text-xs text-slate-300">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> ভেরিফিকেশন তথ্য
                </h4>
                <p><strong>আইডি নম্বর:</strong> {trainee.tranId.replace("TOT-PAID-", "TOT-TR-")}</p>
                <p><strong>ট্র্যাক:</strong> {trackInfo.name}</p>
                <p><strong>ইস্যুকারী:</strong> ফজর একাডেমি টিচার্স ট্রেনিং বোর্ড</p>
                <p><strong>বৈধতা:</strong> ২০২৬ শিক্ষাবর্ষ</p>
              </div>

              <p className="text-slate-400 leading-relaxed">
                এই ডিজিটাল কার্ডটি ফজর একাডেমি লাইভ ক্লাস, মক টেস্ট এবং ট্রেইনার কমিউনিটিতে আপনার অফিসিয়াল পরিচয়পত্র হিসেবে গণ্য হবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Materials */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            কোর্স স্টাডি শিটস, লেসন প্ল্যান ও সহায়ক বই
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "ফজর একাডেমি তাজবীদ ও মাখরাজ গাইড (PDF)",
                size: "4.2 MB",
                category: "কুরআন শিক্ষা",
                link: "#",
              },
              {
                title: "নূরানী কায়দা টিচিং পেডাগজি শিট",
                size: "2.8 MB",
                category: "টিচিং মেথড",
                link: "#",
              },
              {
                title: "ডিজিটাল ক্লাসরুম ও জুম টিচিং হ্যান্ডবুক",
                size: "1.9 MB",
                category: "অনলাইন স্কিলস",
                link: "#",
              },
              {
                title: "স্মার্ট লেসন প্ল্যানিং টেমপ্লেট (Docx)",
                size: "850 KB",
                category: "লেসন প্ল্যান",
                link: "#",
              },
              {
                title: "স্টুডেন্ট সাইকোলজি ও মোটিভেশন গাইড",
                size: "3.1 MB",
                category: "সাইকোলজি",
                link: "#",
              },
              {
                title: "ফাইনাল মাইক্রো-টিচিং ইভালুয়েশন রুব্রিক",
                size: "1.2 MB",
                category: "অ্যাসেসমেন্ট",
                link: "#",
              },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400">
                    {doc.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-2 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">ফাইল সাইজ: {doc.size}</p>
                </div>

                <a
                  href={doc.link}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড করুন
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Receipt */}
      {activeTab === "receipt" && (
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            অফিসিয়াল পেমেন্ট রিসিপ্ট ও ভেরিফিকেশন
          </h2>

          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                  FAJR ACADEMY INVOICE
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">টাকা প্রাপ্তি রসিদ</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                ✓ পরিশোধিত (PAID)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">ট্রেইনির নাম:</p>
                <p className="font-bold text-white mt-0.5">{trainee.fullName}</p>
              </div>
              <div>
                <p className="text-slate-400">মোবাইল নম্বর:</p>
                <p className="font-bold text-white mt-0.5">{trainee.phone}</p>
              </div>
              <div>
                <p className="text-slate-400">ট্রানজেকশন আইডি:</p>
                <p className="font-mono font-bold text-amber-400 mt-0.5">{trainee.tranId}</p>
              </div>
              <div>
                <p className="text-slate-400">পেমেন্ট গেটওয়ে:</p>
                <p className="font-bold text-white mt-0.5">SSLCommerz 256-Bit</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>টিচার্স ট্রেনিং (TOT) ফুল কোর্স ফি:</span>
                <span>৳ ১,০০০</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>লজিস্টিকস ও ডিজিটাল রিসোর্স ফি:</span>
                <span className="text-emerald-400">ফ্রি (স্কলারশিপ)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                <span>মোট পরিশোধিত:</span>
                <span className="text-amber-400">৳ ১,০০০ BDT</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" /> ইনভয়েস প্রিন্ট / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
