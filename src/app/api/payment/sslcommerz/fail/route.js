import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";

export async function POST(request) {
  return handleFail(request);
}

export async function GET(request) {
  return handleFail(request);
}

async function handleFail(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const tranId = searchParams.get("tran_id");

    if (tranId) {
      await PaymentModel.updateOne({ tranId }, { status: "FAILED" });
      await UserModel.updateOne({ tranId }, { paymentStatus: "failed" });
    }

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    return NextResponse.redirect(`${protocol}://${host}/?payment=failed#registration-section`);
  } catch (error) {
    console.error("SSL Fail Error:", error);
    return NextResponse.redirect(new URL("/?payment=failed", request.url));
  }
}
