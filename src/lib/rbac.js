/**
 * Admin-panel access control — the single source of truth for who may do what.
 * Dependency-free, so server code (API routes, pages) and client components share it.
 *
 * Two layers:
 *   1. Account role (UserModel.role)
 *        "super-admin" → everything, including every DELETE and user / role management.
 *        "admin"       → works inside the panel, limited by an optional custom access role.
 *   2. Custom access role (RoleModel) — a named list of `module:action` strings that a
 *      super-admin builds, e.g. an "Accountant" who may read + update payments only.
 *
 * Hard rules (enforced in hasPermission, so no stored data can override them):
 *   - "delete" is never granted to anyone but a super-admin.
 *   - The "users" module (admin accounts + roles) is super-admin only.
 */

export const ACTION_LABEL = {
  read: "দেখা",
  create: "যোগ করা",
  update: "সম্পাদনা",
  delete: "মুছে ফেলা",
};

/** Actions a custom role can carry. "delete" is deliberately missing. */
export const ASSIGNABLE_ACTIONS = ["read", "create", "update"];

/** Modules a custom role can be given. `actions` lists what the admin panel offers for each. */
export const PERMISSION_MODULES = [
  { id: "tots", label: "TOT ট্রেইনি", hint: "ট্রেইনির তালিকা, অ্যাকাউন্ট ও কোর্সে ভর্তি", actions: ["read", "create", "update"] },
  { id: "payments", label: "পেমেন্ট ভেরিফিকেশন", hint: "পেমেন্ট যাচাই, ম্যানুয়াল পেমেন্ট ও রিফান্ড", actions: ["read", "create", "update"] },
  { id: "courses", label: "কোর্স ও সেশন", hint: "কোর্স, কারিকুলাম, স্টাডি ফাইল ও প্রকাশনা", actions: ["read", "create", "update"] },
  { id: "instructors", label: "ইনস্ট্রাক্টর", hint: "ইনস্ট্রাক্টরের অ্যাকাউন্ট ও প্রোফাইল", actions: ["read", "create", "update"] },
  { id: "evaluations", label: "মূল্যায়ন ও ফলাফল", hint: "ট্রেইনির মূল্যায়ন ও সনদের অবস্থা দেখা", actions: ["read"] },
  { id: "announcements", label: "ঘোষণা ও নোটিশ", hint: "ট্রেইনি ও শিক্ষকদের জন্য নোটিশ", actions: ["read", "create", "update"] },
  { id: "settings", label: "সিস্টেম সেটিংস", hint: "প্ল্যাটফর্ম কনফিগারেশন", actions: ["read", "update"] },
];

/** Modules no custom role can reach — only a super-admin. */
export const SUPER_ONLY_MODULES = ["users"];

const MODULE_BY_ID = Object.fromEntries(PERMISSION_MODULES.map((m) => [m.id, m]));

export const permissionKey = (module, action) => `${module}:${action}`;

/** Every grantable `module:action` — what a plain "admin" without a custom role gets. */
export const DEFAULT_ADMIN_PERMISSIONS = PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permissionKey(m.id, a)));

/**
 * Cleans a permission list from the outside world: known module + assignable action only,
 * no duplicates, and create/update always bring `read` with them (you can't edit what you
 * can't open).
 */
export function normalizePermissions(list) {
  const wanted = new Set();
  for (const raw of Array.isArray(list) ? list : []) {
    const [module, action] = String(raw).split(":");
    const def = MODULE_BY_ID[module];
    if (!def || !ASSIGNABLE_ACTIONS.includes(action) || !def.actions.includes(action)) continue;
    wanted.add(permissionKey(module, action));
    if (action !== "read") wanted.add(permissionKey(module, "read"));
  }
  return PERMISSION_MODULES.flatMap((m) => m.actions.map((a) => permissionKey(m.id, a))).filter((k) => wanted.has(k));
}

/**
 * Can this access object do `action` on `module`?
 *   access  → { isSuper: boolean, permissions: string[] }
 *   module  → one id, or an array meaning "any of these"
 */
export function hasPermission(access, module, action = "read") {
  if (!access) return false;
  if (access.isSuper) return true;
  if (action === "delete") return false;
  const permissions = access.permissions || [];
  return (Array.isArray(module) ? module : [module]).some(
    (m) => !SUPER_ONLY_MODULES.includes(m) && permissions.includes(permissionKey(m, action))
  );
}

/** Modules (from PERMISSION_MODULES) the access object can at least read. */
export const readableModules = (access) => PERMISSION_MODULES.filter((m) => hasPermission(access, m.id, "read"));

export const SUPER_ADMIN_LABEL = "সুপার অ্যাডমিন";
export const DEFAULT_ADMIN_LABEL = "অ্যাডমিন";
