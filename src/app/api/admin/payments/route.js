import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { UserModel } from "@/model/user-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { generatePassword, hashPassword } from "@/lib/password";
import { isObjectId, searchFilter } from "@/lib/query-helpers";
import { REGISTRABLE_TRACKS, getPriceForTrack } from "@/service/course-service";
import { newTranId, provisionForPayment, revokeForPayment } from "@/service/payment-service";
import { phoneVariants } from "@/queries/auth-queries";

// Never send password hashes, gateway raw dumps or login markers to the browser.
const SAFE = "-registrationData.passwordHash -registrationData.password -rawResponse -loginIssuedAt";
const STATUSES = ["VALID", "PENDING", "FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED", "INVALID"];
const METHODS = ["BKASH", "NAGAD", "ROCKET", "BANK", "CASH", "CARD", "OTHER"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const status = searchParams.get("status");
    if (status && status !== "all") filters.push({ status });
    const bySearch = searchFilter(searchParams.get("search"), ["tranId", "userEmail", "userName", "userPhone", "valId", "bankTranId"]);
    if (bySearch) filters.push(bySearch);

    const payments = await PaymentModel.find(filters.length ? { $and: filters } : {}).select(SAFE).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: payments.length, payments: plain(payments) });
  } catch (error) {
    return serverError(error, "Admin payments GET");
  }
}

/** Change a payment's status. VALID provisions the account + enrolment; leaving VALID revokes it. */
export async function PATCH(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { paymentId, tranId, status } = await request.json();
    if (!STATUSES.includes(status)) return bad("স্ট্যাটাসটি সঠিক নয়। রিফান্ডের জন্য রিফান্ড অপশন ব্যবহার করুন।");

    const payment = isObjectId(paymentId)
      ? await PaymentModel.findById(paymentId).lean()
      : tranId
        ? await PaymentModel.findOne({ tranId: String(tranId) }).lean()
        : null;
    if (!payment) return bad("পেমেন্ট রেকর্ড পাওয়া যায়নি।", 404);
    if (payment.status === "REFUNDED") return bad("রিফান্ড হওয়া পেমেন্টের স্ট্যাটাস পরিবর্তন করা যায় না।");
    if (payment.status === status) {
      return NextResponse.json({ success: true, message: "স্ট্যাটাস আগেই এটি ছিল।", payment: plain(payment) });
    }

    const wasValid = payment.status === "VALID";
    await PaymentModel.updateOne(
      { _id: payment._id },
      {
        $set: {
          status,
          ...(status === "VALID" ? { finalizedAt: new Date(), verifiedBy: `admin:${auth.session.email}` } : {}),
        },
      }
    );

    let user = null;
    if (status === "VALID") user = await provisionForPayment({ ...payment, status: "VALID" });
    else if (wasValid) await revokeForPayment(payment);

    const updated = await PaymentModel.findById(payment._id).select(SAFE).lean();
    return NextResponse.json({
      success: true,
      message: status === "VALID" ? "পেমেন্ট যাচাই হয়েছে এবং ট্রেইনির অ্যাকাউন্ট ও এনরোলমেন্ট সক্রিয় করা হয়েছে।" : "পেমেন্ট স্ট্যাটাস আপডেট হয়েছে।",
      payment: plain(updated),
      user: user ? { _id: String(user._id), email: user.email, paymentStatus: user.paymentStatus } : null,
      ...(user?.generatedPassword ? { generatedPassword: user.generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin payments PATCH");
  }
}

/**
 * Record an offline payment (bKash / Nagad / cash …). If the trainee has no account yet,
 * one is created with a generated password that is returned ONCE for the admin to share.
 */
export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const email = String(body.userEmail || "").toLowerCase().trim();
    const userName = String(body.userName || "").trim();
    const phone = body.userPhone ? phoneVariants(body.userPhone)[0] || String(body.userPhone).trim() : "";
    const track = REGISTRABLE_TRACKS.includes(body.track) ? body.track : "TOT-MEN";
    const method = METHODS.includes(String(body.cardType || "").toUpperCase()) ? String(body.cardType).toUpperCase() : "OTHER";
    const status = body.status === "PENDING" ? "PENDING" : "VALID";

    if (!EMAIL_RX.test(email)) return bad("ইউজারের সঠিক ইমেইল আবশ্যক।");

    const existingUser = await UserModel.findOne({ email }).select("_id fullName phone").lean();
    if (!existingUser && userName.length < 2) return bad("নতুন ট্রেইনির জন্য নাম আবশ্যক।");

    const customTranId = String(body.tranId || "").trim();
    if (customTranId && (await PaymentModel.exists({ tranId: customTranId }))) {
      return bad("এই ট্রানজেকশন আইডি দিয়ে আগেই একটি পেমেন্ট রেকর্ড আছে।", 409);
    }

    const price = await getPriceForTrack(track);
    const amount = body.amount !== undefined && body.amount !== "" ? Number(body.amount) : price.amount;
    if (!(amount >= 0)) return bad("টাকার পরিমাণ সঠিক নয়।");

    let generatedPassword = null;
    let registrationData = null;
    if (!existingUser) {
      generatedPassword = generatePassword();
      registrationData = {
        fullName: userName,
        email,
        phone,
        passwordHash: await hashPassword(generatedPassword),
        track,
        gender: /WOMEN/.test(track) ? "female" : "male",
      };
    }

    const payment = await PaymentModel.create({
      tranId: customTranId || newTranId(`MAN-${method.slice(0, 3)}`),
      amount,
      currency: price.currency,
      status,
      purpose: "manual",
      courseId: price.course?.courseId || "",
      user: existingUser?._id || null,
      userEmail: email,
      userName: userName || existingUser?.fullName || "",
      userPhone: phone || existingUser?.phone || "",
      track,
      cardType: method,
      paymentMethod: method,
      paymentGateway: "manual_offline",
      registrationData,
      notes: String(body.notes || "").slice(0, 500),
      ...(status === "VALID" ? { finalizedAt: new Date(), verifiedBy: `admin:${auth.session.email}` } : {}),
    });

    // Pending manual payments create the account later, when an admin verifies them.
    let user = existingUser;
    if (status === "VALID") user = await provisionForPayment(payment.toObject());

    const saved = await PaymentModel.findById(payment._id).select(SAFE).lean();
    return NextResponse.json({
      success: true,
      message:
        status === "VALID"
          ? "ম্যানুয়াল পেমেন্ট রেকর্ড হয়েছে এবং ট্রেইনির অ্যাকাউন্ট ও এনরোলমেন্ট সক্রিয় করা হয়েছে!"
          : "পেন্ডিং পেমেন্ট রেকর্ড হয়েছে। যাচাই করলে অ্যাকাউন্ট সক্রিয় হবে।",
      payment: plain(saved),
      user: user ? { _id: String(user._id), email: user.email || email, paymentStatus: user.paymentStatus || "pending" } : null,
      // Returned for PENDING too: the account is created with this password when an admin verifies.
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin payments POST");
  }
}

/** Delete a payment record; a verified one first has its enrolment revoked. */
export async function DELETE(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tranId = searchParams.get("tranId");
    const query = isObjectId(id) ? { _id: id } : tranId ? { tranId } : null;
    if (!query) return bad("পেমেন্ট ID বা tranId আবশ্যক।");

    const payment = await PaymentModel.findOne(query).lean();
    if (!payment) return bad("পেমেন্ট রেকর্ড পাওয়া যায়নি।", 404);
    if (payment.status === "VALID" && payment.paymentGateway === "sslcommerz" && payment.bankTranId) {
      return bad("গেটওয়েতে যাচাইকৃত পেমেন্ট মুছে ফেলা যায় না — প্রয়োজনে রিফান্ড করুন।", 409);
    }
    if (payment.status === "VALID") await revokeForPayment(payment);
    await PaymentModel.deleteOne({ _id: payment._id });

    return NextResponse.json({ success: true, message: "পেমেন্ট রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin payments DELETE");
  }
}
