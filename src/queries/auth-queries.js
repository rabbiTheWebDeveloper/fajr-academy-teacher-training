import { dbConnect } from "@/service/mongo";
import { TotModel } from "@/model/tot-model";
import { PaymentModel } from "@/model/payment-model";
import { isHashedPassword, verifyPassword } from "@/lib/password";
import { accountTypeForRole } from "@/lib/roles";
import { convertBengaliToEnglishNumbers, phoneVariants } from "@/lib/phone";
import { findAccount, modelForType } from "@/service/account-service";

export { phoneVariants };

/**
 * Login lookups across the three account collections:
 *   users (admins) · instructors · tots (trainees).
 *
 * Removed on purpose (they were security holes):
 *  - shared "master" passwords that unlocked every account (incl. admin),
 *  - phone-last-6-digits / transaction-ID accepted as a password,
 *  - an in-memory seed-account fallback that worked even with the DB down.
 * Seed accounts now live only in the database (see /api/seed, dev-only).
 */

/**
 * Find an account by e-mail or phone (any collection: users, instructors, tots),
 * or by payment transaction ID (trainees only).
 * If `expectedType` is provided ('tot', 'instructor', 'admin'), that collection is prioritized.
 * Returns the lean document with `accountType` added, or null.
 */
export async function findUserByIdentifier(identifier, expectedType = null) {
  if (!identifier) return null;
  const clean = convertBengaliToEnglishNumbers(identifier.toString().trim()).toLowerCase();
  if (!clean) return null;

  const phones = clean.includes("@") ? [] : phoneVariants(clean);
  const filter = phones.length ? { $or: [{ email: clean }, { phone: { $in: phones } }] } : { email: clean };

  // If a specific portal/account type was requested, prioritize that collection first
  if (expectedType) {
    const Model = modelForType(expectedType);
    if (Model) {
      await dbConnect();
      const direct = await Model.findOne(filter).lean();
      if (direct) return { ...direct, accountType: expectedType };
    }
  }

  // Cross-collection lookup: admin → instructor → tot
  const found = await findAccount(filter);
  if (found) return { ...found.account, accountType: found.type };

  // Transaction ID lookup (trainees in TotModel only)
  if (!clean.includes("@")) {
    await dbConnect();
    const byTran = await TotModel.findOne({ tranId: clean.toUpperCase() }).lean();
    if (byTran) return { ...byTran, accountType: "tot" };
  }
  return null;
}

/** Verify login credentials across InstructorModel, TotModel and UserModel. */
export async function verifyUserLoginCredentials(identifier, password, expectedType = null) {
  let user;
  try {
    user = await findUserByIdentifier(identifier, expectedType);
  } catch (err) {
    console.error("Login DB error:", err.message);
    return {
      success: false,
      message: "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      serviceUnavailable: true,
    };
  }

  if (!user) {
    const roleLabels = {
      instructor: "ইনস্ট্রাক্টর",
      tot: "টিচার ট্রেইনি",
      admin: "অ্যাডমিন",
    };
    const roleText = expectedType && roleLabels[expectedType] ? `${roleLabels[expectedType]} ` : "";
    return {
      success: false,
      message: `এই ইমেইল বা ফোন নম্বরে কোনো ${roleText}অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে তথ্য পুনরায় যাচাই করুন।`,
      notFound: true,
    };
  }

  const ok = await verifyPassword(String(password || "").trim(), user.password);
  if (!ok) {
    return { success: false, message: "ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।" };
  }

  // The role must belong to the collection the account was found in (old "staff" /
  // "organizer" records have no panel).
  if (accountTypeForRole(user.role || (user.accountType === "tot" ? "teacher" : "")) !== user.accountType) {
    return {
      success: false,
      message: "এই অ্যাকাউন্টের জন্য কোনো প্যানেল নির্ধারিত নেই। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।",
      inactive: true,
    };
  }

  if (user.isActive === false) {
    return {
      success: false,
      message: "আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় রয়েছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।",
      inactive: true,
    };
  }

  const Model = modelForType(user.accountType);
  const isTrainee = user.accountType === "tot";

  if (isTrainee && user.paymentStatus !== "paid" && user.paymentStatus !== "free") {
    // Self-heal only a payment verified AFTER the trainee record last changed (i.e.
    // provisioning crashed midway). If an admin later marked them unpaid, that stands.
    const payment = await PaymentModel.findOne({
      status: "VALID",
      finalizedAt: { $gt: user.updatedAt || new Date(0) },
      $or: [{ user: user._id }, { userEmail: user.email }],
    })
      .sort({ finalizedAt: -1 })
      .lean();

    if (!payment) {
      return {
        success: false,
        isUnpaid: true,
        tranId: user.tranId,
        email: user.email,
        message:
          "আপনার রেজিস্ট্রেশন সম্পন্ন হলেও কোর্স ফি এখনো পরিশোধ হয়নি। ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে পেমেন্ট সম্পন্ন করুন।",
      };
    }

    await Model.updateOne(
      { _id: user._id },
      { paymentStatus: "paid", paidAmount: payment.amount, tranId: payment.tranId, isActive: true }
    );
    user.paymentStatus = "paid";
    user.tranId = payment.tranId;
  }

  // Record the login; re-save legacy plain-text passwords as a hash.
  const update = { lastLogin: new Date() };
  if (!isHashedPassword(user.password)) update.password = String(password).trim();
  await Model.updateOne({ _id: user._id }, update).catch((err) => console.warn("Login update warning:", err.message));

  const isInstructor = user.accountType === "instructor";
  const isAdmin = user.accountType === "admin";

  return {
    success: true,
    user: {
      id: user._id.toString(),
      accountType: user.accountType,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role || (isInstructor ? "instructor" : isAdmin ? "admin" : "teacher"),
      track: user.track || "",
      gender: user.gender || "",
      ...(isTrainee ? { paymentStatus: user.paymentStatus, tranId: user.tranId } : {}),
      ...(isInstructor ? { designation: user.designation, specialization: user.specialization } : {}),
    },
  };
}

/** Create the server-side session record for a freshly issued token. */
export async function createDatabaseSession({ userId, userEmail, token, role, track, userAgent, ipAddress, deviceType }) {
  try {
    await dbConnect();
    const { SessionModel } = await import("@/model/session-model");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return await SessionModel.create({
      userId,
      accountType: accountTypeForRole(role) || "tot",
      userEmail: userEmail.toLowerCase(),
      token,
      role: role || "teacher",
      track: track || "",
      userAgent: userAgent || "",
      ipAddress: ipAddress || "",
      deviceType: deviceType || "unknown",
      isValid: true,
      lastActive: new Date(),
      expiresAt,
    });
  } catch (err) {
    console.error("Session creation error:", err);
    return null;
  }
}

/** Mark a session invalid on logout. */
export async function invalidateDatabaseSession(token) {
  try {
    if (!token) return;
    await dbConnect();
    const { SessionModel } = await import("@/model/session-model");
    await SessionModel.updateMany({ token }, { isValid: false });
  } catch (err) {
    console.error("Session invalidation error:", err);
  }
}
