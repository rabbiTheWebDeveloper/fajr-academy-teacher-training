'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Star,
  Award,
  BookOpen,
  Calendar,
  MessageCircle,
  Clock,
  Check,
  AlertCircle,
  Save,
  RotateCcw,
  Camera,
  Cloud
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import CloudinaryImageUpload from "@/components/CloudinaryImageUpload";

export default function AdminInstructorsClient({ initialInstructors }) {
  const [instructors, setInstructors] = useState(initialInstructors || []);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [selectedInstructorForProfile, setSelectedInstructorForProfile] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const { isLight } = useAdminTheme();

  // Add form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "Senior Lead Master Trainer",
    specialization: "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ",
    track: "TOT-MEN",
    gender: "male",
    password: "Fajr@Instructor2026",
    experienceYears: 5,
    bio: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সিনিয়র প্রশিক্ষক।",
    avatar: "",
  });

  const notify = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  // Add Instructor
  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success && data.instructor) {
        setInstructors((prev) => [data.instructor, ...prev]);
        setShowAddModal(false);
        notify("নতুন ইনস্ট্রাক্টর ডাটাবেসে সফলভাবে যুক্ত হয়েছে!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          designation: "Senior Lead Master Trainer",
          specialization: "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ",
          track: "TOT-MEN",
          gender: "male",
          password: "Fajr@Instructor2026",
          experienceYears: 5,
          bio: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সিনিয়র প্রশিক্ষক।",
          avatar: "",
        });
      } else {
        notify(data.message || "ইনস্ট্রাক্টর যোগ করা ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি: আবার চেষ্টা করুন", "error");
    } finally {
      setSaving(false);
    }
  };

  // Update Instructor
  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/instructors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: editingInstructor._id,
          fullName: editingInstructor.fullName,
          phone: editingInstructor.phone,
          designation: editingInstructor.designation,
          specialization: editingInstructor.specialization,
          track: editingInstructor.track,
          bio: editingInstructor.bio,
          experienceYears: editingInstructor.experienceYears,
          avatar: editingInstructor.avatar || "",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.instructor) {
        setInstructors((prev) =>
          prev.map((i) => (i._id === editingInstructor._id ? data.instructor : i))
        );
        notify("ইনস্ট্রাক্টর প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
        setEditingInstructor(null);
        if (selectedInstructorForProfile && selectedInstructorForProfile._id === editingInstructor._id) {
          setSelectedInstructorForProfile(data.instructor);
        }
      } else {
        notify(data.message || "আপডেট ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Instructor
  const handleDeleteInstructor = async (inst) => {
    if (!window.confirm(`আপনি কি "${inst.fullName}"-কে ইনস্ট্রাক্টর প্যানেল থেকে মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/instructors?id=${inst._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setInstructors((prev) => prev.filter((i) => i._id !== inst._id));
        notify("ইনস্ট্রাক্টর সফলভাবে মুছে ফেলা হয়েছে।");
        if (selectedInstructorForProfile && selectedInstructorForProfile._id === inst._id) {
          setSelectedInstructorForProfile(null);
        }
      } else {
        notify(data.message || "মুছে ফেলা যায়নি", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি", "error");
    }
  };

  // Filtered instructors
  const filtered = instructors.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (i.fullName || "").toLowerCase().includes(q) ||
      (i.email || "").toLowerCase().includes(q) ||
      (i.phone || "").toLowerCase().includes(q) ||
      (i.designation || "").toLowerCase().includes(q) ||
      (i.specialization || "").toLowerCase().includes(q);

    const matchesTrack = trackFilter === "all" ? true : i.track === trackFilter;

    return matchesSearch && matchesTrack;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {msg && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn ${
            msg.type === "error"
              ? "bg-rose-500 text-white border-rose-400"
              : "bg-emerald-500 text-white border-emerald-400"
          }`}
        >
          {msg.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            Senior Faculty & Trainers Management
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            ইনস্ট্রাক্টর ও মাস্টার ট্রেইনার প্যানেল ({instructors.length} জন)
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            TOT কোর্স পরিচালনা, ওরিয়েন্টেশন ও লাইভ ক্লাস পরিচালনার অনুমোদিত শিক্ষক প্রোফাইল নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" /> নতুন ইনস্ট্রাক্টর যোগ করুন
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল, মোবাইল, পদবী বা স্পেশালাইজেশন দিয়ে খুঁজুন..."
            className="w-full px-4 py-2.5 pl-11 rounded-2xl border text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border text-xs font-bold w-full sm:w-auto"
        >
          <option value="all">সব ট্র্যাক (All Faculty)</option>
          <option value="TOT-MEN">TOT Men Faculty</option>
          <option value="TOT-WOMEN-014">TOT Women (014) Faculty</option>
        </select>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((inst) => {
          const isMen = inst.track === "TOT-MEN";
          return (
            <div
              key={inst._id}
              className={`rounded-3xl p-6 border space-y-4 transition-all flex flex-col justify-between ${
                isLight
                  ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                  : "bg-slate-900 border-slate-800 shadow-xl hover:border-slate-700"
              }`}
            >
              <div className="space-y-3.5">
                {/* Badges Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      inst.role === "admin"
                        ? isLight
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : isLight
                        ? "bg-purple-100 text-purple-900 border-purple-300"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {inst.role === "admin" ? "FACULTY LEAD / ADMIN" : "SENIOR MASTER TRAINER"}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isMen
                        ? isLight
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : isLight
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {isMen ? "👨 Men Track" : "🧕 Women Track"}
                  </span>
                </div>

                {/* Avatar & Title */}
                <div className="flex items-center gap-3">
                  <div className="relative group shrink-0">
                    {inst.avatar ? (
                      <img
                        src={inst.avatar}
                        alt={inst.fullName}
                        className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30 shadow-md bg-slate-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                        {inst.fullName ? inst.fullName[0].toUpperCase() : "I"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingInstructor(inst)}
                      title="ছবি আপলোড / পরিবর্তন করুন"
                      className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400 hover:text-white hover:bg-amber-500 hover:border-amber-400 shadow transition-all cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h3 className={`font-black text-base tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                      {inst.fullName}
                    </h3>
                    <p className={`text-xs font-semibold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                      {inst.designation || "TOT Master Trainer"}
                    </p>
                  </div>
                </div>

                {/* Specialization & Rating */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className={`font-mono font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                      {inst.rating || 4.9} / 5.0
                    </span>
                    <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      • {inst.experienceYears || 5}+ বছরের অভিজ্ঞতা
                    </span>
                  </div>

                  <p className={`text-[11px] font-medium line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    🎯 {inst.specialization || "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ"}
                  </p>
                </div>

                {/* Contact details */}
                <div className={`space-y-1 text-xs pt-3 border-t ${isLight ? "border-slate-100 text-slate-600" : "border-slate-800 text-slate-300"}`}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-mono">{inst.phone || "01410764581"}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{inst.email}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className={`pt-4 border-t flex items-center justify-between gap-2 ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                <button
                  type="button"
                  onClick={() => setSelectedInstructorForProfile(inst)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900"
                      : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" /> প্রোফাইল
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingInstructor(inst)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                        : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300"
                    }`}
                    title="এডিট করুন"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteInstructor(inst)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href="/instructor"
                    target="_blank"
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    title="ইনস্ট্রাক্টর পোর্টাল খুলুন"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. INSTRUCTOR PROFILE DETAILS MODAL */}
      {selectedInstructorForProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 border transition-all ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            {/* Modal Top */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {selectedInstructorForProfile.avatar ? (
                  <img
                    src={selectedInstructorForProfile.avatar}
                    alt={selectedInstructorForProfile.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-xl shrink-0 bg-slate-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                    {selectedInstructorForProfile.fullName ? selectedInstructorForProfile.fullName[0].toUpperCase() : "I"}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                      {selectedInstructorForProfile.tranId || "FACULTY"}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ভেরিফায়েড ফ্যাকাল্টি
                    </span>
                  </div>
                  <h2 className={`text-xl font-black mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                    {selectedInstructorForProfile.fullName}
                  </h2>
                  <p className={`text-xs font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                    {selectedInstructorForProfile.designation || "Senior Lead Master Trainer"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInstructorForProfile(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  যোগাযোগ তথ্য
                </span>
                <div className="space-y-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono">{selectedInstructorForProfile.phone || "01410764581"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedInstructorForProfile.email}</span>
                  </div>
                  <a
                    href={`https://wa.me/88${(selectedInstructorForProfile.phone || "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline pt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp মেসেজ পাঠান
                  </a>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  অ্যাকাডেমিক ও ট্র্যাক তথ্য
                </span>
                <div className="space-y-1.5 font-medium">
                  <div>
                    <span className="text-slate-400">ট্র্যাক: </span>
                    <strong className={isLight ? "text-slate-900" : "text-white"}>
                      {selectedInstructorForProfile.track === "TOT-MEN" ? "TOT Men Batch" : "TOT Women 014 Batch"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">রেটিং: </span>
                    <strong className="text-amber-500">⭐ {selectedInstructorForProfile.rating || 4.9} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">অভিজ্ঞতা: </span>
                    <strong className={isLight ? "text-slate-900" : "text-white"}>
                      {selectedInstructorForProfile.experienceYears || 5}+ বছর
                    </strong>
                  </div>
                </div>
              </div>

              <div className={`sm:col-span-2 p-4 rounded-2xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  বিশেষায়িত ক্ষেত্র (Specialization)
                </span>
                <p className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  {selectedInstructorForProfile.specialization || "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ"}
                </p>
              </div>

              <div className={`sm:col-span-2 p-4 rounded-2xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  জীবনী ও পরিচয় (Instructor Bio)
                </span>
                <p className={`leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                  {selectedInstructorForProfile.bio || "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সম্মানিত প্রশিক্ষক। দ্বীনি দায়িত্ববোধ ও পেশাদারিত্বের সাথে দেশ ও বিদেশের প্রশিক্ষণার্থীদের পাঠদান করছেন।"}
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingInstructor(selectedInstructorForProfile);
                  setSelectedInstructorForProfile(null);
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                }`}
              >
                <Edit className="w-3.5 h-3.5" /> তথ্য সংশোধন করুন
              </button>

              <button
                type="button"
                onClick={() => setSelectedInstructorForProfile(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT INSTRUCTOR MODAL */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                ইনস্ট্রাক্টর তথ্য সংশোধন
              </h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-4 text-xs">
              <CloudinaryImageUpload
                value={editingInstructor.avatar || ""}
                onChange={(url) => setEditingInstructor({ ...editingInstructor, avatar: url })}
                label="ইনস্ট্রাক্টরের ছবি (Cloudinary Photo)"
                isLight={isLight}
              />

              <div>
                <label className="block font-bold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  value={editingInstructor.fullName}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, fullName: e.target.value })}
                  className="w-full font-bold px-3 py-2 rounded-xl border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editingInstructor.phone}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ট্র্যাক</label>
                  <select
                    value={editingInstructor.track}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, track: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="TOT-MEN">TOT MEN</option>
                    <option value="TOT-WOMEN-014">TOT WOMEN (014)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">পদবী</label>
                <input
                  type="text"
                  value={editingInstructor.designation}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">বিশেষায়িত বিষয় (Specialization)</label>
                <input
                  type="text"
                  value={editingInstructor.specialization || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">অভিজ্ঞতা (বছর)</label>
                <input
                  type="number"
                  value={editingInstructor.experienceYears || 5}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, experienceYears: Number(e.target.value) })}
                  className="w-full font-mono px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">জীবনী ও সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  value={editingInstructor.bio || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInstructor(null)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                >
                  {saving ? "আপডেট হচ্ছে..." : "✓ সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD NEW INSTRUCTOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                  নতুন ইনস্ট্রাক্টর ও ট্রেইনার নিবন্ধন
                </h3>
                <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  ইনস্ট্রাক্টর হিসেবে MongoDB ডাটাবেসে একাউন্ট তৈরি হবে
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInstructor} className="space-y-4 text-xs">
              <CloudinaryImageUpload
                value={formData.avatar || ""}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                label="ইনস্ট্রাক্টরের ছবি (Cloudinary Photo)"
                isLight={isLight}
              />

              <div>
                <label className="block font-bold mb-1">উস্তাদ / উস্তাজার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="যেমন: শায়খ আহমাদুল্লাহ / উস্তাজা আয়েশা রহমান"
                  className="w-full font-bold px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ইমেইল অ্যাড্রেস *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="trainer@fajracademy.io"
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ট্র্যাক</label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="TOT-MEN">TOT MEN (পুরুষ ব্যাচ)</option>
                    <option value="TOT-WOMEN-014">TOT WOMEN (014 ব্যাচ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">লিঙ্গ (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="male">পুরুষ (Male)</option>
                    <option value="female">মহিলা (Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">পদবী</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Senior Lead Master Trainer"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">বিশেষায়িত বিষয় (Specialization)</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="আন্তর্জাতিক তাজবীদ ও মাখরাজ ডেলিভারি মেথডোলজি"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">অভিজ্ঞতা (বছর)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">লগইন পাসওয়ার্ড *</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">সংক্ষিপ্ত পরিচিতি ও বায়ো</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border"
                  placeholder="প্রশিক্ষকের প্রাতিষ্ঠানিক ডিগ্রি ও শিক্ষকতা অভিজ্ঞতা..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer disabled:opacity-50"
                >
                  {saving ? "নিবন্ধন হচ্ছে..." : "✓ ইনস্ট্রাক্টর যুক্ত করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
