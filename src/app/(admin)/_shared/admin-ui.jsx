'use client';

/**
 * Shared admin-panel helpers: one fetch wrapper that always surfaces the API's
 * `message`, a toast, the DB-error banner and the one-time password box.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, Check, KeyRound, RefreshCw, DatabaseZap, X } from "lucide-react";

export const NETWORK_ERROR = "সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
export const DB_ERROR = "ডাটাবেজের সাথে সংযোগ করা যায়নি। দেখানো তথ্য অসম্পূর্ণ হতে পারে — কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।";

function fallbackMessage(status) {
  if (status === 401) return "সেশনের মেয়াদ শেষ হয়েছে — অনুগ্রহ করে আবার লগইন করুন।";
  if (status === 403) return "এই কাজটি করার অনুমতি আপনার অ্যাকাউন্টে নেই।";
  if (status === 404) return "রেকর্ডটি পাওয়া যায়নি।";
  if (status >= 500) return `সার্ভারে সমস্যা হয়েছে (HTTP ${status})। কিছুক্ষণ পর আবার চেষ্টা করুন।`;
  return `অনুরোধটি সম্পন্ন হয়নি (HTTP ${status})।`;
}

/**
 * fetch + JSON with uniform error handling.
 * Resolves to { ok, status, data, message } and never throws.
 */
export async function callApi(url, { method = "GET", body } = {}) {
  try {
    const res = await fetch(url, {
      method,
      cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok || !data || data.success === false) {
      return { ok: false, status: res.status, data, message: data?.message || fallbackMessage(res.status) };
    }
    return { ok: true, status: res.status, data, message: data.message || "" };
  } catch {
    return { ok: false, status: 0, data: null, message: NETWORK_ERROR };
  }
}

/** Toast state with a single timer (errors stay a little longer). */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((text, type = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ text, type });
    timer.current = setTimeout(() => setToast(null), type === "error" ? 7000 : 4000);
  }, []);

  const hideToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  return { toast, showToast, hideToast };
}

export function AdminToast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div className="fixed bottom-6 right-6 z-80 max-w-sm" role={isError ? "alert" : "status"}>
      <div
        className={`px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-2.5 text-xs font-bold border ${
          isError ? "bg-rose-900 border-rose-700 text-white" : "bg-emerald-950 border-emerald-500 text-emerald-100"
        }`}
      >
        {isError ? (
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-px" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-px" />
        )}
        <span className="leading-relaxed">{toast.text}</span>
        {onClose && (
          <button type="button" onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 cursor-pointer" aria-label="বন্ধ করুন">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Red banner shown when the server page could not read the database. */
export function DbErrorBanner({ message, isLight, onRetry, retrying }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold ${
        isLight ? "bg-rose-50 border-rose-300 text-rose-900" : "bg-rose-950/40 border-rose-800 text-rose-200"
      }`}
    >
      <div className="flex items-start gap-2">
        <DatabaseZap className="w-4 h-4 shrink-0 mt-px" />
        <span className="leading-relaxed">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 ${
            isLight ? "bg-white border-rose-300 hover:bg-rose-100" : "bg-rose-900/40 border-rose-700 hover:bg-rose-900/70"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
          আবার চেষ্টা করুন
        </button>
      )}
    </div>
  );
}

/** One-time password display for accounts created with a server-generated password. */
export function GeneratedPasswordBox({ password, email, isLight, onDone }) {
  const [copied, setCopied] = useState(false);
  if (!password) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
        isLight ? "bg-amber-50 border-amber-300 text-amber-950" : "bg-amber-500/10 border-amber-500/40 text-amber-100"
      }`}
    >
      <div className="flex items-center gap-2 font-black">
        <KeyRound className="w-4 h-4 text-amber-500" /> স্বয়ংক্রিয়ভাবে তৈরি পাসওয়ার্ড
      </div>
      {email && (
        <div className="font-medium">
          লগইন ইমেইল: <span className="font-mono font-bold">{email}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <code
          className={`flex-1 px-3 py-2 rounded-xl border font-mono text-sm font-black tracking-wide select-all break-all ${
            isLight ? "bg-white border-amber-300" : "bg-slate-950 border-amber-500/30"
          }`}
        >
          {password}
        </code>
        <button
          type="button"
          onClick={copy}
          className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 cursor-pointer ${
            copied
              ? "bg-emerald-500 text-white border-emerald-600"
              : isLight
              ? "bg-white border-amber-300 hover:bg-amber-100"
              : "bg-slate-900 border-amber-500/30 hover:bg-slate-800"
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "কপি হয়েছে" : "কপি"}
        </button>
      </div>
      <p className="font-semibold leading-relaxed">
        ⚠ এই পাসওয়ার্ডটি শুধু একবারই দেখানো হচ্ছে — পরে আর দেখা যাবে না। কপি করে নিরাপদ মাধ্যমে (সরাসরি বা ব্যক্তিগত মেসেজে)
        ব্যবহারকারীকে দিন এবং প্রথম লগইনের পর পরিবর্তন করতে বলুন।
      </p>
      {onDone && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer"
          >
            পাসওয়ার্ড সংরক্ষণ করেছি — বন্ধ করুন
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------- formatting helpers ---------------------------- */

export const ROLE_OPTIONS = [
  { value: "teacher", label: "Teacher (ট্রেইনি শিক্ষক)" },
  { value: "student", label: "Student (শিক্ষার্থী)" },
  { value: "participant", label: "Participant (অংশগ্রহণকারী)" },
  { value: "instructor", label: "Instructor (ট্রেইনার)" },
  { value: "admin", label: "Admin (অ্যাডমিন)" },
  { value: "super-admin", label: "Super Admin (সুপার অ্যাডমিন)" },
  { value: "staff", label: "Staff (স্টাফ)" },
  { value: "organizer", label: "Organizer (অর্গানাইজার)" },
];

export const TRAINEE_ROLES = ["teacher", "student", "participant"];

export function trackLabel(track) {
  if (track === "TOT-MEN") return "TOT MEN";
  if (track === "TOT-WOMEN-014") return "TOT WOMEN 014";
  if (track === "TOT-WOMEN") return "TOT WOMEN";
  if (track === "general") return "GENERAL";
  return "—";
}

export const isWomenTrack = (track) => /WOMEN/i.test(track || "");

export function formatMoney(amount, currency = "BDT") {
  const n = Number(amount) || 0;
  return `${currency === "BDT" || !currency ? "৳" : `${currency} `}${n.toLocaleString("en-US")}`;
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("bn-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
