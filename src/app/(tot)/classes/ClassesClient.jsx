'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Copy,
  Check,
  Radio,
  Bell,
  HelpCircle
} from "lucide-react";

export default function ClassesClient({ initialCourses = [], notices = [] }) {
  const [copiedLink, setCopiedLink] = useState(null);

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const defaultClasses = [
    {
      courseId: "TOT-MEN",
      batch: "TRAINING OF TRAINERS (TOT) — MEN",
      subBatch: "BATCH 013",
      orientation: "২০ আগস্ট ২০২৬ (বৃহস্পতিবার, রাত ৮:০০ টা)",
      schedule: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ ও কাজী সাখাওয়াত হোসেন",
      meetUrl: "https://meet.google.com/tot-fajr-men-2026",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-men-batch",
      badgeColor: "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40",
    },
    {
      courseId: "TOT-WOMEN-014",
      batch: "TOT FOR WOMEN",
      subBatch: "BATCH 014",
      orientation: "২৩ আগস্ট ২০২৬ (রবিবার, রাত ৮:০০ টা)",
      schedule: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ - ৯:৩০ টা)",
      trainer: "উস্তাজা ফারহানা চৌধুরী ও সিনিয়র ফিমেল ফ্যাকাল্টি",
      meetUrl: "https://meet.google.com/tot-fajr-women-014",
      whatsappUrl: "https://chat.whatsapp.com/tot-fajr-women-batch014",
      badgeColor: "bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40",
    },
  ];

  const classes = defaultClasses.map((def) => {
    const matched = initialCourses.find(
      (c) => c.courseId === def.courseId || (def.courseId === "TOT-MEN" && c.track === "men")
    );
    return {
      ...def,
      orientation: matched?.orientationDate
        ? `${matched.orientationDate} (${matched.orientationTime || "রাত ৮:০০ টা"})`
        : def.orientation,
      schedule: matched?.routine || def.schedule,
      meetUrl: matched?.meetLink || def.meetUrl,
      whatsappUrl: matched?.whatsappLink || def.whatsappUrl,
      trainer: matched?.instructor || def.trainer,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              লাইভ ক্লাসরুম ও ব্যাচ শিডিউল
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
              <Radio className="w-3 h-3 text-rose-400" /> LIVE PORTAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            আপনার নির্ধারিত ব্যাচ অনুযায়ী সরাসরি গুগল মিট বা জুম লাইভ সেশনে যুক্ত হোন
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> OFFICIAL TOT LIVE ROOM
        </span>
      </div>

      {/* Live Notices Feed */}
      {notices && notices.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#081A3A]/90 border border-[#C59B27]/40 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#C59B27]/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D4AF37] animate-bounce" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                ইনস্ট্রাক্টরের লাইভ ক্লাস সংক্রান্ত নোটিশ:
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C59B27]/20 text-[#D4AF37]">
              LIVE UPDATES
            </span>
          </div>

          <div className="space-y-2">
            {notices.map((n) => (
              <div
                key={n._id}
                className="p-3 rounded-2xl bg-[#051329] border border-slate-800/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-[#D4AF37] block">{n.title}</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{n.content}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                  {n.instructorName} • {n.createdAt ? new Date(n.createdAt).toLocaleDateString("bn-BD") : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Batch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((c) => (
          <div
            key={c.courseId}
            className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-[#C59B27]/70 transition-all shadow-2xl relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${c.badgeColor}`}>
                  {c.batch}
                </span>
                <span className="text-[10px] font-bold text-[#D4AF37] border border-[#C59B27]/30 px-2 py-0.5 rounded-md">
                  {c.subBatch}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">ওরিয়েন্টেশন:</strong>
                    <span>{c.orientation}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">ক্লাস শিডিউল:</strong>
                    <span>{c.schedule}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">সেশন ট্রেইনার:</strong>
                    <span>{c.trainer}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#C59B27]/20">
              <a
                href={c.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C59B27]/25 border border-[#FDFBF7]/30 transition-all"
              >
                <Video className="w-4 h-4" /> সরাসরি লাইভ ক্লাসে প্রবেশ করুন
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(c.meetUrl, c.courseId)}
                  className="flex-1 py-2.5 rounded-xl bg-[#081A3A] hover:bg-[#0B2545] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#C59B27]/30"
                >
                  {copiedLink === c.courseId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  )}
                  {copiedLink === c.courseId ? "লিঙ্ক কপি হয়েছে!" : "মিট লিঙ্ক কপি"}
                </button>

                <a
                  href={c.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-[#051329] hover:bg-[#0B2545] text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp গ্রুপ
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Card */}
      <div className="bg-[#081A3A]/80 border border-[#C59B27]/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">লাইভ ক্লাসে অংশগ্রহণের প্রমিত নিয়মাবলী:</h3>
        </div>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li>ক্লাস শুরুর অন্তত ৫ মিনিট পূর্বে Google Meet লিঙ্কে প্রবেশ করুন।</li>
          <li>নাম্বার বা ডিভাইসের নামের পরিবর্তে আপনার রেজিস্ট্রেশনকৃত পূর্ণ নাম দিয়ে যুক্ত হোন।</li>
          <li>মাইক্রো-টিচিং অনুশীলনের সময় ক্যামেরা অন রাখা এবং তাজবীদ ড্রিলস সক্রিয়ভাবে অনুসরণ করা বাধ্যতামূলক।</li>
          <li>কোনো সেশন মিস হলে ২৪ ঘণ্টার মধ্যে রেকর্ডেড লেকচার ও প্র্যাকটিস শিট দেখে প্রস্তুতি সম্পন্ন করুন।</li>
        </ul>
      </div>
    </div>
  );
}
