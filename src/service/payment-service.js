import { randomBytes } from "node:crypto";
import { dbConnect } from "@/service/mongo";
import { PaymentModel } from "@/model/payment-model";
import { TotModel } from "@/model/tot-model";
import { ParticipantModel } from "@/model/participant-model";
import { SettingModel } from "@/model/setting-model";
import { validateSSLCommerzPayment } from "@/lib/sslcommerz";
import { validationProblem } from "@/lib/payment-validation";
import { enrollUserInCourse } from "@/service/participant-service";
import { courseIdForUserTrack } from "@/service/course-service";
import { sendCustomEmail } from "@/utlis/mail";
import { generatePassword } from "@/lib/password";
import { emailInUse } from "@/service/account-service";
import { notifyAdminsNewPayment, notifyPaymentVerified } from "@/service/push-service";

/**
 * Payment lifecycle — the only code allowed to mark a payment VALID from the gateway.
 *
 *  1. The gateway result is confirmed server-side with the SSLCommerz validation API
 *     (never trusted from the callback's form fields or query string).
 *  2. tran_id, amount and currency must match what we stored when the payment started
 *     (the price is set by the server, see course-service.getPriceForTrack).
 *  3. The PENDING → VALID move is one atomic findOneAndUpdate, so the browser success
 *     redirect, the IPN and refreshes can all arrive in any order: exactly one of them
 *     provisions the account; the rest see "already finalised".
 *  4. Existing accounts are never re-roled and their passwords are never overwritten.
 *  5. Trainee accounts live in TotModel ("tots"). An e-mail that already belongs to an
 *     admin or instructor never gets a trainee account (no duplicate logins).
 */

// Any non-final state can still become VALID if the gateway confirms the money arrived.
const OPEN_STATUSES = ["PENDING", "UNATTEMPTED", "FAILED", "CANCELLED", "EXPIRED", "INVALID"];

export function newTranId(prefix = "TOT") {
  return `${prefix}-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Verify and finalise a gateway payment.
 * @returns {Promise<{ ok: boolean, code?: string, payment?: object, user?: object, firstTime?: boolean }>}
 */
export async function finalizeGatewayPayment({ tranId, valId, source = "gateway" }) {
  await dbConnect();
  if (!tranId) return { ok: false, code: "missing_tran_id" };

  const payment = await PaymentModel.findOne({ tranId }).lean();
  if (!payment) return { ok: false, code: "not_found" };

  // Already done (IPN beat the browser redirect, or a page refresh). `verifiedNow` tells the
  // caller whether THIS request proved the payment with its own val_id — the success route
  // only auto-logs-in on that proof, so knowing a tran_id alone is never enough.
  if (payment.status === "VALID") {
    let verifiedNow = false;
    if (valId) {
      try {
        verifiedNow = !validationProblem(await validateSSLCommerzPayment({ val_id: valId }), payment);
      } catch {}
    }
    const user = payment.user ? await TotModel.findById(payment.user).lean() : null;
    return { ok: true, code: "already_final", payment, user, firstTime: false, verifiedNow };
  }
  if (payment.status === "REFUNDED") return { ok: false, code: "refunded", payment };
  if (!valId) return { ok: false, code: "missing_val_id", payment };

  let validation;
  try {
    validation = await validateSSLCommerzPayment({ val_id: valId });
  } catch (err) {
    console.error(`[payment ${tranId}] validation API error:`, err.message);
    return { ok: false, code: "validation_unreachable", payment };
  }

  const problem = validationProblem(validation, payment);
  if (problem) {
    console.warn(`[payment ${tranId}] rejected (${problem}) via ${source}:`, validation?.status, validation?.amount);
    // The val_id is caller-supplied, so a failed check says nothing definitive about THIS
    // transaction — never close the payment here (that would let anyone who knows a pending
    // tran_id block the payer's genuine confirmation). Just keep a note for admins.
    await PaymentModel.updateOne(
      { tranId, status: { $in: OPEN_STATUSES } },
      { $set: { "rawResponse.lastRejectedValidation": validation || null, notes: `Gateway validation rejected (${source}): ${problem}` } }
    );
    return { ok: false, code: problem, payment };
  }

  // Atomic claim: only one caller wins the PENDING → VALID transition.
  const claimed = await PaymentModel.findOneAndUpdate(
    { tranId, status: { $in: OPEN_STATUSES } },
    {
      $set: {
        status: "VALID",
        valId,
        cardType: validation.card_type || "",
        bankTranId: validation.bank_tran_id || "",
        finalizedAt: new Date(),
        verifiedBy: `sslcommerz:${source}`,
        "rawResponse.validation": validation,
      },
    },
    { returnDocument: "after" }
  ).lean();

  if (!claimed) {
    const current = await PaymentModel.findOne({ tranId }).lean();
    const user = current?.user ? await TotModel.findById(current.user).lean() : null;
    // Lost the race, but this request's val_id was validated above.
    return { ok: current?.status === "VALID", code: "already_final", payment: current, user, firstTime: false, verifiedNow: true };
  }

  const user = await provisionForPayment(claimed);
  notifyAdminsNewPayment(claimed, user); // only for money the gateway just confirmed, not admin re-verifications
  return { ok: true, code: "finalized", payment: claimed, user, firstTime: true, verifiedNow: true };
}

/**
 * Create/update the account and enrolment for a payment that is now VALID.
 * Also used when an admin verifies a manual (bKash/Nagad) payment.
 */
export async function provisionForPayment(payment) {
  await dbConnect();
  const reg = payment.registrationData || {};
  const email = (payment.userEmail || reg.email || "").toLowerCase().trim();

  let user = payment.user ? await TotModel.findById(payment.user) : null;
  if (!user && email) user = await TotModel.findOne({ email });
  let generatedPassword = null;

  if (!user) {
    // Entry points refuse staff e-mails; this guards the rare race (an admin creates a
    // staff account with this e-mail while the payer is on the gateway page).
    const staffType = await emailInUse(email);
    if (staffType) {
      console.error(`[payment ${payment.tranId}] not provisioned: ${email} belongs to a ${staffType} account`);
      await PaymentModel.updateOne(
        { _id: payment._id },
        { $set: { notes: `Not provisioned: ${email} is already used by a ${staffType} account — resolve manually.` } }
      );
      return null;
    }
    // New applicant: create the account now that the money is confirmed. If the stored
    // hash is gone (e.g. re-verifying after the account was deleted), issue a fresh
    // password and hand it back to the admin who triggered this.
    let password = reg.passwordHash; // already a scrypt hash → the model hook keeps it as-is
    if (!password) {
      generatedPassword = generatePassword();
      password = generatedPassword;
    }
    try {
      user = await TotModel.create({
        fullName: reg.fullName || payment.userName || "TOT Trainee",
        email,
        phone: reg.phone || payment.userPhone || "",
        password,
        role: "teacher",
        track: reg.track || payment.track || "TOT-MEN",
        gender: reg.gender === "female" ? "female" : "male",
        hasLaptop: reg.hasLaptop || "yes",
        quranSkill: reg.quranSkill || "fluent",
        englishSkill: reg.englishSkill || "basic",
        education: reg.education || "",
        paymentStatus: "paid",
        paidAmount: payment.amount,
        tranId: payment.tranId,
        paymentGateway: payment.paymentGateway || "sslcommerz",
        enrolledAt: new Date(),
        isActive: true,
      });
    } catch (err) {
      if (err?.code !== 11000) throw err;
      user = await TotModel.findOne({ email }); // created concurrently
    }
  } else {
    // Existing trainee: mark paid; never change role or password.
    user.paymentStatus = "paid";
    user.paidAmount = (Number(user.paidAmount) || 0) + Number(payment.amount || 0);
    user.tranId = user.tranId || payment.tranId;
    user.isActive = true;
    user.enrolledAt = user.enrolledAt || new Date();
    if (payment.purpose === "registration" && reg.track) user.track = reg.track;
    await user.save();
  }

  const courseId = payment.courseId || courseIdForUserTrack(reg.track || payment.track || user.track);
  try {
    await enrollUserInCourse({
      userId: user._id,
      courseId,
      tranId: payment.tranId,
      amount: payment.amount,
      paymentStatus: "paid",
      status: "active",
    });
  } catch (err) {
    console.error(`[payment ${payment.tranId}] enrolment error:`, err.message);
  }

  // Link the payment to the account and drop the stored password hash.
  await PaymentModel.updateOne(
    { _id: payment._id },
    { $set: { user: user._id, courseId }, $unset: { "registrationData.passwordHash": "", "registrationData.password": "" } }
  );

  sendPaymentConfirmation(user, payment, courseId).catch((err) =>
    console.warn(`[payment ${payment.tranId}] confirmation email skipped:`, err.message)
  );
  notifyPaymentVerified(user, payment); // push to the trainee's devices (a brand-new account has none yet)

  const out = user.toObject ? user.toObject() : user;
  if (generatedPassword) out.generatedPassword = generatedPassword;
  return out;
}

/**
 * Reverse provisioning when an admin un-verifies or deletes a payment: the enrolment
 * from this transaction is marked pending, and the user is marked unpaid if they
 * have no other verified payment.
 */
export async function revokeForPayment(payment) {
  await dbConnect();
  if (!payment) return;
  const userId = payment.user;
  const email = payment.userEmail;

  await ParticipantModel.updateMany(
    { tranId: payment.tranId },
    { $set: { paymentStatus: "pending", status: "pending" } }
  );

  const user = userId ? await TotModel.findById(userId) : await TotModel.findOne({ email });
  if (!user) return;

  const other = await PaymentModel.exists({
    _id: { $ne: payment._id },
    status: "VALID",
    $or: [{ user: user._id }, { userEmail: user.email }],
  });
  if (!other && user.paymentStatus !== "free") {
    user.paymentStatus = "pending";
    user.paidAmount = Math.max(0, (Number(user.paidAmount) || 0) - Number(payment.amount || 0));
    await user.save();
  }
}

/** One-time post-payment login: true only for the first caller within 2 hours of finalising. */
export async function claimPostPaymentLogin(tranId) {
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const res = await PaymentModel.updateOne(
    { tranId, status: "VALID", loginIssuedAt: null, finalizedAt: { $gte: since } },
    { $set: { loginIssuedAt: new Date() } }
  );
  return res.modifiedCount === 1;
}

/** Fail/cancel callbacks may only close a payment that is still open. */
export async function closeOpenPayment(tranId, status) {
  if (!tranId) return;
  await dbConnect();
  await PaymentModel.updateOne({ tranId, status: { $in: ["PENDING", "UNATTEMPTED"] } }, { $set: { status } });
}

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Trainee receipt + admin notice, honouring the admin "email notifications" settings. */
async function sendPaymentConfirmation(user, payment, courseId) {
  if (!process.env.GMAIL_APP_PASSWORD || !user?.email) return;
  const settings = (await SettingModel.findOne({ key: "system_settings" }).select("emailNotificationEnabled adminNotificationEmail").lean()) || {};
  if (settings.emailNotificationEnabled === false) return;

  const amount = Number(payment.amount || 0).toLocaleString("en-US");
  const name = escapeHtml(user.fullName);
  await sendCustomEmail({
    toEmail: user.email,
    subject: "পেমেন্ট সফল হয়েছে — ফজর একাডেমি TOT",
    htmlBody: `
      <p>আসসালামু আলাইকুম ${name},</p>
      <p>আপনার <strong>${escapeHtml(courseId)}</strong> কোর্সের পেমেন্ট সফলভাবে যাচাই করা হয়েছে।</p>
      <p>পরিমাণ: <strong>৳${amount}</strong><br/>ট্রানজেকশন আইডি: <strong>${escapeHtml(payment.tranId)}</strong></p>
      <p>আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করে ড্যাশবোর্ডে প্রবেশ করুন।</p>`,
  });

  if (settings.adminNotificationEmail) {
    await sendCustomEmail({
      toEmail: settings.adminNotificationEmail,
      subject: `নতুন পেমেন্ট: ${user.fullName} — ৳${amount}`,
      htmlBody: `<p>${name} (${escapeHtml(user.email)}) — ${escapeHtml(courseId)} — ৳${amount}<br/>Tran ID: ${escapeHtml(payment.tranId)} · ${escapeHtml(payment.paymentMethod || payment.paymentGateway || "")}</p>`,
    });
  }
}
