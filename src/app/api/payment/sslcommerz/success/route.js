import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { getAppUrl } from "@/lib/sslcommerz";
import { claimPostPaymentLogin, finalizeGatewayPayment } from "@/service/payment-service";
import { createDatabaseSession } from "@/queries/auth-queries";

/**
 * Browser return from SSLCommerz after a successful payment (POST form, sometimes GET).
 * Nothing in this request is trusted: the payment is confirmed with the validation API
 * inside finalizeGatewayPayment. A session cookie is issued only once per payment, within
 * two hours of it being verified — replaying this URL never logs anyone in.
 */
export async function POST(request) {
  return handleSuccess(request);
}

export async function GET(request) {
  return handleSuccess(request);
}

async function readParams(request) {
  const url = new URL(request.url);
  const params = { tranId: url.searchParams.get("tran_id") || "", valId: url.searchParams.get("val_id") || "" };
  if (request.method === "POST") {
    try {
      const form = await request.formData();
      params.tranId = form.get("tran_id") || params.tranId;
      params.valId = form.get("val_id") || params.valId;
    } catch {}
  }
  return params;
}

async function handleSuccess(request) {
  const app = getAppUrl();
  const { tranId, valId } = await readParams(request);

  try {
    const result = await finalizeGatewayPayment({ tranId, valId, source: "success" });

    if (!result.ok) {
      const reason = result.code === "validation_unreachable" ? "verifying" : "failed";
      return NextResponse.redirect(`${app}/?payment=${reason}&ref=${encodeURIComponent(tranId)}#register`, 303);
    }

    const user = result.user;
    // Auto-login needs proof from THIS request (its own val_id validated) and is single-use.
    // The user here is always a trainee (TotModel) — staff accounts are never provisioned by a payment.
    const canLogin = user && user.isActive !== false && result.verifiedNow && (await claimPostPaymentLogin(tranId));
    if (!canLogin) {
      // Already used (refresh / replay) — ask the user to sign in normally.
      const email = encodeURIComponent(user?.email || result.payment?.userEmail || "");
      return NextResponse.redirect(`${app}/login?payment=success&email=${email}`, 303);
    }

    const token = await signToken({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      track: user.track,
    });
    await createDatabaseSession({
      userId: user._id,
      userEmail: user.email,
      token,
      role: user.role,
      track: user.track,
      userAgent: request.headers.get("user-agent") || "",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || "",
      deviceType: /mobile|iphone|android|ipad/i.test(request.headers.get("user-agent") || "") ? "mobile" : "desktop",
    });

    const response = NextResponse.redirect(`${app}/dashboard?enrolled=1`, 303);
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    console.error(`[payment ${tranId}] success handler error:`, error);
    return NextResponse.redirect(`${app}/?payment=verifying&ref=${encodeURIComponent(tranId)}#register`, 303);
  }
}
