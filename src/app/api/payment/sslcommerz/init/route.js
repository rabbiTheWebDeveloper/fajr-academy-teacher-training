import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { initSSLCommerzPayment } from "@/lib/sslcommerz";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      fullName,
      email,
      phone,
      password,
      gender = "male",
      track = "TOT-MEN",
      hasLaptop = "yes",
      quranSkill = "fluent",
      englishSkill = "basic",
      education = "",
      amount = 1000,
    } = body;

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "নাম, ইমেইল ও মোবাইল নম্বর আবশ্যক।" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const tranId = `TOT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if an account already exists and is paid
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser && (existingUser.paymentStatus === "paid" || existingUser.paymentStatus === "free")) {
      return NextResponse.json(
        {
          success: false,
          alreadyPaid: true,
          message: "এই ইমেইল দিয়ে ইতোমধ্যে কোর্স ফি পরিশোধ করা হয়েছে এবং অ্যাকাউন্টটি সক্রিয় রয়েছে। অনুগ্রহ করে সরাসরি লগইন করুন।",
        },
        { status: 400 }
      );
    }

    // If an unpaid/pending user record was left over from a previous abandoned attempt, remove it
    if (existingUser && existingUser.paymentStatus !== "paid") {
      await UserModel.deleteMany({ email: cleanEmail, paymentStatus: { $ne: "paid" } });
    }

    const userPassword = password || "Fajr@Teacher2026";

    // Save pending payment record with full registration data
    // NOTE: UserModel will ONLY be created once payment is confirmed VALID/SUCCESS!
    const paymentRecord = await PaymentModel.create({
      tranId,
      amount: Number(amount) || 1000,
      currency: "BDT",
      status: "PENDING",
      userEmail: cleanEmail,
      userName: fullName.trim(),
      userPhone: phone.trim(),
      track,
      paymentMethod: "SSLCOMMERZ",
      registrationData: {
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password: userPassword,
        gender: gender === "female" ? "female" : "male",
        track,
        hasLaptop: hasLaptop || "yes",
        quranSkill: quranSkill || "fluent",
        englishSkill: englishSkill || "basic",
        education: education ? education.trim() : "",
        amount: Number(amount) || 1000,
      },
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    const paymentResult = await initSSLCommerzPayment({
      tranId,
      amount: Number(amount) || 1000,
      productName:
        track === "TOT-MEN"
          ? "TOT - MEN Training Course"
          : "TOT - WOMEN Training Course (Batch 014)",
      cusName: fullName,
      cusEmail: cleanEmail,
      cusPhone: phone,
      baseUrl,
    });

    // Update payment record with session key if returned
    if (paymentResult.sessionkey) {
      paymentRecord.rawResponse = {
        sessionkey: paymentResult.sessionkey,
        status: paymentResult.status,
      };
      await paymentRecord.save();
    }

    return NextResponse.json({
      success: true,
      tranId,
      gatewayUrl: paymentResult.gatewayUrl,
      sessionKey: paymentResult.sessionkey,
      status: paymentResult.status,
    });
  } catch (error) {
    console.error("SSLCommerz Init Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "পেমেন্ট গেটওয়ে ইনিশিয়ালাইজেশনে সমস্যা হয়েছে।",
      },
      { status: 500 }
    );
  }
}
