import { fromBnDigits, usableLink } from "./format.js";

/**
 * Turns the session dates stored on a course ("23 August 2026, Sunday" + "8:00 PM - 9:30 PM",
 * "2026-08-23", "২০ সেপ্টেম্বর ২০২৬" + "রাত ৮:০০ টা", "August 23, 2026", "23/08/2026") into
 * timestamps in Bangladesh time (UTC+6). Anything that can't be parsed is simply shown as
 * text — never guessed.
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
/** Default duration a session counts as "running" when no explicit end time is set. */
export const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000;

function monthIndex(word) {
  const w = String(word || "").normalize("NFC").toLowerCase().replace(/\.$/, "");
  const en = EN_MONTHS.indexOf(w.slice(0, 3));
  if (en >= 0 && /^[a-z]+$/.test(w)) return en;
  const bn = BN_MONTHS.find(([prefix]) => w.startsWith(prefix));
  return bn ? bn[1] : -1;
}

function parseSingleTime(text, fallbackMeridiem = "") {
  const t = fromBnDigits(text).normalize("NFC").trim();
  if (!t) return null;

  let m = t.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)/i);
  let h;
  let min;
  let meridiem = "";

  if (m) {
    h = Number(m[1]) % 12;
    min = Number(m[2] || 0);
    meridiem = m[3].toLowerCase();
    if (meridiem === "pm") h += 12;
  } else {
    m = t.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return null;
    h = Number(m[1]);
    min = Number(m[2]);
    const evening = /রাত|সন্ধ্যা|বিকা?ে?ল|দুপুর/.test(t);
    const morning = /সকাল|ভোর/.test(t);
    if (evening && h < 12) {
      h += 12;
      meridiem = "pm";
    } else if (!morning && fallbackMeridiem === "pm" && h < 12) {
      h += 12;
      meridiem = "pm";
    } else if (h >= 12) {
      meridiem = "pm";
    } else {
      meridiem = "am";
    }
  }

  if (h > 23 || min > 59) return null;
  return { h, min, meridiem };
}

function parseTimeRange(text) {
  const raw = fromBnDigits(text).normalize("NFC").trim();
  if (!raw) return null;
  const parts = raw.split(/\s*[-–—]\s*/);
  const start = parseSingleTime(parts[0]);
  if (!start) return null;
  const end = parts[1] ? parseSingleTime(parts[1], start.meridiem) : null;
  return { start, end };
}

function parseDateParts(text) {
  const d = fromBnDigits(text).normalize("NFC").trim();
  if (!d) return null;

  // 1. ISO: 2026-08-23 or 2026/08/23
  let m = d.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return { year, month, day, rest: d.slice(m.index + m[0].length) };
    }
  }

  // 2. Day Month Year: "23 August 2026, Sunday" / "২০ সেপ্টেম্বর ২০২৬"
  m = d.match(/(\d{1,2})\s*([^\d\s,()/-]+)\.?\s*,?\s*(\d{4})/);
  if (m) {
    const month = monthIndex(m[2]);
    const day = Number(m[1]);
    const year = Number(m[3]);
    if (month >= 0 && day >= 1 && day <= 31) {
      return { year, month, day, rest: d.slice(m.index + m[0].length) };
    }
  }

  // 3. Month Day, Year: "August 23, 2026"
  m = d.match(/([^\d\s,()/-]+)\.?\s+(\d{1,2})\s*,?\s*(\d{4})/);
  if (m) {
    const month = monthIndex(m[1]);
    const day = Number(m[2]);
    const year = Number(m[3]);
    if (month >= 0 && day >= 1 && day <= 31) {
      return { year, month, day, rest: d.slice(m.index + m[0].length) };
    }
  }

  // 4. DD/MM/YYYY or DD-MM-YYYY
  m = d.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    const year = Number(m[3]);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return { year, month, day, rest: d.slice(m.index + m[0].length) };
    }
  }

  return null;
}

/** { at: ms timestamp, endAt: ms|null, hasTime: boolean } or null when the date text can't be understood. */
export function parseSchedule(dateText, timeText) {
  const parts = parseDateParts(dateText);
  if (!parts) return null;

  const range = parseTimeRange(timeText) || parseTimeRange(parts.rest);
  const start = range?.start || null;
  const at = Date.UTC(parts.year, parts.month, parts.day, start ? start.h : 23, start ? start.min : 59) - DHAKA_OFFSET_MS;

  let endAt = null;
  if (start && range?.end) {
    const candidate = Date.UTC(parts.year, parts.month, parts.day, range.end.h, range.end.min) - DHAKA_OFFSET_MS;
    if (candidate > at) endAt = candidate;
  }

  return { at, endAt, hasTime: Boolean(start) };
}

/**
 * Display date for a session. Prefers `liveDate` (usually Bengali), UNLESS `sessionDate`
 * was edited to a different calendar day (protects against stale `liveDate` values).
 */
export function displaySessionDate(module) {
  const sessionDate = String(module?.sessionDate || "").trim();
  const liveDate = String(module?.liveDate || "").trim();
  if (!liveDate) return sessionDate;
  if (!sessionDate) return liveDate;

  const sd = parseDateParts(sessionDate);
  const ld = parseDateParts(liveDate);
  if (sd && ld && (sd.year !== ld.year || sd.month !== ld.month || sd.day !== ld.day)) {
    return sessionDate;
  }
  return liveDate;
}

/** Sort modules by moduleNo ascending (preserving array order on ties). */
export function sortedModules(curriculum = []) {
  return [...(curriculum || [])]
    .map((m, idx) => ({ m, idx }))
    .sort((a, b) => (Number(a.m?.moduleNo) || a.idx + 1) - (Number(b.m?.moduleNo) || b.idx + 1) || a.idx - b.idx)
    .map(({ m }) => m);
}

/** Curriculum modules (sorted) with parsed start/end time, display date, and resolved links. */
export function moduleSchedule(course) {
  const courseMeet = usableLink(course?.meetLink);
  return sortedModules(course?.curriculum).map((module, i) => {
    const displayDate = displaySessionDate(module);
    const when = parseSchedule(module.sessionDate || module.liveDate, module.sessionTime);
    const ownMeet = usableLink(module.meetLink);
    return {
      key: String(module._id || `module-${module.moduleNo ?? i}-${i}`),
      module,
      when,
      displayDate,
      statusOverride: module.sessionStatus || "",
      meetLink: ownMeet || courseMeet,
      hasOwnMeetLink: Boolean(ownMeet),
      recordingUrl: usableLink(module.recordingUrl),
    };
  });
}

/**
 * "held" | "live" | "upcoming" | "cancelled" | "postponed" | null
 * Respects explicit admin/instructor status overrides first, then falls back to the clock.
 */
export function sessionState(when, now, statusOverride = "") {
  if (statusOverride === "cancelled") return "cancelled";
  if (statusOverride === "postponed") return "postponed";
  if (statusOverride === "live") return "live";
  if (statusOverride === "completed") return "held";

  if (!when || now == null) return null;
  if (!when.hasTime) {
    // Date only: "held" once the whole day is over.
    return when.at < now ? "held" : "upcoming";
  }
  if (now < when.at) return "upcoming";
  const end = when.endAt && when.endAt > when.at ? when.endAt : when.at + LIVE_WINDOW_MS;
  if (now < end) return "live";
  return "held";
}

/** The next (or currently running) event of a course, or null. */
export function nextEvent(course, now) {
  if (now == null || !course) return null;

  const schedule = moduleSchedule(course);
  // Any explicitly marked LIVE session wins immediately (even without a parsed date).
  const forcedLive = schedule.find((e) => e.statusOverride === "live");
  if (forcedLive) {
    return { ...forcedLive, kind: "session", when: forcedLive.when || { at: now, endAt: null, hasTime: true } };
  }

  const events = schedule
    .filter((e) => e.when && e.statusOverride !== "cancelled" && e.statusOverride !== "postponed" && e.statusOverride !== "completed")
    .map((e) => ({ ...e, kind: "session" }));

  const orientation = parseSchedule(course.orientationDate, course.orientationTime);
  if (orientation) {
    events.push({
      key: "orientation",
      kind: "orientation",
      module: null,
      when: orientation,
      statusOverride: "",
      meetLink: usableLink(course.meetLink),
    });
  }

  events.sort((a, b) => a.when.at - b.when.at);
  return events.find((e) => {
    const st = sessionState(e.when, now, e.statusOverride);
    return st === "live" || st === "upcoming";
  }) || null;
}
