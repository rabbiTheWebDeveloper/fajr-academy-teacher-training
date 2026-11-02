import { fromBnDigits } from "./format";

/**
 * Turns the free-text session dates stored on a course ("23 August 2026, Sunday" +
 * "8:00 PM", or "২০ সেপ্টেম্বর ২০২৬" + "রাত ৮:০০ টা") into timestamps in Bangladesh time.
 * Anything that can't be parsed is simply shown as text — never guessed.
 */

const EN_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
// Prefixes, longest / most specific first ("মে" must be tested last).
const BN_MONTHS = [
  ["জানু", 0],
  ["ফেব্রু", 1],
  ["মার্চ", 2],
  ["এপ্রি", 3],
  ["জুলা", 6],
  ["জুন", 5],
  ["আগ", 7],
  ["সেপ্টে", 8],
  ["অক্টো", 9],
  ["নভে", 10],
  ["ডিসে", 11],
  ["মে", 4],
].map(([p, i]) => [p.normalize("NFC"), i]);

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
/** A session counts as "running" for this long after its start time. */
export const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

function monthIndex(word) {
  const w = String(word || "").normalize("NFC").toLowerCase();
  const en = EN_MONTHS.indexOf(w.slice(0, 3));
  if (en >= 0 && /^[a-z]+$/.test(w)) return en;
  const bn = BN_MONTHS.find(([prefix]) => w.startsWith(prefix));
  return bn ? bn[1] : -1;
}

function parseTime(text) {
  const t = fromBnDigits(text).normalize("NFC");
  if (!t.trim()) return null;
  let m = t.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)/i);
  let h;
  let min;
  if (m) {
    h = Number(m[1]) % 12;
    min = Number(m[2] || 0);
    if (/pm/i.test(m[3])) h += 12;
  } else {
    m = t.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return null;
    h = Number(m[1]);
    min = Number(m[2]);
    const evening = /রাত|সন্ধ্যা|বিকা?ে?ল|দুপুর/.test(t);
    if (evening && h < 12) h += 12;
  }
  if (h > 23 || min > 59) return null;
  return { h, min };
}

/** { at: ms timestamp, hasTime } or null when the date text can't be understood. */
export function parseSchedule(dateText, timeText) {
  const d = fromBnDigits(dateText).normalize("NFC");
  const m = d.match(/(\d{1,2})\s*([^\d\s,()]+)\.?\s*,?\s*(\d{4})/);
  if (!m) return null;
  const month = monthIndex(m[2]);
  const day = Number(m[1]);
  const year = Number(m[3]);
  if (month < 0 || day < 1 || day > 31) return null;
  const time = parseTime(timeText) || parseTime(d.slice(m.index + m[0].length));
  const at = Date.UTC(year, month, day, time ? time.h : 23, time ? time.min : 59) - DHAKA_OFFSET_MS;
  return { at, hasTime: Boolean(time) };
}

/** Curriculum modules with their parsed start time. */
export function moduleSchedule(course) {
  return (course?.curriculum || []).map((module, i) => ({
    key: module._id || `module-${module.moduleNo ?? i}`,
    module,
    when: parseSchedule(module.sessionDate || module.liveDate, module.sessionTime),
  }));
}

/** "held" | "live" | "upcoming" | null (unknown date or clock not ready yet). */
export function sessionState(when, now) {
  if (!when || now == null) return null;
  if (!when.hasTime) {
    // Date only: "held" once the whole day is over.
    return when.at < now ? "held" : "upcoming";
  }
  if (now < when.at) return "upcoming";
  if (now < when.at + LIVE_WINDOW_MS) return "live";
  return "held";
}

/** The next (or currently running) dated event of a course, or null. */
export function nextEvent(course, now) {
  if (now == null || !course) return null;
  const events = moduleSchedule(course)
    .filter((e) => e.when)
    .map((e) => ({ ...e, kind: "session" }));
  const orientation = parseSchedule(course.orientationDate, course.orientationTime);
  if (orientation) events.push({ key: "orientation", kind: "orientation", module: null, when: orientation });
  events.sort((a, b) => a.when.at - b.when.at);
  return events.find((e) => sessionState(e.when, now) !== "held") || null;
}
