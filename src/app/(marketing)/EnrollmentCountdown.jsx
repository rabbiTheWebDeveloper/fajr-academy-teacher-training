'use client'

import { useSyncExternalStore } from 'react'
import { Calendar, Clock, Flame, Hourglass, Lock } from 'lucide-react'
import { admissionState, countdownParts } from './admission'
import { toBengaliNumber } from '@/lib/utils'

const subscribe = (onTick) => {
  const id = setInterval(onTick, 1000)
  return () => clearInterval(id)
}
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000
const getServerSnapshot = () => null

function useLiveNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const padBn = (n) => toBengaliNumber(String(n).padStart(2, '0'))

/**
 * Live enrollment deadline & next-enrollment-start countdown for the marketing page.
 *
 * Variants:
 *   - "bar"     compact inline ticker for the top announcement bar
 *   - "compact" sleek 4-box strip for the hero card
 *   - "card"    full countdown banner for AdmissionHighlight and #register
 *
 * Renders nothing when no enrollmentEndDate / nextEnrollmentStartDate applies.
 */
export default function EnrollmentCountdown({ settings = {}, variant = 'card', className = '' }) {
  const now = useLiveNow()
  const hasSchedule = Boolean(settings?.enrollmentEndDate || settings?.nextEnrollmentStartDate)
  if (!hasSchedule) return null

  const state = now != null ? admissionState(settings, now) : null
  const isEnding = state?.countdownKind === 'ending'
  const isNextStart = state?.countdownKind === 'next_start'
  const isEndedNoNext = state?.phase === 'ended' && !state?.countdownKind

  // Nothing to show once the window has moved cleanly to open with no countdown target
  if (state && !isEnding && !isNextStart && !isEndedNoNext) return null

  const parts = state?.targetAt && now != null ? countdownParts(state.targetAt, now) : null
  const urgent = Boolean(isEnding && parts && parts.diff > 0 && parts.diff < 24 * 60 * 60 * 1000)

  /* ---------------- Top Announcement Bar Variant ---------------- */
  if (variant === 'bar') {
    if (!parts) return null
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap ${
          urgent
            ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
            : isNextStart
              ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
              : 'border-amber-400/40 bg-amber-400/15 text-amber-200'
        } ${className}`}
      >
        <Clock className="h-3 w-3 shrink-0" />
        <span className="hidden sm:inline font-bengali">
          {isNextStart ? 'পরবর্তী ভর্তি শুরু:' : 'ভর্তি শেষ হতে বাকি:'}
        </span>
        <span>
          {padBn(parts.days)}দি : {padBn(parts.hours)}ঘ : {padBn(parts.minutes)}মি : {padBn(parts.seconds)}সে
        </span>
      </span>
    )
  }

  /* ---------------- Neutral SSR placeholder (avoids hydration mismatch) ---------------- */
  if (!state) {
    return (
      <div
        className={`rounded-2xl border border-amber-400/25 bg-[#060F22]/90 px-4 py-3 text-center text-xs text-slate-300 ${className}`}
      >
        ভর্তির সময়সীমা হিসাব করা হচ্ছে…
      </div>
    )
  }

  /* ---------------- Ended (no next start date set) ---------------- */
  if (isEndedNoNext) {
    return (
      <div
        className={`rounded-2xl border border-rose-400/35 bg-rose-950/30 p-4 text-center sm:text-left ${className}`}
      >
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-200">
            <Lock className="h-4 w-4 shrink-0 text-rose-400" />
            <span>বর্তমান ব্যাচের ভর্তির সময় শেষ হয়েছে</span>
          </div>
          {state.endText && (
            <span className="text-xs text-rose-200/80">শেষ সময় ছিল: {state.endText}</span>
          )}
        </div>
      </div>
    )
  }

  const units = [
    { label: 'দিন', value: parts.days },
    { label: 'ঘণ্টা', value: parts.hours },
    { label: 'মিনিট', value: parts.minutes },
    { label: 'সেকেন্ড', value: parts.seconds },
  ]

  /* ---------------- Compact Hero Strip Variant ---------------- */
  if (variant === 'compact') {
    return (
      <div
        className={`rounded-2xl border p-3.5 ${
          urgent
            ? 'border-rose-400/45 bg-rose-950/35'
            : isNextStart
              ? 'border-sky-400/35 bg-sky-950/30'
              : 'border-amber-400/35 bg-amber-500/[0.08]'
        } ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
              urgent ? 'text-rose-200' : isNextStart ? 'text-sky-200' : 'text-amber-300'
            }`}
          >
            {isNextStart ? (
              <Hourglass className="h-3.5 w-3.5" />
            ) : (
              <Flame className={`h-3.5 w-3.5 ${urgent ? 'animate-pulse text-rose-400' : ''}`} />
            )}
            {isNextStart ? 'পরবর্তী ভর্তি শুরু হতে বাকি' : 'ভর্তি শেষ হতে বাকি'}
          </span>
          <span className="text-[10px] text-slate-300 truncate">
            {isNextStart ? state.nextStartText : state.endText}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {units.map((u) => (
            <div
              key={u.label}
              className="rounded-xl border border-white/10 bg-[#060D1A]/85 px-2 py-2"
            >
              <div
                className={`font-mono text-lg font-black leading-none ${
                  urgent ? 'text-rose-300' : isNextStart ? 'text-sky-300' : 'text-amber-300'
                }`}
              >
                {padBn(u.value)}
              </div>
              <div className="mt-1 text-[10px] font-medium text-slate-400">{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ---------------- Full Card Variant (AdmissionHighlight & #register) ---------------- */
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        urgent
          ? 'border-rose-400/50 bg-gradient-to-r from-rose-950/55 via-[#0B152B] to-amber-950/35'
          : isNextStart
            ? 'border-sky-400/40 bg-gradient-to-r from-sky-950/45 via-[#0B152B] to-indigo-950/40'
            : 'border-amber-400/40 bg-gradient-to-r from-amber-500/10 via-[#0B152B] to-amber-500/5'
      } ${className}`}
    >
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="space-y-1 text-center md:text-left">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              urgent
                ? 'border-rose-400/50 bg-rose-500/20 text-rose-200'
                : isNextStart
                  ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
                  : 'border-amber-400/40 bg-amber-400/15 text-amber-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full animate-pulse ${
                urgent ? 'bg-rose-400' : isNextStart ? 'bg-sky-400' : 'bg-amber-400'
              }`}
            />
            {isNextStart
              ? state.phase === 'ended'
                ? 'বর্তমান ব্যাচের ভর্তি শেষ'
                : 'আসন্ন ব্যাচ ভর্তি'
              : urgent
                ? 'শেষ মুহূর্ত — দ্রুত ভর্তি হোন'
                : 'ভর্তির সময়সীমা চলছে'}
          </div>

          <h3 className="text-base font-black text-white sm:text-lg">
            {isNextStart ? 'পরবর্তী ব্যাচের ভর্তি শুরু হতে বাকি' : 'ভর্তির সময় শেষ হতে বাকি'}
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-300 md:justify-start">
            {isEnding && state.endText && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                শেষ সময়: <strong className="text-white">{state.endText}</strong>
              </span>
            )}
            {state.nextStartText && (isNextStart || (state.endAt && state.nextStartAt > state.endAt)) && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                পরবর্তী ভর্তি শুরু: <strong className="text-white">{state.nextStartText}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center shrink-0">
          {units.map((u) => (
            <div
              key={u.label}
              className={`min-w-[62px] sm:min-w-[74px] rounded-xl border bg-[#060D1A]/90 px-2.5 py-2.5 sm:px-3.5 sm:py-3 shadow-inner ${
                urgent
                  ? 'border-rose-400/40'
                  : isNextStart
                    ? 'border-sky-400/35'
                    : 'border-amber-400/30'
              }`}
            >
              <div
                className={`font-mono text-xl sm:text-2xl font-black leading-none ${
                  urgent ? 'text-rose-300' : isNextStart ? 'text-sky-300' : 'text-amber-300'
                }`}
              >
                {padBn(u.value)}
              </div>
              <div className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-400">{u.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
