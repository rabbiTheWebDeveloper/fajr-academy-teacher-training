'use client';

import { useState } from "react";
import { Calendar, Clock, MessageCircle, Save, Video } from "lucide-react";
import { apiFetch } from "./api";
import { FlashMessage, useFlash } from "./Flash";
import { isHttpsUrl } from "./utils";

const FIELD_META = {
  meetLink: { label: "Google Meet / Zoom লাইভ লিঙ্ক", placeholder: "https://meet.google.com/...", icon: Video, type: "url", link: true },
  whatsappLink: { label: "ব্যাচ WhatsApp গ্রুপ লিঙ্ক", placeholder: "https://chat.whatsapp.com/...", icon: MessageCircle, type: "url", link: true },
  routine: { label: "ক্লাস রুটিন", placeholder: "যেমন: রবিবার ও বৃহস্পতিবার (রাত ৮:০০)", icon: Clock, type: "text" },
  orientationDate: { label: "ওরিয়েন্টেশন তারিখ", placeholder: "যেমন: ২০ সেপ্টেম্বর ২০২৬", icon: Calendar, type: "text" },
  orientationTime: { label: "ওরিয়েন্টেশন সময়", placeholder: "যেমন: রাত ৮:০০ টা – ৯:৩০ টা", icon: Clock, type: "text" },
};

/**
 * Controlled editor for a course's class logistics (PATCH /api/instructor/courses).
 * Mount with key={course.courseId} so switching batches never saves another batch's values.
 */
export default function CourseSettingsForm({
  course,
  fields = ["meetLink", "whatsappLink", "routine", "orientationDate", "orientationTime"],
  onSaved,
  onCancel,
  submitLabel = "সংরক্ষণ করুন",
}) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f, course?.[f] ?? ""])));
  const [isSaving, setIsSaving] = useState(false);
  const { flash, show, clear } = useFlash();

  if (!course) return null;

  const changed = fields.filter((f) => String(values[f] ?? "").trim() !== String(course[f] ?? "").trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    clear();
    if (changed.length === 0) {
      show("error", "কোনো পরিবর্তন করা হয়নি।");
      return;
    }
    for (const f of changed) {
      const v = String(values[f] ?? "").trim();
      if (FIELD_META[f]?.link && v !== "" && !isHttpsUrl(v)) {
        show("error", `${FIELD_META[f].label} অবশ্যই https:// দিয়ে শুরু হতে হবে (মুছে ফেলতে ঘরটি খালি রাখুন)।`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const body = { courseId: course.courseId };
      for (const f of changed) body[f] = String(values[f] ?? "").trim();
      const data = await apiFetch("/api/instructor/courses", { method: "PATCH", body });
      show("success", data.message || "সফলভাবে আপডেট করা হয়েছে!");
      if (data.course) {
        setValues(Object.fromEntries(fields.map((f) => [f, data.course[f] ?? ""])));
        onSaved?.(data.course);
      }
    } catch (err) {
      show("error", err.message || "আপডেট ব্যর্থ হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((f) => {
          const meta = FIELD_META[f];
          const Icon = meta.icon;
          return (
            <label key={f} className={`block ${meta.link && fields.length > 1 ? "sm:col-span-2" : ""}`}>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">{meta.label}</span>
              <span className="relative block">
                <input
                  type={meta.type}
                  value={values[f]}
                  onChange={(e) => setValues((v) => ({ ...v, [f]: e.target.value }))}
                  placeholder={meta.placeholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Icon className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </span>
            </label>
          );
        })}
      </div>

      <FlashMessage flash={flash} onClose={clear} />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            বন্ধ করুন
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || changed.length === 0}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "আপডেট হচ্ছে..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
