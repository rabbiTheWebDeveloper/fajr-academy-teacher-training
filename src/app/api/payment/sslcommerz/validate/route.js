import { NextResponse } from "next/server";
import { requirePermission, serverError } from "@/lib/api-auth";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { finalizeGatewayPayment } from "@/service/payment-service";

/**
 * Admin tool: re-check a gateway payment by val_id (e.g. when the IPN never arrived)
 * and finalise it through the same verified path as the gateway callbacks.
 * POST { val_id }  (admin only)
 */
export async function POST(request) {
  const auth = await requirePermission(request, "payments", "update");
  if (auth.error) return auth.error;

  try {
    const { val_id } = await request.json();
    if (!val_id) return NextResponse.json({ success: false, message: "val_id is required" }, { status: 400 });

    const validation = await validateSSLCommerzPayment({ val_id });
    if (!validation?.tran_id) {
      return NextResponse.json({ success: false, message: "Gateway did not recognise this val_id.", validation }, { status: 404 });
    }

    const result = await finalizeGatewayPayment({ tranId: validation.tran_id, valId: val_id, source: `admin:${auth.session.email}` });
    return NextResponse.json({
      success: result.ok,
      code: result.code,
      message: result.ok ? "পেমেন্ট যাচাই ও অ্যাকাউন্ট সক্রিয় করা হয়েছে।" : `যাচাই ব্যর্থ: ${result.code}`,
      tranId: validation.tran_id,
    });
  } catch (error) {
    return serverError(error, "Payment validate");
  }
}
