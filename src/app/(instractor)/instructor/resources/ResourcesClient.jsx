'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderDown,
  FileText,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Video,
  FileSpreadsheet
} from "lucide-react";

export default function ResourcesClient({ initialResources = [] }) {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("কুরআন শিক্ষা ও তাজবীদ");
  const [format, setFormat] = useState("PDF");
  const [size, setSize] = useState("3.0 MB");
  const [fileUrl, setFileUrl] = useState("");
  const [desc, setDesc] = useState("");

  const filtered = resources.filter((r) => {
    const matchesSearch =
      (r.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.desc || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ? true : r.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle Add Resource
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/instructor/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          format,
          size,
          fileUrl,
          desc,
        }),
      });
      const data = await res.json();
      if (data.success && data.resource) {
        setResources([data.resource, ...resources]);
        setToastMsg("নতুন স্টাডি মেটেরিয়াল সফলভাবে যুক্ত হয়েছে!");
        setIsAddModalOpen(false);
        setTitle("");
        setFileUrl("");
        setDesc("");
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        alert(data.message || "রিসোর্স যোগ করতে ব্যর্থ হয়েছে");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে সমস্যা হয়েছে");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Resource
  const handleDeleteResource = async (resourceId) => {
    if (!confirm("আপনি কি নিশ্চিত এই রিসোর্সটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/instructor/resources?resourceId=${resourceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setResources(resources.filter((r) => r.resourceId !== resourceId));
        setToastMsg("রিসোর্স সফলভাবে মুছে ফেলা হয়েছে।");
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/instructor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> ড্যাশবোর্ডে ফিরে যান
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            স্টাডি রিসোর্স ও শিট ম্যানেজমেন্ট হাব
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            ট্রেইনি শিক্ষকদের জন্য রঙিন তাজবীদ গাইড, নূরানী পেডাগজি শিট ও লেসন প্ল্যানার
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> নতুন রিসোর্স যোগ করুন
        </button>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="রিসোর্সের নাম বা বিবরণ দিয়ে খুঁজুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
            <FolderDown className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">কোনো স্টাডি রিসোর্স পাওয়া যায়নি।</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.resourceId}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-4 hover:border-indigo-500/40 transition-all shadow-xl group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.format} • {item.size}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm leading-snug group-hover:text-indigo-200 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-white bg-slate-800 hover:bg-indigo-600 px-3.5 py-2 rounded-xl transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড / ড্রাইভ
                </a>

                <button
                  onClick={() => handleDeleteResource(item.resourceId)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">নতুন স্টাডি মেটেরিয়াল যুক্ত করুন</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">রিসোর্সের শিরোনাম:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: মাখরাজ ও সিফাত রঙিন চার্ট বুক..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ক্যাটাগরি:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="কুরআন শিক্ষা ও তাজবীদ">কুরআন শিক্ষা ও তাজবীদ</option>
                    <option value="টিচিং পেডাগজি">টিচিং পেডাগজি</option>
                    <option value="লেসন প্ল্যান">লেসন প্ল্যান</option>
                    <option value="ডিজিটাল স্কিলস">ডিজিটাল স্কিলস</option>
                    <option value="লার্নার সাইকোলজি">লার্নার সাইকোলজি</option>
                    <option value="সার্টিফিকেশন ও পরীক্ষা">সার্টিফিকেশন ও পরীক্ষা</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফরম্যাট:</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="PDF">PDF ডকুমেন্ট</option>
                    <option value="DOCX">Word (DOCX)</option>
                    <option value="SLIDES">PowerPoint Slides</option>
                    <option value="VIDEO">রেকর্ডেড ভিডিও</option>
                    <option value="DRIVE">Google Drive ফোল্ডার</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফাইল সাইজ:</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="যেমন: 3.5 MB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ফাইল ড্রাইভ লিঙ্ক:</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">সংক্ষিপ্ত বিবরণ:</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="এই মেটেরিয়ালটির বিষয়বস্তু ও ট্রেইনিদের জন্য নির্দেশনা..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-all"
                >
                  {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "যুক্ত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
