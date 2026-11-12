'use client';

import { useMemo, useState } from "react";
import { BookOpen, Search, SearchX } from "lucide-react";
import MaterialCard from "../_shared/MaterialCard";
import PaymentRequiredCard from "../_shared/PaymentRequiredCard";
import { toBn } from "../_shared/format";

/** Study materials of the trainee's enrolled course(s) only. */
export default function MaterialsClient({ materials = [], courses = [], paid = false, primaryCourseId = "", lastAttempt = null }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  // Categories that actually exist in this trainee's materials.
  const categories = useMemo(
    () => [...new Set(materials.map((m) => m.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "bn")),
    [materials]
  );

  const term = search.trim().toLowerCase();
  const filtered = materials.filter((m) => {
    const matchesSearch =
      !term ||
      [m.title, m.desc, m.category, m.courseName].some((v) => String(v || "").toLowerCase().includes(term));
    const matchesCategory = categoryFilter === "all" || m.category === categoryFilter;
    const matchesCourse = courseFilter === "all" || m.courseId === courseFilter;
    return matchesSearch && matchesCategory && matchesCourse;
  });

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setCourseFilter("all");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">স্টাডি বুকস ও হ্যান্ডআউট</h1>
            {paid && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C59B27]/20 text-[#D4AF37] border border-[#C59B27]/30 whitespace-nowrap">
                {toBn(filtered.length)}টি ফাইল
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">আপনার এনরোল করা কোর্সের অনুমোদিত স্টাডি শিট, ম্যানুয়াল ও লেসন প্ল্যান</p>
        </div>
      </div>

      {!paid ? (
        <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} />
      ) : materials.length === 0 ? (
        <div className="py-16 rounded-3xl bg-[#081A3A]/60 border border-[#C59B27]/20 text-center text-slate-400 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">এখনো কোনো স্টাডি ম্যাটেরিয়াল প্রকাশ করা হয়নি</p>
          <p className="text-xs">ইনস্ট্রাক্টর ম্যাটেরিয়াল যুক্ত করলেই এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-[#081A3A]/90 border border-[#C59B27]/30 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="বইয়ের নাম বা ক্যাটাগরি দিয়ে সার্চ করুন..."
                aria-label="ম্যাটেরিয়াল সার্চ"
                className="w-full bg-[#051329] border border-[#C59B27]/30 rounded-xl px-4 py-2 pl-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
              />
              <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {courses.length > 1 && (
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                aria-label="কোর্স ফিল্টার"
                className="bg-[#051329] border border-[#C59B27]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">সকল কোর্স</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="ক্যাটাগরি ফিল্টার"
              className="bg-[#051329] border border-[#C59B27]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <SearchX className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">আপনার খোঁজের সাথে মিলে এমন কোনো ফাইল পাওয়া যায়নি।</p>
              <button type="button" onClick={resetFilters} className="text-xs font-bold text-[#D4AF37] hover:underline">
                ফিল্টার মুছে ফেলুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <MaterialCard key={item.key} item={item} showCourse={courses.length > 1} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
