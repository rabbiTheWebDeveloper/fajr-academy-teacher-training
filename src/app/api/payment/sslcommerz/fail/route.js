import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/sslcommerz";
import { closeOpenPayment } from "@/service/payment-service";

/** Browser return after a failed payment. Only an open (PENDING) payment can be marked failed. */
async function handle(request) {
  let tranId = new URL(request.url).searchParams.get("tran_id") || "";
  if (request.method === "POST") {
    try {
      tranId = String((await request.formData()).get("tran_id") || tranId);
    } catch {}
  }
  try {
    await closeOpenPayment(tranId, "FAILED");
  } catch (error) {
    console.error(`[payment ${tranId}] fail handler error:`, error);
  }
  return NextResponse.redirect(`${getAppUrl()}/?payment=failed#register`, 303);
}

export const POST = handle;
export const GET = handle;
