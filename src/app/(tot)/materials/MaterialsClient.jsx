'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Video,
  Layers,
  ExternalLink
} from "lucide-react";

export default function MaterialsClient({ initialMaterials = [] }) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = materials.filter((m) => {
    const matchesSearch =
      (m.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.desc || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ? true : m.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
              কোর্স হ্যান্ডআউটস ও স্টাডি বুকস হাব
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/30">
              {filtered.length} ফাইলস
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সকল অনুমোদিত তাজবীদ ডায়াগ্রাম, পেডাগজি ম্যানুয়াল ও লেসন শিট
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/40 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> OFFICIAL TOT RESOURCES
        </span>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-[#081A3A]/90 border border-[#C59B27]/30 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="বইয়ের নাম বা ক্যাটাগরি দিয়ে সার্চ করুন..."
            className="w-full bg-[#051329] border border-[#C59B27]/30 rounded-xl px-4 py-2 pl-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#051329] border border-[#C59B27]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="all">সকল ক্যাটাগরি</option>
          <option value="কুরআন শিক্ষা ও তাজবীদ">কুরআন শিক্ষা ও তাজবীদ</option>
          <option value="টিচিং পেডাগজি">টিচিং পেডাগজি</option>
          <option value="লেসন প্ল্যান">লেসন প্ল্যান</option>
          <option value="ডিজিটাল স্কিলস">ডিজিটাল স্কিলস</option>
          <option value="লার্নার সাইকোলজি">লার্নার সাইকোলজি</option>
          <option value="সার্টিফিকেশন ও পরীক্ষা">সার্টিফিকেশন ও পরীক্ষা</option>
        </select>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">কোনো স্টাডি ফাইল পাওয়া যায়নি।</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.resourceId}
              className="bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/30 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-[#C59B27]/70 transition-all shadow-xl group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/30">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.format} • {item.size}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#C59B27]/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ফ্রি ডাউনলোড
                </span>

                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-1.5 transition-all shadow border border-[#FDFBF7]/30"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
