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
} from "lucide-react";

export default function AdminCoursesClient({ initialBatches }) {
  const [batches, setBatches] = useState(initialBatches || []);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
        body: JSON.stringify(newCourse),
      });
      const data = await res.json();

      if (data.success && data.course) {
        setBatches((prev) => [...prev, data.course]);
        setShowAddModal(false);
        notify("নতুন কোর্স সফলভাবে তৈরি হয়েছে!", "success");
        setNewCourse({
          courseId: "",
          name: "",
          tag: "নতুন ব্যাচ",
          track: "general",
          fee: 1000,
          regularFee: 2500,
          orientationDate: "শীঘ্রই ঘোষিত হবে",
          orientationTime: "রাত ৮:০০ টা",
          routine: "সপ্তাহে ৩ দিন (রাত ৮:০০)",
          duration: "১ মাস (৪টি প্রফেশনাল সেশন)",
          meetLink: "",
          whatsappLink: "",
          instructor: "ফজর একাডেমি ফ্যাকাল্টি",
          maxSeats: 60,
          status: "Active & Enrolling",
        });
      } else {
        notify(data.message || "কোর্স তৈরি ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি।", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (batch) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${batch.name}" মুছে ফেলতে চান?`)) return;

    try {
      const id = batch._id || batch.courseId;
      const res = await fetch(`/api/admin/courses?id=${id}&courseId=${batch.courseId || ""}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setBatches((prev) => prev.filter((b) => (b._id || b.courseId) !== id));
        notify("কোর্স সফলভাবে মুছে ফেলা হয়েছে।", "success");
      } else {
        notify(data.message || "মুছে ফেলা যায়নি", "error");
      }
    } catch (err) {
      notify("সার্ভার ত্রুটি।", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            TOT কোর্স ব্যাচ ও লাইভ সেশন শিডিউলার
          </h1>
          <p className="text-xs text-slate-400">
            পুরুষ ও মহিলা ব্যাচের ওরিয়েন্টেশন তারিখ, গুগল মিট লাইভ লিঙ্ক, কোর্স ফি ও রুটিন ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn ${
                notification.type === "error"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {notification.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {notification.msg}
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> নতুন কোর্স / ব্যাচ যোগ করুন
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => {
          const batchKey = batch._id || batch.courseId || batch.id;
          const isEditing = editingId === batchKey;
          const isMen = batch.track === "men" || batch.courseId === "TOT-MEN";

          return (
            <div
              key={batchKey}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isMen
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {batch.tag || "কোর্স ব্যাচ"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (isEditing ? handleSaveCourse(batch) : setEditingId(batchKey))}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isEditing ? (
                        <Save className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Edit className="w-3.5 h-3.5" />
                      )}
                      {isEditing ? (saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন") : "এডিট করুন"}
                    </button>

                    {isEditing && (
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        title="বাতিল"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCourse(batch)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Batch Name */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">ব্যাচের নাম</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => handleUpdateField(batchKey, "name", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                      />
                    ) : (
                      <h3 className="text-base font-bold text-white">{batch.name}</h3>
                    )}
                  </div>

                  {/* Course ID & Tag Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">কোর্স আইডি (ID)</label>
                      <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                        {batch.courseId || batch.id}
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">কোর্স ফি (BDT)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={batch.fee || 1000}
                          onChange={(e) => handleUpdateField(batchKey, "fee", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-bold"
                        />
                      ) : (
                        <span className="font-bold text-emerald-400 text-sm">
                          ৳ {batch.fee || 1000}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Orientation Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> ওরিয়েন্টেশন তারিখ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={batch.orientationDate}
                          onChange={(e) =>
                            handleUpdateField(batchKey, "orientationDate", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-medium"
                        />
                      ) : (
                        <p className="font-bold text-slate-200">{batch.orientationDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> ওরিয়েন্টেশন সময়
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={batch.orientationTime}
                          onChange={(e) =>
                            handleUpdateField(batchKey, "orientationTime", e.target.value)
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-medium"
                        />
                      ) : (
                        <p className="font-bold text-slate-200">{batch.orientationTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Routine */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">সাপ্তাহিক রুটিন</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.routine}
                        onChange={(e) => handleUpdateField(batchKey, "routine", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                      />
                    ) : (
                      <p className="text-slate-300 font-medium">{batch.routine}</p>
                    )}
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">প্রধান ট্রেইনার / ইন্সট্রাক্টর</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.instructor}
                        onChange={(e) => handleUpdateField(batchKey, "instructor", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                      />
                    ) : (
                      <p className="text-amber-300 font-bold">{batch.instructor}</p>
                    )}
                  </div>

                  {/* Meet Link */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <Video className="w-3.5 h-3.5 text-blue-400" /> Google Meet লাইভ ক্লাস লিংক
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.meetLink}
                        onChange={(e) => handleUpdateField(batchKey, "meetLink", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono text-[11px]"
                      />
                    ) : (
                      <a
                        href={batch.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                      >
                        {batch.meetLink} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    )}
                  </div>

                  {/* WhatsApp Group */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> ট্রেইনি WhatsApp গ্রুপ
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batch.whatsappLink}
                        onChange={(e) => handleUpdateField(batchKey, "whatsappLink", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono text-[11px]"
                      />
                    ) : (
                      <a
                        href={batch.whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                      >
                        {batch.whatsappLink} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    নিবন্ধিত ট্রেইনি: <strong className="text-white">{batch.enrolledCount || 0}</strong> /{" "}
                    {batch.maxSeats || 60}
                  </span>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {batch.status || "Active"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">নতুন কোর্স / ব্যাচ তৈরি করুন</h2>
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
                <label className="text-slate-300 font-bold block mb-1">কোর্সের নাম *</label>
                <input
                  type="text"
                  required
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  placeholder="যেমন: Training of Trainers (TOT) – MEN BATCH 015"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">কোর্স আইডি (Unique ID)</label>
                  <input
                    type="text"
                    value={newCourse.courseId}
                    onChange={(e) => setNewCourse({ ...newCourse, courseId: e.target.value })}
                    placeholder="TOT-MEN-015"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">কোর্স ফি (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={newCourse.fee}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, fee: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">ক্যাটাগরি / ট্র্যাক</label>
                  <select
                    value={newCourse.track}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        track: e.target.value,
                        tag: e.target.value === "women" ? "মহিলা ব্যাচ" : "পুরুষ ব্যাচ",
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="men">পুরুষদের কোর্স (Men)</option>
                    <option value="women">নারীদের কোর্স (Women)</option>
                    <option value="general">সাধারণ কোর্স (General)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">সর্বোচ্চ আসন সংখ্যা</label>
                  <input
                    type="number"
                    value={newCourse.maxSeats}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, maxSeats: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">ওরিয়েন্টেশন তারিখ</label>
                  <input
                    type="text"
                    value={newCourse.orientationDate}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, orientationDate: e.target.value })
                    }
                    placeholder="২০ সেপ্টেম্বর ২০২৬"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">ওরিয়েন্টেশন সময়</label>
                  <input
                    type="text"
                    value={newCourse.orientationTime}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, orientationTime: e.target.value })
                    }
                    placeholder="রাত ৮:০০ টা"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">ক্লাস রুটিন</label>
                <input
                  type="text"
                  value={newCourse.routine}
                  onChange={(e) => setNewCourse({ ...newCourse, routine: e.target.value })}
                  placeholder="রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">ইন্সট্রাক্টরের নাম</label>
                <input
                  type="text"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="উস্তাদ আব্দুল্লাহ আল-মাহমুদ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Google Meet লিংক</label>
                <input
                  type="url"
                  value={newCourse.meetLink}
                  onChange={(e) => setNewCourse({ ...newCourse, meetLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">WhatsApp গ্রুপ লিংক</label>
                <input
                  type="url"
                  value={newCourse.whatsappLink}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, whatsappLink: e.target.value })
                  }
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer"
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
