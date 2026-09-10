import { NextResponse } from "next/server";
import {
  querySSLCommerzTransactionByTrxId,
  querySSLCommerzTransactionBySessionId,
} from "@/lib/sslcommerz";

/**
 * GET /api/payment/sslcommerz/query?tran_id=REF123
 * or
 * GET /api/payment/sslcommerz/query?sessionkey=XYZ123
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tran_id = searchParams.get("tran_id");
    const sessionkey = searchParams.get("sessionkey");

    if (!tran_id && !sessionkey) {
      return NextResponse.json(
        {
          success: false,
          message: "Either tran_id or sessionkey parameter is required.",
        },
        { status: 400 }
      );
    }

    let data;
    if (tran_id) {
      data = await querySSLCommerzTransactionByTrxId({ tran_id });
    } else {
      data = await querySSLCommerzTransactionBySessionId({ sessionkey });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("SSLCommerz transaction query error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to query transaction status",
      },
      { status: 500 }
    );
  }
}
