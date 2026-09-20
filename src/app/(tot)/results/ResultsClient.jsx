'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Share2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  UserCheck,
  GraduationCap,
  FileText,
  BadgeCheck,
} from "lucide-react";

export default function ResultsClient({ trainee, evaluation }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const totalScore = evaluation?.totalScore || 0;
  const grade = evaluation?.grade || "N/A";
  const qualStatus = evaluation?.qualificationStatus || "certified";
  const scores = evaluation?.scores || {
    makhrajTajweed: 0,
    childPsychologyPedagogy: 0,
    digitalClassroomTools: 0,
    microTeachingDemo: 0,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "certified_and_hired":
        return {
          title: "ফজর একাডেমিতে শিক্ষক হিসেবে নির্বাচিত ও সার্টিফাইড",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
          message:
            "অভিনন্দন! আপনার অসাধারণ পারফরম্যান্স এবং শিক্ষণ দক্ষতার ভিত্তিতে ফজর একাডেমি শিক্ষক প্যানেলে সরাসরি নিয়োগ ও সার্টিফায়েড ট্রেইনার হিসেবে নির্বাচন করা হয়েছে।",
        };
      case "certified":
        return {
          title: "সফলভাবে উত্তীর্ণ ও সনদপ্রাপ্ত (Certified Trainer)",
          color: "bg-[#C59B27]/20 text-[#D4AF37] border-[#C59B27]/40",
          icon: <Award className="w-5 h-5 text-[#D4AF37]" />,
          message:
            "মাশাআল্লাহ! আপনি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সকল ক্রাইটেরিয়া সফলভাবে সম্পন্ন করে উত্তীর্ণ হয়েছেন।",
        };
      case "needs_improvement":
        return {
          title: "উন্নতি প্রয়োজন (Needs Practice)",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          message:
            "কোর্সে অংশগ্রহণ প্রশংসনীয়। নির্ধারিত বিষয়ে ইনস্ট্রাক্টরের পরামর্শ মোতাবেক আরও কিছু অনুশীলন সম্পন্ন করুন।",
        };
      default:
        return {
          title: "পুনরায় প্র্যাকটিস সুপারিশকৃত",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
          message:
            "লাইভ ডেমো ক্লাস ও পাঠদানে আরও উন্নতি প্রয়োজন। পরবর্তী ব্যাচে পুনরায় ডেমো দেওয়ার সুযোগ রয়েছে।",
        };
    }
  };

  const statusInfo = getStatusBadge(qualStatus);

  const rubricCriteria = [
    {
      id: "makhraj",
      name: "মাখরাজ ও তাজবীদ বিশুদ্ধতা",
      englishName: "Makhraj & Tajweed Precision",
      score: scores.makhrajTajweed || 0,
      max: 25,
      desc: "হরফের বিশুদ্ধ উচ্চারণ, মাদ্দ, গুন্নাহ্‌ এবং কিরাত উপস্থাপনার সঠিক নিয়মাবলি।",
      color: "from-amber-400 to-[#D4AF37]",
    },
    {
      id: "pedagogy",
      name: "শিশু মনোবিজ্ঞান ও শিক্ষাদান পদ্ধতি",
      englishName: "Child Psychology & Modern Pedagogy",
      score: scores.childPsychologyPedagogy || 0,
      max: 25,
      desc: "শিশুবান্ধব আনন্দময় ক্লাস পরিচালনা, ধৈর্যশীল আচরণ ও মোটিভেশনাল টেকনিক।",
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: "digital",
      name: "ডিজিটাল ক্লাসরুম ও সফটওয়্যার দক্ষতা",
      englishName: "Digital Classroom & Interactive Tools",
      score: scores.digitalClassroomTools || 0,
      max: 25,
      desc: "জুম/গুগল মিট, ডিজিটাল হোয়াইটবোর্ড ও অডিও-ভিজ্যুয়াল ফ্ল্যাশকার্ডের সাবলীল ব্যবহার।",
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "demo",
      name: "মাইক্রো-টিচিং লাইভ ডেমো ক্লাস",
      englishName: "Micro-Teaching Live Demo",
      score: scores.microTeachingDemo || 0,
      max: 25,
      desc: "বাস্তব ক্লাস সিমিউলেশনে পাঠদান, সময় ব্যবস্থাপনা ও আত্মবিশ্বাসী প্রেজেন্টেশন।",
      color: "from-purple-400 to-pink-500",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Printable CSS Hook */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #official-certificate-container,
          #official-certificate-container * {
            visibility: visible;
          }
          #official-certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #051329 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Breadcrumb / Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
            Fajr Academy • TOT Evaluation Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-[#D4AF37]" />
            কোর্স মূল্যায়ন ও ফলাফল
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {evaluation && (
            <>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:shadow-[#D4AF37]/20 transition-all hover:scale-105 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                সনদপত্র প্রিন্ট / PDF
              </button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#081A3A] border border-[#C59B27]/40 text-slate-200 hover:text-[#D4AF37] text-xs font-semibold transition-all"
              >
                <Share2 className="w-4 h-4" />
                {copied ? "লিংক কপি হয়েছে!" : "শেয়ার"}
              </button>
            </>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081A3A]/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            ড্যাশবোর্ড
          </Link>
        </div>
      </div>

      {/* Trainee Meta Bar */}
      <div className="bg-gradient-to-r from-[#081A3A] via-[#051329] to-[#081A3A] border border-[#C59B27]/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C59B27]/20 border border-[#C59B27]/40 flex items-center justify-center font-bold text-[#D4AF37] text-lg shadow-inner">
            {trainee?.fullName ? trainee.fullName.charAt(0) : "T"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {trainee?.fullName || "Candidate Teacher"}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                {trainee?.track || "TOT-MEN"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {trainee?.email || "teacher@fajracademy.io"} • ট্রেইনার আইডি:{" "}
              <span className="font-mono text-[#D4AF37] font-semibold">
                {trainee?.tranId || "TOT-TR-014"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">কোর্স স্ট্যাটাস</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> ৪ মডিউল সম্পন্ন
            </div>
          </div>
          <Link
            href="/id-card"
            className="px-3 py-1.5 rounded-lg bg-[#C59B27]/15 border border-[#C59B27]/30 text-xs text-[#D4AF37] hover:bg-[#C59B27]/25 font-semibold transition-colors"
          >
            ডিজিটাল আইডি কার্ড
          </Link>
        </div>
      </div>

      {evaluation ? (
        <>
          {/* Main Hero Results Showcase */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status Announcement Banner */}
            <div
              className={`flex items-start gap-3.5 p-4 rounded-2xl border mb-6 ${statusInfo.color}`}
            >
              <div className="mt-0.5">{statusInfo.icon}</div>
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-1">
                  {statusInfo.title}
                </h3>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {statusInfo.message}
                </p>
              </div>
            </div>

            {/* Score & Grade Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score Display Card */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  মোট অর্জিত স্কোর (Total Score)
                </span>
                <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#C59B27] py-2">
                  {totalScore}
                  <span className="text-xl sm:text-2xl text-slate-400 font-medium ml-1">
                    /100
                  </span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-2 overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-[#D4AF37] to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(totalScore, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>পাস মার্ক: ৬০</span>
                  <span className="text-[#D4AF37] font-semibold">
                    {totalScore >= 80 ? "এক্সিলেন্স লেভেল" : "উত্তীর্ণ"}
                  </span>
                </div>
              </div>

              {/* Grade Card */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-[#D4AF37]" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  ফাইনাল লেটার গ্রেড (Grade)
                </span>
                <div className="text-5xl sm:text-6xl font-black text-emerald-400 py-2">
                  {grade}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {grade === "A+"
                    ? "অসাধারণ ফলাফল (Outstanding)"
                    : grade === "A"
                    ? "চমৎকার পারফরম্যান্স (Excellent)"
                    : grade === "B"
                    ? "সন্তোষজনক পারফরম্যান্স (Good)"
                    : "উত্তীর্ণ"}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-3 bg-slate-800/60 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ভেরিফাইড সনদপত্র ইস্যু সম্পন্ন
                </div>
              </div>

              {/* Evaluator & Date Card */}
              <div className="bg-[#051329]/90 border border-[#C59B27]/30 rounded-2xl p-6 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                  <UserCheck className="w-4 h-4" /> মূল্যায়নকারী কর্মকর্তা
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {evaluation?.instructorName || "ফজর একাডেমি ফ্যাকাল্টি প্যানেল"}
                  </div>
                  <div className="text-xs text-slate-400">
                    চিফ ট্রেইনার ও তাজবীদ শিক্ষক পরীক্ষক
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>
                    মূল্যায়নের তারিখ:{" "}
                    <span className="text-slate-200 font-medium">
                      {evaluation?.evaluatedAt
                        ? new Date(evaluation.evaluatedAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "সম্প্রতি মূল্যায়িত"}
                    </span>
                  </div>
                  <div>
                    সার্টিফিকেট ট্র্যাকিং:{" "}
                    <span className="text-[#D4AF37] font-mono text-[11px]">
                      CERT-{evaluation?._id?.slice(-8).toUpperCase() || "2026-TOT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks Quote Box */}
            {evaluation?.remarks && (
              <div className="mt-6 bg-[#0B2545]/60 border border-[#C59B27]/25 rounded-2xl p-5 relative">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  ইনস্ট্রাক্টরের মূল্যায়ন মন্তব্য ও পর্যবেক্ষণ:
                </span>
                <p className="text-sm text-slate-200 italic leading-relaxed pl-3 border-l-2 border-[#D4AF37]">
                  &ldquo;{evaluation.remarks}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* 4 Rubric Breakdown Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  ৪-স্তরীয় মূল্যায়ন রুব্রিক স্কোরকার্ড (Rubric Breakdown)
                </h3>
                <p className="text-xs text-slate-400">
                  প্রতিটি মূল্যায়িত বিষয়ের পূর্ণমান ২৫, মোট ১০০ নম্বরের ফলাফল বিভাজন
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubricCriteria.map((item) => {
                const percentage = Math.round((item.score / item.max) * 100);
                return (
                  <div
                    key={item.id}
                    className="bg-[#051329] border border-slate-800 hover:border-[#C59B27]/40 rounded-2xl p-5 shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {item.englishName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#D4AF37]">
                          {item.score}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          /{item.max}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {item.desc}
                    </p>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>দক্ষতা মাত্রা</span>
                        <span className="font-semibold text-slate-200">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Royal Certificate Preview & Printable Section */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between no-print">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  অফিসিয়াল সনদপত্র (Official Digital Certificate)
                </h3>
                <p className="text-xs text-slate-400">
                  ফজর একাডেমি ট্রেইনার্স বোর্ডের ডিজিটাল ভেরিফাইড সনদপত্র। সরাসরি প্রিন্ট অথবা PDF সংরক্ষণ করতে পারেন।
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#D4AF37] hover:bg-[#C59B27]/30 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> প্রিন্ট / সেভ PDF
              </button>
            </div>

            {/* Certificate Canvas */}
            <div
              id="official-certificate-container"
              className="relative bg-gradient-to-b from-[#061938] via-[#081F44] to-[#041226] border-8 border-double border-[#D4AF37]/60 rounded-3xl p-6 sm:p-12 text-center text-white shadow-2xl overflow-hidden"
            >
              {/* Ornate Corner Accents */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]" />

              {/* Certificate Watermark / Ambient Glow */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                <Award className="w-96 h-96 text-[#D4AF37]" />
              </div>

              {/* Bismillah Header */}
              <div className="relative z-10 space-y-4">
                <div className="text-amber-300 font-serif text-base sm:text-lg tracking-wider">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] tracking-widest uppercase bg-[#C59B27]/15 px-4 py-1 rounded-full border border-[#C59B27]/30">
                    FAJR ACADEMY • TEACHER TRAINING DIVISION
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-300 font-serif">
                    CERTIFICATE OF EXCELLENCE
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-100/70 uppercase tracking-widest font-semibold">
                    ট্রেনিং অব ট্রেইনার্স (TOT) সনদপত্র
                  </p>
                </div>

                <div className="py-4">
                  <p className="text-xs sm:text-sm text-slate-300 italic mb-2">
                    This certificate is proudly awarded to
                  </p>
                  <div className="text-2xl sm:text-4xl font-black text-white font-serif tracking-wide border-b-2 border-[#D4AF37]/40 pb-2 inline-block px-8">
                    {trainee?.fullName || "Candidate Teacher"}
                  </div>
                  <p className="text-xs text-[#D4AF37] mt-2 font-mono">
                    Trainee ID: {trainee?.tranId || "TOT-TR-014"} • Track:{" "}
                    {trainee?.track || "TOT-MEN"}
                  </p>
                </div>

                <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  for successfully demonstrating mastery in{" "}
                  <strong className="text-[#D4AF37] font-semibold">
                    Tajweed Precision, Child Psychology & Modern Quranic Pedagogy, Digital Classroom Management, and Live Micro-Teaching
                  </strong>{" "}
                  under the Training of Trainers (TOT) curriculum, achieving Final Grade:{" "}
                  <strong className="text-emerald-400 font-bold">{grade}</strong> (Score:{" "}
                  <strong className="text-[#D4AF37] font-bold">{totalScore}/100</strong>).
                </p>

                {/* Signatures & Seal Grid */}
                <div className="pt-8 sm:pt-12 grid grid-cols-3 items-end gap-4 text-center">
                  {/* Lead Trainer Signature */}
                  <div className="space-y-1">
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-amber-200 text-sm border-b border-slate-500/50 pb-0.5 px-3">
                        {evaluation?.instructorName || "Faculty Lead"}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      প্রধান প্রশিক্ষক ও পরীক্ষক
                    </div>
                    <div className="text-[10px] text-slate-400">
                      TOT Examination Board
                    </div>
                  </div>

                  {/* Golden Verified Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-[#D4AF37] to-yellow-300 p-1 shadow-xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#051329] flex flex-col items-center justify-center text-center p-1 border border-amber-300/40">
                        <Award className="w-5 h-5 text-[#D4AF37] mb-0.5" />
                        <span className="text-[7px] font-black text-amber-200 uppercase tracking-tighter">
                          OFFICIAL SEAL
                        </span>
                        <span className="text-[6px] text-slate-300">
                          VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Director Signature */}
                  <div className="space-y-1">
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-amber-200 text-sm border-b border-slate-500/50 pb-0.5 px-3">
                        Engr. Abu Bakr
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      কোর্স ডিরেক্টর
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ফজর একাডেমি বাংলাদেশ
                    </div>
                  </div>
                </div>

                {/* Certificate Footer Verification Code */}
                <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                  <span>
                    Issue Date:{" "}
                    {evaluation?.evaluatedAt
                      ? new Date(evaluation.evaluatedAt).toLocaleDateString()
                      : "September 2026"}
                  </span>
                  <span className="font-mono text-[#D4AF37]">
                    Certificate No: FAJR-TOT-{evaluation?._id?.slice(-8).toUpperCase() || "2026-VAL"}
                  </span>
                  <span>fajracademy.io/verify</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Pending Evaluation Empty State */
        <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#D4AF37] shadow-xl">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D4AF37] bg-[#C59B27]/20 px-3 py-1 rounded-full border border-[#C59B27]/30 uppercase">
              Evaluation In Progress
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              আপনার চূড়ান্ত মূল্যায়ন ও সনদপত্র প্রস্তুত হচ্ছে
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              আপনি যদি ৪টি লাইভ ক্লাস এবং মাইক্রো-টিচিং ডেমো ক্লাস সম্পন্ন করে থাকেন, তবে ইনস্ট্রাক্টর প্যানেল আপনার পারফরম্যান্স মূল্যায়ন করছেন।
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left pt-4">
            <div className="bg-[#051329] p-4 rounded-xl border border-emerald-500/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" /> ধাপ ১: ক্লাস
              </div>
              <p className="text-[11px] text-slate-300">
                ৪টি অনলাইন লাইভ ট্রেনিং সেশন সম্পন্ন।
              </p>
            </div>

            <div className="bg-[#051329] p-4 rounded-xl border border-emerald-500/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" /> ধাপ ২: ডেমো
              </div>
              <p className="text-[11px] text-slate-300">
                মাইক্রো-টিচিং লাইভ ডেমো ক্লাস উপস্থাপন।
              </p>
            </div>

            <div className="bg-[#051329] p-4 rounded-xl border border-[#C59B27]/50 shadow-md">
              <div className="flex items-center gap-2 text-[#D4AF37] font-bold text-xs mb-1">
                <Clock className="w-4 h-4" /> ধাপ ৩: মার্কিং
              </div>
              <p className="text-[11px] text-slate-300">
                ৪টি রুব্রিকে ১০০ নম্বরের বিস্তারিত মূল্যায়ন।
              </p>
            </div>

            <div className="bg-[#051329] p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-1">
                <Award className="w-4 h-4" /> ধাপ ৪: সনদ
              </div>
              <p className="text-[11px] text-slate-400">
                ভেরিফাইড সনদপত্র প্রকাশ ও শিক্ষক নিয়োগ।
              </p>
            </div>
          </div>

          {/* Guidance on 4-Rubrics */}
          <div className="bg-[#051329]/80 border border-slate-800 rounded-2xl p-6 text-left max-w-2xl mx-auto space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              মূল্যায়ন যেভাবে করা হয় (১০০ নম্বর):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>মাখরাজ ও তাজবীদ বিশুদ্ধতা (২৫ নম্বর)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>শিশু মনোবিজ্ঞান ও পাঠদান পদ্ধতি (২৫ নম্বর)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>ডিজিটাল ক্লাসরুম ও টুলস দক্ষতা (২৫ নম্বর)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span>মাইক্রো-টিচিং লাইভ ডেমো ক্লাস (২৫ নম্বর)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#051329] font-bold text-xs shadow-lg hover:scale-105 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              লাইভ ক্লাসে যোগ দিন
            </Link>

            <Link
              href="/materials"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#081A3A] border border-[#C59B27]/40 text-slate-200 hover:text-[#D4AF37] font-semibold text-xs transition-colors"
            >
              কোর্স ম্যাটেরিয়াল পড়ুন
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
