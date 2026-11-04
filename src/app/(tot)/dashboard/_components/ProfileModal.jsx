"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, AlertCircle, Loader2, X } from "lucide-react";
import { BLOOD_GROUPS, QURAN_SKILLS, ENGLISH_SKILLS, fromBnDigits } from "../../_shared/format";

const inputCls =
"w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60";

/** 01XXXXXXXXX from "+880 1X…", "8801X…", Bengali digits, spaces or dashes. */
function normalizePhone(value) {
  let digits = fromBnDigits(value).replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2);
  return digits;
}

/** Keep a legacy stored value selectable instead of silently replacing it. */
function withCurrent(options, current) {
  if (!current || options.some((o) => o.value === current)) return options;
  return [...options, { value: current, label: `${current} (পূর্বে সংরক্ষিত)` }];
}

/**
 * Edits the signed-in trainee's own profile through PATCH /api/tot/profile.
 * The server identifies the user from the session; no email / tran_id is sent.
 */
export default function ProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    phone: user.phone || "",
    emergencyContactNumber: user.emergencyContactNumber || "",
    bloodGroup: user.bloodGroup || "",
    quranSkill: user.quranSkill || "",
    englishSkill: user.englishSkill || "",
    hasLaptop: user.hasLaptop === "no" ? "no" : "yes",
    education: user.education || "",
    bio: user.bio || "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { message, login }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError(null);

    const body = {
      emergencyContactNumber: fromBnDigits(form.emergencyContactNumber).trim(),
      bloodGroup: form.bloodGroup,
      quranSkill: form.quranSkill,
      englishSkill: form.englishSkill,
      hasLaptop: form.hasLaptop,
      education: form.education.trim(),
      bio: form.bio.trim(),
    };

    if (form.phone.trim() || user.phone) {
      const phone = normalizePhone(form.phone);
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        setError({ message: "সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।" });
        return;
      }
      body.phone = phone;
    }
    if (body.emergencyContactNumber && !/^\+?[\d\s-]{7,20}$/.test(body.emergencyContactNumber)) {
      setError({ message: "জরুরি যোগাযোগ নম্বরটি সঠিক নয়। শুধু সংখ্যা ব্যবহার করুন।" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/tot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        setError({ message: json?.message || "আপনার সেশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।", login: true });
        return;
      }
      if (!res.ok || !json?.success) {
        setError({ message: json?.message || "প্রোফাইল আপডেট করা যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।" });
        return;
      }
      onSaved(json.trainee || {}, json.message || "প্রোফাইল সফলভাবে আপডেট হয়েছে!");
    } catch {
      setError({ message: "সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।" });
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    if (!saving) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={close} />

      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <h3 id="profile-modal-title" className="text-base font-bold text-white">
              টিচার প্রোফাইল তথ্য আপডেট
            </h3>
          </div>
          <button type="button" onClick={close} aria-label="বন্ধ করুন" className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-phone" className="text-slate-300 font-semibold block mb-1">
                মোবাইল নম্বর:
              </label>
              <input
                id="pf-phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="01XXXXXXXXX"
                disabled={saving}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pf-emergency" className="text-slate-300 font-semibold block mb-1">
                জরুরি যোগাযোগ নম্বর:
              </label>
              <input
                id="pf-emergency"
                type="tel"
                inputMode="tel"
                value={form.emergencyContactNumber}
                onChange={update("emergencyContactNumber")}
                placeholder="ঐচ্ছিক"
                disabled={saving}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-blood" className="text-slate-300 font-semibold block mb-1">
                রক্তের গ্রুপ:
              </label>
              <select id="pf-blood" value={form.bloodGroup} onChange={update("bloodGroup")} disabled={saving} className={inputCls}>
                <option value="">নির্বাচন করুন</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-slate-300 font-semibold block mb-1">নিজস্ব ল্যাপটপ / কম্পিউটার:</span>
              <div className="flex items-center gap-4 pt-2">
                {[
                  { value: "yes", label: "হ্যাঁ, আছে" },
                  { value: "no", label: "না, সহায়তা প্রয়োজন" },
                ].map((o) => (
                  <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="laptop"
                      value={o.value}
                      checked={form.hasLaptop === o.value}
                      onChange={update("hasLaptop")}
                      disabled={saving}
                      className="accent-indigo-500"
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="pf-quran" className="text-slate-300 font-semibold block mb-1">
              কুরআন তিলাওয়াত দক্ষতা:
            </label>
            <select id="pf-quran" value={form.quranSkill} onChange={update("quranSkill")} disabled={saving} className={inputCls}>
              {!form.quranSkill && <option value="">নির্বাচন করুন</option>}
              {withCurrent(QURAN_SKILLS, user.quranSkill).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pf-english" className="text-slate-300 font-semibold block mb-1">
              ইংরেজি যোগাযোগ দক্ষতা:
            </label>
            <select id="pf-english" value={form.englishSkill} onChange={update("englishSkill")} disabled={saving} className={inputCls}>
              {!form.englishSkill && <option value="">নির্বাচন করুন</option>}
              {withCurrent(ENGLISH_SKILLS, user.englishSkill).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pf-education" className="text-slate-300 font-semibold block mb-1">
              শিক্ষাগত যোগ্যতা:
            </label>
            <input
              id="pf-education"
              type="text"
              maxLength={120}
              value={form.education}
              onChange={update("education")}
              placeholder="যেমন: দাওরায়ে হাদীস / ফাজিল / অনার্স..."
              disabled={saving}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="pf-bio" className="text-slate-300 font-semibold block mb-1">
              সংক্ষিপ্ত বায়ো / শিক্ষকতা অভিজ্ঞতা:
            </label>
            <textarea
              id="pf-bio"
              rows={3}
              maxLength={1000}
              value={form.bio}
              onChange={update("bio")}
              placeholder="অনলাইন বা মাদ্রাসায় পাঠদানের পূর্ব অভিজ্ঞতা..."
              disabled={saving}
              className={`${inputCls} p-3`}
            />
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {error.message}{" "}
                {error.login && (
                  <Link href="/login" className="underline font-bold text-white">
                    লগইন করুন
                  </Link>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={close} disabled={saving} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-60">
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
