'use client';

import React, { useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

/** Shared building blocks for the login / forgot-password / reset-password screens. */

export function AuthCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#071328]/85 backdrop-blur-2xl shadow-2xl shadow-black/60">
        {/* Gold hairline + soft glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-9">
          <div className="text-center mb-7">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-900/40 ring-4 ring-amber-400/10">
              {Icon ? <Icon className="h-6 w-6" strokeWidth={2.25} /> : null}
            </div>
            <h1 className="text-2xl sm:text-[27px] font-black text-white tracking-tight font-serif">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-[13px] text-slate-300/85 leading-relaxed">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

const TONES = {
  error: "bg-rose-500/10 border-rose-400/30 text-rose-100 [&_svg]:text-rose-400",
  warning: "bg-amber-500/10 border-amber-400/30 text-amber-100 [&_svg]:text-amber-400",
  success: "bg-emerald-500/10 border-emerald-400/30 text-emerald-100 [&_svg]:text-emerald-400",
  info: "bg-sky-500/10 border-sky-400/30 text-sky-100 [&_svg]:text-sky-400",
};

export function Alert({ tone = "error", icon: Icon, title, children }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mb-4 flex items-start gap-2.5 rounded-2xl border p-3.5 text-xs leading-relaxed ${TONES[tone] || TONES.error}`}
    >
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0" /> : null}
      <div className="flex-1 font-medium">
        {title ? <strong className="mb-0.5 block text-[13px] text-white">{title}</strong> : null}
        {children}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 text-base sm:text-sm font-medium text-white " +
  "placeholder:text-slate-500 outline-none transition-all hover:border-white/20 " +
  "focus:border-amber-400/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-amber-400/15";

export function Field({ label, icon: Icon, labelRight, hint, className = "", ...inputProps }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-bold text-slate-200">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        <input id={id} className={`${INPUT_CLASS} pr-4 ${className}`} {...inputProps} />
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}
      </div>
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function PasswordField({ label, labelRight, hint, ...inputProps }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-bold text-slate-200">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} className={`${INPUT_CLASS} pr-12`} {...inputProps} />
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          title={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function SubmitButton({ loading, loadingText = "অপেক্ষা করুন...", disabled, children }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3.5 text-sm sm:text-[15px] font-black text-slate-950 shadow-lg shadow-amber-950/50 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export const SUPPORT_URL = "https://wa.me/8801410764581?text=Login%20Help%20Fajr%20TOT";
