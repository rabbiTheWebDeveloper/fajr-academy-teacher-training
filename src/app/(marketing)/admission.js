// Shared admission & enrollment-window helpers (server + client safe: plain functions only).

/** Fired by <AdmitLink track="men|women"> so the registration form can pre-select the batch. */
export const SELECT_TRACK_EVENT = 'fajr:select-track'

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000 // Asia/Dhaka is UTC+6 all year (no DST)
const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
]

const toBn = (v) => String(v ?? '').replace(/\d/g, (d) => BN_DIGITS[d])

/**
 * Normalizes an ISO or datetime-local string into a canonical Bangladesh-time ISO string
 * ("2026-11-30T23:59:00+06:00"). Returns "" for empty input and null for invalid dates.
 */
export function normalizeEnrollmentDate(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  // Plain date "YYYY-MM-DD" → end-of-day Dhaka time is NOT guessed; treat as 00:00 Dhaka unless time given.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const withTz = `${raw}T00:00:00+06:00`
    return Number.isNaN(Date.parse(withTz)) ? null : withTz
  }
  // HTML datetime-local "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss" without offset → Dhaka (+06:00).
  const localMatch = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?$/.exec(raw)
  if (localMatch) {
    const withTz = `${localMatch[1]}T${localMatch[2]}:${localMatch[3] || '00'}+06:00`
    return Number.isNaN(Date.parse(withTz)) ? null : withTz
  }
  const ms = Date.parse(raw)
  if (Number.isNaN(ms)) return null
  return formatIsoInDhaka(ms)
}

/** Converts a timestamp (ms) to "YYYY-MM-DDTHH:mm:ss+06:00". */
export function formatIsoInDhaka(ms) {
  const local = new Date(ms + DHAKA_OFFSET_MS)
  const y = local.getUTCFullYear()
  const mo = String(local.getUTCMonth() + 1).padStart(2, '0')
  const d = String(local.getUTCDate()).padStart(2, '0')
  const h = String(local.getUTCHours()).padStart(2, '0')
  const mi = String(local.getUTCMinutes()).padStart(2, '0')
  const s = String(local.getUTCSeconds()).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:${mi}:${s}+06:00`
}

/** Converts a stored ISO/date string to "YYYY-MM-DDTHH:mm" in Dhaka time for <input type="datetime-local">. */
export function toDhakaInputValue(value) {
  const ms = parseEnrollmentDate(value)
  if (ms == null) return ''
  return formatIsoInDhaka(ms).slice(0, 16)
}

/** Parses an enrollment ISO string into epoch ms, or null if empty/invalid. */
export function parseEnrollmentDate(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const normalized = normalizeEnrollmentDate(raw)
  if (!normalized) return null
  const ms = Date.parse(normalized)
  return Number.isNaN(ms) ? null : ms
}

/**
 * Deterministic Bengali date + time in Bangladesh time (SSR + browser identical).
 * Example: "৩০ নভেম্বর ২০২৬, রাত ১১:৫৯ টা"
 */
export function formatEnrollmentDateBn(value) {
  const ms = typeof value === 'number' ? value : parseEnrollmentDate(value)
  if (ms == null) return ''
  const local = new Date(ms + DHAKA_OFFSET_MS)
  const day = local.getUTCDate()
  const month = BN_MONTHS[local.getUTCMonth()]
  const year = local.getUTCFullYear()
  const h24 = local.getUTCHours()
  const min = local.getUTCMinutes()
  const h12 = h24 % 12 || 12
  const period =
    h24 < 5 ? 'ভোর' : h24 < 12 ? 'সকাল' : h24 < 15 ? 'দুপুর' : h24 < 18 ? 'বিকাল' : h24 < 20 ? 'সন্ধ্যা' : 'রাত'
  return `${toBn(day)} ${month} ${toBn(year)}, ${period} ${toBn(h12)}:${toBn(String(min).padStart(2, '0'))} টা`
}

/**
 * Splits remaining ms into { days, hours, minutes, seconds } (all >= 0).
 */
export function countdownParts(targetMs, nowMs) {
  const diff = Math.max(0, (Number(targetMs) || 0) - (Number(nowMs) || 0))
  return {
    diff,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

/**
 * Admission mode + live enrollment window state from public settings.
 *
 *   mode          : 'open' | 'waitlist' | 'closed'
 *   closed        : boolean (true when manually closed, deadline passed, or waiting for next start)
 *   phase         : 'open' | 'closing_soon' | 'ended' | 'upcoming' | 'manual_closed'
 *   countdownKind : 'ending' | 'next_start' | null
 *   targetAt      : ms timestamp for the active countdown (or null)
 *   endAt         : parsed enrollmentEndDate ms (or null)
 *   nextStartAt   : parsed nextEnrollmentStartDate ms (or null)
 *   closedReason  : Bengali explanation when closed
 */
export function admissionState(settings = {}, nowMs = Date.now()) {
  const manuallyClosed = settings.registrationOpen === false || settings.admissionStatus === 'closed'
  const baseOpenMode = settings.admissionStatus === 'waitlist' ? 'waitlist' : 'open'
  const endAt = parseEnrollmentDate(settings.enrollmentEndDate)
  const nextStartAt = parseEnrollmentDate(settings.nextEnrollmentStartDate)
  const now = Number.isFinite(nowMs) ? nowMs : Date.now()

  const endText = endAt ? formatEnrollmentDateBn(endAt) : ''
  const nextStartText = nextStartAt ? formatEnrollmentDateBn(nextStartAt) : ''

  // 1. Manually switched off by admin
  if (manuallyClosed) {
    const hasFutureNext = Boolean(nextStartAt && nextStartAt > now)
    return {
      mode: 'closed',
      closed: true,
      phase: 'manual_closed',
      countdownKind: hasFutureNext ? 'next_start' : null,
      targetAt: hasFutureNext ? nextStartAt : null,
      endAt,
      nextStartAt,
      endText,
      nextStartText,
      label: hasFutureNext
        ? `ভর্তি সাময়িক বন্ধ — পরবর্তী ভর্তি শুরু: ${nextStartText}`
        : 'ভর্তি সাময়িক সমাপ্ত — পরবর্তী ব্যাচ শীঘ্রই',
      closedReason: hasFutureNext
        ? `এই মুহূর্তে ভর্তি বন্ধ রয়েছে। পরবর্তী ব্যাচের ভর্তি শুরু হবে ${nextStartText}।`
        : 'এই মুহূর্তে ভর্তি বন্ধ রয়েছে। পরবর্তী ব্যাচের আপডেটের জন্য Facebook Messenger-এ যোগাযোগ করুন।',
    }
  }

  // 2. Enrollment end date is configured
  if (endAt) {
    // 2a. Before deadline → enrollment is running with live countdown to end
    if (now < endAt) {
      return {
        mode: baseOpenMode,
        closed: false,
        phase: 'closing_soon',
        countdownKind: 'ending',
        targetAt: endAt,
        endAt,
        nextStartAt,
        endText,
        nextStartText,
        label:
          baseOpenMode === 'waitlist'
            ? `অপেক্ষমাণ তালিকা চলছে — শেষ তারিখ: ${endText}`
            : `ভর্তি চলছে — শেষ সময়: ${endText}`,
        closedReason: '',
      }
    }

    // 2b. Deadline passed, check if next enrollment has ALREADY started
    if (nextStartAt && nextStartAt > endAt && now >= nextStartAt) {
      return {
        mode: baseOpenMode,
        closed: false,
        phase: 'open',
        countdownKind: null,
        targetAt: null,
        endAt,
        nextStartAt,
        endText,
        nextStartText,
        label:
          baseOpenMode === 'waitlist'
            ? 'অপেক্ষমাণ তালিকা চলছে — আসন সীমিত'
            : 'নতুন ব্যাচের ভর্তি চলছে — সীমিত আসন',
        closedReason: '',
      }
    }

    // 2c. Deadline passed and next enrollment is either upcoming or not set yet → CLOSED
    const hasFutureNext = Boolean(nextStartAt && nextStartAt > now)
    return {
      mode: 'closed',
      closed: true,
      phase: 'ended',
      countdownKind: hasFutureNext ? 'next_start' : null,
      targetAt: hasFutureNext ? nextStartAt : null,
      endAt,
      nextStartAt,
      endText,
      nextStartText,
      label: hasFutureNext
        ? `ভর্তি সময় শেষ — পরবর্তী ভর্তি শুরু: ${nextStartText}`
        : 'ভর্তির সময় শেষ হয়েছে — পরবর্তী ব্যাচ শীঘ্রই',
      closedReason: hasFutureNext
        ? `বর্তমান ব্যাচের ভর্তির সময় শেষ হয়েছে। পরবর্তী ভর্তি শুরু হবে ${nextStartText}।`
        : 'বর্তমান ব্যাচের ভর্তির সময় শেষ হয়েছে। পরবর্তী ব্যাচের আপডেটের জন্য Facebook Messenger-এ যোগাযোগ করুন।',
    }
  }

  // 3. Only nextEnrollmentStartDate is set and still in the future → upcoming (closed until start)
  if (nextStartAt && now < nextStartAt) {
    return {
      mode: 'closed',
      closed: true,
      phase: 'upcoming',
      countdownKind: 'next_start',
      targetAt: nextStartAt,
      endAt: null,
      nextStartAt,
      endText: '',
      nextStartText,
      label: `পরবর্তী ব্যাচের ভর্তি শুরু হবে: ${nextStartText}`,
      closedReason: `পরবর্তী ব্যাচের ভর্তি এখনো শুরু হয়নি। ভর্তি শুরু হবে ${nextStartText}।`,
    }
  }

  // 4. Open without deadline
  return {
    mode: baseOpenMode,
    closed: false,
    phase: 'open',
    countdownKind: null,
    targetAt: null,
    endAt,
    nextStartAt,
    endText,
    nextStartText,
    label: baseOpenMode === 'waitlist' ? 'অপেক্ষমাণ তালিকা চলছে — আসন সীমিত' : 'ভর্তি চলছে — সীমিত আসন',
    closedReason: '',
  }
}

/** Percentage saved against the regular fee, or 0 when there is no real discount. */
export function discountPercent(fee, regularFee) {
  const f = Number(fee)
  const r = Number(regularFee)
  if (!Number.isFinite(f) || !Number.isFinite(r) || r <= 0 || f >= r) return 0
  return Math.round((1 - f / r) * 100)
}

/**
 * Honest seat line for a batch, built only from real numbers.
 * Returns { text, tone } where tone is 'urgent' | 'info' | 'plain'.
 */
export function seatLine(course = {}, toBnFn = String) {
  const enrolled = Number(course.enrolledCount) || 0
  const max = Number(course.maxSeats) || 0
  if (max > 0 && enrolled >= max) return { text: 'আসন পূর্ণ — অপেক্ষমাণ তালিকায় যুক্ত হোন', tone: 'urgent' }
  if (max > 0 && (max - enrolled) / max <= 0.2) {
    return { text: `মাত্র ${toBnFn(max - enrolled)}টি আসন বাকি`, tone: 'urgent' }
  }
  if (enrolled > 0) return { text: `${toBnFn(enrolled)} জন ইতোমধ্যে ভর্তি হয়েছেন`, tone: 'info' }
  return { text: 'সীমিত আসন', tone: 'plain' }
}
