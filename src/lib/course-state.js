/**
 * Course publishing lifecycle — shared by the admin API, the instructor panel and the
 * admin screen (no imports, so it is safe in client components).
 *
 *   draft        being prepared; visible to admins (and in the instructor materials list) only
 *   published    live: shown on the website and open for admission (subject to status/seats)
 *   unpublished  hidden from the website and closed for NEW admission, but a running batch:
 *                enrolled trainees keep their classes and materials, instructors keep working
 *   archived     finished batch kept for history: hidden, no new admission; enrolled trainees
 *                keep access to what they already had. Must be restored before reuse.
 *
 * `isPublished` stays on the document and always equals (publishState === "published"),
 * so every existing public query / checkout check keeps working unchanged.
 */
export const COURSE_STATES = ["draft", "published", "unpublished", "archived"];

export const COURSE_STATE_LABEL = {
  draft: "ড্রাফট",
  published: "প্রকাশিত",
  unpublished: "আনপাবলিশড",
  archived: "আর্কাইভড",
};

/** State of a course document. Older documents only carry the isPublished flag. */
export function courseState(course) {
  if (COURSE_STATES.includes(course?.publishState)) return course.publishState;
  return course?.isPublished === false ? "unpublished" : "published";
}

/** A course document with a consistent publishState + isPublished pair. */
export function withCourseState(course) {
  const publishState = courseState(course);
  return { ...course, publishState, isPublished: publishState === "published" };
}

/**
 * Mongo filter for courses that are "operating": published or hidden-but-running.
 * Excludes drafts and archives; also matches older documents that have no publishState.
 */
export const OPERATING_COURSE_FILTER = { publishState: { $nin: ["draft", "archived"] } };

/** Why a state change is not allowed, or null. `participants` = enrolments on the course. */
export function transitionProblem(from, to, { participants = 0 } = {}) {
  if (!COURSE_STATES.includes(to)) return "কোর্সের অবস্থা সঠিক নয়।";
  if (from === to) return "কোর্সটি আগে থেকেই এই অবস্থায় আছে।";
  if (from === "archived" && to !== "unpublished") {
    return "আর্কাইভ করা কোর্স আগে “রিস্টোর” করুন (রিস্টোর করলে আনপাবলিশড অবস্থায় ফিরে আসে), তারপর প্রকাশ করুন।";
  }
  if (to === "draft" && participants > 0) {
    return `এই কোর্সে ${participants} জন অংশগ্রহণকারী আছেন, তাই ড্রাফটে নেওয়া যাবে না। নতুন ভর্তি বন্ধ করতে “আনপাবলিশ” করুন, ব্যাচ শেষ হলে “আর্কাইভ” করুন।`;
  }
  return null;
}

/** Why a course cannot be published yet, or null. */
export function publishProblem(course) {
  if (!String(course?.name || "").trim()) return "প্রকাশের আগে কোর্সের নাম দিন।";
  if (!(Number(course?.fee) > 0)) return "প্রকাশের আগে কোর্স ফি ০ এর বেশি দিন — অনলাইন পেমেন্টে ০ টাকার কোর্স চালানো যায় না।";
  return null;
}
