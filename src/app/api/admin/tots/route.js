import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { TotModel, TOT_ROLES } from "@/model/tot-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { PaymentModel } from "@/model/payment-model";
import { ParticipantModel } from "@/model/participant-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { SessionModel } from "@/model/session-model";
import { CourseModel } from "@/model/course-model";
import { requirePermission, serverError } from "@/lib/api-auth";
import { generatePassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isObjectId, searchFilter, trackFilter } from "@/lib/query-helpers";
import { phoneVariants } from "@/lib/phone";
import { courseIdForUserTrack, getPriceForTrack } from "@/service/course-service";
import { enrollUserInCourse, withEnrolmentCounts } from "@/service/participant-service";
import { newTranId, provisionForPayment, revokeForPayment } from "@/service/payment-service";
import { emailInUse, emailTakenMessage, phoneInUse, phoneTakenMessage } from "@/service/account-service";

/**
 * Admin → TOT trainees (TotModel, collection "tots"): everyone who registers / pays.
 *   GET    ?search=&track=men|women|none&paymentStatus=&role=
 *   POST   { fullName, email, phone?, password?, role?, track?, gender?, paymentStatus?, designation? }
 *   PATCH  { id, paymentStatus?, role?, track?, isActive?, resetPassword?, fullName?, phone? }
 *   DELETE ?id=
 */
const TRACKS = ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", ""];
const PAYMENT_STATUSES = ["paid", "pending", "failed", "free"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

export async function GET(request) {
  const auth = await requirePermission(request, "tots", "read");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const role = searchParams.get("role");
    const paymentStatus = searchParams.get("paymentStatus");
    if (role && role !== "all") filters.push({ role });
    if (paymentStatus && paymentStatus !== "all") filters.push({ paymentStatus });
    const track = searchParams.get("track");
    if (track === "none") filters.push({ track: { $in: ["", null] } });
    else {
      const byTrack = trackFilter(track);
      if (byTrack) filters.push(byTrack);
    }
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "tranId"]);
    if (bySearch) filters.push(bySearch);

    const tots = await TotModel.find(filters.length ? { $and: filters } : {})
      .sort({ createdAt: -1 })
      .select(SAFE_ACCOUNT_SELECT)
      .lean();
    return NextResponse.json({ success: true, count: tots.length, tots: plain(await withEnrolmentCounts(tots)) });
  } catch (error) {
    return serverError(error, "Admin TOTs GET");
  }
}

/** Mark a trainee paid by recording a manual VALID payment, so revenue and enrolment stay in sync. */
async function markPaid(tot, adminEmail) {
  const existing = await PaymentModel.findOne({ status: "VALID", $or: [{ user: tot._id }, { userEmail: tot.email }] }).lean();
  if (existing) {
    await provisionForPayment(existing);
    return;
  }
  const { amount, currency, course } = await getPriceForTrack(tot.track);
  const payment = await PaymentModel.create({
    tranId: newTranId("ADM"),
    amount,
    currency,
    status: "VALID",
    purpose: "manual",
    courseId: course?.courseId || "",
    user: tot._id,
    userEmail: tot.email,
    userName: tot.fullName,
    userPhone: tot.phone || "",
    track: tot.track,
    paymentMethod: "ADMIN_MARKED_PAID",
    paymentGateway: "admin_manual",
    finalizedAt: new Date(),
    verifiedBy: `admin:${adminEmail}`,
  });
  await provisionForPayment(payment.toObject());
}

export async function POST(request) {
  const auth = await requirePermission(request, "tots", "create");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const phone = body.phone ? phoneVariants(body.phone)[0] || String(body.phone).trim() : "";
    const role = body.role || "teacher";
    const track = body.track ?? "TOT-MEN";
    const paymentStatus = body.paymentStatus || "pending";

    if (fullName.length < 2 || !EMAIL_RX.test(email)) return bad("পূর্ণ নাম ও সঠিক ইমেইল আবশ্যক।");
    if (!TOT_ROLES.includes(role) || !TRACKS.includes(track) || !PAYMENT_STATUSES.includes(paymentStatus)) {
      return bad("রোল, ব্যাচ বা পেমেন্ট স্ট্যাটাস সঠিক নয়।");
    }

    let password = String(body.password || "").trim();
    let generatedPassword = null;
    if (!password) {
      password = generatePassword();
      generatedPassword = password;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      return bad(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
    }

    const emailOwner = await emailInUse(email);
    if (emailOwner) return bad(emailTakenMessage(emailOwner), 409);
    const phoneOwner = phone ? await phoneInUse(phone) : null;
    if (phoneOwner) return bad(phoneTakenMessage(phoneOwner), 409);

    const tot = await TotModel.create({
      fullName,
      email,
      phone,
      password,
      role,
      track,
      gender: body.gender === "female" ? "female" : "male",
      designation: String(body.designation || "").trim().slice(0, 100) || "TOT Trainee Teacher",
      // "paid" is only set by a recorded payment (below); "free" grants a complimentary seat.
      paymentStatus: paymentStatus === "paid" ? "pending" : paymentStatus,
      paidAmount: 0,
      isActive: true,
    });

    if (paymentStatus === "paid") await markPaid(tot, auth.session.email);
    if (paymentStatus === "free") {
      await enrollUserInCourse({
        userId: tot._id,
        courseId: courseIdForUserTrack(tot.track),
        paymentStatus: "free",
        status: "active",
        notes: `Complimentary access granted by ${auth.session.email}`,
      });
    }

    const fresh = await TotModel.findById(tot._id).select(SAFE_ACCOUNT_SELECT).lean();
    return NextResponse.json({
      success: true,
      message: "ট্রেইনি অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      tot: plain(fresh),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin TOTs POST");
  }
}

export async function PATCH(request) {
  const auth = await requirePermission(request, "tots", "update");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { id, paymentStatus, role, track, isActive, resetPassword } = body;
    if (!isObjectId(id)) return bad("সঠিক ট্রেইনি ID আবশ্যক।");

    const tot = await TotModel.findById(id);
    if (!tot) return bad("ট্রেইনি পাওয়া যায়নি।", 404);

    if (role !== undefined) {
      if (!TOT_ROLES.includes(role)) return bad("রোলটি সঠিক নয় (ইনস্ট্রাক্টর/অ্যাডমিন আলাদা পেজ থেকে তৈরি করুন)।");
      tot.role = role;
    }
    if (track !== undefined) {
      if (!TRACKS.includes(track)) return bad("ব্যাচটি সঠিক নয়।");
      tot.track = track;
    }
    if (isActive !== undefined) tot.isActive = Boolean(isActive);
    if (body.fullName !== undefined) {
      const name = String(body.fullName).trim();
      if (name.length < 2) return bad("পূর্ণ নাম আবশ্যক।");
      tot.fullName = name.slice(0, 100);
    }
    if (body.phone !== undefined) {
      const phone = body.phone ? phoneVariants(body.phone)[0] || "" : "";
      if (body.phone && !phone) return bad("মোবাইল নম্বরটি সঠিক নয়।");
      const owner = phone ? await phoneInUse(phone, { exceptId: tot._id }) : null;
      if (owner) return bad(phoneTakenMessage(owner), 409);
      tot.phone = phone;
    }

    // Admin password reset: a new random password is set and returned ONCE.
    let generatedPassword = null;
    if (resetPassword) {
      generatedPassword = generatePassword();
      tot.password = generatedPassword; // hashed by the model hook
      await SessionModel.updateMany({ userId: tot._id }, { $set: { isValid: false } });
    }
    await tot.save();

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) return bad("পেমেন্ট স্ট্যাটাস সঠিক নয়।");
      if (paymentStatus === "paid") {
        await markPaid(tot, auth.session.email);
      } else if (paymentStatus === "free") {
        // Complimentary seat: active account + a free enrolment in their track's course.
        await TotModel.updateOne({ _id: tot._id }, { $set: { paymentStatus: "free", isActive: true } });
        await enrollUserInCourse({
          userId: tot._id,
          courseId: courseIdForUserTrack(tot.track),
          paymentStatus: "free",
          status: "active",
          notes: `Complimentary access granted by ${auth.session.email}`,
        });
      } else {
        // Revert: un-enrol the courses paid by this trainee's verified payments. Admin-recorded
        // payments go back to PENDING so revenue matches; gateway payments stay VALID
        // (the money really arrived — refund them from the Payments screen).
        const valid = await PaymentModel.find({ status: "VALID", $or: [{ user: tot._id }, { userEmail: tot.email }] }).lean();
        for (const p of valid) {
          await revokeForPayment(p);
          if (p.purpose === "manual" || p.paymentGateway !== "sslcommerz") {
            await PaymentModel.updateOne(
              { _id: p._id },
              { $set: { status: "PENDING", notes: `Reverted to pending by ${auth.session.email}` }, $unset: { finalizedAt: "" } }
            );
          }
        }
        await ParticipantModel.updateMany(
          { user: tot._id, paymentStatus: "free" },
          { $set: { paymentStatus: "pending", status: "pending" } }
        );
        await TotModel.updateOne({ _id: tot._id }, { $set: { paymentStatus } });
      }
    }

    const updated = await TotModel.findById(tot._id).select(SAFE_ACCOUNT_SELECT).lean();
    return NextResponse.json({
      success: true,
      message: generatedPassword ? "নতুন পাসওয়ার্ড তৈরি হয়েছে — এখনই ট্রেইনিকে নিরাপদে জানান।" : "ট্রেইনির তথ্য সফলভাবে আপডেট হয়েছে।",
      tot: plain(updated),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin TOTs PATCH");
  }
}

/** Deletes the trainee with their enrolments (seat counts), evaluations and sessions. Payments are kept. */
export async function DELETE(request) {
  const auth = await requirePermission(request, "tots", "delete");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return bad("সঠিক ট্রেইনি ID আবশ্যক।");

    const tot = await TotModel.findById(id).lean();
    if (!tot) return bad("ট্রেইনি পাওয়া যায়নি।", 404);

    const participants = await ParticipantModel.find({ user: tot._id }).select("course").lean();
    for (const p of participants) {
      if (p.course) await CourseModel.updateOne({ _id: p.course, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });
    }
    await Promise.all([
      ParticipantModel.deleteMany({ user: tot._id }),
      EvaluationModel.deleteMany({ traineeId: tot._id }),
      SessionModel.deleteMany({ userId: tot._id }),
      // Payments are financial records — kept, only unlinked from the deleted account.
      PaymentModel.updateMany({ user: tot._id }, { $set: { user: null, notes: `Account ${tot.email} deleted by ${auth.session.email}` } }),
    ]);
    await TotModel.deleteOne({ _id: tot._id });

    return NextResponse.json({ success: true, message: "ট্রেইনি ও তার এনরোলমেন্ট সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin TOTs DELETE");
  }
}
