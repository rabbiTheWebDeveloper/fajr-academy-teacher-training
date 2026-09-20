import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = {};
    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { tranId: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { userPhone: { $regex: search, $options: "i" } },
        { valId: { $regex: search, $options: "i" } },
      ];
    }

    const payments = await PaymentModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: payments.length, payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { paymentId, tranId, status } = body;

    const payment = paymentId
      ? await PaymentModel.findById(paymentId)
      : await PaymentModel.findOne({ tranId });

    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment record not found" }, { status: 404 });
    }

    payment.status = status || "VALID";
    await payment.save();

    // If marked VALID, activate or create the associated user
    if (status === "VALID") {
      let user = await UserModel.findOne({
        $or: [{ tranId: payment.tranId }, { email: payment.userEmail }],
      });

      const reg = payment.registrationData || {};

      if (!user && (payment.userEmail || reg.email)) {
        const userPassword = reg.password || "Fajr@Teacher2026";
        const cleanEmail = (reg.email || payment.userEmail || "").toLowerCase().trim();

        await UserModel.create({
          fullName: reg.fullName || payment.userName || "Teacher Candidate",
          email: cleanEmail,
          phone: reg.phone || payment.userPhone || "",
          password: userPassword,
          role: "teacher",
          track: reg.track || payment.track || "TOT-MEN",
          gender: reg.gender === "female" ? "female" : "male",
          hasLaptop: reg.hasLaptop || "yes",
          quranSkill: reg.quranSkill || "fluent",
          englishSkill: reg.englishSkill || "basic",
          education: reg.education || "",
          paymentStatus: "paid",
          paidAmount: payment.amount || 1000,
          tranId: payment.tranId,
          paymentGateway: payment.paymentGateway || "sslcommerz",
          enrolledAt: new Date(),
          isActive: true,
        });
      } else if (user) {
        user.paymentStatus = "paid";
        user.paidAmount = payment.amount || 1000;
        user.isActive = true;
        if (payment.tranId) user.tranId = payment.tranId;
        await user.save();
      }
    }

    return NextResponse.json({ success: true, message: "Payment status updated", payment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Record offline manual payment and activate trainee
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      userName,
      userEmail,
      userPhone = "",
      amount = 1000,
      track = "TOT-MEN",
      tranId: customTranId,
      cardType = "BKASH",
      status = "VALID",
    } = body;

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "ইউজারের ইমেইল আবশ্যক।" },
        { status: 400 }
      );
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const tranId =
      customTranId && customTranId.trim() !== ""
        ? customTranId.trim()
        : `MAN-${cardType.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    // 1. Create Payment Record
    const newPayment = await PaymentModel.create({
      tranId,
      valId: `VAL-${tranId}`,
      amount: Number(amount) || 1000,
      currency: "BDT",
      status,
      userEmail: cleanEmail,
      userName: userName ? userName.trim() : "Trainee Teacher",
      userPhone: userPhone.trim(),
      track,
      cardType,
      paymentMethod: cardType,
      paymentGateway: "manual_offline",
    });

    // 2. Activate or Create User in UserModel
    let user = await UserModel.findOne({ email: cleanEmail });
    if (user) {
      if (status === "VALID") {
        user.paymentStatus = "paid";
        user.paidAmount = Number(amount) || 1000;
        user.isActive = true;
        user.tranId = tranId;
        if (track) user.track = track;
        await user.save();
      }
    } else {
      user = await UserModel.create({
        fullName: userName ? userName.trim() : "Trainee Teacher",
        email: cleanEmail,
        phone: userPhone.trim(),
        password: "Fajr@Teacher2026",
        role: "teacher",
        track,
        paymentStatus: status === "VALID" ? "paid" : "pending",
        paidAmount: status === "VALID" ? (Number(amount) || 1000) : 0,
        tranId,
        paymentGateway: "manual_offline",
        isActive: true,
        enrolledAt: status === "VALID" ? new Date() : null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "ম্যানুয়াল পেমেন্ট রেকর্ড ও ট্রেইনি অ্যাকাউন্ট সফলভাবে যুক্ত হয়েছে!",
      payment: {
        ...newPayment.toObject(),
        _id: newPayment._id.toString(),
      },
      user: {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        paymentStatus: user.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Admin Manual Payment Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove payment record
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tranId = searchParams.get("tranId");

    let query = {};
    if (id) query._id = id;
    else if (tranId) query.tranId = tranId;
    else {
      return NextResponse.json(
        { success: false, message: "পেমেন্ট ID বা tranId আবশ্যক।" },
        { status: 400 }
      );
    }

    await PaymentModel.findOneAndDelete(query);

    return NextResponse.json({
      success: true,
      message: "পেমেন্ট রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
