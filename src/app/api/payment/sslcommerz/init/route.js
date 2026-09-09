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

    // Check if user already exists or create pending user
    let user = await UserModel.findOne({ email: cleanEmail });

    const userPassword = password || "Fajr@Teacher2026";

    if (!user) {
      user = await UserModel.create({
        fullName,
        email: cleanEmail,
        phone,
        password: userPassword,
        role: "teacher",
        track,
        gender: gender === "female" ? "female" : "male",
        hasLaptop,
        quranSkill,
        englishSkill,
        education,
        paymentStatus: "pending",
        paidAmount: 0,
        tranId,
        paymentGateway: "sslcommerz",
      });
    } else {
      user.fullName = fullName;
      user.phone = phone;
      user.track = track;
      user.gender = gender === "female" ? "female" : "male";
      user.hasLaptop = hasLaptop;
      user.quranSkill = quranSkill;
      user.englishSkill = englishSkill;
      user.education = education;
      user.tranId = tranId;
      if (password) user.password = password;
      await user.save();
    }

    // Save pending payment record
    await PaymentModel.create({
      tranId,
      amount: Number(amount) || 1000,
      currency: "BDT",
      status: "PENDING",
      userEmail: cleanEmail,
      userName: fullName,
      userPhone: phone,
      track,
      paymentMethod: "SSLCOMMERZ",
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    const paymentResult = await initSSLCommerzPayment({
      tranId,
      amount: Number(amount) || 1000,
      productName: track === "TOT-MEN" ? "TOT - MEN Training Course" : "TOT - WOMEN Training Course (Batch 014)",
      cusName: fullName,
      cusEmail: cleanEmail,
      cusPhone: phone,
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      tranId,
      gatewayUrl: paymentResult.gatewayUrl,
      isSimulation: paymentResult.isSimulation,
    });
  } catch (error) {
    console.error("SSLCommerz Init Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "পেমেন্ট গেটওয়ে ইনিশিয়ালাইজেশনে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
