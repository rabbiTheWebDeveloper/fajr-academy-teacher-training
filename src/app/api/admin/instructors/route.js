import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { SessionModel } from "@/model/session-model";
import { requireAuth, ADMIN_ROLES, serverError } from "@/lib/api-auth";
import { generatePassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { isObjectId, pick, searchFilter } from "@/lib/query-helpers";
import { phoneVariants } from "@/queries/auth-queries";

const SAFE = "-password -resetPasswordToken -resetPasswordExpires";
const TRACKS = ["TOT-MEN", "TOT-WOMEN-014", "TOT-WOMEN", ""];
const EDITABLE = ["fullName", "phone", "track", "gender", "designation", "specialization", "bio", "experienceYears", "rating", "avatar", "isActive"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const bad = (message, status = 400) => NextResponse.json({ success: false, message }, { status });
const plain = (v) => JSON.parse(JSON.stringify(v));

function cleanProfile(input) {
  const out = pick(input, EDITABLE);
  if (out.fullName !== undefined) out.fullName = String(out.fullName).trim().slice(0, 100);
  if (out.phone !== undefined) out.phone = out.phone ? phoneVariants(out.phone)[0] || String(out.phone).trim() : "";
  if (out.track !== undefined && !TRACKS.includes(out.track)) return { error: "ব্যাচটি সঠিক নয়।" };
  if (out.gender !== undefined) out.gender = out.gender === "female" ? "female" : "male";
  for (const k of ["designation", "specialization"]) if (out[k] !== undefined) out[k] = String(out[k]).trim().slice(0, 150);
  if (out.bio !== undefined) out.bio = String(out.bio).trim().slice(0, 1500);
  if (out.experienceYears !== undefined) out.experienceYears = Math.min(Math.max(Number(out.experienceYears) || 0, 0), 60);
  if (out.rating !== undefined) out.rating = Math.min(Math.max(Number(out.rating) || 0, 0), 5);
  if (out.avatar !== undefined && out.avatar && !/^https:\/\//.test(out.avatar)) return { error: "ছবির লিংক https:// দিয়ে শুরু হতে হবে।" };
  if (out.isActive !== undefined) out.isActive = Boolean(out.isActive);
  return { data: out };
}

/** Instructors only (admins are managed on the Users screen). No auto-seeding. */
export async function GET(request) {
  const auth = await requireAuth(request, ADMIN_ROLES);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filters = [{ role: "instructor" }];
    const track = searchParams.get("track");
    if (track && track !== "all") filters.push({ track });
    const bySearch = searchFilter(searchParams.get("search"), ["fullName", "email", "phone", "designation"]);
    if (bySearch) filters.push(bySearch);

    const instructors = await UserModel.find({ $and: filters }).sort({ createdAt: -1 }).select(SAFE).lean();
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

    const existing = await UserModel.findOne({ email });
    if (existing) {
      if (["instructor", "admin", "super-admin"].includes(existing.role)) {
        return bad("এই ইমেইলে ইতিমধ্যে একজন ইনস্ট্রাক্টর/অ্যাডমিন অ্যাকাউন্ট সক্রিয় আছে।", 409);
      }
      // Promote an existing trainee account; their password stays theirs.
      Object.assign(existing, data, { role: "instructor", isActive: true });
      await existing.save();
      const promoted = await UserModel.findById(existing._id).select(SAFE).lean();
      return NextResponse.json({ success: true, message: "বর্তমান ব্যবহারকারীকে ইনস্ট্রাক্টরে উন্নীত করা হয়েছে!", instructor: plain(promoted) });
    }

    let password = String(body.password || "").trim();
    let generatedPassword = null;
    if (!password) {
      password = generatePassword();
      generatedPassword = password;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      return bad(`পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`);
    }
    if (data.phone && (await UserModel.exists({ phone: { $in: phoneVariants(data.phone) } }))) {
      return bad("এই মোবাইল নম্বরে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।", 409);
    }

    const created = await UserModel.create({
      designation: "TOT Master Trainer",
      specialization: "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ",
      bio: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সম্মানিত প্রশিক্ষক।",
      experienceYears: 0,
      rating: 0,
      track: "TOT-MEN",
      ...data,
      email,
      password,
      role: "instructor",
      paymentStatus: "free",
      paidAmount: 0,
      isActive: true,
    });

    const instructor = await UserModel.findById(created._id).select(SAFE).lean();
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
    if (!isObjectId(body.instructorId)) return bad("ইনস্ট্রাক্টর ID আবশ্যক।");
    const { data, error } = cleanProfile(body);
    if (error) return bad(error);
    if (Object.keys(data).length === 0) return bad("পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।");

    const updated = await UserModel.findOneAndUpdate(
      { _id: body.instructorId, role: "instructor" },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    )
      .select(SAFE)
      .lean();
    if (!updated) return bad("ইনস্ট্রাক্টর পাওয়া যায়নি।", 404);

    return NextResponse.json({ success: true, message: "ইনস্ট্রাক্টর প্রোফাইল সফলভাবে আপডেট করা হয়েছে!", instructor: plain(updated) });
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

    const res = await UserModel.deleteOne({ _id: id, role: "instructor" });
    if (res.deletedCount === 0) return bad("ইনস্ট্রাক্টর পাওয়া যায়নি (অ্যাডমিন অ্যাকাউন্ট এখান থেকে মোছা যায় না)।", 404);
    await SessionModel.deleteMany({ userId: id });
    return NextResponse.json({ success: true, message: "ইনস্ট্রাক্টর সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (error) {
    return serverError(error, "Admin instructors DELETE");
  }
}
