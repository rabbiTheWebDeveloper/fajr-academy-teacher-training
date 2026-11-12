'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, LinkIcon, ShieldCheck } from "lucide-react";
import { Alert, AuthCard, PasswordField, SubmitButton } from "./AuthUI";

const MIN_LENGTH = 6; // keep in sync with MIN_PASSWORD_LENGTH in src/lib/password.js

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  // "checking" → "ready" | "invalid"
  const [status, setStatus] = useState(token ? "checking" : "invalid");
  const [invalidMsg, setInvalidMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.valid) setStatus("ready");
        else {
          setInvalidMsg(data.message || "");
          setStatus("invalid");
        }
      })
      .catch(() => {
        // Couldn't check (network) — let the user try; the POST validates again.
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const next = password.trim();
    if (next.length < MIN_LENGTH) {
      setErrorMsg(`পাসওয়ার্ড কমপক্ষে ${MIN_LENGTH} অক্ষরের হতে হবে।`);
      return;
    }
    if (next !== confirm.trim()) {
      setErrorMsg("দুটি পাসওয়ার্ড মিলছে না। অনুগ্রহ করে আবার লিখুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const qs = new URLSearchParams({ reset: "success" });
        if (data.email) qs.set("email", data.email);
        router.replace(`/login?${qs}`);
        return; // keep the spinner until the login page shows
      }
      if (data.expired) {
        setInvalidMsg(data.message || "");
        setStatus("invalid");
      } else {
        setErrorMsg(data.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক সংযোগ ত্রুটি। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    }
    setLoading(false);
  };

  if (status === "checking") {
    return (
      <AuthCard icon={ShieldCheck} title="লিংক যাচাই করা হচ্ছে" subtitle="অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...">
        <div className="flex justify-center py-4">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (status === "invalid") {
    return (
      <AuthCard
        icon={LinkIcon}
        title="লিংকটি আর কার্যকর নেই"
        subtitle={
          invalidMsg ||
          "এই রিসেট লিংকটি সঠিক নয় অথবা এর মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে নতুন লিংকের জন্য আবার অনুরোধ করুন।"
        }
      >
        <Link
          href="/forgot-password"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/50 transition-all hover:brightness-110"
        >
          নতুন রিসেট লিংক নিন <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </Link>
        <Link
          href="/login"
          className="mt-5 block text-center text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          লগইন পেজে ফিরে যান
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      icon={ShieldCheck}
      title="নতুন পাসওয়ার্ড সেট করুন"
      subtitle="এমন একটি পাসওয়ার্ড দিন যা আপনি সহজে মনে রাখতে পারবেন কিন্তু অন্যরা অনুমান করতে পারবে না।"
    >
      {errorMsg ? <Alert icon={AlertCircle}>{errorMsg}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="নতুন পাসওয়ার্ড"
          name="new-password"
          autoComplete="new-password"
          autoFocus
          required
          minLength={MIN_LENGTH}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          hint={`কমপক্ষে ${MIN_LENGTH} অক্ষর`}
        />
        <PasswordField
          label="পাসওয়ার্ড নিশ্চিত করুন"
          name="confirm-password"
          autoComplete="new-password"
          required
          maxLength={128}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
        />

        <SubmitButton loading={loading} loadingText="সংরক্ষণ করা হচ্ছে...">
          পাসওয়ার্ড পরিবর্তন করুন <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </SubmitButton>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-center text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        লগইন পেজে ফিরে যান
      </Link>
    </AuthCard>
  );
}
