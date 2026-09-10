import { NextResponse } from "next/server";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const val_id = searchParams.get("val_id");
  return processValidation(val_id);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const val_id = body.val_id;
    return processValidation(val_id);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

async function processValidation(val_id) {
  if (!val_id) {
    return NextResponse.json(
      { success: false, message: "val_id is required for validation" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const result = await validateSSLCommerzPayment({ val_id });

    if (result && (result.status === "VALID" || result.status === "VALIDATED")) {
      const tranId = result.tran_id;
      if (tranId) {
        await PaymentModel.updateOne(
          { tranId },
          {
            status: "VALID",
            valId: val_id,
            cardType: result.card_type || "",
            bankTranId: result.bank_tran_id || "",
            rawResponse: result,
          }
        );

        await UserModel.updateOne(
          { tranId },
          { paymentStatus: "paid", isActive: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("SSLCommerz Validation API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to validate transaction" },
      { status: 500 }
    );
  }
}
