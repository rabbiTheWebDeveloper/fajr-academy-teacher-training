import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  return handleSuccess(request);
}

export async function GET(request) {
  return handleSuccess(request);
}

async function handleSuccess(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    let tranId = searchParams.get("tran_id");
    let valId = "";
    let cardType = "";
    let bankTranId = "";

    // If POST from SSLCommerz form-data / body
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        tranId = formData.get("tran_id") || tranId;
        valId = formData.get("val_id") || "";
        cardType = formData.get("card_type") || "";
        bankTranId = formData.get("bank_tran_id") || "";
      } catch {
        // Fallback to query param
      }
    }

    if (!tranId) {
      return NextResponse.redirect(new URL("/?payment=error", request.url));
    }

    // Find payment record
    const payment = await PaymentModel.findOne({ tranId });
    if (payment) {
      payment.status = "VALID";
      payment.valId = valId || `VAL_${Date.now()}`;
      payment.cardType = cardType;
      payment.bankTranId = bankTranId;
      await payment.save();
    }

    // Find and activate user
    let user = await UserModel.findOne({ tranId });
    if (!user && payment?.userEmail) {
      user = await UserModel.findOne({ email: payment.userEmail });
    }

    if (user) {
      user.paymentStatus = "paid";
      user.paidAmount = 1000;
      user.enrolledAt = user.enrolledAt || new Date();
      user.isActive = true;
      user.role = "teacher";
      await user.save();
    }

    // Sign authentication JWT
    const token = await signToken({
      id: user ? user._id.toString() : "teacher_id",
      email: user ? user.email : (payment?.userEmail || "teacher@fajracademy.io"),
      fullName: user ? user.fullName : (payment?.userName || "Teacher Candidate"),
      role: "teacher",
      track: user?.track || payment?.track || "TOT-MEN",
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const redirectUrl = new URL(`${protocol}://${host}/teacher?enrolled=true&tran_id=${tranId}`);

    const response = NextResponse.redirect(redirectUrl);

    // Set auth cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("SSLCommerz Success Handling Error:", error);
    return NextResponse.redirect(new URL("/?payment=error", request.url));
  }
}
