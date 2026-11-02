import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { requireAuth, serverError } from "@/lib/api-auth";
import { getTraineeEvaluations, getTraineeUser, USER_SAFE_FIELDS } from "@/service/trainee-service";
import { phoneVariants } from "@/queries/auth-queries";

/** The signed-in user's own profile. Client-supplied email/tran_id are ignored. */
export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    const user = await getTraineeUser(auth.session.id);
    if (!user) return NextResponse.json({ success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" }, { status: 404 });
    const [evaluation] = await getTraineeEvaluations(user);
    return NextResponse.json({ success: true, trainee: { ...user, evaluation: evaluation || null } });
  } catch (error) {
    return serverError(error, "TOT profile GET");
  }
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""];

export async function PATCH(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  try {
    await dbConnect();
    const body = await request.json();
    const update = {};

    if (body.phone !== undefined) {
      const phone = phoneVariants(body.phone)[0];
      if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
        return NextResponse.json({ success: false, message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।" }, { status: 400 });
      }
      const taken = await UserModel.exists({ phone: { $in: phoneVariants(phone) }, _id: { $ne: auth.session.id } });
      if (taken) return NextResponse.json({ success: false, message: "এই মোবাইল নম্বরটি অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে।" }, { status: 409 });
      update.phone = phone;
    }
    if (body.emergencyContactNumber !== undefined) update.emergencyContactNumber = String(body.emergencyContactNumber).trim().slice(0, 20);
    if (body.bloodGroup !== undefined) {
      if (!BLOOD_GROUPS.includes(body.bloodGroup)) {
        return NextResponse.json({ success: false, message: "রক্তের গ্রুপ সঠিক নয়।" }, { status: 400 });
      }
      update.bloodGroup = body.bloodGroup;
    }
    for (const key of ["quranSkill", "englishSkill", "education", "bio"]) {
      if (body[key] !== undefined) update[key] = String(body[key]).trim().slice(0, key === "bio" ? 1000 : 120);
    }
    if (body.hasLaptop !== undefined) update.hasLaptop = body.hasLaptop === "no" ? "no" : "yes";
    if (body.avatar !== undefined && (body.avatar === "" || /^https:\/\//.test(body.avatar))) update.avatar = body.avatar;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: "পরিবর্তনের মতো কোনো তথ্য পাওয়া যায়নি।" }, { status: 400 });
    }

    const updated = await UserModel.findByIdAndUpdate(auth.session.id, { $set: update }, { returnDocument: "after", runValidators: true })
      .select(USER_SAFE_FIELDS)
      .lean();
    if (!updated) return NextResponse.json({ success: false, message: "প্রোফাইল পাওয়া যায়নি।" }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: "আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
      trainee: JSON.parse(JSON.stringify(updated)),
    });
  } catch (error) {
    return serverError(error, "TOT profile PATCH");
  }
}
