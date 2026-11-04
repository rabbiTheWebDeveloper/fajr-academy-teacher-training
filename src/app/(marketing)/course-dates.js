import { MEN_TOT_CURRICULUM, WOMEN_TOT_CURRICULUM } from '@/constant/course-defaults'

/** Shown when a session has no date yet — never a guessed date. */
export const NO_DATE = 'তারিখ ঘোষণা হবে'

/** The course's own curriculum, else the built-in curriculum for that batch. */
export function modulesFor(course, track) {
  if (course?.curriculum?.length) return course.curriculum
  return track === 'women' ? WOMEN_TOT_CURRICULUM : MEN_TOT_CURRICULUM
}

/** One row per session, in order, with its date text (liveDate, else sessionDate). */
export function sessionRows(modules = []) {
  return [...modules]
    .sort((a, b) => (a.moduleNo ?? 0) - (b.moduleNo ?? 0))
    .map((m, i) => ({
      key: String(m._id || `${m.moduleNo ?? i}-${i}`),
      no: m.moduleNo ?? i + 1,
      title: m.title || '',
      trainer: m.trainerName || '',
      date: m.liveDate || m.sessionDate || NO_DATE,
      time: m.sessionTime || '',
    }))
}

/** "first → last" date text for a batch; a single date when they match. */
export function sessionRange(rows = []) {
  if (rows.length === 0) return NO_DATE
  const first = rows[0].date
  const last = rows[rows.length - 1].date
  if (first === last) return first
  if (first === NO_DATE && last === NO_DATE) return NO_DATE
  return `${first} → ${last}`
}
