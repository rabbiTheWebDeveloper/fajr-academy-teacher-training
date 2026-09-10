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
  AlertCircle,
  Receipt,
  LogOut,
  Printer,
  Globe,
  Phone,
  GraduationCap,
} from "lucide-react";
import { OfficialIDCard } from "@/components/TeacherOfficialIDCard";
import TOTLogoutButton from "@/components/TOTLogoutButton";

export default function DashboardClient({ trainee, payments = [], isNewlyEnrolled }) {
  const [activeTrack, setActiveTrack] = useState(trainee.track || "TOT-MEN");
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [completedModules, setCompletedModules] = useState([1]);

  const isMen = activeTrack === "TOT-MEN" || activeTrack.toLowerCase().includes("men");

  // Official Poster Branded Information
  const trackInfo = isMen
    ? {
        name: "TRAINING OF TRAINERS (TOT) — Men",
        scriptTitle: "Men",
        batchBadge: "BATCH 013",
        sessionNum: "SESSION 01",
        sessionTitle: "THE QUR'ANIC TEACHER",
        sessionSubtitle: "Purpose, Mindset & the Art of Inspiring",
        sessionTheme:
          "“A Qur’anic teacher does not merely teach children to read and memorize the Qur’an. They nurture hearts, build confidence, inspire love and respect for the Qur’an, and help children develop a lifelong connection with it.”",
        trainerName: "Kazi Shakhawat Hossain",
        trainerRole: "Senior Operation Executive, Fajr Academy",
        trainerEdu1: "BA (Hons) in Qur'anic Sciences & Islamic Studies (IIUC)",
        trainerEdu2: "MA in Islamic Studies, Bangladesh Islami University (BIU)",
        orientationDateStr: "2026-08-20T20:00:00+06:00",
        orientationDisplay: "20 AUGUST 2026 (THURSDAY)",
        orientationTime: "8:00 PM",
        meetLink: "https://meet.google.com/tot-fajr-men-2026",
        whatsappGroup: "https://chat.whatsapp.com/tot-fajr-men-batch",
        helpline: "+880 1857-381244",
        tagline: "Better Teachers, Brighter Generations",
      }
    : {
        name: "TOT FOR WOMEN",
        scriptTitle: "Women",
        batchBadge: "FIRST BATCH",
        sessionNum: "SESSION 01",
        sessionTitle: "THE QUR'ANIC TEACHER",
        sessionSubtitle: "Purpose, Mindset & the Art of Inspiring",
        sessionTheme:
          "“A Qur’anic teacher does not merely teach children to read and memorize the Qur’an. They nurture hearts, build confidence, inspire love and respect for the Qur’an, and help children develop a lifelong connection with it.”",
        trainerName: "Kazi Shakhawat Hossain",
        trainerRole: "Senior Operation Executive, Fajr Academy",
        trainerEdu1: "BA (Hons) in Qur'anic Sciences & Islamic Studies (IIUC)",
        trainerEdu2: "MA in Islamic Studies, Bangladesh Islami University (BIU)",
        orientationDateStr: "2026-08-23T20:00:00+06:00",
        orientationDisplay: "23 AUGUST 2026 (SUNDAY)",
        orientationTime: "8:00 PM",
        meetLink: "https://meet.google.com/tot-fajr-women-014",
        whatsappGroup: "https://chat.whatsapp.com/tot-fajr-women-batch014",
        helpline: "+880 1857-381244",
        tagline: "Better Teachers, Brighter Generations",
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
        <div className="bg-gradient-to-r from-[#051329] via-[#0B2545] to-[#081A3A] border border-[#C59B27]/60 rounded-3xl p-4 sm:p-5 flex items-start gap-4 shadow-2xl animate-fadeIn">
          <div className="p-2.5 bg-[#C59B27]/20 text-[#D4AF37] rounded-2xl border border-[#C59B27]/40">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-[#D4AF37]">
              🎉 অভিনন্দন! আপনার রেজিস্ট্রেশন ও ১,০০০ টাকা কোর্স ফি নিশ্চিত হয়েছে
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              আপনার টিচার আইডি এবং কোর্স এক্সেস সক্রিয় করা হয়েছে। নিচের ওরিয়েন্টেশন ক্লাসে যোগ দিন এবং হোয়াটসঅ্যাপ গ্রুপে যুক্ত হয়ে নিন।
            </p>
          </div>
        </div>
      )}

      {/* Trainee Header Banner with Royal Brand Palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#134074]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#E5B842] text-[#051329] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-[#C59B27]/25 border-2 border-[#FDFBF7]/40">
              {trainee.fullName ? trainee.fullName[0].toUpperCase() : "T"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                  {trainee.fullName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40">
                  {trackInfo.batchBadge}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED TRAINEE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-3">
                <span><strong>ID:</strong> {trainee.tranId.replace("TOT-PAID-", "TOT-TR-")}</span>
                <span>•</span>
                <span><strong>Email:</strong> {trainee.email}</span>
                <span>•</span>
                <span><strong>Phone:</strong> {trainee.phone}</span>
              </p>
            </div>
          </div>

          {/* Track Switcher & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="bg-[#051329] p-1.5 rounded-2xl border border-[#C59B27]/30 flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTrack("TOT-MEN")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  isMen ? "bg-gradient-to-r from-[#C59B27] to-[#D4AF37] text-[#051329] shadow-md shadow-[#C59B27]/20" : "text-slate-400 hover:text-white"
                }`}
              >
                👨 MEN Track
              </button>
              <button
                onClick={() => setActiveTrack("TOT-WOMEN-014")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  !isMen ? "bg-gradient-to-r from-[#C59B27] to-[#D4AF37] text-[#051329] shadow-md shadow-[#C59B27]/20" : "text-slate-400 hover:text-white"
                }`}
              >
                🧕 WOMEN Track
              </button>
            </div>

            <Link
              href="/payments"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] border border-[#C59B27]/40 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Receipt className="w-4 h-4 text-[#D4AF37]" /> ইনভয়েস
            </Link>

            <button
              onClick={() => setActiveTab("idcard")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C59B27]/20 hover:bg-[#C59B27]/30 text-[#D4AF37] border border-[#C59B27]/40 flex items-center justify-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" /> আইডি কার্ড
            </button>

            <TOTLogoutButton variant="header" className="!py-2 !px-3" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#C59B27]/20 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "overview", label: "লাইভ সেশন হাব", icon: Layers },
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
                  ? "bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] text-[#051329] shadow-md shadow-[#C59B27]/20 border border-[#FDFBF7]/30"
                  : "text-slate-300 hover:text-white hover:bg-[#0B2545]/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Overview / Official Session Card */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Official Banner Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border-2 border-[#C59B27]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Top Session Tag & Batch */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1.5 rounded-full bg-[#081A3A] text-white text-xs font-black uppercase tracking-wider border border-[#C59B27]/40 shadow-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> {trackInfo.sessionNum}
                </span>
                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
                  {trackInfo.batchBadge}
                </span>
              </div>

              {/* Tagline */}
              <div className="text-xs italic font-serif text-[#D4AF37] tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                {trackInfo.tagline}
              </div>
            </div>

            {/* Session Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-serif">
                {trackInfo.sessionTitle} <span className="text-[#D4AF37]">:</span>
              </h2>
              <p className="text-base sm:text-xl font-bold text-[#D4AF37]">
                {trackInfo.sessionSubtitle}
              </p>
            </div>

            {/* Session Theme Box */}
            <div className="bg-[#051329]/80 border-l-4 border-[#C59B27] p-5 sm:p-6 rounded-r-2xl border-y border-r border-[#C59B27]/20 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded bg-[#C59B27]/20 text-[#D4AF37]">
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                </span>
                <span className="text-[11px] uppercase tracking-widest font-black text-[#D4AF37]">
                  SESSION THEME
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                {trackInfo.sessionTheme}
              </p>
            </div>

            {/* Session Trainer Card */}
            <div className="bg-[#051329] border border-[#C59B27]/35 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                {/* Trainer Avatar with Golden Ring */}
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#0B2545] to-[#134074] border-2 border-[#C59B27] p-0.5 shadow-lg flex items-center justify-center text-white font-bold text-2xl">
                    <UserCheck className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C59B27] text-[#051329] flex items-center justify-center text-[10px] font-black shadow">
                    ✓
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/30 text-[10px] font-bold">
                    <GraduationCap className="w-3 h-3 text-[#D4AF37]" /> SESSION TRAINER
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-serif">
                    {trackInfo.trainerName}
                  </h3>
                  <p className="text-xs text-[#D4AF37] font-semibold">
                    {trackInfo.trainerRole}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    • {trackInfo.trainerEdu1}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    • {trackInfo.trainerEdu2}
                  </p>
                </div>
              </div>

              {/* Date & Time Pill Box */}
              <div className="bg-[#081A3A] border border-[#C59B27]/30 rounded-2xl p-4 flex flex-col sm:items-end justify-center min-w-[200px] text-left sm:text-right space-y-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3 h-3 text-[#D4AF37]" /> SESSION DATE
                  </div>
                  <div className="text-sm font-black text-white font-mono">
                    {trackInfo.orientationDisplay}
                  </div>
                </div>

                <div className="border-t border-[#C59B27]/20 pt-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center sm:justify-end gap-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" /> TIME
                  </div>
                  <div className="text-sm font-black text-[#D4AF37] font-mono">
                    {trackInfo.orientationTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Clocks */}
            <div className="bg-[#051329]/90 border border-[#C59B27]/25 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#D4AF37] animate-pulse" /> লাইভ ক্লাস শুরুর সময় গণনা:
              </div>

              <div className="flex items-center gap-2.5 text-center">
                {[
                  { label: "দিন", value: timeLeft.days },
                  { label: "ঘণ্টা", value: timeLeft.hours },
                  { label: "মিনিট", value: timeLeft.minutes },
                  { label: "সেকেন্ড", value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#081A3A] border border-[#C59B27]/30 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl min-w-[55px] sm:min-w-[65px]">
                    <div className="text-lg sm:text-xl font-black text-[#D4AF37] font-mono">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#C59B27]/25 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={trackInfo.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#C59B27]/30 transition-all transform hover:-translate-y-0.5 border border-[#FDFBF7]/30"
                >
                  <Video className="w-4 h-4" /> লাইভ ক্লাসরুমে প্রবেশ করুন
                </a>

                <a
                  href={trackInfo.whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#C59B27]/40 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#D4AF37]" /> অফিসিয়াল হোয়াটসঅ্যাপ গ্রুপ
                </a>

                <button
                  onClick={copyMeetLink}
                  className="px-4 py-3.5 rounded-xl bg-[#051329] hover:bg-[#081A3A] text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-[#C59B27]/25"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? "কপি হয়েছে!" : "মিট লিংক কপি"}
                </button>
              </div>

              {/* Bottom Official Link Bar */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[#D4AF37]">
                  <Globe className="w-3.5 h-3.5" /> www.fajracademy.io
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> {trackInfo.helpline}
                </span>
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
              ১০টি কমপ্লিট মডিউল ও প্র্যাকটিকাম সিলেবাস
            </h2>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
              ৬ সপ্তাহের কমপ্লিট পেডাগজি কোর্স
            </span>
          </div>

          <div className="space-y-3">
            {modules.map((m) => {
              const isDone = completedModules.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDone
                      ? "bg-[#051329] border-[#C59B27]/40 shadow-md"
                      : "bg-[#081A3A]/70 border-[#C59B27]/20 hover:border-[#C59B27]/40"
                  }`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleModule(m.id)}
                        className={`mt-0.5 sm:mt-0 p-1 rounded-lg transition-colors ${
                          isDone ? "text-[#D4AF37]" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {m.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>সময়কাল: {m.duration}</span>
                          <span>•</span>
                          <span>স্টাডি রিসোর্স: {m.docs}টি ফাইল</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isDone ? "সম্পন্ন" : "আসন্ন"}
                    </span>
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" /> আপনার অফিসিয়াল টিচার্স ট্রেনিং আইডি কার্ড
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ফজর একাডেমি ট্রেনিং বোর্ডের অনুমোদিত ডিজিটাল ট্রেইনি পরিচিতিপত্র
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-2 shadow-md transition-all border border-[#FDFBF7]/30"
            >
              <Download className="w-4 h-4" /> কার্ড প্রিন্ট / সেভ করুন
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
            <OfficialIDCard
              profile={{
                fullName: trainee.fullName,
                designation: isMen ? "TOT TRAINEE (MEN - BATCH 013)" : "TOT TRAINEE (WOMEN - BATCH 014)",
                teacherId: trainee.tranId.replace("TOT-PAID-", "TOT-TR-"),
                bloodGroup: "B+",
                department: "Teacher Training Division",
                role: "Trainee Teacher",
                gender: trainee.gender,
              }}
            />

            <div className="max-w-sm space-y-4 text-xs text-slate-300">
              <div className="bg-[#051329] border border-[#C59B27]/30 p-4 rounded-2xl space-y-2 shadow-lg">
                <h4 className="font-bold text-[#D4AF37] flex items-center gap-1.5">
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
                className="bg-[#051329] border border-[#C59B27]/25 p-4 rounded-2xl hover:border-[#C59B27]/50 transition-all flex flex-col justify-between gap-3 shadow-lg"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/30">
                    {doc.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-2 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">ফাইল সাইজ: {doc.size}</p>
                </div>

                <a
                  href={doc.link}
                  className="w-full py-2 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#C59B27]/30"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড করুন
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Receipt / Payment History */}
      {activeTab === "receipt" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#D4AF37]" /> অফিসিয়াল পেমেন্ট রিসিপ্ট ও হিস্টোরি
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                আপনার কোর্স রেজিস্ট্রেশন ফি, ট্রানজেকশন বিবরণ ও ডাউনলোডযোগ্য মানি রিসিপ্ট
              </p>
            </div>

            <Link
              href="/payments"
              className="px-4 py-2 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] font-bold text-xs border border-[#C59B27]/40 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" /> ফুল পেমেন্ট পেজ খুলুন
            </Link>
          </div>

          {/* Quick Payment History Summary Table */}
          {payments.length > 0 && (
            <div className="bg-[#051329] border border-[#C59B27]/30 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" /> ট্রানজেকশন রেকর্ড তালিকা
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#081A3A] text-[10px] uppercase text-[#D4AF37] border-b border-[#C59B27]/20">
                    <tr>
                      <th className="py-2.5 px-4">ট্রানজেকশন আইডি</th>
                      <th className="py-2.5 px-4">গেটওয়ে / চ্যানেল</th>
                      <th className="py-2.5 px-4">পরিমাণ</th>
                      <th className="py-2.5 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C59B27]/15">
                    {payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-[#0B2545]/40">
                        <td className="py-3 px-4 font-mono font-bold text-[#D4AF37]">{p.tranId}</td>
                        <td className="py-3 px-4 text-slate-300">SSLCommerz ({p.cardType || "Direct"})</td>
                        <td className="py-3 px-4 font-bold text-[#D4AF37]">৳ {p.amount || 1000} BDT</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ {p.status || "VALID"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Printable Invoice Card */}
          <div className="max-w-2xl mx-auto bg-[#051329] border-2 border-[#C59B27]/35 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#E5B842] flex items-center justify-center text-[#051329] font-black text-xl shadow-lg border border-[#FDFBF7]/30">
                  ف
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#D4AF37] tracking-wider">
                    FAJR ACADEMY INVOICE
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5">টাকা প্রাপ্তি রসিদ</h3>
                </div>
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
                <p className="font-mono font-bold text-[#D4AF37] mt-0.5">{trainee.tranId}</p>
              </div>
              <div>
                <p className="text-slate-400">পেমেন্ট গেটওয়ে:</p>
                <p className="font-bold text-white mt-0.5">SSLCommerz 256-Bit Gateway</p>
              </div>
            </div>

            <div className="bg-[#081A3A] p-4 rounded-2xl border border-[#C59B27]/25 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{trackInfo.name} রেজিস্ট্রেশন ফি:</span>
                <span>৳ ১,০০০</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>লজিস্টিকস ও ডিজিটাল রিসোর্স ফি:</span>
                <span className="text-emerald-400">ফ্রি (স্কলারশিপ)</span>
              </div>
              <div className="border-t border-[#C59B27]/20 pt-2 flex justify-between font-bold text-white text-sm">
                <span>মোট পরিশোধিত:</span>
                <span className="text-[#D4AF37]">৳ ১,০০০ BDT</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                href="/payments"
                className="text-xs font-bold text-slate-300 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
              >
                <Receipt className="w-4 h-4 text-[#D4AF37]" /> সম্পূর্ণ ইনভয়েস পেজে যান →
              </Link>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-2 shadow-lg shadow-[#C59B27]/20 transition-all border border-[#FDFBF7]/30"
              >
                <Printer className="w-4 h-4" /> ইনভয়েস প্রিন্ট / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
