import { NextResponse } from "next/server";
import {
  initiateSSLCommerzRefund,
  querySSLCommerzRefund,
} from "@/lib/sslcommerz";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";

/**
 * GET /api/payment/sslcommerz/refund?refund_ref_id=SLXXXXX
 * Query status of a refund request
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const refund_ref_id = searchParams.get("refund_ref_id");

    if (!refund_ref_id) {
      return NextResponse.json(
        { success: false, message: "refund_ref_id query param is required" },
        { status: 400 }
      );
    }

    const data = await querySSLCommerzRefund({ refund_ref_id });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("SSLCommerz refund query error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to query refund status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment/sslcommerz/refund
 * Initiate refund
 */
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { refund_amount, refund_remarks, bank_tran_id, refe_id } = body;

    if (!refund_amount || !bank_tran_id || !refe_id) {
      return NextResponse.json(
        {
          success: false,
          message: "refund_amount, bank_tran_id, and refe_id are required",
        },
        { status: 400 }
      );
    }

    const data = await initiateSSLCommerzRefund({
      refund_amount,
      refund_remarks,
      bank_tran_id,
      refe_id,
    });

    // Optionally update local payment record status
    if (data && data.status === "success") {
      await PaymentModel.updateOne(
        { bankTranId: bank_tran_id },
        {
          $set: {
            "rawResponse.refund": data,
          },
        }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("SSLCommerz refund initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to initiate refund",
      },
      { status: 500 }
    );
  }
}
