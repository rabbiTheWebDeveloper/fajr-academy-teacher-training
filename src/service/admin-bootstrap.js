import { hashPassword } from "../lib/password.js";
import { phoneVariants } from "../lib/phone.js";

/**
 * Default (first) admin account — works in production, where /api/seed is closed.
 *
 * Server environment:
 *   DEFAULT_ADMIN_EMAIL     required
 *   DEFAULT_ADMIN_PASSWORD  required — at least 10 characters, not a public demo password
 *   DEFAULT_ADMIN_NAME      optional (default "System Administrator")
 *   DEFAULT_ADMIN_PHONE     optional
 *
 * Automatic (every server start, from dbConnect): creates that account as super-admin
 *   ONLY when the "users" collection has no active admin — i.e. a fresh database.
 * Manual (`pnpm seed:admin`): creates it if that e-mail has no account yet.
 *
 * Never modifies an existing account and never logs the password.
 * Relative imports only, so the CLI script can use this file outside Next.js.
 */
const ADMIN_ROLES = ["admin", "super-admin"];
const ACCOUNT_COLLECTIONS = ["users", "instructors", "tots"];
const PUBLIC_DEMO_PASSWORDS = ["Fajr@Admin2026", "Fajr@Instructor2026", "Fajr@Teacher2026"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_DEFAULT_ADMIN_PASSWORD = 10;

export function readDefaultAdminConfig(env = process.env) {
  return {
    email: String(env.DEFAULT_ADMIN_EMAIL || "").trim().toLowerCase(),
    password: String(env.DEFAULT_ADMIN_PASSWORD || ""),
    fullName: String(env.DEFAULT_ADMIN_NAME || "").trim().slice(0, 100) || "System Administrator",
    phone: phoneVariants(env.DEFAULT_ADMIN_PHONE || "")[0] || "",
  };
}

/** null when usable, "not_configured" when unset, otherwise a human-readable problem. */
export function defaultAdminConfigProblem(cfg) {
  if (!cfg.email && !cfg.password) return "not_configured";
  if (!EMAIL_RX.test(cfg.email)) return "DEFAULT_ADMIN_EMAIL is missing or not a valid e-mail address";
  if (cfg.password.length < MIN_DEFAULT_ADMIN_PASSWORD) {
    return `DEFAULT_ADMIN_PASSWORD must be at least ${MIN_DEFAULT_ADMIN_PASSWORD} characters`;
  }
  if (PUBLIC_DEMO_PASSWORDS.includes(cfg.password)) return "DEFAULT_ADMIN_PASSWORD is a public demo password — choose your own";
  return null;
}

/**
 * @param db  native MongoDB Db (mongoose.connection.db)
 * @returns {Promise<{ status: "created"|"admin-exists"|"exists"|"conflict"|"invalid"|"not-configured", email?: string, message?: string }>}
 */
export async function ensureDefaultAdmin(db, { env = process.env, onlyIfNoAdmin = true } = {}) {
  const users = db.collection("users");
  const activeAdmins = await users.countDocuments({ role: { $in: ADMIN_ROLES }, isActive: { $ne: false } });
  if (onlyIfNoAdmin && activeAdmins > 0) return { status: "admin-exists" };

  const cfg = readDefaultAdminConfig(env);
  const problem = defaultAdminConfigProblem(cfg);
  if (problem === "not_configured") {
    if (activeAdmins === 0) {
      console.warn(
        "[accounts] No active admin account exists. Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD and restart, or run `pnpm seed:admin`."
      );
    }
    return { status: "not-configured" };
  }
  if (problem) {
    console.error(`[accounts] default admin not created: ${problem}`);
    return { status: "invalid", message: problem };
  }

  // One e-mail = one account across admins, instructors and trainees.
  for (const name of ACCOUNT_COLLECTIONS) {
    const found = await db.collection(name).findOne({ email: cfg.email }, { projection: { role: 1, isActive: 1 } });
    if (!found) continue;
    const message =
      name === "users"
        ? `${cfg.email} already exists (role ${found.role || "?"}${found.isActive === false ? ", inactive" : ""}) — left unchanged`
        : `${cfg.email} already belongs to an account in "${name}" — use a different DEFAULT_ADMIN_EMAIL`;
    console.warn(`[accounts] default admin not created: ${message}`);
    return { status: name === "users" ? "exists" : "conflict", email: cfg.email, message };
  }

  let phone = cfg.phone;
  if (phone) {
    const variants = phoneVariants(phone);
    for (const name of ACCOUNT_COLLECTIONS) {
      if (await db.collection(name).findOne({ phone: { $in: variants } }, { projection: { _id: 1 } })) {
        console.warn(`[accounts] DEFAULT_ADMIN_PHONE is already used by another account — admin created without a phone`);
        phone = "";
        break;
      }
    }
  }

  // Same unique index UserModel declares; makes simultaneous server starts create one account.
  await users.createIndex({ email: 1 }, { unique: true }).catch(() => {});
  const now = new Date();
  try {
    const res = await users.updateOne(
      { email: cfg.email },
      {
        $setOnInsert: {
          fullName: cfg.fullName,
          email: cfg.email,
          phone,
          password: await hashPassword(cfg.password),
          role: "super-admin",
          designation: "Super Administrator",
          department: "Administration",
          employeeId: "",
          gender: "",
          permissions: [],
          avatar: "",
          isActive: true,
          lastLogin: null,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
    if (!res.upsertedCount) return { status: "exists", email: cfg.email, message: "created by another server instance" };
  } catch (err) {
    if (err?.code === 11000) return { status: "exists", email: cfg.email, message: "created by another server instance" };
    throw err;
  }

  console.log(`[accounts] default super-admin created: ${cfg.email} — sign in and change this password from Admin → অ্যাডমিন ইউজার.`);
  return { status: "created", email: cfg.email };
}
