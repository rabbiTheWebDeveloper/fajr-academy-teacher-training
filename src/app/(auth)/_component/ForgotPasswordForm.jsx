'use client';

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, KeyRound, Mail, MailCheck } from "lucide-react";
import { Alert, AuthCard, Field, SubmitButton, SUPPORT_URL } from "./AuthUI";

export default function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sent, setSent] = useState(null); // { maskedEmail, minutes }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSent({ maskedEmail: data.maskedEmail || "", minutes: data.expiresInMinutes || 30 });
      } else {
        setErrorMsg(data.message || "অনুরোধটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক সংযোগ ত্রুটি। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = (
    <Link
      href="/login"
      className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> লগইন পেজে ফিরে যান
    </Link>
  );

  if (sent) {
    return (
      <AuthCard
        icon={MailCheck}
        title="ইমেইল চেক করুন"
        subtitle="পাসওয়ার্ড রিসেট করার লিংক আপনার অ্যাকাউন্টের ইমেইলে পাঠানো হয়েছে।"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
          {sent.maskedEmail ? (
            <p className="text-sm font-bold text-amber-300 break-all" dir="ltr">
              {sent.maskedEmail}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            ইমেইলের লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন। লিংকটি {sent.minutes} মিনিট পর্যন্ত কার্যকর থাকবে।
            ইনবক্সে না পেলে Spam / Promotions ফোল্ডার দেখুন।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10 cursor-pointer"
        >
          ইমেইল পাননি? আবার চেষ্টা করুন
        </button>

        {backToLogin}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={KeyRound}
      title="পাসওয়ার্ড ভুলে গেছেন?"
      subtitle="আপনার অ্যাকাউন্টের ইমেইল অথবা মোবাইল নম্বর দিন — আমরা ইমেইলে একটি রিসেট লিংক পাঠিয়ে দেব।"
    >
      {errorMsg ? <Alert icon={AlertCircle}>{errorMsg}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="ইমেইল অথবা মোবাইল নম্বর"
          icon={Mail}
          type="text"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="017xxxxxxxx বা you@example.com"
        />

        <SubmitButton loading={loading} loadingText="পাঠানো হচ্ছে...">
          রিসেট লিংক পাঠান <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
        ইমেইলে প্রবেশাধিকার নেই?{" "}
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-amber-400 hover:underline">
          সাপোর্ট হেল্পলাইনে যোগাযোগ করুন
        </a>
      </p>

      {backToLogin}
    </AuthCard>
  );
}
