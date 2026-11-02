import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { InstructorModel } from "@/model/instructor-model";
import { SAFE_ACCOUNT_SELECT } from "@/model/account-schema";
import { SessionModel } from "@/model/session-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { generatePassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isObjectId, pick, searchFilter } from "@/lib/query-helpers";
import { phoneVariants } from "@/lib/phone";
import { emailInUse, emailTakenMessage, phoneInUse, phoneTakenMessage } from "@/service/account-service";

/**
 * Admin → Instructors (InstructorModel, collection "instructors").
 *   GET    ?search=&track=
 *   POST   { fullName, email, password?, phone?, track?, gender?, designation?, specialization?, bio?, experienceYears?, rating?, avatar? }
 *   PATCH  { instructorId, ...same profile fields, isActive?, resetPassword? }
 *   DELETE ?id=
 */
const TRACKS = ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", ""];
const EDITABLE = ["fullName", "phone", "track", "gender", "designation", "specialization", "bio", "education", "experienceYears", "rating", "avatar", "isActive"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

function cleanProfile(input) {
  const out = pick(input, EDITABLE);
  if (out.fullName !== undefined) out.fullName = String(out.fullName).trim().slice(0, 100);
  if (out.phone !== undefined) {
    out.phone = out.phone ? phoneVariants(out.phone)[0] || "" : "";
    if (input.phone && !out.phone) return { error: "মোবাইল নম্বরটি সঠিক নয়।" };
  }
  if (out.track !== undefined && !TRACKS.includes(out.track)) return { error: "ব্যাচটি সঠিক নয়।" };
  if (out.gender !== undefined) out.gender = out.gender === "female" ? "female" : "male";
  for (const k of ["designation", "specialization", "education"]) if (out[k] !== undefined) out[k] = String(out[k]).trim().slice(0, 150);
  if (out.bio !== undefined) out.bio = String(out.bio).trim().slice(0, 1500);
  if (out.experienceYears !== undefined) out.experienceYears = Math.min(Math.max(Number(out.experienceYears) || 0, 0), 60);
  if (out.rating !== undefined) out.rating = Math.min(Math.max(Number(out.rating) || 0, 0), 5);
  if (out.avatar !== undefined && out.avatar && !/^https:\/\//.test(out.avatar)) return { error: "ছবির লিংক https:// দিয়ে শুরু হতে হবে।" };
  if (out.isActive !== undefined) out.isActive = Boolean(out.isActive);
  return { data: out };
}

export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [];
    const track = searchParams.get("track");
    if (track && track !== "all") filters.push({ track });
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "designation"]);
    if (bySearch) filters.push(bySearch);

    const instructors = await InstructorModel.find(filters.length ? { $and: filters } : {})
      .sort({ createdAt: -1 })
      .select(SAFE_ACCOUNT_SELECT)
      .lean();
    return NextResponse.json({ success: true, count: instructors.length, instructors: plain(instructors) });
  } catch (error) {
    return serverError(error, "Admin instructors GET");
  }
}

export async function POST(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const { data, error } = cleanProfile(body);
    if (error) return bad(error);
    if (!data.fullName || data.fullName.length < 2 || !EMAIL_RX.test(email)) return bad("ইনস্ট্রাক্টরের পূর্ণ নাম ও সঠিক ইমেইল আবশ্যক।");

    // One e-mail = one account across admins, instructors and trainees.
    const emailOwner = await emailInUse(email);
    if (emailOwner) return bad(emailTakenMessage(emailOwner), 409);
    const phoneOwner = data.phone ? await phoneInUse(data.phone) : null;
    if (phoneOwner) return bad(phoneTakenMessage(phoneOwner), 409);

    let password = String(body.password || "").trim();
    let generatedPassword = null;
    if (!password) {
      password = generatePassword();
      generatedPassword = password;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      return bad(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
    }

    const created = await InstructorModel.create({
      bio: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সম্মানিত প্রশিক্ষক।",
      ...data,
      email,
      password,
      role: "instructor",
      isActive: data.isActive ?? true,
      createdBy: auth.session.email || "",
    });

    const instructor = await InstructorModel.findById(created._id).select(SAFE_ACCOUNT_SELECT).lean();
    return NextResponse.json({
      success: true,
      message: "নতুন ইনস্ট্রাক্টর সফলভাবে যুক্ত হয়েছে!",
      instructor: plain(instructor),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin instructors POST");
  }
}

export async function PATCH(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const id = body.instructorId || body.id;
    if (!isObjectId(id)) return bad("ইনস্ট্রাক্টর ID আবশ্যক।");
    const { data, error } = cleanProfile(body);
    if (error) return bad(error);
    if (data.fullName !== undefined && data.fullName.length < 2) return bad("পূর্ণ নাম আবশ্যক।");

    if (data.phone) {
      const owner = await phoneInUse(data.phone, { exceptId: id });
      if (owner) return bad(phoneTakenMessage(owner), 409);
    }

    let generatedPassword = null;
    if (body.resetPassword) {
      generatedPassword = generatePassword();
      data.password = generatedPassword; // hashed by the model's update hook
    }
    if (Object.keys(data).length === 0) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

    const updated = await InstructorModel.findOneAndUpdate({ _id: id }, { $set: data }, { returnDocument: "after", runValidators: true })
      .select(SAFE_ACCOUNT_SELECT)
      .lean();
    if (!updated) return bad("ইনস্ট্রাক্টর পাওয়া যায়নি।", 404);
    if (generatedPassword || data.isActive === false) {
      await SessionModel.updateMany({ userId: updated._id }, { $set: { isValid: false } });
    }

    return NextResponse.json({
      success: true,
      message: generatedPassword ? "নতুন পাসওয়ার্ড তৈরি হয়েছে — এখনই ইনস্ট্রাক্টরকে নিরাপদে জানান।" : "ইনস্ট্রাক্টর প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
      instructor: plain(updated),
      ...(generatedPassword ? { generatedPassword } : {}),
    });
  } catch (error) {
    return serverError(error, "Admin instructors PATCH");
  }
}

/** Deletes the instructor account and its login sessions. Grades they gave stay intact (evaluator name/email are stored on each evaluation). */
export async function DELETE(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!isObjectId(id)) return bad("ইনস্ট্রাক্টর ID আবশ্যক।");

    const res = await InstructorModel.deleteOne({ _id: id });
    if (res.deletedCount === 0) return bad("ইনস্ট্রাক্টর পাওয়া যায়নি।", 404);
    await SessionModel.deleteMany({ userId: id });
    return NextResponse.json({ success: true, message: "ইনস্ট্রাক্টর সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin instructors DELETE");
  }
}
