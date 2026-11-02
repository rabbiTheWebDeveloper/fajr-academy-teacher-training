'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Trash2,
  ExternalLink,
  Search,
  Eye,
  Edit,
  X,
  Star,
  MessageCircle,
  Camera,
  RefreshCw,
  Power,
  KeyRound,
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import CloudinaryImageUpload from "@/components/CloudinaryImageUpload";
import {
  AdminToast,
  DbErrorBanner,
  GeneratedPasswordBox,
  callApi,
  isWomenTrack,
  trackLabel,
  useToast,
} from "../../_shared/admin-ui";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  designation: "",
  specialization: "",
  track: "TOT-MEN",
  gender: "male",
  password: "",
  experienceYears: "",
  rating: "",
  bio: "",
  avatar: "",
};

function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("880") ? digits : `88${digits}`}`;
}

/** Drop empty optional fields so the server applies its own defaults. */
function createPayload(form) {
  const out = { fullName: form.fullName, email: form.email, track: form.track, gender: form.gender };
  for (const k of ["phone", "designation", "specialization", "bio", "avatar", "password"]) {
    if (String(form[k] || "").trim()) out[k] = form[k];
  }
  if (form.experienceYears !== "") out.experienceYears = Number(form.experienceYears) || 0;
  if (form.rating !== "") out.rating = Number(form.rating) || 0;
  return out;
}

export default function AdminInstructorsClient({ initialInstructors, loadError: initialLoadError }) {
  const [instructors, setInstructors] = useState(initialInstructors || []);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [selectedInstructorForProfile, setSelectedInstructorForProfile] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [addError, setAddError] = useState("");
  const [addResult, setAddResult] = useState(null); // { email, password }
  const [resetInfo, setResetInfo] = useState(null); // { name, email, password } shown once
  const { isLight } = useAdminTheme();
  const { toast, showToast, hideToast } = useToast();

  const [formData, setFormData] = useState(EMPTY_FORM);

  const replaceInstructor = (updated) => {
    setInstructors((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    setSelectedInstructorForProfile((prev) => (prev && prev._id === updated._id ? updated : prev));
  };

  const reload = async () => {
    setReloading(true);
    const { ok, data, message } = await callApi("/api/admin/instructors");
    setReloading(false);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setInstructors(data.instructors || []);
    setLoadError(null);
    showToast(`${(data.instructors || []).length} জন ইনস্ট্রাক্টরের সর্বশেষ তথ্য লোড হয়েছে।`);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormData(EMPTY_FORM);
    setAddError("");
    setAddResult(null);
  };

  // Add Instructor
  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAddError("");
    const { ok, data, message } = await callApi("/api/admin/instructors", { method: "POST", body: createPayload(formData) });
    setSaving(false);

    if (!ok) {
      setAddError(message);
      showToast(message, "error");
      return;
    }
    if (data.instructor) setInstructors((prev) => [data.instructor, ...prev.filter((i) => i._id !== data.instructor._id)]);
    showToast(message || "নতুন ইনস্ট্রাক্টর যুক্ত হয়েছে!");
    if (data.generatedPassword) {
      setAddResult({ email: data.instructor?.email || formData.email, password: data.generatedPassword });
    } else {
      closeAddModal();
    }
  };

  // Update Instructor
  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSaving(true);
    const { ok, data, message } = await callApi("/api/admin/instructors", {
      method: "PATCH",
      body: {
        instructorId: editingInstructor._id,
        fullName: editingInstructor.fullName,
        phone: editingInstructor.phone || "",
        track: editingInstructor.track ?? "TOT-MEN",
        gender: editingInstructor.gender || "male",
        designation: editingInstructor.designation || "",
        specialization: editingInstructor.specialization || "",
        bio: editingInstructor.bio || "",
        experienceYears: Number(editingInstructor.experienceYears) || 0,
        rating: Number(editingInstructor.rating) || 0,
        avatar: editingInstructor.avatar || "",
        isActive: editingInstructor.isActive !== false,
      },
    });
    setSaving(false);

    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.instructor) replaceInstructor(data.instructor);
    showToast(message || "ইনস্ট্রাক্টর প্রোফাইল আপডেট হয়েছে!");
    setEditingInstructor(null);
  };

  const handleToggleActive = async (inst) => {
    const next = inst.isActive === false;
    if (
      !window.confirm(
        next ? `"${inst.fullName}"-এর অ্যাকাউন্ট আবার সক্রিয় করবেন?` : `"${inst.fullName}"-এর অ্যাকাউন্ট নিষ্ক্রিয় করবেন? নিষ্ক্রিয় অবস্থায় লগইন করা যাবে না।`
      )
    )
      return;
    setBusyId(inst._id);
    const { ok, data, message } = await callApi("/api/admin/instructors", {
      method: "PATCH",
      body: { instructorId: inst._id, isActive: next },
    });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.instructor) replaceInstructor(data.instructor);
    showToast(next ? "ইনস্ট্রাক্টর অ্যাকাউন্ট সক্রিয় করা হয়েছে।" : "ইনস্ট্রাক্টর অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।");
  };

  // New password for an instructor (shown once)
  const handleResetPassword = async (inst) => {
    if (!window.confirm(`"${inst.fullName}"-এর জন্য নতুন পাসওয়ার্ড তৈরি করবেন?\n\nপুরনো পাসওয়ার্ড আর কাজ করবে না।`)) return;
    setBusyId(inst._id);
    const { ok, data, message } = await callApi("/api/admin/instructors", {
      method: "PATCH",
      body: { instructorId: inst._id, resetPassword: true },
    });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    if (data.instructor) replaceInstructor(data.instructor);
    if (data.generatedPassword) setResetInfo({ name: inst.fullName, email: inst.email, password: data.generatedPassword });
    showToast("নতুন পাসওয়ার্ড তৈরি হয়েছে।");
  };

  // Delete Instructor
  const handleDeleteInstructor = async (inst) => {
    if (
      !window.confirm(
        `"${inst.fullName}"-এর ইনস্ট্রাক্টর অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলবেন?\n\nতাঁর দেওয়া মূল্যায়নগুলো অক্ষত থাকবে। শুধু সাময়িকভাবে বন্ধ করতে চাইলে "নিষ্ক্রিয়" ব্যবহার করুন।`
      )
    )
      return;

    setBusyId(inst._id);
    const { ok, message } = await callApi(`/api/admin/instructors?id=${encodeURIComponent(inst._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) {
      showToast(message, "error");
      return;
    }
    setInstructors((prev) => prev.filter((i) => i._id !== inst._id));
    setSelectedInstructorForProfile((prev) => (prev && prev._id === inst._id ? null : prev));
    showToast(message || "ইনস্ট্রাক্টর মুছে ফেলা হয়েছে।");
  };

  // Filtered instructors
  const q = search.trim().toLowerCase();
  const filtered = instructors.filter((i) => {
    const matchesSearch =
      !q ||
      [i.fullName, i.email, i.phone, i.designation, i.specialization].some((v) => String(v || "").toLowerCase().includes(q));
    const matchesTrack =
      trackFilter === "all" ? true : trackFilter === "men" ? i.track === "TOT-MEN" : trackFilter === "women" ? isWomenTrack(i.track) : !i.track;
    return matchesSearch && matchesTrack;
  });

  const fieldCls = `w-full px-3 py-2 rounded-xl border outline-hidden ${
    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-slate-700 text-white focus:border-amber-500"
  }`;
  const labelCls = `block font-bold mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`;

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} onClose={hideToast} />
      <DbErrorBanner message={loadError} isLight={isLight} onRetry={reload} retrying={reloading} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            Senior Faculty & Trainers Management
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            ইনস্ট্রাক্টর ও মাস্টার ট্রেইনার প্যানেল ({instructors.length} জন)
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            TOT কোর্স পরিচালনা, ওরিয়েন্টেশন ও লাইভ ক্লাস পরিচালনার অনুমোদিত শিক্ষক প্রোফাইল নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={reload}
            disabled={reloading}
            title="ডাটাবেজ থেকে আবার লোড করুন"
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
              isLight ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50" : "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`} /> রিফ্রেশ
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> নতুন ইনস্ট্রাক্টর যোগ করুন
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল, মোবাইল, পদবী বা স্পেশালাইজেশন দিয়ে খুঁজুন..."
            className={`w-full px-4 py-2.5 pl-11 rounded-2xl border text-xs ${isLight ? "" : "bg-slate-900 border-slate-800 text-white"}`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-2xl border text-xs font-bold w-full sm:w-auto ${isLight ? "" : "bg-slate-900 border-slate-800 text-white"}`}
        >
          <option value="all">সব ট্র্যাক (All Faculty)</option>
          <option value="men">TOT Men Faculty</option>
          <option value="women">TOT Women Faculty</option>
          <option value="none">নির্দিষ্ট ব্যাচ নেই</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div
          className={`text-center py-12 text-xs rounded-3xl border ${
            isLight ? "bg-white border-slate-200 text-slate-500" : "bg-slate-900 border-slate-800 text-slate-400"
          }`}
        >
          {instructors.length === 0
            ? loadError
              ? "ইনস্ট্রাক্টর তালিকা লোড করা যায়নি।"
              : "এখনো কোনো ইনস্ট্রাক্টর যুক্ত করা হয়নি। 'নতুন ইনস্ট্রাক্টর যোগ করুন' বাটনে ক্লিক করুন।"
            : "ফিল্টারের সাথে মেলে এমন কোনো ইনস্ট্রাক্টর পাওয়া যায়নি।"}
        </div>
      )}

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((inst) => {
          const isMen = !isWomenTrack(inst.track);
          const active = inst.isActive !== false;
          const busy = busyId === inst._id;
          return (
            <div
              key={inst._id}
              className={`rounded-3xl p-6 border space-y-4 transition-all flex flex-col justify-between ${
                isLight ? "bg-white border-slate-200 shadow-sm hover:shadow-md" : "bg-slate-900 border-slate-800 shadow-xl hover:border-slate-700"
              } ${active ? "" : "opacity-75"}`}
            >
              <div className="space-y-3.5">
                {/* Badges Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      active
                        ? isLight
                          ? "bg-purple-100 text-purple-900 border-purple-300"
                          : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : isLight
                        ? "bg-slate-100 text-slate-600 border-slate-300"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {active ? "INSTRUCTOR" : "নিষ্ক্রিয় অ্যাকাউন্ট"}
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
                    {trackLabel(inst.track)}
                  </span>
                </div>

                {/* Avatar & Title */}
                <div className="flex items-center gap-3">
                  <div className="relative group shrink-0">
                    {inst.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
                      onClick={() => setEditingInstructor({ ...inst })}
                      title="ছবি আপলোড / পরিবর্তন করুন"
                      className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 text-amber-400 hover:text-white hover:bg-amber-500 hover:border-amber-400 shadow transition-all cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-black text-base tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{inst.fullName}</h3>
                    <p className={`text-xs font-semibold ${isLight ? "text-amber-800" : "text-amber-400"}`}>{inst.designation || "—"}</p>
                  </div>
                </div>

                {/* Specialization & Rating */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className={`font-mono font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                      {Number(inst.rating || 0).toFixed(1)} / 5.0
                    </span>
                    <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      • {Number(inst.experienceYears || 0)} বছরের অভিজ্ঞতা
                    </span>
                  </div>

                  <p className={`text-[11px] font-medium line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    🎯 {inst.specialization || "বিশেষায়িত ক্ষেত্র যুক্ত করা হয়নি"}
                  </p>
                </div>

                {/* Contact details */}
                <div className={`space-y-1 text-xs pt-3 border-t ${isLight ? "border-slate-100 text-slate-600" : "border-slate-800 text-slate-300"}`}>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-mono">{inst.phone || "ফোন নম্বর নেই"}</span>
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
                    isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" /> প্রোফাইল
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(inst)}
                    disabled={busy}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                      active
                        ? isLight
                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-500"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                    }`}
                    title={active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingInstructor({ ...inst })}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                    title="এডিট করুন"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(inst)}
                    disabled={busy}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                      isLight ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700" : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400"
                    }`}
                    title="নতুন পাসওয়ার্ড তৈরি করুন"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteInstructor(inst)}
                    disabled={busy}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 cursor-pointer disabled:opacity-50"
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
            <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {selectedInstructorForProfile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">INSTRUCTOR</span>
                    {selectedInstructorForProfile.isActive === false ? (
                      <span className="text-xs font-bold text-rose-500">নিষ্ক্রিয় অ্যাকাউন্ট</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> সক্রিয় ফ্যাকাল্টি
                      </span>
                    )}
                  </div>
                  <h2 className={`text-xl font-black mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>{selectedInstructorForProfile.fullName}</h2>
                  <p className={`text-xs font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>{selectedInstructorForProfile.designation || "—"}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInstructorForProfile(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>যোগাযোগ তথ্য</span>
                <div className="space-y-1.5 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono">{selectedInstructorForProfile.phone || "ফোন নম্বর নেই"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedInstructorForProfile.email}</span>
                  </div>
                  {whatsappHref(selectedInstructorForProfile.phone) && (
                    <a
                      href={whatsappHref(selectedInstructorForProfile.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:underline pt-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp মেসেজ পাঠান
                    </a>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>অ্যাকাডেমিক ও ট্র্যাক তথ্য</span>
                <div className="space-y-1.5 font-medium">
                  <div>
                    <span className="text-slate-400">ট্র্যাক: </span>
                    <strong className={isLight ? "text-slate-900" : "text-white"}>{trackLabel(selectedInstructorForProfile.track)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">রেটিং: </span>
                    <strong className="text-amber-500">⭐ {Number(selectedInstructorForProfile.rating || 0).toFixed(1)} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">অভিজ্ঞতা: </span>
                    <strong className={isLight ? "text-slate-900" : "text-white"}>{Number(selectedInstructorForProfile.experienceYears || 0)} বছর</strong>
                  </div>
                </div>
              </div>

              <div className={`sm:col-span-2 p-4 rounded-2xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block ${isLight ? "text-slate-500" : "text-slate-400"}`}>বিশেষায়িত ক্ষেত্র (Specialization)</span>
                <p className={`font-semibold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{selectedInstructorForProfile.specialization || "তথ্য নেই"}</p>
              </div>

              <div className={`sm:col-span-2 p-4 rounded-2xl border space-y-1.5 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                <span className={`text-[11px] font-bold block ${isLight ? "text-slate-500" : "text-slate-400"}`}>জীবনী ও পরিচয় (Instructor Bio)</span>
                <p className={`leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>{selectedInstructorForProfile.bio || "তথ্য নেই"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setEditingInstructor({ ...selectedInstructorForProfile });
                  setSelectedInstructorForProfile(null);
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
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
              <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>ইনস্ট্রাক্টর তথ্য সংশোধন</h3>
              <button onClick={() => setEditingInstructor(null)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className={`space-y-4 text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
              <CloudinaryImageUpload
                value={editingInstructor.avatar || ""}
                onChange={(url) => setEditingInstructor({ ...editingInstructor, avatar: url })}
                label="ইনস্ট্রাক্টরের ছবি (Cloudinary Photo)"
                isLight={isLight}
              />

              <div>
                <label className={labelCls}>পূর্ণ নাম *</label>
                <input
                  type="text"
                  value={editingInstructor.fullName || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, fullName: e.target.value })}
                  className={`${fieldCls} font-bold`}
                  required
                  minLength={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={editingInstructor.phone || ""}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, phone: e.target.value })}
                    className={`${fieldCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>ট্র্যাক</label>
                  <select
                    value={editingInstructor.track ?? "TOT-MEN"}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, track: e.target.value })}
                    className={fieldCls}
                  >
                    <option value="TOT-MEN">TOT MEN</option>
                    <option value="TOT-WOMEN-014">TOT WOMEN (014)</option>
                    <option value="TOT-WOMEN">TOT WOMEN</option>
                    <option value="">নির্দিষ্ট ব্যাচ নেই</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>লিঙ্গ</label>
                  <select
                    value={editingInstructor.gender === "female" ? "female" : "male"}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, gender: e.target.value })}
                    className={fieldCls}
                  >
                    <option value="male">পুরুষ (Male)</option>
                    <option value="female">মহিলা (Female)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>অ্যাকাউন্ট</label>
                  <select
                    value={editingInstructor.isActive === false ? "no" : "yes"}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, isActive: e.target.value === "yes" })}
                    className={fieldCls}
                  >
                    <option value="yes">সক্রিয়</option>
                    <option value="no">নিষ্ক্রিয়</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>পদবী</label>
                <input
                  type="text"
                  value={editingInstructor.designation || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, designation: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className={labelCls}>বিশেষায়িত বিষয় (Specialization)</label>
                <input
                  type="text"
                  value={editingInstructor.specialization || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, specialization: e.target.value })}
                  className={fieldCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>অভিজ্ঞতা (বছর)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editingInstructor.experienceYears ?? 0}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, experienceYears: e.target.value })}
                    className={`${fieldCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>রেটিং (০-৫)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingInstructor.rating ?? 0}
                    onChange={(e) => setEditingInstructor({ ...editingInstructor, rating: e.target.value })}
                    className={`${fieldCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>জীবনী ও সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  value={editingInstructor.bio || ""}
                  onChange={(e) => setEditingInstructor({ ...editingInstructor, bio: e.target.value })}
                  rows={3}
                  maxLength={1500}
                  className={fieldCls}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setEditingInstructor(null)} className="px-4 py-2 rounded-xl border font-bold cursor-pointer">
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer disabled:opacity-50"
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
                <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>নতুন ইনস্ট্রাক্টর ও ট্রেইনার নিবন্ধন</h3>
                <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  ইনস্ট্রাক্টর রোলে নতুন অ্যাকাউন্ট তৈরি হবে (ইমেইলটি ট্রেইনি অ্যাকাউন্টের হলে সেটিকে ইনস্ট্রাক্টরে উন্নীত করা হবে)
                </p>
              </div>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addResult ? (
              <GeneratedPasswordBox password={addResult.password} email={addResult.email} isLight={isLight} onDone={closeAddModal} />
            ) : (
              <form onSubmit={handleAddInstructor} className={`space-y-4 text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                {addError && (
                  <div
                    role="alert"
                    className={`p-3 rounded-xl border text-xs font-bold ${
                      isLight ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {addError}
                  </div>
                )}

                <CloudinaryImageUpload
                  value={formData.avatar || ""}
                  onChange={(url) => setFormData({ ...formData, avatar: url })}
                  label="ইনস্ট্রাক্টরের ছবি (Cloudinary Photo)"
                  isLight={isLight}
                />

                <div>
                  <label className={labelCls}>উস্তাদ / উস্তাজার পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="যেমন: শায়খ আহমাদুল্লাহ / উস্তাজা আয়েশা রহমান"
                    className={`${fieldCls} font-bold`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>ইমেইল অ্যাড্রেস *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="trainer@example.com"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>ট্র্যাক</label>
                    <select value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })} className={fieldCls}>
                      <option value="TOT-MEN">TOT MEN (পুরুষ ব্যাচ)</option>
                      <option value="TOT-WOMEN-014">TOT WOMEN (014 ব্যাচ)</option>
                      <option value="">নির্দিষ্ট ব্যাচ নেই</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>লিঙ্গ (Gender)</label>
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={fieldCls}>
                      <option value="male">পুরুষ (Male)</option>
                      <option value="female">মহিলা (Female)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>পদবী</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="খালি রাখলে: TOT Master Trainer"
                    className={fieldCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>বিশেষায়িত বিষয় (Specialization)</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="যেমন: আন্তর্জাতিক তাজবীদ ও মাখরাজ ডেলিভারি মেথডোলজি"
                    className={fieldCls}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>অভিজ্ঞতা (বছর)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      placeholder="0"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>রেটিং (০-৫)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="0"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>লগইন পাসওয়ার্ড</label>
                    <input
                      type="text"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="খালি = স্বয়ংক্রিয়"
                      className={`${fieldCls} font-mono`}
                    />
                  </div>
                </div>
                <p className={`text-[11px] -mt-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  পাসওয়ার্ড খালি রাখলে স্বয়ংক্রিয় পাসওয়ার্ড তৈরি হবে এবং শুধু একবার দেখানো হবে।
                </p>

                <div>
                  <label className={labelCls}>সংক্ষিপ্ত পরিচিতি ও বায়ো</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={2}
                    maxLength={1500}
                    className={fieldCls}
                    placeholder="প্রশিক্ষকের প্রাতিষ্ঠানিক ডিগ্রি ও শিক্ষকতা অভিজ্ঞতা..."
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={closeAddModal} className="px-4 py-2 rounded-xl border font-bold cursor-pointer">
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
            )}
          </div>
        </div>
      )}

      {/* One-time display of an admin-reset password */}
      {resetInfo && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 ${
              isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <h3 className="text-base font-bold">নতুন পাসওয়ার্ড — {resetInfo.name}</h3>
            <GeneratedPasswordBox password={resetInfo.password} email={resetInfo.email} isLight={isLight} onDone={() => setResetInfo(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
