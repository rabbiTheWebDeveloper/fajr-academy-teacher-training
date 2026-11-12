'use client';

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LogIn,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Alert, AuthCard, Field, PasswordField, SubmitButton, SUPPORT_URL } from "./AuthUI";

const DEV_ACCOUNTS = [
  { label: "Trainee", id: "teacher.men@fajracademy.io", pw: "Fajr@Teacher2026" },
  { label: "Instructor", id: "instructor.men@fajracademy.io", pw: "Fajr@Instructor2026" },
  { label: "Admin", id: "admin@fajracademy.io", pw: "Fajr@Admin2026" },
];

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect") || "";
  const reasonParam = searchParams.get("reason") || "";
  const paymentParam = searchParams.get("payment") || "";
  const resetParam = searchParams.get("reset") || "";

  const [identifier, setIdentifier] = useState(
    searchParams.get("email") || searchParams.get("phone") || ""
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [unpaidInfo, setUnpaidInfo] = useState(null);
  const isDev = process.env.NODE_ENV !== "production";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setUnpaidInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        // Safe redirect check: ensure destination matches the user's role access
        const safeRedirect =
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.startsWith("//") &&
          !redirectParam.startsWith("/\\")
            ? redirectParam
            : null;

        let targetUrl = data.redirectUrl || "/dashboard";

        if (safeRedirect) {
          const isAdminPath = safeRedirect.startsWith("/admin");
          const isInstructorPath = safeRedirect.startsWith("/instructor");
          const isTraineePath = !isAdminPath && !isInstructorPath;

          const role = data.user?.role;
          const isUserAdmin = role === "admin" || role === "super-admin";
          const isUserInstructor = role === "instructor" || isUserAdmin;
          const isUserTrainee = ["teacher", "student", "participant"].includes(role);

          if (isAdminPath && isUserAdmin) {
            targetUrl = safeRedirect;
          } else if (isInstructorPath && isUserInstructor) {
            targetUrl = safeRedirect;
          } else if (isTraineePath && isUserTrainee) {
            targetUrl = safeRedirect;
          }
        }

        router.push(targetUrl);
        router.refresh();
        return; // keep the button in its loading state while the panel loads
      }

      if (data.isUnpaid) {
        setUnpaidInfo({ tranId: data.tranId, email: data.email, message: data.message });
      } else {
        setErrorMsg(data.message || "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে তথ্য পুনরায় যাচাই করুন।");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক সংযোগ ত্রুটি। দয়া করে আপনার ইন্টারনেট চেক করে আবার চেষ্টা করুন।");
    }
    setLoading(false);
  };

  return (
    <AuthCard
      icon={LogIn}
      title="অ্যাকাউন্টে লগইন করুন"
      subtitle="আপনার ইমেইল বা মোবাইল নম্বর এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন"
    >
      {errorMsg ? <Alert icon={AlertCircle}>{errorMsg}</Alert> : null}

      {resetParam === "success" && !errorMsg ? (
        <Alert tone="success" icon={CheckCircle2} title="পাসওয়ার্ড পরিবর্তন হয়েছে">
          এখন আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন।
        </Alert>
      ) : null}

      {redirectParam.startsWith("/admin") ? (
        <Alert tone="warning" icon={ShieldCheck} title="অ্যাডমিন এক্সেস সংরক্ষিত">
          প্রশাসনিক প্যানেল দেখতে অনুগ্রহ করে আপনার অ্যাডমিন অ্যাকাউন্টে লগইন করুন।
        </Alert>
      ) : null}

      {redirectParam.startsWith("/instructor") ? (
        <Alert tone="info" icon={UserCheck} title="ইনস্ট্রাক্টর কনসোল এক্সেস">
          ক্লাস মূল্যায়ন ও ট্রেইনার কনসোল দেখতে ইনস্ট্রাক্টর অ্যাকাউন্টে লগইন করুন।
        </Alert>
      ) : null}

      {reasonParam === "session_expired" ? (
        <Alert tone="warning" icon={AlertCircle}>
          আপনার পূর্ববর্তী সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।
        </Alert>
      ) : null}

      {reasonParam === "account_disabled" ? (
        <Alert icon={AlertCircle}>
          এই অ্যাডমিন অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে বা আর নেই। সুপার-অ্যাডমিনের সাথে যোগাযোগ করুন।
        </Alert>
      ) : null}

      {/* Returned from the gateway after a verified payment */}
      {paymentParam === "success" ? (
        <Alert tone="success" icon={CheckCircle2}>
          পেমেন্ট সফলভাবে যাচাই হয়েছে! আপনার ইমেইল ও রেজিস্ট্রেশনের পাসওয়ার্ড দিয়ে লগইন করুন।
        </Alert>
      ) : null}

      {unpaidInfo ? (
        <Alert tone="warning" icon={CreditCard} title="পেমেন্ট পেন্ডিং রয়েছে!">
          <p className="text-slate-300">{unpaidInfo.message}</p>
          <Link
            href={`/payment/ssl-checkout?email=${encodeURIComponent(unpaidInfo.email || "")}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 py-2.5 text-xs font-black text-slate-950 shadow-md transition-all hover:brightness-110"
          >
            কোর্স ফি পরিশোধ করুন <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="ইমেইল অথবা মোবাইল নম্বর"
          icon={Mail}
          type="text"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="017xxxxxxxx বা you@example.com"
        />

        <PasswordField
          label="পাসওয়ার্ড"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          labelRight={
            <Link
              href="/forgot-password"
              className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          }
        />

        <SubmitButton loading={loading} loadingText="যাচাই করা হচ্ছে...">
          লগইন করুন <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </SubmitButton>
      </form>

      {/* Development quick-fill (never rendered in production builds) */}
      {isDev ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/10 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Dev quick fill · local seed only
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {DEV_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setUnpaidInfo(null);
                  setIdentifier(acc.id);
                  setPassword(acc.pw);
                }}
                className="rounded-md border border-white/10 bg-white/5 py-1.5 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/10 cursor-pointer"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-xs">
        <Link href="/#register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
          নতুন আবেদন করুন
        </Link>
        <a
          href={SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-slate-300 hover:text-white hover:underline transition-colors"
        >
          সাপোর্ট হেল্পলাইন
        </a>
      </div>
    </AuthCard>
  );
}
