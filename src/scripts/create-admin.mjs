/**
 * Create the default super-admin — safe to run against PRODUCTION:
 *
 *   pnpm seed:admin
 *
 * Reads (environment first, then .env.local, then .env):
 *   MONGODB_CONNECTION_STRING   required
 *   DEFAULT_ADMIN_EMAIL         required
 *   DEFAULT_ADMIN_PASSWORD      required — at least 10 characters, not a public demo password
 *   DEFAULT_ADMIN_NAME          optional
 *   DEFAULT_ADMIN_PHONE         optional
 *
 * Creates the account (role super-admin, collection "users") only if that e-mail has no
 * account yet. An existing account is never changed, and the password is never printed.
 * Without a shell on the server, set the same DEFAULT_ADMIN_* variables there instead:
 * the app creates this admin by itself on its first start when no admin exists.
 */
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { ensureDefaultAdmin } from "../service/admin-bootstrap.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadEnvFiles() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf-8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

async function main() {
  const env = loadEnvFiles();
  const uri = env.MONGODB_CONNECTION_STRING;
  if (!uri) {
    console.error("MONGODB_CONNECTION_STRING is not set.");
    return 1;
  }
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); // querySrv ECONNREFUSED on some Windows ISPs
  } catch {}

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  try {
    const result = await ensureDefaultAdmin(mongoose.connection.db, { env, onlyIfNoAdmin: false });
    switch (result.status) {
      case "created":
        console.log(`✓ Super-admin created: ${result.email}\n  Sign in at /login, then change the password (Admin → অ্যাডমিন ইউজার → key icon).`);
        return 0;
      case "exists":
        console.log(`- ${result.message}. Nothing changed.`);
        return 0;
      case "not-configured":
        console.error("Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD (environment, .env.local or .env).");
        return 1;
      default:
        console.error(`✗ ${result.message || result.status}`);
        return 1;
    }
  } finally {
    await mongoose.disconnect();
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error("seed:admin failed:", err.message);
    process.exitCode = 1;
  });
