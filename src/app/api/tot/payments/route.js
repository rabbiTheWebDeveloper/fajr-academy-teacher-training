import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email") || session?.email;
    const tranIdParam = searchParams.get("tran_id");

    const query = {};
    if (emailParam && tranIdParam) {
      query.$or = [{ userEmail: emailParam.toLowerCase().trim() }, { tranId: tranIdParam }];
    } else if (emailParam) {
      query.userEmail = emailParam.toLowerCase().trim();
    } else if (tranIdParam) {
      query.tranId = tranIdParam;
    }

    const payments = await PaymentModel.find(query).sort({ createdAt: -1 }).lean();

    const sanitized = payments.map((p) => ({
      _id: p._id.toString(),
      tranId: p.tranId,
      valId: p.valId,
      amount: p.amount,
      currency: p.currency || "BDT",
      status: p.status,
      userEmail: p.userEmail,
      userName: p.userName,
      userPhone: p.userPhone,
      track: p.track,
      cardType: p.cardType || "SSLCommerz Direct",
      bankTranId: p.bankTranId,
      paymentGateway: p.paymentGateway || "sslcommerz",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      payments: sanitized,
    });
  } catch (error) {
    console.error("TOT Payments GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
