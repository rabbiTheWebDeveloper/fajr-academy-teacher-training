'use client';

import React, { useState, useRef } from "react";
import { Upload, X, Camera, Loader2, CheckCircle2, AlertCircle, Cloud, RefreshCw } from "lucide-react";

export default function CloudinaryImageUpload({
  value = "",
  onChange,
  label = "ইনস্ট্রাক্টরের ছবি (Cloudinary Photo)",
  isLight = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP ইত্যাদি) নির্বাচন করুন।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("ছবির সাইজ সর্বোচ্চ 5MB হতে পারে।");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.message || "ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err) {
      setError("সার্ভার ত্রুটি: ছবি আপলোড করা যায়নি।");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold">
          {label}
        </label>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
          <Cloud className="w-3 h-3" /> Cloudinary CDN
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div
          className={`relative rounded-2xl border p-3 flex items-center gap-4 transition-all ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
          }`}
        >
          {/* Avatar Preview */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 bg-slate-900 shadow-md">
            <img
              src={value}
              alt="Instructor Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">ছবি সফলভাবে সংযুক্ত</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-[220px]">
              {value}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${uploading ? "animate-spin" : ""}`} />
                পরিবর্তন
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-3 h-3" />
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-amber-500 bg-amber-500/10 scale-[0.99]"
              : isLight
              ? "border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 bg-slate-50"
              : "border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 bg-slate-950"
          }`}
        >
          {uploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              <span className="text-xs font-bold text-amber-500">
                Cloudinary-তে ছবি আপলোড হচ্ছে...
              </span>
              <span className="text-[10px] text-slate-400">অনুগ্রহ করে অপেক্ষা করুন</span>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-0.5">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">
                ক্লিক করে ছবি নির্বাচন করুন বা ড্র্যাগ করে ছাড়ুন
              </span>
              <span className="text-[11px] text-slate-400">
                JPG, PNG বা WEBP (সর্বোচ্চ 5MB) • Cloudinary আপলোড
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
