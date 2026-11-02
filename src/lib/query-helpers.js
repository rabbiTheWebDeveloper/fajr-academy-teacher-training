/** Shared query helpers for the admin / instructor / trainee APIs. */

/** Roles that count as trainees (people who enrol and pay). */
export const TRAINEE_ROLE_LIST = ["teacher", "student", "participant"];

/** Escape user input before building a RegExp — "(" etc. used to crash search with a 500. */
export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive "contains" search over several fields, or null for an empty term. */
export function searchFilter(term, fields) {
  const clean = String(term || "").trim();
  if (!clean) return null;
  const rx = new RegExp(escapeRegex(clean), "i");
  return { $or: fields.map((f) => ({ [f]: rx })) };
}

/**
 * Batch filter on the user `track` field.
 * "men" / "women" are the UI shorthands; anything else is an exact track code.
 * Gender is deliberately NOT used: it defaults to "male", which double-counted people.
 */
export function trackFilter(track) {
  if (!track || track === "all") return null;
  if (track === "men") return { track: "TOT-MEN" };
  if (track === "women") return { track: { $regex: /WOMEN/i } };
  return { track };
}

/** Course code a trainee belongs to, derived from their track. */
export function courseIdForTrack(track) {
  return /WOMEN/i.test(track || "") ? "TOT-WOMEN-014" : "TOT-MEN";
}

/** Pagination params with sane bounds. */
export function pagination(searchParams, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || defaultLimit, 1), maxLimit);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
}

/** Deep-serialise lean docs (ObjectIds, Dates) into plain JSON for client components. */
export const toPlain = (value) => JSON.parse(JSON.stringify(value ?? null));

/** Keep only whitelisted keys from a request body. */
export function pick(source, keys) {
  const out = {};
  for (const k of keys) if (source?.[k] !== undefined) out[k] = source[k];
  return out;
}

/** Validate a MongoDB ObjectId string. */
export const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);
