import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { ParticipantModel } from "@/model/participant-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { SessionModel } from "@/model/session-model";
import { CourseModel } from "@/model/course-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { generatePassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { TRAINEE_ROLE_LIST, isObjectId, searchFilter, trackFilter } from "@/lib/query-helpers";
import { courseIdForUserTrack, getPriceForTrack } from "@/service/course-service";
import { enrollUserInCourse } from "@/service/participant-service";
import { newTranId, provisionForPayment, revokeForPayment } from "@/service/payment-service";
import { phoneVariants } from "@/queries/auth-queries";

const SAFE = "-password -resetPasswordToken -resetPasswordExpires";
const ROLES = ["teacher", "student", "participant", "instructor", "admin", "super-admin", "staff", "organizer"];
const TRACKS = ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", ""];
const PAYMENT_STATUSES = ["paid", "pending", "failed", "free"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });

export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const role = searchParams.get("role");
    const paymentStatus = searchParams.get("paymentStatus");
    if (role && role !== "all") filters.push({ role });
    if (paymentStatus && paymentStatus !== "all") filters.push({ paymentStatus });
    const byTrack = trackFilter(searchParams.get("track"));
    if (byTrack) filters.push(byTrack);
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "tranId"]);
    if (bySearch) filters.push(bySearch);

    const users = await UserModel.find(filters.length ? { $and: filters } : {}).sort({ createdAt: -1 }).select(SAFE).lean();
    return NextResponse.json({ success: true, count: users.length, users: JSON.parse(JSON.stringify(users)) });
  } catch (error) {
    return serverError(error, "Admin users GET");
  }
}

/** Mark a user paid by recording a manual VALID payment, so revenue and enrolment stay in sync. */
async function markPaid(user, adminEmail) {
  const existing = await PaymentModel.findOne({ status: "VALID", $or: [{ user: user._id }, { userEmail: user.email }] }).lean();
  if (existing) {
    await provisionForPayment(existing);
    return;
  }
  const { amount, currency, course } = await getPriceForTrack(user.track);
  const payment = await PaymentModel.create({
    tranId: newTranId("ADM"),
    amount,
    currency,
    status: "VALID",
    purpose: "manual",
    courseId: course?.courseId || "",
    user: user._id,
    userEmail: user.email,
    userName: user.fullName,
    userPhone: user.phone || "",
    track: user.track,
    paymentMethod: "ADMIN_MARKED_PAID",
    paymentGateway: "admin_manual",
    finalizedAt: new Date(),
    verifiedBy: `admin:${adminEmail}`,
  });
  await provisionForPayment(payment.toObject());
}

export async function PATCH(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { userId, paymentStatus, role, track, isActive, resetPassword } = await request.json();
    if (!isObjectId(userId)) return bad("সঠিক User ID আবশ্যক।");

    const user = await UserModel.findById(userId);
    if (!user) return bad("ইউজার পাওয়া যায়নি।", 404);
    const isSelf = String(user._id) === auth.session.id;

    if (role !== undefined) {
      if (!ROLES.includes(role)) return bad("রোলটি সঠিক নয়।");
      if (isSelf && role !== user.role) return bad("নিজের রোল নিজে পরিবর্তন করা যায় না।", 403);
      if ((role === "super-admin" || user.role === "super-admin") && auth.session.role !== "super-admin") {
        return bad("সুপার-অ্যাডমিন রোল শুধু সুপার-অ্যাডমিন পরিবর্তন করতে পারবেন।", 403);
      }
      user.role = role;
    }
    if (track !== undefined) {
      if (!TRACKS.includes(track)) return bad("ব্যাচটি সঠিক নয়।");
      user.track = track;
    }
    if (isActive !== undefined) {
      if (isSelf && !isActive) return bad("নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যায় না।", 403);
      user.isActive = Boolean(isActive);
    }
    // Admin password reset: a new random password is set and returned ONCE.
    let generatedPassword = null;
    if (resetPassword) {
      if (["super-admin"].includes(user.role) && auth.session.role !== "super-admin") {
        return bad("সুপার-অ্যাডমিনের পাসওয়ার্ড শুধু সুপার-অ্যাডমিন রিসেট করতে পারবেন।", 403);
      }
      generatedPassword = generatePassword();
      user.password = generatedPassword; // hashed by the model hook
      await SessionModel.updateMany({ userId: user._id }, { $set: { isValid: false } });
    }
    await user.save();

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) return bad("পেমেন্ট স্ট্যাটাস সঠিক নয়।");
      if (paymentStatus === "paid") {
        await markPaid(user, auth.session.email);
      } else if (paymentStatus === "free") {
        // Complimentary seat: active account + a free enrolment in their track's course.
        await UserModel.updateOne({ _id: user._id }, { $set: { paymentStatus: "free", isActive: true } });
        if (TRAINEE_ROLE_LIST.includes(user.role)) {
          await enrollUserInCourse({
            userId: user._id,
            courseId: courseIdForUserTrack(user.track),
            paymentStatus: "free",
            status: "active",
            notes: `Complimentary access granted by ${auth.session.email}`,
          });
        }
      } else {
        // Revert: un-enrol the courses paid by this user's verified payments. Admin-recorded
        // payments are reverted to PENDING so revenue matches; gateway payments stay VALID
        // (the money really arrived — refund them from the Payments screen).
        const valid = await PaymentModel.find({ status: "VALID", $or: [{ user: user._id }, { userEmail: user.email }] }).lean();
        for (const p of valid) {
          await revokeForPayment(p);
          if (p.purpose === "manual" || p.paymentGateway !== "sslcommerz") {
            await PaymentModel.updateOne(
              { _id: p._id },
              { $set: { status: "PENDING", notes: `Reverted to pending by ${auth.session.email}` }, $unset: { finalizedAt: "" } }
            );
          }
        }
        await UserModel.updateOne({ _id: user._id }, { $set: { paymentStatus } });
      }
    }

    const updated = await UserModel.findById(user._id).select(SAFE).lean();
    return NextResponse.json({
      success: true,
      message: generatedPassword ? "নতুন পাসওয়ার্ড তৈরি হয়েছে — এখনই ব্যবহারকারীকে নিরাপদে জানান।" : "ইউজার সফলভাবে আপডেট হয়েছে।",
      user: JSON.parse(JSON.stringify(updated)),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin users PATCH");
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const userId = new URL(request.url).searchParams.get("userId");
    if (!isObjectId(userId)) return bad("সঠিক User ID আবশ্যক।");
    if (userId === auth.session.id) return bad("নিজের অ্যাকাউন্ট নিজে মুছে ফেলা যায় না।", 403);

    const user = await UserModel.findById(userId).lean();
    if (!user) return bad("ইউজার পাওয়া যায়নি।", 404);
    if (["admin", "super-admin"].includes(user.role)) {
      if (user.role === "super-admin" && auth.session.role !== "super-admin") return bad("সুপার-অ্যাডমিন মুছতে পারবেন শুধু সুপার-অ্যাডমিন।", 403);
      const admins = await UserModel.countDocuments({ role: { $in: ["admin", "super-admin"] }, isActive: { $ne: false } });
      if (admins <= 1) return bad("শেষ সক্রিয় অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যায় না।", 403);
    }

    // Cascade: enrolments (and their seat counts), evaluations and sessions. Payments are
    // financial records — they are kept, only unlinked from the deleted account.
    const participants = await ParticipantModel.find({ user: user._id }).select("course").lean();
    for (const p of participants) {
      if (p.course) await CourseModel.updateOne({ _id: p.course, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });
    }
    await Promise.all([
      ParticipantModel.deleteMany({ user: user._id }),
      EvaluationModel.deleteMany({ traineeId: user._id }),
      SessionModel.deleteMany({ userId: user._id }),
      PaymentModel.updateMany({ user: user._id }, { $set: { user: null, notes: `Account ${user.email} deleted by ${auth.session.email}` } }),
    ]);
    await UserModel.deleteOne({ _id: user._id });

    return NextResponse.json({ success: true, message: "ইউজার ও তার এনরোলমেন্ট সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin users DELETE");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
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
    if (!ROLES.includes(role) || !TRACKS.includes(track) || !PAYMENT_STATUSES.includes(paymentStatus)) return bad("রোল, ব্যাচ বা পেমেন্ট স্ট্যাটাস সঠিক নয়।");
    if (role === "super-admin" && auth.session.role !== "super-admin") return bad("সুপার-অ্যাডমিন তৈরি করতে পারবেন শুধু সুপার-অ্যাডমিন।", 403);

    // Use the admin-provided password, or generate one and show it once.
    let password = String(body.password || "").trim();
    let generatedPassword = null;
    if (!password) {
      password = generatePassword();
      generatedPassword = password;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      return bad(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
    }

    if (await UserModel.exists({ email })) return bad("এই ইমেইলে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।", 409);
    if (phone && (await UserModel.exists({ phone: { $in: phoneVariants(phone) } }))) return bad("এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।", 409);

    const isStaff = ["admin", "super-admin", "instructor", "staff", "organizer"].includes(role);
    const user = await UserModel.create({
      fullName,
      email,
      phone,
      password,
      role,
      track,
      gender: body.gender === "female" ? "female" : "male",
      designation:
        String(body.designation || "").trim() ||
        (role === "admin" ? "System Administrator" : role === "instructor" ? "Master Trainer" : "TOT Trainee Teacher"),
      paymentStatus: isStaff ? "free" : paymentStatus === "paid" ? "pending" : paymentStatus,
      paidAmount: 0,
      isActive: true,
      ...(isStaff ? { rating: 0, experienceYears: 0 } : {}),
    });

    // Paid trainees get a recorded payment + enrolment, exactly like a real purchase.
    if (!isStaff && paymentStatus === "paid") await markPaid(user, auth.session.email);

    const fresh = await UserModel.findById(user._id).select(SAFE).lean();
    return NextResponse.json({
      success: true,
      message: `${role === "admin" ? "অ্যাডমিন" : "ইউজার"} সফলভাবে তৈরি হয়েছে!`,
      user: JSON.parse(JSON.stringify(fresh)),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin users POST");
  }
}
