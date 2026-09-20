'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Radio,
  Calendar,
  Clock,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Mic,
  Monitor,
  Edit,
  Sparkles,
  Layers,
  AlertCircle
} from "lucide-react";

export default function LiveClient({ courses = [] }) {
  const [copiedLink, setCopiedLink] = useState(null);
  const [checklist, setChecklist] = useState({
    mic: true,
    camera: true,
    tablet: false,
    slides: true,
    audioShare: false,
  });

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const defaultBatches = [
    {
      courseId: "TOT-MEN",
      name: "TOT – MEN BATCH (পুরুষ ব্যাচ)",
      routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০ টা - ৯:৩০ টা)",
      orientation: "২০ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
      meetLink: "https://meet.google.com/tot-fajr-men-2026",
      whatsappLink: "https://chat.whatsapp.com/tot-fajr-men-batch",
      coTrainers: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ, মাওলানা তারিকুল ইসলাম",
      accent: "from-blue-600 to-indigo-700",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
      courseId: "TOT-WOMEN-014",
      name: "TOT – WOMEN BATCH 014 (মহিলা ব্যাচ)",
      routine: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০ টা - ৯:৩০ টা)",
      orientation: "২১ সেপ্টেম্বর ২০২৬ (রাত ৮:০০ টা)",
      meetLink: "https://meet.google.com/tot-fajr-women-014",
      whatsappLink: "https://chat.whatsapp.com/tot-fajr-women-batch014",
      coTrainers: "উস্তাজা ফারহানা চৌধুরী, উস্তাজা সাদিয়া আক্তার",
      accent: "from-emerald-600 to-teal-700",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  ];

  const batches = defaultBatches.map((def) => {
    const matched = courses.find((c) => c.courseId === def.courseId);
    return {
      ...def,
      meetLink: matched?.meetLink || def.meetLink,
      whatsappLink: matched?.whatsappLink || def.whatsappLink,
      routine: matched?.routine || def.routine,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              লাইভ ক্লাসরুম কন্ট্রোল হাব
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
              <Radio className="w-3 h-3 text-rose-400" /> LIVE HUB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            সরাসরি হোস্ট হিসেবে গুগল মিট শুরু করুন, স্টুডেন্ট লিঙ্ক কপি করুন এবং হোস্টিং প্রস্তুতি নিশ্চিত করুন
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> MASTER HOST CONSOLE
        </span>
      </div>

      {/* Batch Live Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map((b) => (
          <div
            key={b.courseId}
            className="bg-slate-900/95 border border-indigo-950/80 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between gap-6 hover:border-indigo-500/40 transition-all relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${b.badge}`}>
                  {b.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {b.courseId}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">ক্লাস শিডিউল:</strong>
                    <span>{b.routine}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">ওরিয়েন্টেশন:</strong>
                    <span>{b.orientation}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  কো-ট্রেইনার্স: {b.coTrainers}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-800">
              <a
                href={b.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Video className="w-4 h-4" /> হোস্ট হিসেবে লাইভ রুম ওপেন করুন
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(b.meetLink, b.courseId)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedLink === b.courseId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedLink === b.courseId ? "কপি সম্পন্ন!" : "মিট লিঙ্ক কপি"}
                </button>

                <a
                  href={b.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pre-Class Equipment Checklist Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            লাইভ ক্লাস শুরুর পূর্বে প্রি-ফ্লাইট চেকলিস্ট
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          ক্লাস ডেলিভারির মান নিশ্চিত করতে লাইভে প্রবেশের আগে প্রতিটি বিষয় চেক করে নিন:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "mic", label: "মাইক্রোফোন ও সাউন্ড কোয়ালিটি টেস্ট সম্পন্ন", icon: Mic },
            { key: "camera", label: "এইচডি ক্যামেরা ও পর্যাপ্ত ফ্রন্ট লাইটিং নিশ্চিত", icon: Video },
            { key: "tablet", label: "ডিজিটাল পেন ও ড্রয়িং প্যাড কানেক্টেড", icon: Edit },
            { key: "slides", label: "তাজবীদ স্লাইড ও লেসন শিট ওপেন রাখা হয়েছে", icon: Layers },
            { key: "audioShare", label: "কম্পিউটার অডিও শেয়ারিং টেস্ট করা হয়েছে", icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isChecked = checklist[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-3 text-xs transition-all ${
                  isChecked
                    ? "bg-indigo-950/30 border-indigo-500/40 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isChecked ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    isChecked
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
