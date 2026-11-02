import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/sslcommerz";
import { closeOpenPayment } from "@/service/payment-service";

/** Browser return after the payer cancels. Only an open (PENDING) payment can be cancelled. */
async function handle(request) {
  let tranId = new URL(request.url).searchParams.get("tran_id") || "";
  if (request.method === "POST") {
    try {
      tranId = String((await request.formData()).get("tran_id") || tranId);
    } catch {}
  }
  try {
    await closeOpenPayment(tranId, "CANCELLED");
  } catch (error) {
    console.error(`[payment ${tranId}] cancel handler error:`, error);
  }
  return NextResponse.redirect(`${getAppUrl()}/?payment=cancelled#register`, 303);
}

export const POST = handle;
export const GET = handle;
