import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    await dbConnect();

    const seedUsers = [
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

    const results = [];

    for (const u of seedUsers) {
      const user = await UserModel.findOneAndUpdate(
        { email: u.email },
        { ...u, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      // Create verified payment records for teachers
      await PaymentModel.findOneAndUpdate(
        { tranId: u.tranId },
        {
          tranId: u.tranId,
          userEmail: u.email,
          userName: u.fullName,
          userPhone: u.phone,
          track: u.track,
          amount: u.paidAmount || 1000,
          status: "VALID",
          cardType: "SEED_VERIFIED",
          paymentGateway: "sslcommerz",
        },
        { upsert: true, new: true }
      );

      results.push({
        name: user.fullName,
        email: user.email,
        password: u.password,
        role: user.role,
        track: user.track,
        loginPortal:
          user.role === "admin"
            ? "/admin"
            : user.role === "instructor"
            ? "/instructor"
            : "/dashboard",
      });
    }

    return NextResponse.json({
      success: true,
      message: "সকল সিড ইউজার সফলভাবে ডাটাবেজে তৈরি ও আপডেট হয়েছে!",
      accounts: results,
    });
  } catch (error) {
    console.error("Seed execution error:", error);
    return NextResponse.json(
      { success: false, message: "সিড তৈরিতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
