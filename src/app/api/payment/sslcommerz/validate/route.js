import { NextResponse } from "next/server";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const val_id = searchParams.get("val_id");
  return processValidation(val_id);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const val_id = body.val_id;
    return processValidation(val_id);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

async function processValidation(val_id) {
  if (!val_id) {
    return NextResponse.json(
      { success: false, message: "val_id is required for validation" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const result = await validateSSLCommerzPayment({ val_id });

    if (result && (result.status === "VALID" || result.status === "VALIDATED")) {
      const tranId = result.tran_id;
      if (tranId) {
        const payment = await PaymentModel.findOneAndUpdate(
          { tranId },
          {
            status: "VALID",
            valId: val_id,
            cardType: result.card_type || "",
            bankTranId: result.bank_tran_id || "",
            rawResponse: result,
          },
          { new: true }
        );

        let user = await UserModel.findOne({ tranId });
        if (!user && payment?.userEmail) {
          user = await UserModel.findOne({ email: payment.userEmail });
        }

        const reg = payment?.registrationData || {};

        if (!user && payment) {
          const userPassword = reg.password || "Fajr@Teacher2026";
          const cleanEmail = (reg.email || payment.userEmail || "").toLowerCase().trim();

          await UserModel.create({
            fullName: reg.fullName || payment.userName || "Teacher Candidate",
            email: cleanEmail,
            phone: reg.phone || payment.userPhone || "",
            password: userPassword,
            role: "teacher",
            track: reg.track || payment.track || "TOT-MEN",
            gender: reg.gender === "female" ? "female" : "male",
            hasLaptop: reg.hasLaptop || "yes",
            quranSkill: reg.quranSkill || "fluent",
            englishSkill: reg.englishSkill || "basic",
            education: reg.education || "",
            paymentStatus: "paid",
            paidAmount: Number(result.amount) || payment.amount || 1000,
            tranId: tranId,
            paymentGateway: "sslcommerz",
            enrolledAt: new Date(),
            isActive: true,
          });
        } else if (user) {
          user.paymentStatus = "paid";
          user.paidAmount = Number(result.amount) || payment?.amount || 1000;
          user.enrolledAt = user.enrolledAt || new Date();
          user.isActive = true;
          user.role = "teacher";
          if (tranId) user.tranId = tranId;
          await user.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("SSLCommerz Validation API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to validate transaction" },
      { status: 500 }
    );
  }
}
