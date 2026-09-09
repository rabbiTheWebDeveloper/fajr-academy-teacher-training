'use client';

import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Video,
  MessageCircle,
  Users,
  CheckCircle2,
  Save,
  Sparkles,
  ExternalLink,
  Edit
} from "lucide-react";

export default function AdminCoursesClient({ initialBatches }) {
  const [batches, setBatches] = useState(initialBatches);
  const [editingId, setEditingId] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateBatch = (id, field, value) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setEditingId(null);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            TOT কোর্স ব্যাচ ও সেশন শিডিউলার
          </h1>
          <p className="text-xs text-slate-400">
            পুরুষ ও মহিলা ব্যাচের ওরিয়েন্টেশন তারিখ, গুগল মিট লাইভ লিঙ্ক ও রুটিন ব্যবস্থাপনা
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> ব্যাচ সেটিংস সংরক্ষিত হয়েছে!
          </div>
        )}
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => {
          const isEditing = editingId === batch.id;
          const isMen = batch.id === "TOT-MEN";

          return (
            <div
              key={batch.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isMen
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {batch.tag}
                </span>

                <button
                  onClick={() => (isEditing ? handleSave() : setEditingId(batch.id))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-400" /> : <Edit className="w-3.5 h-3.5" />}
                  {isEditing ? "সংরক্ষণ করুন" : "এডিট করুন"}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Batch Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">ব্যাচের নাম</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={batch.name}
                      onChange={(e) => handleUpdateBatch(batch.id, "name", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  ) : (
                    <h3 className="text-base font-bold text-white">{batch.name}</h3>
                  )}
                </div>

                {/* Orientation Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">ওরিয়েন্টেশন তারিখ</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.orientationDate}
                        onChange={(e) => handleUpdateBatch(batch.id, "orientationDate", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    ) : (
                      <p className="font-bold text-amber-400">{batch.orientationDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">সময়</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.orientationTime}
                        onChange={(e) => handleUpdateBatch(batch.id, "orientationTime", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    ) : (
                      <p className="font-bold text-slate-200">{batch.orientationTime}</p>
                    )}
                  </div>
                </div>

                {/* Routine */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">সাপ্তাহিক ক্লাস দিনসমূহ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={batch.routine}
                      onChange={(e) => handleUpdateBatch(batch.id, "routine", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  ) : (
                    <p className="font-bold text-slate-200">{batch.routine}</p>
                  )}
                </div>

                {/* Google Meet Live Class Link */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">গুগল মিট / জুম লাইভ ক্লাসরুম লিঙ্ক</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={batch.meetLink}
                      onChange={(e) => handleUpdateBatch(batch.id, "meetLink", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  ) : (
                    <a
                      href={batch.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-mono flex items-center gap-1"
                    >
                      {batch.meetLink} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* WhatsApp Community Link */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">হোয়াটসঅ্যাপ কমিউনিটি গ্রুপ লিঙ্ক</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={batch.whatsappLink}
                      onChange={(e) => handleUpdateBatch(batch.id, "whatsappLink", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  ) : (
                    <a
                      href={batch.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-mono flex items-center gap-1"
                    >
                      {batch.whatsappLink} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
