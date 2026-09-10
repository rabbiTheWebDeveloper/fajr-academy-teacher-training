'use client';

import React from "react";
import Link from "next/link";
import { OfficialIDCard } from "@/components/TeacherOfficialIDCard";
import { CreditCard, Download, ArrowLeft, ShieldCheck, Printer, Sparkles } from "lucide-react";

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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
        </Link>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> VERIFIED TRAINEE ID
        </span>
      </div>

      <div className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
            <Sparkles className="w-3.5 h-3.5" /> Better Teachers, Brighter Generations
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            অফিসিয়াল ডিজিটাল ট্রেইনি কার্ড
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
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
            <div className="bg-[#051329] p-5 rounded-2xl border border-[#C59B27]/30 space-y-3 shadow-lg">
              <h3 className="font-bold text-[#D4AF37] text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> কার্ডের বিশদ বিবরণ
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <p><strong>নাম:</strong> {user?.fullName || "Candidate Teacher"}</p>
                <p><strong>আইডি:</strong> {teacherId}</p>
                <p><strong>ট্র্যাক:</strong> {isMen ? "TOT – MEN BATCH 013" : "TOT – WOMEN (FIRST BATCH)"}</p>
                <p><strong>মেয়াদ:</strong> ২০২৬ শিক্ষাবর্ষ</p>
                <p><strong>ইস্যু অথরিটি:</strong> ফজর একাডেমি এডুকেশন বোর্ড</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C59B27]/25 transition-all cursor-pointer border border-[#FDFBF7]/30"
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
