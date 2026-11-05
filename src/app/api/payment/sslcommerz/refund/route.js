import { NextResponse } from "next/server";
import { initiateSSLCommerzRefund, querySSLCommerzRefund } from "@/lib/sslcommerz";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { requirePermission, serverError } from "@/lib/api-auth";
import { revokeForPayment } from "@/service/payment-service";

/** GET ?refund_ref_id=… — refund status from the gateway (admin only). */
export async function GET(request) {
  const auth = await requirePermission(request, "payments", "read");
  if (auth.error) return auth.error;

  try {
    const refund_ref_id = new URL(request.url).searchParams.get("refund_ref_id");
    if (!refund_ref_id) {
      return NextResponse.json({ success: false, message: "refund_ref_id is required" }, { status: 400 });
    }
    const data = await querySSLCommerzRefund({ refund_ref_id });

    if (data?.status) {
      await dbConnect();
      await PaymentModel.updateOne({ "refund.refId": refund_ref_id }, { $set: { "refund.status": String(data.status) } });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return serverError(error, "Refund query");
  }
}

/**
 * POST { tranId, amount?, remarks? } — refund a verified gateway payment (admin only).
 * The bank transaction ID and the maximum amount come from our own record, not the request.
 */
export async function POST(request) {
  const auth = await requirePermission(request, "payments", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { tranId, amount, remarks = "Course Fee Refund" } = await request.json();
    const payment = await PaymentModel.findOne({ tranId: String(tranId || "") }).lean();

    if (!payment) return NextResponse.json({ success: false, message: "পেমেন্ট পাওয়া যায়নি।" }, { status: 404 });
    if (payment.status !== "VALID" || !payment.bankTranId) {
      return NextResponse.json(
        { success: false, message: "শুধুমাত্র গেটওয়েতে যাচাইকৃত (VALID) পেমেন্ট রিফান্ড করা যায়।" },
        { status: 400 }
      );
    }
    if (payment.refund?.refId) {
      return NextResponse.json({ success: false, message: "এই পেমেন্টের রিফান্ড ইতোমধ্যে অনুরোধ করা হয়েছে।" }, { status: 409 });
    }

    const refundAmount = Number(amount) || payment.amount;
    if (refundAmount <= 0 || refundAmount > payment.amount) {
      return NextResponse.json({ success: false, message: "রিফান্ডের পরিমাণ সঠিক নয়।" }, { status: 400 });
    }

    const data = await initiateSSLCommerzRefund({
      refund_amount: refundAmount,
      refund_remarks: String(remarks).slice(0, 200),
      bank_tran_id: payment.bankTranId,
      refe_id: payment.tranId,
    });

    const accepted = data?.APIConnect === "DONE" && ["success", "processing"].includes(String(data?.status).toLowerCase());
    if (!accepted) {
      return NextResponse.json(
        { success: false, message: data?.errorReason || "গেটওয়ে রিফান্ড অনুরোধ গ্রহণ করেনি।", data },
        { status: 502 }
      );
    }

    const fullRefund = refundAmount >= payment.amount;
    await PaymentModel.updateOne(
      { _id: payment._id },
      {
        $set: {
          refund: {
            refId: data.refund_ref_id || "",
            amount: refundAmount,
            status: String(data.status),
            remarks: String(remarks).slice(0, 200),
            requestedAt: new Date(),
            requestedBy: auth.session.email,
          },
          ...(fullRefund ? { status: "REFUNDED" } : {}),
        },
      }
    );
    if (fullRefund) await revokeForPayment(payment);

    return NextResponse.json({ success: true, message: "রিফান্ড অনুরোধ সফলভাবে পাঠানো হয়েছে।", data });
  } catch (error) {
    return serverError(error, "Refund initiate");
  }
}
