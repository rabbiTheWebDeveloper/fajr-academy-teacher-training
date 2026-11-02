'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Mail, KeyRound } from 'lucide-react'

/**
 * Checkout for an EXISTING account (a signed-in trainee buying a course, or an account
 * created unpaid that must prove ownership with its password). New applicants register
 * on the home page form. The price shown comes from the course catalogue and the server
 * charges the course fee itself — nothing on this page can change the amount or mark a
 * payment as paid.
 */
const toBn = (n) => Number(n || 0).toLocaleString('en-US').replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

function SSLCheckoutContent() {
  const searchParams = useSearchParams()
  const courseParam = searchParams.get('course') || ''
  const presetEmail = searchParams.get('email') || ''

  const [me, setMe] = useState(undefined) // undefined = loading, null = signed out
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState(courseParam)
  const [identifier, setIdentifier] = useState(presetEmail)
  const [password, setPassword] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/courses').then((r) => r.json()).catch(() => ({ courses: [] })),
    ]).then(([meRes, courseRes]) => {
      if (!alive) return
      const user = meRes?.user || null
      const list = courseRes?.courses || []
      setMe(user)
      setCourses(list)
      if (!courseParam && list.length) {
        const own = list.find((c) => c.courseId === (/WOMEN/i.test(user?.track || '') ? 'TOT-WOMEN-014' : 'TOT-MEN'))
        setCourseId((own || list[0]).courseId)
      }
    })
    return () => {
      alive = false
    }
  }, [courseParam])

  const course = useMemo(() => courses.find((c) => c.courseId === courseId), [courses, courseId])

  const handlePay = async () => {
    setErrorMsg('')
    if (!course) return setErrorMsg('অনুগ্রহ করে একটি কোর্স নির্বাচন করুন।')
    if (!me && (!identifier.trim() || !password.trim())) {
      return setErrorMsg('আপনার অ্যাকাউন্টের ইমেইল/মোবাইল এবং পাসওয়ার্ড দিন।')
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/payment/sslcommerz/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(me ? { courseId } : { courseId, identifier: identifier.trim(), password: password.trim() }),
      })
      const data = await res.json()
      if (data.success && data.gatewayUrl) {
        window.location.href = data.gatewayUrl
        return
      }
      setErrorMsg(data.message || 'পেমেন্ট শুরু করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } catch {
      setErrorMsg('নেটওয়ার্ক সমস্যা হয়েছে। ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।')
    }
    setProcessing(false)
  }

  return (
    <div className="min-h-screen bg-[#051329] text-white selection:bg-amber-500 selection:text-white py-8 px-4 sm:px-6 lg:px-8 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fajr-logo.png" alt="Fajr Academy" className="w-10 h-10 rounded-xl object-cover shadow-lg border border-[#C59B27]/50" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white font-serif">FAJR ACADEMY</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#F59E0B]">Secure Checkout</span>
          </div>
        </Link>
        <Link href={me ? '/dashboard' : '/login'} className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> {me ? 'ড্যাশবোর্ডে ফিরে যান' : 'লগইন পেজে ফিরে যান'}
        </Link>
      </header>

      <main className="max-w-3xl mx-auto w-full my-8 relative z-10">
        <div className="bg-[#071328]/90 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#030d1d] via-[#071733] to-[#0a234d] p-5 sm:p-7 border-b border-[#C59B27]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
                কোর্স ফি পরিশোধ
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SSLCommerz
                </span>
              </h1>
              <p className="text-xs text-[#F59E0B] font-semibold mt-1">বিকাশ, নগদ, রকেট, কার্ড ও ইন্টারনেট ব্যাংকিং</p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">পরিশোধযোগ্য ফি</span>
              <span className="text-2xl sm:text-3xl font-black text-[#FACC15]">
                {course ? `৳ ${toBn(course.fee)}` : '—'} <span className="text-xs font-bold text-slate-300">BDT</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div role="alert" className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Course picker */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-bold text-white mb-2">কোর্স নির্বাচন করুন</legend>
              {courses.length === 0 && <p className="text-xs text-slate-400">কোর্সের তালিকা লোড হচ্ছে…</p>}
              <div className="grid sm:grid-cols-2 gap-3">
                {courses.map((c) => (
                  <label
                    key={c.courseId}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      c.courseId === courseId ? 'border-amber-400 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                    }`}
                  >
                    <input type="radio" name="course" value={c.courseId} checked={c.courseId === courseId} onChange={() => setCourseId(c.courseId)} className="sr-only" />
                    <span className="block text-sm font-bold text-white">{c.name}</span>
                    <span className="block text-xs text-slate-400 mt-1">ওরিয়েন্টেশন: {c.orientationDate}</span>
                    <span className="flex items-center justify-between mt-2">
                      <span className="text-amber-300 font-black">৳ {toBn(c.fee)}</span>
                      {c.courseId === courseId && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Who is paying */}
            {me === undefined ? (
              <p className="text-xs text-slate-400">অ্যাকাউন্ট যাচাই করা হচ্ছে…</p>
            ) : me ? (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                পেমেন্ট করছেন: <strong className="text-white">{me.fullName}</strong> ({me.email})
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার অ্যাকাউন্ট যাচাই করতে ইমেইল/মোবাইল ও পাসওয়ার্ড দিন। নতুন হলে{' '}
                  <Link href="/#register" className="text-amber-300 underline">হোম পেজ থেকে রেজিস্ট্রেশন করুন</Link>।
                </p>
                <label className="block">
                  <span className="text-xs font-bold text-slate-200">ইমেইল বা মোবাইল</span>
                  <span className="relative block mt-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-200">পাসওয়ার্ড</span>
                  <span className="relative block mt-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  </span>
                </label>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-300 leading-relaxed flex gap-2">
              <Lock className="w-4 h-4 text-[#F59E0B] shrink-0" />
              পরবর্তী ধাপে SSLCommerz-এর নিরাপদ পেজে পেমেন্ট করবেন। পেমেন্ট গেটওয়েতে যাচাই হওয়ার সাথে সাথে কোর্সটি আপনার অ্যাকাউন্টে যুক্ত হবে।
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={processing || me === undefined || !course}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-amber-600/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {processing ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> গেটওয়েতে নিয়ে যাওয়া হচ্ছে…
                </>
              ) : (
                <>
                  {course ? `৳ ${toBn(course.fee)} পরিশোধ করুন` : 'পরিশোধ করুন'} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SSLCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#051329]" />}>
      <SSLCheckoutContent />
    </Suspense>
  )
}
