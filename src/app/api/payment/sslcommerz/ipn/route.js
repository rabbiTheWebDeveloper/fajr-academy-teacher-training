import { NextResponse } from "next/server";
import { finalizeGatewayPayment } from "@/service/payment-service";

/**
 * SSLCommerz Instant Payment Notification (server-to-server).
 * The posted `status` is ignored — only the validation API decides (inside
 * finalizeGatewayPayment). Safe to receive any number of times.
 */
export async function POST(request) {
  let tranId = "";
  let valId = "";
  try {
    const form = await request.formData();
    tranId = String(form.get("tran_id") || "");
    valId = String(form.get("val_id") || "");
  } catch {
    return NextResponse.json({ success: false, message: "Invalid IPN payload" }, { status: 400 });
  }

  if (!tranId || !valId) {
    return NextResponse.json({ success: false, message: "tran_id and val_id are required" }, { status: 400 });
  }

  try {
    const result = await finalizeGatewayPayment({ tranId, valId, source: "ipn" });
    return NextResponse.json({ success: result.ok, code: result.code });
  } catch (error) {
    console.error(`[payment ${tranId}] IPN error:`, error);
    // 500 lets SSLCommerz retry the notification later.
    return NextResponse.json({ success: false, message: "IPN processing error" }, { status: 500 });
  }
}
