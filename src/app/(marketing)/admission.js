// Shared admission helpers for the marketing page (server + client safe: plain functions only).

/** Fired by <AdmitLink track="men|women"> so the registration form can pre-select the batch. */
export const SELECT_TRACK_EVENT = 'fajr:select-track'

/**
 * Admission mode from the public settings.
 *   open     → admission running
 *   waitlist → running, but seats are limited / waiting list
 *   closed   → registration switched off
 */
export function admissionState(settings = {}) {
  const closed = settings.registrationOpen === false || settings.admissionStatus === 'closed'
  const mode = closed ? 'closed' : settings.admissionStatus === 'waitlist' ? 'waitlist' : 'open'
  const label = {
    open: 'ভর্তি চলছে — সীমিত আসন',
    waitlist: 'অপেক্ষমাণ তালিকা চলছে — আসন সীমিত',
    closed: 'ভর্তি সাময়িক সমাপ্ত — পরবর্তী ব্যাচ শীঘ্রই',
  }[mode]
  return { mode, closed, label }
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
export function seatLine(course = {}, toBn = String) {
  const enrolled = Number(course.enrolledCount) || 0
  const max = Number(course.maxSeats) || 0
  if (max > 0 && enrolled >= max) return { text: 'আসন পূর্ণ — অপেক্ষমাণ তালিকায় যুক্ত হোন', tone: 'urgent' }
  if (max > 0 && (max - enrolled) / max <= 0.2) {
    return { text: `মাত্র ${toBn(max - enrolled)}টি আসন বাকি`, tone: 'urgent' }
  }
  if (enrolled > 0) return { text: `${toBn(enrolled)} জন ইতোমধ্যে ভর্তি হয়েছেন`, tone: 'info' }
  return { text: 'সীমিত আসন', tone: 'plain' }
}
