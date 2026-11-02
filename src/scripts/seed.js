/**
 * Local demo seeder:  node src/scripts/seed.js
 *
 * Creates one admin (users), two instructors (instructors) and two paid trainees (tots)
 * — the same three collections the app uses. Existing accounts (any collection) are
 * never modified, passwords are stored as scrypt hashes, and the connection string comes
 * ONLY from MONGODB_CONNECTION_STRING (.env.local / .env / environment).
 * The running app offers the same via GET /api/seed (development only).
 */
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { randomBytes, scryptSync } = require("crypto");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); // querySrv ECONNREFUSED on some Windows ISPs
} catch {}

function readEnv(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    const full = path.resolve(__dirname, "../..", file);
    if (!fs.existsSync(full)) continue;
    const match = fs.readFileSync(full, "utf-8").match(new RegExp(`^${name}=(.+)$`, "m"));
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const hash = (plain) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${scryptSync(plain, salt, 64).toString("base64")}`;
};

const now = () => new Date();
const ACCOUNTS = [
  ["users", { fullName: "Maulana Farabi Chowdhury", email: "admin@fajracademy.io", phone: "01410764581", role: "admin", designation: "Founder & Lead Administrator" }, "Fajr@Admin2026"],
  ["instructors", { fullName: "Shaykh Abdullah Al-Mahmud", email: "instructor.men@fajracademy.io", phone: "01711223344", role: "instructor", track: "TOT-MEN", gender: "male", designation: "Senior Master Trainer (Men Track)", experienceYears: 8, rating: 4.9 }, "Fajr@Instructor2026"],
  ["instructors", { fullName: "Ustadha Farhana Chowdhury", email: "instructor.women@fajracademy.io", phone: "01811223344", role: "instructor", track: "TOT-WOMEN-014", gender: "female", designation: "Lead Trainer (Women Batch 014)", experienceYears: 6, rating: 4.8 }, "Fajr@Instructor2026"],
  ["tots", { fullName: "Hafiz Tariqul Islam", email: "teacher.men@fajracademy.io", phone: "01911223344", role: "teacher", track: "TOT-MEN", gender: "male", paymentStatus: "paid", paidAmount: 1000, tranId: "TOT-PAID-MEN-001" }, "Fajr@Teacher2026"],
  ["tots", { fullName: "Nusrat Jahan", email: "teacher.women@fajracademy.io", phone: "01611223344", role: "teacher", track: "TOT-WOMEN-014", gender: "female", paymentStatus: "paid", paidAmount: 1000, tranId: "TOT-PAID-WOMEN-014" }, "Fajr@Teacher2026"],
];

async function seed() {
  const uri = readEnv("MONGODB_CONNECTION_STRING");
  if (!uri) {
    console.error("MONGODB_CONNECTION_STRING is not set (.env.local / .env / environment).");
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  try {
    for (const [collection, data, demoPassword] of ACCOUNTS) {
      const taken = await Promise.all(["users", "instructors", "tots"].map((c) => db.collection(c).findOne({ email: data.email }, { projection: { _id: 1 } })));
      if (taken.some(Boolean)) {
        console.log(`- exists, untouched: ${data.email}`);
        continue;
      }
      await db.collection(collection).insertOne({ ...data, password: hash(demoPassword), isActive: true, createdAt: now(), updatedAt: now() });
      console.log(`✓ ${collection}: ${data.email} (password: ${demoPassword})`);
    }
    console.log("\nDone. Trainee enrolments/payments are created when you use GET /api/seed on the running app.");
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((err) => {
  console.error("Seed error:", err.message);
  process.exitCode = 1;
});
