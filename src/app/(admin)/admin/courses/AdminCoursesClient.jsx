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
  Edit,
  Plus,
  Trash2,
  X,
  DollarSign,
  AlertCircle,
  Link as LinkIcon,
  Layers,
  FileText,
  Download,
  FolderDown,
  Check,
  ChevronRight,
  Eye,
  FileCode,
  Tag,
  User,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import {
  DEFAULT_TOT_CURRICULUM,
  WOMEN_TOT_CURRICULUM,
  MEN_TOT_CURRICULUM,
  DEFAULT_TOT_RESOURCES,
} from "@/constant/course-defaults";

export default function AdminCoursesClient({ initialBatches }) {
  const [batches, setBatches] = useState(initialBatches || []);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { isLight } = useAdminTheme();

  // Curriculum & Resource Modal state
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState(null);
  const [curriculumTab, setCurriculumTab] = useState("curriculum"); // "curriculum" | "resources"
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  // New Module Form State
  const [newModule, setNewModule] = useState({
    moduleNo: 1,
    sessionBadge: "SESSION 01",
    title: "",
    subtitle: "",
    description: "",
    themeQuote: "",
    trainerName: "",
    trainerRole: "",
    trainerQualifications: "",
    sessionDate: "",
    sessionTime: "",
    duration: "১ ঘণ্টা",
    liveDate: "",
    topics: "",
  });

  // New Resource Form State
  const [newResource, setNewResource] = useState({
    title: "",
    category: "কুরআন শিক্ষা ও তাজবীদ",
    format: "PDF",
    size: "2.5 MB",
    desc: "",
    fileUrl: "https://drive.google.com/drive/folders/tot-fajr-resources",
    isDownloadable: true,
  });

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    courseId: "",
    name: "",
    tag: "পুরুষ ব্যাচ",
    track: "men",
    fee: 1000,
    regularFee: 2500,
    orientationDate: "২০ সেপ্টেম্বর ২০২৬",
    orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
    routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
    duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
    meetLink: "https://meet.google.com/tot-fajr-room",
    whatsappLink: "https://chat.whatsapp.com/tot-fajr-community",
    instructor: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
    maxSeats: 60,
    status: "Active & Enrolling",
  });

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleUpdateField = (id, field, value) => {
    setBatches((prev) =>
      prev.map((b) => {
        const matchId = b._id || b.courseId || b.id;
        return matchId === id ? { ...b, [field]: value } : b;
      })
    );
  };

  // Save updated course to database
  const handleSaveCourse = async (batch) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      const data = await res.json();

      if (data.success) {
        notify("কোর্স তথ্য সফলভাবে ডাটাবেজে আপডেট হয়েছে!", "success");
        setEditingId(null);
        if (selectedCourseForCurriculum && (selectedCourseForCurriculum._id === batch._id || selectedCourseForCurriculum.courseId === batch.courseId)) {
          setSelectedCourseForCurriculum(data.course);
        }
      } else {
        notify(data.message || "আপডেট ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি। আবার চেষ্টা করুন।", "error");
    } finally {
      setSaving(false);
    }
  };

  // Create new course in database
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCourse,
          curriculum: DEFAULT_TOT_CURRICULUM,
          resources: DEFAULT_TOT_RESOURCES,
        }),
      });
      const data = await res.json();

      if (data.success && data.course) {
        setBatches((prev) => [...prev, data.course]);
        notify("নতুন কোর্স ও কারিকুলাম সফলভাবে তৈরি হয়েছে!", "success");
        setShowAddModal(false);
        setNewCourse({
          courseId: "",
          name: "",
          tag: "পুরুষ ব্যাচ",
          track: "men",
          fee: 1000,
          regularFee: 2500,
          orientationDate: "২০ সেপ্টেম্বর ২০২৬",
          orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
          routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "https://meet.google.com/tot-fajr-room",
          whatsappLink: "https://chat.whatsapp.com/tot-fajr-community",
          instructor: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
          maxSeats: 60,
          status: "Active & Enrolling",
        });
      } else {
        notify(data.message || "তৈরি ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (batch) => {
    const confirmDelete = window.confirm(
      `আপনি কি নিশ্চিত যে "${batch.name}" কোর্সটি মুছে ফেলতে চান?`
    );
    if (!confirmDelete) return;

    try {
      const queryId = batch._id ? `id=${batch._id}` : `courseId=${batch.courseId}`;
      const res = await fetch(`/api/admin/courses?${queryId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setBatches((prev) =>
          prev.filter((b) => (b._id || b.courseId) !== (batch._id || batch.courseId))
        );
        notify("কোর্স সফলভাবে মুছে ফেলা হয়েছে।", "success");
        if (selectedCourseForCurriculum && (selectedCourseForCurriculum._id === batch._id || selectedCourseForCurriculum.courseId === batch.courseId)) {
          setSelectedCourseForCurriculum(null);
        }
      } else {
        notify(data.message || "মুছে ফেলা যায়নি", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি", "error");
    }
  };

  // Curriculum Management Handlers
  const handleAddModule = (e) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum) return;

    const topicsArray = newModule.topics
      ? newModule.topics.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const moduleObj = {
      moduleNo: Number(newModule.moduleNo) || (selectedCourseForCurriculum.curriculum?.length || 0) + 1,
      sessionBadge: newModule.sessionBadge || `SESSION 0${(selectedCourseForCurriculum.curriculum?.length || 0) + 1}`,
      title: newModule.title,
      subtitle: newModule.subtitle,
      description: newModule.description,
      themeQuote: newModule.themeQuote,
      trainerName: newModule.trainerName,
      trainerRole: newModule.trainerRole,
      trainerQualifications: newModule.trainerQualifications,
      sessionDate: newModule.sessionDate,
      sessionTime: newModule.sessionTime,
      duration: newModule.duration || "১ ঘণ্টা",
      liveDate: newModule.liveDate || newModule.sessionDate,
      topics: topicsArray,
      lessons: [
        { lessonNo: 1, title: `${newModule.title} - লেসন ০১`, duration: "৪৫ মিনিট", isFreePreview: false },
        { lessonNo: 2, title: `${newModule.title} - লেসন ০২`, duration: "৪৫ মিনিট", isFreePreview: false },
      ],
    };

    const updatedCurriculum = [...(selectedCourseForCurriculum.curriculum || []), moduleObj];
    const updatedCourse = { ...selectedCourseForCurriculum, curriculum: updatedCurriculum };

    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
    setShowAddModuleModal(false);
    setNewModule({
      moduleNo: updatedCurriculum.length + 1,
      sessionBadge: `SESSION 0${updatedCurriculum.length + 1}`,
      title: "",
      subtitle: "",
      description: "",
      themeQuote: "",
      trainerName: "",
      trainerRole: "",
      trainerQualifications: "",
      sessionDate: "",
      sessionTime: "",
      duration: "১ ঘণ্টা",
      liveDate: "",
      topics: "",
    });
  };

  const handleReloadOfficialCurriculum = () => {
    if (!selectedCourseForCurriculum) return;
    const isMen = selectedCourseForCurriculum.track === "men" || selectedCourseForCurriculum.courseId === "TOT-MEN";
    const officialCurriculum = isMen ? MEN_TOT_CURRICULUM : WOMEN_TOT_CURRICULUM;

    if (!window.confirm(`আপনি কি "${selectedCourseForCurriculum.name}" কোর্সের কারিকুলাম অফিশিয়াল পোস্টার সেশন তথ্য অনুযায়ী রিলোড ও আপডেট করতে চান?`)) return;

    const updatedCourse = { ...selectedCourseForCurriculum, curriculum: officialCurriculum };
    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
    notify("পোস্টার অনুযায়ী অফিসিয়াল কারিকুলাম সফলভাবে রিলোড ও সেভ হয়েছে!");
  };

  const handleDeleteModule = (moduleIndex) => {
    if (!selectedCourseForCurriculum) return;
    if (!window.confirm("আপনি কি এই মডিউলটি মুছে ফেলতে চান?")) return;

    const updatedCurriculum = selectedCourseForCurriculum.curriculum.filter((_, idx) => idx !== moduleIndex);
    const updatedCourse = { ...selectedCourseForCurriculum, curriculum: updatedCurriculum };

    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
  };

  const handleAddLessonToModule = (moduleIndex) => {
    const lessonTitle = window.prompt("নতুন লেসন বা ক্লাসের নাম লিখুন:");
    if (!lessonTitle) return;

    const updatedCurriculum = [...selectedCourseForCurriculum.curriculum];
    const targetModule = updatedCurriculum[moduleIndex];
    const newLessonNo = (targetModule.lessons?.length || 0) + 1;

    targetModule.lessons = [
      ...(targetModule.lessons || []),
      { lessonNo: newLessonNo, title: lessonTitle, duration: "৪৫ মিনিট", isFreePreview: false },
    ];

    const updatedCourse = { ...selectedCourseForCurriculum, curriculum: updatedCurriculum };
    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
  };

  // Resource Management Handlers
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum) return;

    const resourceObj = {
      resourceId: `RES-${Date.now().toString().slice(-4)}`,
      title: newResource.title,
      category: newResource.category,
      format: newResource.format,
      size: newResource.size,
      desc: newResource.desc,
      fileUrl: newResource.fileUrl,
      isDownloadable: newResource.isDownloadable,
    };

    const updatedResources = [...(selectedCourseForCurriculum.resources || []), resourceObj];
    const updatedCourse = { ...selectedCourseForCurriculum, resources: updatedResources };

    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
    setShowAddResourceModal(false);
    setNewResource({
      title: "",
      category: "কুরআন শিক্ষা ও তাজবীদ",
      format: "PDF",
      size: "2.5 MB",
      desc: "",
      fileUrl: "https://drive.google.com/drive/folders/tot-fajr-resources",
      isDownloadable: true,
    });
  };

  const handleDeleteResource = (resourceIndex) => {
    if (!selectedCourseForCurriculum) return;
    if (!window.confirm("আপনি কি এই স্টাডি ম্যাটেরিয়ালটি মুছে ফেলতে চান?")) return;

    const updatedResources = selectedCourseForCurriculum.resources.filter((_, idx) => idx !== resourceIndex);
    const updatedCourse = { ...selectedCourseForCurriculum, resources: updatedResources };

    setSelectedCourseForCurriculum(updatedCourse);
    handleSaveCourse(updatedCourse);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-500/90 text-white border-emerald-400"
              : "bg-rose-500/90 text-white border-rose-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
              isLight
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Curriculum, Modules & Learning Resources
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            কোর্স, কারিকুলাম ও রিসোর্স কনফিগারেশন
          </h1>
          <p className={`text-xs sm:text-sm mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            TOT ব্যাচ সিডিউল, লাইভ ক্লাসরুম লিংক, ৪টি মডিউলের কারিকুলাম এবং স্টাডি বুকস ও হ্যান্ডবুক নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> নতুন কোর্স তৈরি
        </button>
      </div>

      {/* Course Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => {
          const batchKey = batch._id || batch.courseId || batch.id;
          const isEditing = editingId === batchKey;
          const isMen = batch.track === "men";
          const curriculumCount = batch.curriculum?.length || 4;
          const resourcesCount = batch.resources?.length || 6;

          return (
            <div
              key={batchKey}
              className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden flex flex-col justify-between transition-all ${
                isLight
                  ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                  : "bg-slate-900 border-slate-800 shadow-2xl"
              }`}
            >
              <div>
                {/* Card Top Pill & Actions */}
                <div className={`flex items-center justify-between border-b pb-4 mb-4 ${isLight ? "border-slate-100" : "border-slate-800"}`}>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isMen
                        ? isLight
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : isLight
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {batch.tag || "কোর্স ব্যাচ"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (isEditing ? handleSaveCourse(batch) : setEditingId(batchKey))}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                          : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                      }`}
                    >
                      {isEditing ? <Save className="w-3.5 h-3.5 text-emerald-600" /> : <Edit className="w-3.5 h-3.5" />}
                      {isEditing ? (saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন") : "এডিট"}
                    </button>

                    {isEditing && (
                      <button
                        onClick={() => setEditingId(null)}
                        className={`p-1.5 rounded-lg border ${
                          isLight
                            ? "bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300"
                            : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                        }`}
                        title="বাতিল"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCourse(batch)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Batch Name */}
                  <div>
                    <label className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      ব্যাচের নাম
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => handleUpdateField(batchKey, "name", e.target.value)}
                        className="w-full font-bold px-3 py-2 rounded-xl border text-sm"
                      />
                    ) : (
                      <h3 className={`text-base font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                        {batch.name}
                      </h3>
                    )}
                  </div>

                  {/* Course ID & Fee */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        কোর্স আইডি (ID)
                      </label>
                      <span className="font-mono font-bold px-2.5 py-1 rounded-lg border block text-xs bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-amber-700 dark:text-amber-400">
                        {batch.courseId || batch.id}
                      </span>
                    </div>

                    <div>
                      <label className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        কোর্স ফি (BDT)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={batch.fee || 1000}
                          onChange={(e) => handleUpdateField(batchKey, "fee", Number(e.target.value))}
                          className="w-full font-mono font-bold px-3 py-1.5 rounded-xl border"
                        />
                      ) : (
                        <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">
                          ৳ {batch.fee || 1000}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Orientation Date & Time */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-slate-800"}`}>
                    <div>
                      <label className={`text-[11px] font-bold flex items-center gap-1 mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> ওরিয়েন্টেশন তারিখ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={batch.orientationDate}
                          onChange={(e) => handleUpdateField(batchKey, "orientationDate", e.target.value)}
                          className="w-full font-medium px-2 py-1 rounded-lg border text-xs"
                        />
                      ) : (
                        <p className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {batch.orientationDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`text-[11px] font-bold flex items-center gap-1 mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> ওরিয়েন্টেশন সময়
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={batch.orientationTime}
                          onChange={(e) => handleUpdateField(batchKey, "orientationTime", e.target.value)}
                          className="w-full font-medium px-2 py-1 rounded-lg border text-xs"
                        />
                      ) : (
                        <p className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {batch.orientationTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className={`text-[11px] font-bold block mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      প্রধান ট্রেইনার / ইন্সট্রাক্টর
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.instructor}
                        onChange={(e) => handleUpdateField(batchKey, "instructor", e.target.value)}
                        className="w-full font-medium px-3 py-2 rounded-xl border text-xs"
                      />
                    ) : (
                      <p className={`font-bold ${isLight ? "text-amber-800" : "text-amber-300"}`}>
                        {batch.instructor}
                      </p>
                    )}
                  </div>

                  {/* Links Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className={`block font-bold mb-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        Google Meet
                      </span>
                      <a
                        href={batch.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono truncate"
                      >
                        <Video className="w-3 h-3 shrink-0" /> {batch.meetLink || "লিংক যুক্ত নেই"}
                      </a>
                    </div>

                    <div>
                      <span className={`block font-bold mb-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        WhatsApp গ্রুপ
                      </span>
                      <a
                        href={batch.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono truncate"
                      >
                        <MessageCircle className="w-3 h-3 shrink-0" /> {batch.whatsappLink || "লিংক যুক্ত নেই"}
                      </a>
                    </div>
                  </div>

                  {/* CURRICULUM & RESOURCE MANAGER BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseForCurriculum(batch);
                        setCurriculumTab("curriculum");
                      }}
                      className={`w-full py-2.5 px-3.5 rounded-2xl border flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-900 shadow-xs"
                          : "bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>কারিকুলাম ও রিসোর্স ম্যানেজার</span>
                      </div>
                      <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                        {curriculumCount} মডিউল • {resourcesCount} রিসোর্স
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className={`pt-4 mt-4 border-t flex items-center justify-between text-xs ${isLight ? "border-slate-100 text-slate-600" : "border-slate-800 text-slate-400"}`}>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>
                    নিবন্ধিত ট্রেইনি:{" "}
                    <strong className={isLight ? "text-slate-900" : "text-white"}>
                      {batch.enrolledCount || 0}
                    </strong>{" "}
                    / {batch.maxSeats || 60}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isLight
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {batch.status || "Active"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CURRICULUM & RESOURCES FULL MODAL */}
      {selectedCourseForCurriculum && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 border transition-all ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-amber-500 text-slate-950">
                    {selectedCourseForCurriculum.courseId}
                  </span>
                  <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                    {selectedCourseForCurriculum.name}
                  </h2>
                </div>
                <p className={`text-xs mt-1 font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  ৪ সপ্তাহের আন্তর্জাতিক TOT কারিকুলাম ও ক্লাসের স্টাডি ম্যাটেরিয়ালস ম্যানেজার
                </p>
              </div>

              <button
                onClick={() => setSelectedCourseForCurriculum(null)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center justify-between gap-4">
              <div
                className={`flex items-center gap-1.5 p-1 rounded-2xl border ${
                  isLight ? "bg-slate-100 border-slate-300" : "bg-slate-950 border-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCurriculumTab("curriculum")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    curriculumTab === "curriculum"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : isLight
                      ? "text-slate-700 hover:text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>কারিকুলাম ও মডিউল ({selectedCourseForCurriculum.curriculum?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumTab("resources")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    curriculumTab === "resources"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : isLight
                      ? "text-slate-700 hover:text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FolderDown className="w-4 h-4" />
                  <span>স্টাডি বুকস ও ফাইলস ({selectedCourseForCurriculum.resources?.length || 0})</span>
                </button>
              </div>

              {curriculumTab === "curriculum" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReloadOfficialCurriculum}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isLight
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }`}
                    title="পোস্টার অনুযায়ী অফিসিয়াল কারিকুলাম রিলোড করুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">পোস্টার কারিকুলাম রিলোড</span>
                    <span className="sm:hidden">রিলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewModule({
                        moduleNo: (selectedCourseForCurriculum.curriculum?.length || 0) + 1,
                        sessionBadge: `SESSION 0${(selectedCourseForCurriculum.curriculum?.length || 0) + 1}`,
                        title: "",
                        subtitle: "",
                        description: "",
                        themeQuote: "",
                        trainerName: "",
                        trainerRole: "",
                        trainerQualifications: "",
                        sessionDate: "",
                        sessionTime: "",
                        duration: "১ ঘণ্টা",
                        liveDate: "",
                        topics: "",
                      });
                      setShowAddModuleModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> নতুন সেশন
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> নতুন স্টাডি ফাইল
                </button>
              )}
            </div>

            {/* TAB CONTENT: CURRICULUM MODULES */}
            {curriculumTab === "curriculum" && (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {(selectedCourseForCurriculum.curriculum || []).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    কোনো মডিউল ডাটা নেই। উপরে &apos;নতুন মডিউল&apos; বাটনে ক্লিক করে যোগ করুন।
                  </div>
                ) : (
                  selectedCourseForCurriculum.curriculum.map((mod, modIdx) => (
                    <div
                      key={mod._id || modIdx}
                      className={`p-5 rounded-3xl border space-y-3.5 transition-all ${
                        isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950 border-slate-800 shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-2">
                            {mod.sessionBadge ? (
                              <span className="px-3 py-1 rounded-full font-mono text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs tracking-wider">
                                {mod.sessionBadge}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                MODULE {mod.moduleNo || modIdx + 1}
                              </span>
                            )}

                            {(mod.sessionDate || mod.liveDate) && (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"
                              }`}>
                                <Calendar className="w-3 h-3 text-amber-500" />
                                {mod.sessionDate || mod.liveDate}
                              </span>
                            )}

                            {(mod.sessionTime || mod.duration) && (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                                isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-900 text-slate-300 border-slate-800"
                              }`}>
                                <Clock className="w-3 h-3 text-amber-500" />
                                {mod.sessionTime || mod.duration}
                              </span>
                            )}
                          </div>

                          {/* Session Title */}
                          <h4 className={`text-sm sm:text-base font-black leading-snug tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                            {mod.title}
                          </h4>

                          {/* Theme Quote Box (from poster) */}
                          {mod.themeQuote && (
                            <div className={`p-3 rounded-2xl border text-xs leading-relaxed italic ${
                              isLight
                                ? "bg-amber-50/70 border-amber-200/80 text-slate-800"
                                : "bg-amber-950/20 border-amber-500/20 text-amber-200/90"
                            }`}>
                              <span className="font-bold not-italic text-amber-600 dark:text-amber-400 block mb-1 text-[10px] uppercase tracking-wider">
                                📖 SESSION THEME:
                              </span>
                              {mod.themeQuote}
                            </div>
                          )}

                          {mod.description && !mod.themeQuote && (
                            <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                              {mod.description}
                            </p>
                          )}

                          {/* Session Trainer Box (from poster) */}
                          {mod.trainerName && (
                            <div className={`flex items-start gap-3 p-3 rounded-2xl border ${
                              isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                            }`}>
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow shrink-0 mt-0.5">
                                {mod.trainerName[0]}
                              </div>
                              <div className="text-xs min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                    SESSION TRAINER
                                  </span>
                                  <span className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                                    {mod.trainerName}
                                  </span>
                                </div>
                                {mod.trainerRole && (
                                  <p className={`text-[11px] font-medium mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                    {mod.trainerRole}
                                  </p>
                                )}
                                {mod.trainerQualifications && (
                                  <p className={`text-[10px] font-mono mt-0.5 ${isLight ? "text-amber-800" : "text-amber-300/90"}`}>
                                    🎓 {mod.trainerQualifications}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddLessonToModule(modIdx)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer ${
                              isLight
                                ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-500" /> লেসন
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(modIdx)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 border border-rose-500/30 cursor-pointer"
                            title="মডিউল মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Topics pills */}
                      {mod.topics && mod.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {mod.topics.map((t, tidx) => (
                            <span
                              key={tidx}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                isLight
                                  ? "bg-white border-slate-300 text-slate-700"
                                  : "bg-slate-900 border-slate-800 text-slate-300"
                              }`}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Lessons list */}
                      {mod.lessons && mod.lessons.length > 0 && (
                        <div className={`mt-2 pt-2 border-t space-y-1.5 ${isLight ? "border-slate-200" : "border-slate-850"}`}>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                            লাইভ ক্লাস ও লেসন সূচি ({mod.lessons.length}টি সেশন)
                          </span>
                          {mod.lessons.map((les, lidx) => (
                            <div
                              key={lidx}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                                isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
                                  {les.lessonNo || lidx + 1}
                                </span>
                                <span className={`font-semibold truncate ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                                  {les.title}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${isLight ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-slate-950 text-slate-400 border-slate-800"}`}>
                                {les.duration || "৪৫ মিনিট"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: STUDY RESOURCES & MATERIALS */}
            {curriculumTab === "resources" && (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {(selectedCourseForCurriculum.resources || []).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    কোনো স্টাডি ফাইল বা বই যুক্ত নেই। &apos;নতুন স্টাডি ফাইল&apos; বাটনে ক্লিক করে যোগ করুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {selectedCourseForCurriculum.resources.map((res, resIdx) => (
                      <div
                        key={res._id || res.resourceId || resIdx}
                        className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                          isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              {res.category || "স্টাডি ম্যাটেরিয়াল"}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleDeleteResource(resIdx)}
                              className="text-rose-600 hover:text-rose-500 cursor-pointer p-1"
                              title="ফাইল মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className={`text-xs sm:text-sm font-black leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
                            {res.title}
                          </h4>

                          {res.desc && (
                            <p className={`text-[11px] line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                              {res.desc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-850 text-xs">
                          <span className={`text-[10px] font-mono font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                            {res.format || "PDF"} • {res.size || "2.5 MB"}
                          </span>

                          <a
                            href={res.fileUrl || "https://drive.google.com"}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> ডাউনলোড লিংক
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className={`pt-3 border-t flex justify-end ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <button
                type="button"
                onClick={() => setSelectedCourseForCurriculum(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODULE MODAL */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                নতুন কারিকুলাম মডিউল যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddModuleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">সেশন ব্যাজ / নম্বর</label>
                  <input
                    type="text"
                    value={newModule.sessionBadge}
                    onChange={(e) => setNewModule({ ...newModule, sessionBadge: e.target.value })}
                    placeholder="যেমন: SESSION 01 / ORIENTATION"
                    className="w-full font-mono font-bold px-3 py-2 rounded-xl border text-amber-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">সময়কাল</label>
                  <input
                    type="text"
                    value={newModule.duration}
                    onChange={(e) => setNewModule({ ...newModule, duration: e.target.value })}
                    placeholder="যেমন: ১ ঘণ্টা / ৪৫ মিনিট"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">সেশন শিরোনাম (Topic Title) *</label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  placeholder="যেমন: THE QUR'ANIC TEACHER : Purpose, Mindset & the Art of Inspiring"
                  className="w-full font-bold px-3 py-2 rounded-xl border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">সেশন তারিখ (Date)</label>
                  <input
                    type="text"
                    value={newModule.sessionDate}
                    onChange={(e) => setNewModule({ ...newModule, sessionDate: e.target.value })}
                    placeholder="যেমন: 23 August 2026, Sunday"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">সেশন সময় (Time)</label>
                  <input
                    type="text"
                    value={newModule.sessionTime}
                    onChange={(e) => setNewModule({ ...newModule, sessionTime: e.target.value })}
                    placeholder="যেমন: 8:00 PM - 9:00 PM"
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">সেশন থিম কোট (Session Theme / Quote)</label>
                <textarea
                  value={newModule.themeQuote}
                  onChange={(e) => setNewModule({ ...newModule, themeQuote: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border italic"
                  placeholder="পোস্টারের থিম উদ্ধৃতি..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ট্রেইনার নাম (Trainer Name)</label>
                  <input
                    type="text"
                    value={newModule.trainerName}
                    onChange={(e) => setNewModule({ ...newModule, trainerName: e.target.value })}
                    placeholder="যেমন: Kazi Shakhawat Hossain"
                    className="w-full font-bold px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ট্রেইনার পদবী (Trainer Role)</label>
                  <input
                    type="text"
                    value={newModule.trainerRole}
                    onChange={(e) => setNewModule({ ...newModule, trainerRole: e.target.value })}
                    placeholder="যেমন: Senior Operation Executive"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ট্রেইনার শিক্ষাগত যোগ্যতা (Qualifications)</label>
                <input
                  type="text"
                  value={newModule.trainerQualifications}
                  onChange={(e) => setNewModule({ ...newModule, trainerQualifications: e.target.value })}
                  placeholder="যেমন: BA (Hons) in Qur'anic Sciences (IIUC), MA (BIU)"
                  className="w-full font-mono text-[11px] px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">টপিক কি-ওয়ার্ড (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={newModule.topics}
                  onChange={(e) => setNewModule({ ...newModule, topics: e.target.value })}
                  placeholder="Mindset, Pedagogy, Live Practice"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  ✓ মডিউল সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className={`font-black text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                নতুন স্টাডি ফাইল বা বই যুক্ত করুন
              </h3>
              <button onClick={() => setShowAddResourceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">রিসোর্স / বইয়ের নাম *</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="যেমন: ফজর একাডেমি তাজবীদ চার্ট ২০২৬"
                  className="w-full font-bold px-3 py-2 rounded-xl border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ক্যাটাগরি</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
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
                  <label className="block font-bold mb-1">ফাইল ফরম্যাট</label>
                  <select
                    value={newResource.format}
                    onChange={(e) => setNewResource({ ...newResource, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="PDF">PDF ডকুমেন্ট</option>
                    <option value="DOCX">DOCX ফাইল</option>
                    <option value="SLIDES">PowerPoint স্লাইড</option>
                    <option value="VIDEO">রেকর্ডেড ভিডিও</option>
                    <option value="DRIVE">Google Drive ফোল্ডার</option>
                    <option value="ZIP">ZIP প্যাকেজ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ফাইল সাইজ</label>
                  <input
                    type="text"
                    value={newResource.size}
                    onChange={(e) => setNewResource({ ...newResource, size: e.target.value })}
                    placeholder="যেমন: 4.2 MB"
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ডাউনলোডেবল</label>
                  <select
                    value={newResource.isDownloadable ? "yes" : "no"}
                    onChange={(e) => setNewResource({ ...newResource, isDownloadable: e.target.value === "yes" })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="yes">হ্যাঁ (সরাসরি ডাউনলোড)</option>
                    <option value="no">না (শুধুমাত্র ভিউ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">ফাইল ডাউনলোড / ড্রাইভ লিংক *</label>
                <input
                  type="url"
                  value={newResource.fileUrl}
                  onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full font-mono px-3 py-2 rounded-xl border"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  value={newResource.desc}
                  onChange={(e) => setNewResource({ ...newResource, desc: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border"
                  placeholder="ফাইলের মধ্যে কী কী বিষয় কভার করা আছে..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  ✓ ফাইল যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW COURSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8 border ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                  নতুন কোর্স / ব্যাচ তৈরি করুন
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">কোর্সের নাম *</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="যেমন: Training of Trainers (TOT) - Batch 015"
                  className="w-full font-bold px-3 py-2.5 rounded-xl border"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">কোর্স আইডি (ID)</label>
                  <input
                    type="text"
                    value={newCourse.courseId}
                    onChange={(e) => setNewCourse({ ...newCourse, courseId: e.target.value })}
                    placeholder="TOT-BATCH-015"
                    className="w-full font-mono font-bold px-3 py-2 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">ট্যাগ / লেবেল</label>
                  <input
                    type="text"
                    value={newCourse.tag}
                    onChange={(e) => setNewCourse({ ...newCourse, tag: e.target.value })}
                    placeholder="পুরুষ ব্যাচ / স্পেশাল ব্যাচ"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">অফার ফি (BDT) *</label>
                  <input
                    type="number"
                    value={newCourse.fee}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, fee: Number(e.target.value) })
                    }
                    className="w-full font-mono font-bold px-3 py-2 rounded-xl border"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">রেগুলার ফি (BDT)</label>
                  <input
                    type="number"
                    value={newCourse.regularFee}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, regularFee: Number(e.target.value) })
                    }
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">ট্র্যাক (অডিয়েন্স)</label>
                  <select
                    value={newCourse.track}
                    onChange={(e) => setNewCourse({ ...newCourse, track: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  >
                    <option value="men">পুরুষদের কোর্স (Men)</option>
                    <option value="women">নারীদের কোর্স (Women)</option>
                    <option value="general">সাধারণ কোর্স (General)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">সর্বোচ্চ আসন সংখ্যা</label>
                  <input
                    type="number"
                    value={newCourse.maxSeats}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, maxSeats: Number(e.target.value) })
                    }
                    className="w-full font-mono px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">ওরিয়েন্টেশন তারিখ</label>
                  <input
                    type="text"
                    value={newCourse.orientationDate}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, orientationDate: e.target.value })
                    }
                    placeholder="২০ সেপ্টেম্বর ২০২৬"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">ওরিয়েন্টেশন সময়</label>
                  <input
                    type="text"
                    value={newCourse.orientationTime}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, orientationTime: e.target.value })
                    }
                    placeholder="রাত ৮:০০ টা"
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">ক্লাস রুটিন</label>
                <input
                  type="text"
                  value={newCourse.routine}
                  onChange={(e) => setNewCourse({ ...newCourse, routine: e.target.value })}
                  placeholder="রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">ইন্সট্রাক্টরের নাম</label>
                <input
                  type="text"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="উস্তাদ আব্দুল্লাহ আল-মাহমুদ"
                  className="w-full px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Google Meet লিংক</label>
                <input
                  type="url"
                  value={newCourse.meetLink}
                  onChange={(e) => setNewCourse({ ...newCourse, meetLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full font-mono text-[11px] px-3 py-2 rounded-xl border"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">WhatsApp গ্রুপ লিংক</label>
                <input
                  type="url"
                  value={newCourse.whatsappLink}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, whatsappLink: e.target.value })
                  }
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full font-mono text-[11px] px-3 py-2 rounded-xl border"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? "তৈরি হচ্ছে..." : "✓ কোর্স তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
