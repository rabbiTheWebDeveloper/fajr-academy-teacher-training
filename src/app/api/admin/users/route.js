import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const track = searchParams.get("track");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    const query = {};
    if (role && role !== "all") query.role = role;
    if (track && track !== "all") query.track = track;
    if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { tranId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, paymentStatus, role, track, isActive } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    const updateData = {};
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updateData.paidAmount = 1000;
        updateData.enrolledAt = new Date();
      }
    }
    if (role !== undefined) updateData.role = role;
    if (track !== undefined) updateData.track = track;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password")
      .lean();

    // If payment status was updated to paid, also ensure PaymentModel is sync
    if (paymentStatus === "paid" && updatedUser?.tranId) {
      await PaymentModel.findOneAndUpdate(
        { tranId: updatedUser.tranId },
        { status: "VALID", userEmail: updatedUser.email, amount: 1000 },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: "User updated successfully", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    await UserModel.findByIdAndDelete(userId);
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      fullName,
      email,
      phone = "",
      password = "Fajr@Admin2026",
      role = "teacher",
      track = "TOT-MEN",
      gender = "male",
      paymentStatus = "paid",
      paidAmount = 1000,
      designation = "",
    } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "পূর্ণ নাম ও ইমেইল আবশ্যক।" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "এই ইমেইলে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।" },
        { status: 409 }
      );
    }

    const tranId = `ADM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await UserModel.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      role,
      track,
      gender,
      designation: designation || (role === "admin" ? "System Administrator" : role === "instructor" ? "Master Trainer" : "TOT Trainee Teacher"),
      paymentStatus,
      paidAmount: paymentStatus === "paid" ? (Number(paidAmount) || 1000) : 0,
      tranId,
      isActive: true,
      enrolledAt: paymentStatus === "paid" ? new Date() : null,
    });

    if (paymentStatus === "paid") {
      await PaymentModel.create({
        tranId,
        userEmail: cleanEmail,
        userName: fullName,
        userPhone: phone,
        track,
        amount: Number(paidAmount) || 1000,
        status: "VALID",
        cardType: "ADMIN_CREATION",
        paymentGateway: "admin_manual",
      });
    }

    return NextResponse.json({
      success: true,
      message: `${role === "admin" ? "অ্যাডমিন" : "ইউজার"} সফলভাবে তৈরি হয়েছে!`,
      user: {
        _id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        track: newUser.track,
        paymentStatus: newUser.paymentStatus,
        tranId: newUser.tranId,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin user creation error:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার তৈরিতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
