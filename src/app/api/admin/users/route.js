import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel, USER_ROLES } from "@/model/user-model";
import { RoleModel } from "@/model/role-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { SessionModel } from "@/model/session-model";
import { requireSuperAdmin, serverError } from "@/lib/api-auth";
import { generatePassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isObjectId, searchFilter } from "@/lib/query-helpers";
import { phoneVariants } from "@/lib/phone";
import { emailInUse, emailTakenMessage, phoneInUse, phoneTakenMessage } from "@/service/account-service";

/**
 * Admin → Admin users (UserModel, collection "users"). Admin accounts only:
 * trainees are managed at /api/admin/tots and instructors at /api/admin/instructors.
 *
 * SUPER-ADMIN ONLY — every method. Adding, changing, disabling and deleting admin
 * accounts (and the roles they hold, see /api/admin/roles) is not delegable.
 *   GET    ?search=&role=
 *   POST   { fullName, email, phone?, password?, role?, accessRoleId?, designation? }
 *   PATCH  { id, role?, accessRoleId?, isActive?, resetPassword?, fullName?, phone?, designation? }
 *   DELETE ?id=
 * `role` is the account type ("admin" | "super-admin"); `accessRoleId` picks a custom
 * permission role for an "admin" (null/"" = the default admin permissions).
 * Guards: nobody changes/deactivates/deletes themselves, and the last active super-admin
 * can never be demoted, disabled or removed.
 */
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

const countActiveSuperAdmins = (exceptId) =>
  UserModel.countDocuments({ role: "super-admin", isActive: { $ne: false }, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });

/** { skip } when not sent, { value } for null / a valid role id, { error } otherwise. */
async function readAccessRole(raw) {
  if (raw === undefined) return { skip: true };
  if (raw === null || raw === "") return { value: null };
  if (!isObjectId(raw)) return { error: "রোলটি সঠিক নয়।" };
  if (!(await RoleModel.exists({ _id: raw }))) return { error: "নির্বাচিত রোলটি আর নেই — পেজ রিফ্রেশ করুন।" };
  return { value: raw };
}

export async function GET(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const role = searchParams.get("role");
    if (role && role !== "all") filters.push({ role });
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "designation"]);
    if (bySearch) filters.push(bySearch);

    const users = await UserModel.find(filters.length ? { $and: filters } : {})
      .sort({ createdAt: -1 })
      .select(SAFE_ACCOUNT_SELECT)
      .lean();
    return NextResponse.json({ success: true, count: users.length, users: plain(users) });
  } catch (error) {
    return serverError(error, "Admin users GET");
  }
}

export async function POST(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const phone = body.phone ? phoneVariants(body.phone)[0] || "" : "";
    const role = body.role || "admin";

    if (fullName.length < 2 || !EMAIL_RX.test(email)) return bad("পূর্ণ নাম ও সঠিক ইমেইল আবশ্যক।");
    if (body.phone && !phone) return bad("মোবাইল নম্বরটি সঠিক নয়।");
    if (!USER_ROLES.includes(role)) return bad("রোলটি সঠিক নয় — এখানে শুধু অ্যাডমিন বা সুপার-অ্যাডমিন তৈরি করা যায়।");

    // A super-admin needs no custom role; an admin may carry one.
    const accessRole = role === "super-admin" ? { value: null } : await readAccessRole(body.accessRoleId);
    if (accessRole.error) return bad(accessRole.error);

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

    const user = await UserModel.create({
      fullName,
      email,
      phone,
      password,
      role,
      accessRole: accessRole.value ?? null,
      designation: String(body.designation || "").trim().slice(0, 100) || (role === "super-admin" ? "Super Administrator" : "System Administrator"),
      isActive: true,
    });

    const fresh = await UserModel.findById(user._id).select(SAFE_ACCOUNT_SELECT).lean();
    return NextResponse.json({
      success: true,
      message: "অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      user: plain(fresh),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin users POST");
  }
}

export async function PATCH(request) {
  const auth = await requireSuperAdmin(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const { id, role, isActive, resetPassword } = body;
    if (!isObjectId(id)) return bad("সঠিক অ্যাডমিন ID আবশ্যক।");

    const user = await UserModel.findById(id);
    if (!user) return bad("অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি।", 404);
    const isSelf = String(user._id) === auth.session.id;
    const wasActiveSuper = user.role === "super-admin" && user.isActive !== false;

    if (role !== undefined && role !== user.role) {
      if (!USER_ROLES.includes(role)) return bad("রোলটি সঠিক নয়।");
      if (isSelf) return bad("নিজের রোল নিজে পরিবর্তন করা যায় না।", 403);
      if (wasActiveSuper && (await countActiveSuperAdmins(user._id)) === 0) return bad("শেষ সক্রিয় সুপার-অ্যাডমিনের রোল বদলানো যায় না।", 403);
      user.role = role;
    }

    // Custom permission role: only meaningful for "admin"; super-admins hold none.
    if (user.role === "super-admin") {
      user.accessRole = null;
    } else {
      const accessRole = await readAccessRole(body.accessRoleId);
      if (accessRole.error) return bad(accessRole.error);
      if (!accessRole.skip) user.accessRole = accessRole.value;
    }

    if (isActive !== undefined && Boolean(isActive) !== (user.isActive !== false)) {
      if (isSelf && !isActive) return bad("নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যায় না।", 403);
      if (!isActive && wasActiveSuper && (await countActiveSuperAdmins(user._id)) === 0) {
        return bad("শেষ সক্রিয় সুপার-অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয় করা যায় না।", 403);
      }
      user.isActive = Boolean(isActive);
      if (!isActive) await SessionModel.updateMany({ userId: user._id }, { $set: { isValid: false } });
    }
    if (body.fullName !== undefined) {
      const name = String(body.fullName).trim();
      if (name.length < 2) return bad("পূর্ণ নাম আবশ্যক।");
      user.fullName = name.slice(0, 100);
    }
    if (body.designation !== undefined) user.designation = String(body.designation).trim().slice(0, 100);
    if (body.phone !== undefined) {
      const phone = body.phone ? phoneVariants(body.phone)[0] || "" : "";
      if (body.phone && !phone) return bad("মোবাইল নম্বরটি সঠিক নয়।");
      const owner = phone ? await phoneInUse(phone, { exceptId: user._id }) : null;
      if (owner) return bad(phoneTakenMessage(owner), 409);
      user.phone = phone;
    }

    // Password reset: a new random password is set and returned ONCE; old sessions end.
    let generatedPassword = null;
    if (resetPassword) {
      generatedPassword = generatePassword();
      user.password = generatedPassword; // hashed by the model hook
      await SessionModel.updateMany({ userId: user._id }, { $set: { isValid: false } });
    }
    await user.save();

    const updated = await UserModel.findById(user._id).select(SAFE_ACCOUNT_SELECT).lean();
    return NextResponse.json({
      success: true,
      message: generatedPassword ? "নতুন পাসওয়ার্ড তৈরি হয়েছে — এখনই নিরাপদে জানিয়ে দিন।" : "অ্যাডমিন অ্যাকাউন্ট আপডেট হয়েছে।",
      user: plain(updated),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin users PATCH");
  }
}

export async function DELETE(request) {
  const auth = await requireSuperAdmin(request, "অ্যাডমিন অ্যাকাউন্ট মুছতে পারবেন শুধু সুপার-অ্যাডমিন।");
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return bad("সঠিক অ্যাডমিন ID আবশ্যক।");
    if (id === auth.session.id) return bad("নিজের অ্যাকাউন্ট নিজে মুছে ফেলা যায় না।", 403);

    const user = await UserModel.findById(id).lean();
    if (!user) return bad("অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি।", 404);
    if (user.role === "super-admin" && user.isActive !== false && (await countActiveSuperAdmins(user._id)) === 0) {
      return bad("শেষ সক্রিয় সুপার-অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যায় না।", 403);
    }

    await Promise.all([SessionModel.deleteMany({ userId: user._id }), UserModel.deleteOne({ _id: user._id })]);
    return NextResponse.json({ success: true, message: "অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin users DELETE");
  }
}
