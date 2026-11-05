import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { enrollUserInCourse } from "@/service/participant-service";
import { findAccountByEmail, modelForType } from "@/service/account-service";
import { requireSuperAdmin } from "@/lib/api-auth";
import { generatePassword } from "@/lib/password";
import { homeForRole } from "@/lib/roles";

/**
 * Demo-account seeder — one account per collection type:
 *   users (admin) · instructors · tots (paid trainees, with payment + enrolment).
 * - Development: GET or POST, demo passwords from the list below.
 * - Production: POST by a super-admin only, and every new account gets a RANDOM password that
 *   is returned once in this response (the demo passwords are public in the source).
 * Existing accounts (in any collection) are never touched.
 */
const isProd = process.env.NODE_ENV === "production";

export async function GET() {
  if (isProd) {
    return NextResponse.json({ success: false, message: "Not available." }, { status: 404 });
  }
  return handleSeed();
}

export async function POST(request) {
  if (isProd) {
    // It can create an admin account, so it is a user-management action: super-admin only.
    const auth = await requireSuperAdmin(request);
    if (auth.error) return auth.error;
  }
  return handleSeed();
}

const SEED_ACCOUNTS = [
  {
    type: "admin",
    demoPassword: "Fajr@Admin2026",
    data: {
      fullName: "Maulana Farabi Chowdhury",
      email: "admin@fajracademy.io",
      phone: "01410764581",
      role: "admin",
      designation: "Founder & Lead Administrator",
    },
  },
  {
    type: "instructor",
    demoPassword: "Fajr@Instructor2026",
    data: {
      fullName: "Shaykh Abdullah Al-Mahmud",
      email: "instructor.men@fajracademy.io",
      phone: "01711223344",
      role: "instructor",
      track: "TOT-MEN",
      gender: "male",
      designation: "Senior Master Trainer (Men Track)",
      experienceYears: 8,
      rating: 4.9,
    },
  },
  {
    type: "instructor",
    demoPassword: "Fajr@Instructor2026",
    data: {
      fullName: "Ustadha Farhana Chowdhury",
      email: "instructor.women@fajracademy.io",
      phone: "01811223344",
      role: "instructor",
      track: "TOT-WOMEN-014",
      gender: "female",
      designation: "Lead Trainer (Women Batch 014)",
      experienceYears: 6,
      rating: 4.8,
    },
  },
  {
    type: "tot",
    demoPassword: "Fajr@Teacher2026",
    tranId: "TOT-PAID-MEN-001",
    data: {
      fullName: "Hafiz Tariqul Islam",
      email: "teacher.men@fajracademy.io",
      phone: "01911223344",
      role: "teacher",
      track: "TOT-MEN",
      gender: "male",
    },
  },
  {
    type: "tot",
    demoPassword: "Fajr@Teacher2026",
    tranId: "TOT-PAID-WOMEN-014",
    data: {
      fullName: "Nusrat Jahan",
      email: "teacher.women@fajracademy.io",
      phone: "01611223344",
      role: "teacher",
      track: "TOT-WOMEN-014",
      gender: "female",
    },
  },
];

async function handleSeed() {
  try {
    await dbConnect();
    const results = [];

    for (const seed of SEED_ACCOUNTS) {
      const { email } = seed.data;
      const existing = await findAccountByEmail(email);
      if (existing) {
        results.push({ name: existing.account.fullName, email, type: existing.type, role: existing.account.role, status: "already-exists" });
        continue;
      }

      const password = isProd ? generatePassword() : seed.demoPassword;
      const Model = modelForType(seed.type);
      const isTrainee = seed.type === "tot";
      const account = await Model.create({
        ...seed.data,
        password,
        isActive: true,
        ...(isTrainee ? { paymentStatus: "paid", paidAmount: 1000, tranId: seed.tranId, enrolledAt: new Date() } : {}),
      });

      // Trainees get a verified payment record and an active enrolment, like a real purchase.
      if (isTrainee) {
        await PaymentModel.updateOne(
          { tranId: seed.tranId },
          {
            $setOnInsert: {
              tranId: seed.tranId,
              user: account._id,
              userEmail: email,
              userName: account.fullName,
              userPhone: account.phone,
              track: account.track,
              courseId: account.track,
              amount: 1000,
              status: "VALID",
              purpose: "manual",
              cardType: "SEED_VERIFIED",
              paymentMethod: "SEED",
              paymentGateway: "seed",
              finalizedAt: new Date(),
              verifiedBy: "seed",
            },
          },
          { upsert: true }
        );
        try {
          await enrollUserInCourse({
            userId: account._id,
            courseId: account.track,
            tranId: seed.tranId,
            amount: 1000,
            paymentStatus: "paid",
            status: "active",
          });
        } catch (e) {
          console.warn("Seed enrolment warning:", e.message);
        }
      }

      results.push({
        name: account.fullName,
        email,
        password, // shown once, only for accounts this call created
        type: seed.type,
        role: account.role,
        status: "created",
        loginPortal: homeForRole(account.role),
      });
    }

    return NextResponse.json({
      success: true,
      message: "সিড অ্যাকাউন্ট তৈরি সম্পন্ন — অ্যাডমিন (users), ইনস্ট্রাক্টর (instructors) ও ট্রেইনি (tots) আলাদা কালেকশনে।",
      accounts: results,
    });
  } catch (error) {
    console.error("Seed execution error:", error);
    return NextResponse.json({ success: false, message: "সিড তৈরিতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
