import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email") || session?.email;
    const tranIdParam = searchParams.get("tran_id");

    let query = {};
    if (emailParam) {
      query.email = emailParam.toLowerCase().trim();
    } else if (tranIdParam) {
      query.tranId = tranIdParam;
    } else {
      // Return first trainee as demo fallback if neither provided
      const first = await UserModel.findOne({ role: { $in: ["teacher", "student"] } })
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .lean();
      if (first) query._id = first._id;
    }

    const user = await UserModel.findOne(query)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Attach latest evaluation if exists
    const evaluation = await EvaluationModel.findOne({ traineeId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const sanitized = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : "",
      evaluation: evaluation
        ? {
            _id: evaluation._id.toString(),
            totalScore: evaluation.totalScore,
            grade: evaluation.grade,
            qualificationStatus: evaluation.qualificationStatus,
            scores: evaluation.scores,
            remarks: evaluation.remarks,
            evaluatedAt: evaluation.evaluatedAt
              ? new Date(evaluation.evaluatedAt).toISOString()
              : "",
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      trainee: sanitized,
    });
  } catch (error) {
    console.error("TOT Profile GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const session = await getSessionUser();
    const body = await request.json();
    const { email, tranId, phone, bloodGroup, quranSkill, englishSkill, hasLaptop, education, bio } = body;

    const targetEmail = email || session?.email;
    let query = {};
    if (targetEmail) {
      query.email = targetEmail.toLowerCase().trim();
    } else if (tranId) {
      query.tranId = tranId;
    } else {
      const fallback = await UserModel.findOne({ role: { $in: ["teacher", "student"] } })
        .select("_id")
        .lean();
      if (fallback) {
        query._id = fallback._id;
      } else {
        return NextResponse.json(
          { success: false, message: "Email or Transaction ID is required." },
          { status: 400 }
        );
      }
    }

    const updateFields = {};
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;
    if (quranSkill !== undefined) updateFields.quranSkill = quranSkill;
    if (englishSkill !== undefined) updateFields.englishSkill = englishSkill;
    if (hasLaptop !== undefined) updateFields.hasLaptop = hasLaptop;
    if (education !== undefined) updateFields.education = education.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();

    const updated = await UserModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    )
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "প্রোফাইল পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
      trainee: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("TOT Profile PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
