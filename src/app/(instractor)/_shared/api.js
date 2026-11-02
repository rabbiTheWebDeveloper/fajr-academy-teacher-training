/**
 * fetch() wrapper for the instructor APIs.
 * Every API answers `{ success, message, ... }`; on a non-2xx status (or success:false)
 * this throws an Error carrying the server's own `message`, so the UI can always show it.
 */
export async function apiFetch(url, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      cache: "no-store",
      signal,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error("সার্ভারের সাথে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok || !data || data.success === false) {
    const fallback =
      res.status === 401
        ? "আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।"
        : res.status === 403
          ? "এই কাজটি করার অনুমতি আপনার অ্যাকাউন্টে নেই।"
          : `অনুরোধটি সম্পন্ন করা যায়নি (HTTP ${res.status})।`;
    const error = new Error(data?.message || fallback);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const isAbort = (error) => error?.name === "AbortError";
