import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";

export async function POST(request) {
  return handleIPN(request);
}

export async function GET(request) {
  return handleIPN(request);
}

async function handleIPN(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    let tranId = searchParams.get("tran_id") || "";
    let valId = searchParams.get("val_id") || "";
    let cardType = searchParams.get("card_type") || "";
    let bankTranId = searchParams.get("bank_tran_id") || "";
    let status = searchParams.get("status") || "";
    let amount = searchParams.get("amount") || "";
    let rawData = {};

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        tranId = formData.get("tran_id") || tranId;
        valId = formData.get("val_id") || valId;
        cardType = formData.get("card_type") || cardType;
        bankTranId = formData.get("bank_tran_id") || bankTranId;
        status = formData.get("status") || status;
        amount = formData.get("amount") || amount;

        for (const [key, value] of formData.entries()) {
          rawData[key] = value;
        }
      } catch {
        // Fallback
      }
    }

    if (!tranId && !valId) {
      return NextResponse.json({ message: "Invalid IPN Payload" }, { status: 400 });
    }

    let validationResult = null;
    if (valId) {
      try {
        validationResult = await validateSSLCommerzPayment({ val_id: valId });
      } catch (err) {
        console.error("IPN Validation Error:", err);
      }
    }

    const isValid =
      status === "VALID" ||
      status === "VALIDATED" ||
      validationResult?.status === "VALID" ||
      validationResult?.status === "VALIDATED";

    const payment = await PaymentModel.findOne({ tranId });
    if (payment) {
      payment.status = isValid ? "VALID" : (status || payment.status);
      if (valId) payment.valId = valId;
      if (cardType) payment.cardType = cardType;
      if (bankTranId) payment.bankTranId = bankTranId;
      payment.rawResponse = {
        ...(payment.rawResponse || {}),
        ...rawData,
        ...(validationResult || {}),
      };
      await payment.save();
    }

    if (isValid) {
      let user = await UserModel.findOne({ tranId });
      if (!user && payment?.userEmail) {
        user = await UserModel.findOne({ email: payment.userEmail });
      }

      if (user) {
        user.paymentStatus = "paid";
        user.paidAmount = Number(amount) || payment?.amount || 1000;
        user.isActive = true;
        user.role = "teacher";
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "IPN processed successfully",
      status: isValid ? "VALID" : status,
    });
  } catch (error) {
    console.error("SSLCommerz IPN Handler Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
