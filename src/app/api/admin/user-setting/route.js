import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { SessionModel } from "@/model/session-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { ADMIN_ROLES, requireAuth, serverError } from "@/lib/api-auth";
import { resolveAdminAccess } from "@/service/access-service";
import { verifyPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { signToken } from "@/lib/auth";
import { phoneVariants } from "@/lib/phone";
import { phoneInUse, phoneTakenMessage } from "@/service/account-service";
import { isObjectId, toPlain } from "@/lib/query-helpers";

/**
 * Signed-in Admin's own User Setting API (/api/admin/user-setting).
 * Every active admin / super-admin can manage ONLY their own profile, password, and sessions.
 *   GET    — profile, resolved role/permissions, and active login sessions
 *   PATCH  — update own profile info (fullName, phone, designation, department, gender, avatar)
 *   POST   — change own password OR revoke own other active sessions
 */

const GENDERS = ["", "male", "female", "other"];
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });

function readToken(request) {
  const fromCookies = request?.cookies?.get?.("auth_token")?.value;
  if (fromCookies) return fromCookies;
  const header = request?.headers?.get?.("cookie") || "";
  return header.match(/(?:^|;\s*)auth_token=([^;]+)/)?.[1] || null;
}

async function resolveCurrentAdmin(request) {
  const base = await requireAuth(request, ADMIN_ROLES);
  if (base.error) return base;
  const resolved = await resolveAdminAccess(base.session);
  if (!resolved.access) {
    const status = resolved.reason === "unauthenticated" ? 401 : 403;
    return { error: bad("আপনার অ্যাকাউন্ট যাচাই করা যায়নি। অনুগ্রহ করে আবার লগইন করুন।", status) };
  }
  return { session: base.session, access: resolved.access, token: readToken(request) };
}

async function listMySessions(userId, currentToken) {
  const rows = await SessionModel.find({
    userId,
    isValid: true,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastActive: -1 })
    .limit(20)
    .lean();

  return toPlain(
    rows.map((s) => ({
      _id: String(s._id),
      deviceType: s.deviceType || "unknown",
      ipAddress: s.ipAddress || "",
      userAgent: s.userAgent || "",
      lastActive: s.lastActive ? new Date(s.lastActive).toISOString() : "",
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : "",
      isCurrent: Boolean(currentToken && s.token === currentToken),
    }))
  );
}

export async function GET(request) {
  try {
    const auth = await resolveCurrentAdmin(request);
    if (auth.error) return auth.error;

    await dbConnect();
    const [user, sessions] = await Promise.all([
      UserModel.findById(auth.access.id).select(SAFE_ACCOUNT_SELECT).lean(),
      listMySessions(auth.access.id, auth.token),
    ]);
    if (!user) return bad("ব্যবহারকারীর অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।", 404);

    return NextResponse.json({
      success: true,
      user: toPlain(user),
      access: auth.access,
      sessions,
    });
  } catch (error) {
    return serverError(error, "Admin user-setting GET");
  }
}

export async function PATCH(request) {
  try {
    const auth = await resolveCurrentAdmin(request);
    if (auth.error) return auth.error;

    await dbConnect();
    const body = await request.json();
    const user = await UserModel.findById(auth.access.id);
    if (!user) return bad("ব্যবহারকারীর অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।", 404);

    const prevName = user.fullName;

    if (body.fullName !== undefined) {
      const fullName = String(body.fullName || "").trim().slice(0, 100);
      if (fullName.length < 2) return bad("পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে।");
      user.fullName = fullName;
    }

    if (body.phone !== undefined) {
      const rawPhone = String(body.phone || "").trim();
      const normalized = rawPhone ? phoneVariants(rawPhone)[0] || "" : "";
      if (rawPhone && !normalized) return bad("মোবাইল নম্বরটি সঠিক নয় (যেমন: 017XXXXXXXX)।");
      if (normalized) {
        const owner = await phoneInUse(normalized, { exceptId: user._id });
        if (owner) return bad(phoneTakenMessage(owner), 409);
      }
      user.phone = normalized;
    }

    if (body.designation !== undefined) {
      user.designation = String(body.designation || "").trim().slice(0, 100);
    }

    if (body.department !== undefined) {
      user.department = String(body.department || "").trim().slice(0, 100);
    }

    if (body.gender !== undefined) {
      const g = String(body.gender || "").trim();
      if (!GENDERS.includes(g)) return bad("লিঙ্গের মান সঠিক নয়।");
      user.gender = g;
    }

    if (body.avatar !== undefined) {
      const avatar = String(body.avatar || "").trim();
      if (avatar && !/^https:\/\/[^\s]+$/i.test(avatar)) {
        return bad("প্রোফাইল ছবির লিংক অবশ্যই https:// দিয়ে শুরু হতে হবে।");
      }
      user.avatar = avatar.slice(0, 500);
    }

    await user.save();
    const fresh = await UserModel.findById(user._id).select(SAFE_ACCOUNT_SELECT).lean();

    const response = NextResponse.json({
      success: true,
      message: "আপনার প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!",
      user: toPlain(fresh),
    });

    // Refresh cookie if display name changed so the header reflects the new name immediately.
    if (fresh && fresh.fullName !== prevName) {
      try {
        const nextToken = await signToken({
          id: String(fresh._id),
          email: fresh.email,
          fullName: fresh.fullName,
          role: fresh.role,
          track: auth.session.track || "",
        });
        if (auth.token) {
          await SessionModel.updateOne({ userId: fresh._id, token: auth.token }, { $set: { token: nextToken, lastActive: new Date() } });
        }
        response.cookies.set("auth_token", nextToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      } catch {
        // Non-fatal: DB is updated and layout reads fresh name from resolveAdminAccess.
      }
    }

    return response;
  } catch (error) {
    return serverError(error, "Admin user-setting PATCH");
  }
}

export async function POST(request) {
  try {
    const auth = await resolveCurrentAdmin(request);
    if (auth.error) return auth.error;

    await dbConnect();
    const body = await request.json();
    const action = body.action || "change-password";

    if (action === "revoke-session") {
      const sessionId = String(body.sessionId || "").trim();
      if (!isObjectId(sessionId)) return bad("সঠিক সেশন ID আবশ্যক।");
      await SessionModel.updateOne(
        { _id: sessionId, userId: auth.access.id },
        { $set: { isValid: false } }
      );
      const sessions = await listMySessions(auth.access.id, auth.token);
      return NextResponse.json({ success: true, message: "নির্বাচিত ডিভাইসের সেশন বন্ধ করা হয়েছে।", sessions });
    }

    if (action === "revoke-other-sessions") {
      const filter = { userId: auth.access.id, isValid: true };
      if (auth.token) filter.token = { $ne: auth.token };
      const res = await SessionModel.updateMany(filter, { $set: { isValid: false } });
      const sessions = await listMySessions(auth.access.id, auth.token);
      return NextResponse.json({
        success: true,
        message:
          res.modifiedCount > 0
            ? `${res.modifiedCount}টি অন্যান্য ডিভাইস থেকে লগআউট করা হয়েছে।`
            : "অন্য কোনো সক্রিয় ডিভাইস পাওয়া যায়নি।",
        sessions,
      });
    }

    if (action === "change-password") {
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "").trim();
      const confirmPassword = String(body.confirmPassword || "").trim();
      const logoutOtherDevices = body.logoutOtherDevices !== false;

      if (!currentPassword) return bad("বর্তমান পাসওয়ার্ড দিন।");
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return bad(`নতুন পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
      }
      if (newPassword.length > 128) return bad("পাসওয়ার্ড সর্বোচ্চ ১২৮ অক্ষরের হতে পারে।");
      if (newPassword !== confirmPassword) return bad("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।");
      if (newPassword === currentPassword) return bad("নতুন পাসওয়ার্ড অবশ্যই বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে।");

      const user = await UserModel.findById(auth.access.id).select("+password");
      if (!user) return bad("ব্যবহারকারীর অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।", 404);

      const matches = await verifyPassword(currentPassword, user.password);
      if (!matches) return bad("বর্তমান পাসওয়ার্ডটি সঠিক নয়।", 400);

      user.password = newPassword; // hashed automatically by applyAccountSecurity pre-save hook
      await user.save();

      if (logoutOtherDevices) {
        const filter = { userId: user._id, isValid: true };
        if (auth.token) filter.token = { $ne: auth.token };
        await SessionModel.updateMany(filter, { $set: { isValid: false } });
      }

      const sessions = await listMySessions(user._id, auth.token);
      return NextResponse.json({
        success: true,
        message: logoutOtherDevices
          ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে এবং অন্যান্য ডিভাইস থেকে লগআউট করা হয়েছে!"
          : "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!",
        sessions,
      });
    }

    return bad("অজানা অ্যাকশন।");
  } catch (error) {
    return serverError(error, "Admin user-setting POST");
  }
}
