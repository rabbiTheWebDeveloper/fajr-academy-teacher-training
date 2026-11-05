'use client';

/**
 * Shared admin-panel helpers: one fetch wrapper that always surfaces the API's
 * `message`, a toast, the DB-error banner and the one-time password box.
 */

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Copy, Check, KeyRound, RefreshCw, DatabaseZap, ShieldQuestion, Trash2, X } from "lucide-react";
import { useAdminTheme } from "../AdminThemeContext";

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

/* ------------------------------ confirm dialog ------------------------------ */

const CONFIRM_TONES = {
  danger: {
    title: "এই কাজটি ফেরানো যাবে না",
    confirmLabel: "হ্যাঁ, মুছে ফেলুন",
    Icon: Trash2,
    ring: "bg-rose-500/15 text-rose-500",
    btn: "bg-rose-600 hover:bg-rose-500 text-white focus-visible:outline-rose-400",
  },
  warning: {
    title: "নিশ্চিত করুন",
    confirmLabel: "হ্যাঁ, এগিয়ে যান",
    Icon: AlertTriangle,
    ring: "bg-amber-500/15 text-amber-500",
    btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 focus-visible:outline-amber-300",
  },
  primary: {
    title: "নিশ্চিত করুন",
    confirmLabel: "হ্যাঁ, নিশ্চিত করুন",
    Icon: ShieldQuestion,
    ring: "bg-indigo-500/15 text-indigo-500",
    btn: "bg-indigo-600 hover:bg-indigo-500 text-white focus-visible:outline-indigo-400",
  },
};

/** Paragraphs split on blank lines; a paragraph starting with ⚠ is shown as a highlighted warning. */
function splitMessage(message) {
  return String(message || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("⚠") ? { warn: true, text: p.replace(/^⚠\s*/, "") } : { warn: false, text: p }));
}

function ConfirmDialog({ request, onAnswer }) {
  const { isLight } = useAdminTheme();
  const titleId = useId();
  const bodyId = useId();
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const tone = CONFIRM_TONES[request.tone] || CONFIRM_TONES.primary;
  const { Icon } = tone;

  // Focus the safe choice first for destructive actions; restore focus to the trigger when closing.
  useEffect(() => {
    const previous = document.activeElement;
    (request.tone === "danger" ? cancelRef : confirmRef).current?.focus();
    return () => {
      if (previous && typeof previous.focus === "function" && document.contains(previous)) previous.focus();
    };
  }, [request.tone]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onAnswer(false);
    } else if (e.key === "Tab") {
      // keep focus inside the dialog
      const first = cancelRef.current;
      const last = confirmRef.current;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const parts = splitMessage(request.message);

  return (
    <div
      className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onAnswer(false)}
      onKeyDown={onKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-700 text-slate-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${tone.ring}`}>
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={`text-base font-black leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
              {request.title || tone.title}
            </h2>
          </div>
        </div>

        <div id={bodyId} className="space-y-2.5 text-xs leading-relaxed">
          {parts.map((p, i) =>
            p.warn ? (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-xl border font-semibold ${
                  isLight ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-amber-500/10 border-amber-500/40 text-amber-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px text-amber-500" />
                <span className="whitespace-pre-line">{p.text}</span>
              </div>
            ) : (
              <p key={i} className={`whitespace-pre-line wrap-break-word ${i === 0 ? "font-bold" : "font-medium"} ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                {p.text}
              </p>
            )
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onAnswer(false)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
              isLight ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50" : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            }`}
          >
            {request.cancelLabel || "বাতিল"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onAnswer(true)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${tone.btn}`}
          >
            {request.confirmLabel || tone.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * In-app replacement for window.confirm.
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm("…?", { tone: "danger", confirmLabel: "মুছে ফেলুন" }))) return;
 *   …render {confirmDialog} once in the page.
 * tone: "primary" (default) | "warning" | "danger". Resolves true/false; never rejects.
 */
export function useConfirm() {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const settle = useCallback((answer) => {
    const done = resolver.current;
    resolver.current = null;
    setRequest(null);
    if (done) done(answer);
  }, []);

  const confirm = useCallback((message, options = {}) => {
    // A second question replaces an unanswered first one (treated as "no").
    if (resolver.current) resolver.current(false);
    return new Promise((resolve) => {
      resolver.current = resolve;
      setRequest({ message, ...options });
    });
  }, []);

  useEffect(
    () => () => {
      if (resolver.current) resolver.current(false);
    },
    []
  );

  const confirmDialog = request ? <ConfirmDialog request={request} onAnswer={settle} /> : null;
  return { confirm, confirmDialog };
}

/* ---------------------------- formatting helpers ---------------------------- */

/** Roles of TOT trainee accounts (TotModel — Admin → TOT ট্রেইনি). */
export const TOT_ROLE_OPTIONS = [
  { value: "teacher", label: "Teacher (ট্রেইনি শিক্ষক)" },
  { value: "student", label: "Student (শিক্ষার্থী)" },
  { value: "participant", label: "Participant (অংশগ্রহণকারী)" },
];

export const TRAINEE_ROLES = ["teacher", "student", "participant"];

/**
 * WhatsApp chat link (wa.me) for a phone number, or null when there is no usable number.
 * Accepts 01XXXXXXXXX, 1XXXXXXXXX, 8801…, +8801… and Bengali digits; other country codes are kept.
 * `text` pre-fills the message box (the admin still presses send).
 */
export function whatsappHref(phone, text = "") {
  const bn = "০১২৩৪৫৬৭৮৯";
  const digits = String(phone || "")
    .replace(/[০-৯]/g, (d) => String(bn.indexOf(d)))
    .replace(/\D/g, "");
  if (digits.length < 10) return null;
  let international = digits;
  if (digits.startsWith("00")) international = digits.slice(2);
  else if (digits.startsWith("0")) international = `88${digits}`; // local 01XXXXXXXXX
  else if (digits.length === 10 && digits.startsWith("1")) international = `880${digits}`; // 1XXXXXXXXX
  return `https://wa.me/${international}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

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
