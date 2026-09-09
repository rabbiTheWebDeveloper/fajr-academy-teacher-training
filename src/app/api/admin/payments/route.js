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

    // If marked VALID, activate the associated user
    if (status === "VALID") {
      const user = await UserModel.findOne({
        $or: [{ tranId: payment.tranId }, { email: payment.userEmail }],
      });

      if (user) {
        user.paymentStatus = "paid";
        user.paidAmount = payment.amount || 1000;
        user.isActive = true;
        await user.save();
      }
    }

    return NextResponse.json({ success: true, message: "Payment status updated", payment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
