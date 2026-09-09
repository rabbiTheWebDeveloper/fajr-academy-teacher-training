'use client';

import React from "react";
import Link from "next/link";
import { OfficialIDCard } from "@/components/TeacherOfficialIDCard";
import { CreditCard, Download, ArrowLeft, ShieldCheck, Printer } from "lucide-react";

export default function TraineeIDCardClient({ user, trackName, teacherId, isMen }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED TRAINEE ID
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            অফিসিয়াল ডিজিটাল ট্রেইনি কার্ড
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল ট্রেইনি পরিচিতিপত্র
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {/* Card Component */}
          <OfficialIDCard
            profile={{
              fullName: user?.fullName || "Candidate Teacher",
              designation: trackName,
              teacherId: teacherId,
              bloodGroup: "B+",
              department: "Teacher Training Division",
              role: "Trainee Teacher",
              gender: user?.gender || (isMen ? "male" : "female"),
            }}
          />

          {/* Verification and Print Details */}
          <div className="space-y-4 max-w-sm text-xs text-slate-300">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> কার্ডের বিশদ বিবরণ
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <p><strong>নাম:</strong> {user?.fullName || "Candidate Teacher"}</p>
                <p><strong>আইডি:</strong> {teacherId}</p>
                <p><strong>ট্র্যাক:</strong> {isMen ? "TOT – MEN BATCH" : "TOT – WOMEN (BATCH 014)"}</p>
                <p><strong>মেয়াদ:</strong> ২০২৬ শিক্ষাবর্ষ</p>
                <p><strong>ইস্যু অথরিটি:</strong> ফজর একাডেমি এডুকেশন বোর্ড</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট / সেভ করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
