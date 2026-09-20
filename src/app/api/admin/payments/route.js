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
