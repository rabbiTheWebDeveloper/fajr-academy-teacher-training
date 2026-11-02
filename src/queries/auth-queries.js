import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { PaymentModel } from "@/model/payment-model";
import { isHashedPassword, verifyPassword } from "@/lib/password";

/**
 * Login lookups.
 *
 * Removed on purpose (they were security holes):
 *  - shared "master" passwords that unlocked every account (incl. admin),
 *  - phone-last-6-digits / transaction-ID accepted as a password,
 *  - an in-memory seed-account fallback that worked even with the DB down.
 * Seed accounts now live only in the database (see /api/seed, dev-only).
 */

function convertBengaliToEnglishNumbers(str) {
  if (!str) return "";
  const bnToEnMap = { "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9" };
  return str.replace(/[০-৯]/g, (w) => bnToEnMap[w] || w);
}

/** Every stored phone spelling for a Bangladeshi number: 01XXXXXXXXX, 8801…, +8801… */
export function phoneVariants(input) {
  const digits = convertBengaliToEnglishNumbers(String(input || "")).replace(/[^0-9]/g, "");
  if (digits.length < 10) return [];
  const local = `0${digits.replace(/^(88)?0?/, "")}`; // 01XXXXXXXXX
  return [...new Set([local, `88${local}`, `+88${local}`, local.slice(1)])];
}

/** Find a user by email or phone number (case/format-insensitive). */
export async function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = convertBengaliToEnglishNumbers(identifier.toString().trim()).toLowerCase();
  const phones = phoneVariants(clean);

  await dbConnect();
  const query = clean.includes("@")
    ? { email: clean }
    : { $or: [{ email: clean }, { tranId: clean.toUpperCase() }, ...phones.map((phone) => ({ phone }))] };
  return UserModel.findOne(query).lean();
}

/** Verify login credentials. Returns { success, user } or { success: false, message, ... }. */
export async function verifyUserLoginCredentials(identifier, password) {
  let user;
  try {
    user = await findUserByIdentifier(identifier);
  } catch (err) {
    console.error("Login DB error:", err.message);
    return {
      success: false,
      message: "সার্ভারের সাথে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      serviceUnavailable: true,
    };
  }

  if (!user) {
    return {
      success: false,
      message: "এই ইমেইল বা ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে আগে রেজিস্ট্রেশন করুন।",
      notFound: true,
    };
  }

  const ok = await verifyPassword(String(password || "").trim(), user.password);
  if (!ok) {
    return { success: false, message: "ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।" };
  }

  if (user.isActive === false) {
    return {
      success: false,
      message: "আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় রয়েছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।",
      inactive: true,
    };
  }

  const isStaff = ["admin", "super-admin", "instructor"].includes(user.role);
  const isPaid = isStaff || user.paymentStatus === "paid" || user.paymentStatus === "free";

  if (!isPaid) {
    // Self-heal only a payment verified AFTER the user record last changed (i.e. provisioning
    // crashed midway). If an admin later marked the user unpaid, that decision stands.
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

    await UserModel.updateOne(
      { _id: user._id },
      { paymentStatus: "paid", paidAmount: payment.amount, tranId: payment.tranId, isActive: true }
    );
    user.paymentStatus = "paid";
    user.tranId = payment.tranId;
  }

  // Record the login; re-save legacy plain-text passwords as a hash.
  const update = { lastLogin: new Date() };
  if (!isHashedPassword(user.password)) update.password = String(password).trim();
  await UserModel.updateOne({ _id: user._id }, update).catch((err) => console.warn("Login update warning:", err.message));

  return {
    success: true,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role || "teacher",
      track: user.track || "TOT-MEN",
      gender: user.gender || "male",
      paymentStatus: user.paymentStatus,
      tranId: user.tranId,
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
      userEmail: userEmail.toLowerCase(),
      token,
      role: role || "teacher",
      track: track || "TOT-MEN",
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
