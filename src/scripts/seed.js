const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dns = require("dns");

// Use Google/Cloudflare DNS to fix querySrv ECONNREFUSED on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

// Read .env
const envFile = path.resolve(__dirname, "../../.env");
let mongoUri = "mongodb+srv://rabbifajracademy:rabbi.fajracademy@cluster0.c6bc0x0.mongodb.net/fajrtraining";

if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, "utf-8");
  const match = content.match(/MONGODB_CONNECTION_STRING=(.+)/);
  if (match && match[1]) {
    mongoUri = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

const seedAccounts = [
  {
    fullName: "Maulana Farabi Chowdhury",
    email: "admin@fajracademy.io",
    phone: "01410764581",
    password: "Fajr@Admin2026",
    role: "admin",
    track: "TOT-MEN",
    gender: "male",
    designation: "Founder & Lead Administrator",
    paymentStatus: "paid",
    paidAmount: 1000,
    tranId: "ADM-SEED-001",
    isActive: true,
  },
  {
    fullName: "Shaykh Abdullah Al-Mahmud",
    email: "instructor.men@fajracademy.io",
    phone: "01711223344",
    password: "Fajr@Instructor2026",
    role: "instructor",
    track: "TOT-MEN",
    gender: "male",
    designation: "Senior Master Trainer (Men Track)",
    paymentStatus: "paid",
    paidAmount: 1000,
    tranId: "INST-MEN-001",
    isActive: true,
  },
  {
    fullName: "Ustadha Farhana Chowdhury",
    email: "instructor.women@fajracademy.io",
    phone: "01811223344",
    password: "Fajr@Instructor2026",
    role: "instructor",
    track: "TOT-WOMEN-014",
    gender: "female",
    designation: "Lead Trainer (Women Batch 014)",
    paymentStatus: "paid",
    paidAmount: 1000,
    tranId: "INST-WOMEN-014",
    isActive: true,
  },
  {
    fullName: "Hafiz Tariqul Islam",
    email: "teacher.men@fajracademy.io",
    phone: "01911223344",
    password: "Fajr@Teacher2026",
    role: "teacher",
    track: "TOT-MEN",
    gender: "male",
    designation: "TOT Trainee Teacher",
    paymentStatus: "paid",
    paidAmount: 1000,
    tranId: "TOT-PAID-MEN-001",
    isActive: true,
  },
  {
    fullName: "Nusrat Jahan",
    email: "teacher.women@fajracademy.io",
    phone: "01611223344",
    password: "Fajr@Teacher2026",
    role: "teacher",
    track: "TOT-WOMEN-014",
    gender: "female",
    designation: "TOT Trainee Teacher",
    paymentStatus: "paid",
    paidAmount: 1000,
    tranId: "TOT-PAID-WOMEN-014",
    isActive: true,
  },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB!");

    const userSchema = new mongoose.Schema(
      {
        fullName: String,
        email: { type: String, unique: true },
        phone: String,
        password: String,
        role: String,
        track: String,
        gender: String,
        designation: String,
        paymentStatus: String,
        paidAmount: Number,
        tranId: String,
        isActive: Boolean,
      },
      { timestamps: true }
    );

    const User = mongoose.models.User || mongoose.model("User", userSchema);

    for (const acc of seedAccounts) {
      await User.findOneAndUpdate({ email: acc.email }, acc, { upsert: true, new: true });
      console.log(`✓ Seeded ${acc.role.toUpperCase()}: ${acc.email} (Password: ${acc.password})`);
    }

    console.log("\nAll seed users created successfully!");
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
