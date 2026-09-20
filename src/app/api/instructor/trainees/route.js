import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { EvaluationModel } from "@/model/evaluation-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const track = searchParams.get("track") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const query = { role: { $in: ["teacher", "student"] } };

    if (track === "men") {
      query.$or = [{ track: "TOT-MEN" }, { gender: "male" }];
    } else if (track === "women") {
      query.$or = [{ track: { $regex: /WOMEN/i } }, { gender: "female" }];
    } else if (track !== "all" && track) {
      query.track = track;
    }

    if (paymentStatus !== "all" && paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$and = [
        {
          $or: [
            { fullName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { tranId: searchRegex },
          ],
        },
      ];
    }

    const total = await UserModel.countDocuments(query);
    const trainees = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "fullName email phone track gender designation bloodGroup paymentStatus paidAmount tranId hasLaptop quranSkill englishSkill education bio createdAt"
      )
      .lean();

    // Attach latest evaluation status for each trainee
    const traineeIds = trainees.map((t) => t._id);
    const evaluations = await EvaluationModel.find({
      traineeId: { $in: traineeIds },
    })
      .select("traineeId totalScore grade qualificationStatus evaluatedAt")
      .lean();

    const evalMap = {};
    evaluations.forEach((e) => {
      evalMap[e.traineeId.toString()] = e;
    });

    const sanitized = trainees.map((t) => {
      const idStr = t._id.toString();
      const evaluation = evalMap[idStr] || null;
      return {
        ...t,
        _id: idStr,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : "",
        evaluation: evaluation
          ? {
              totalScore: evaluation.totalScore,
              grade: evaluation.grade,
              qualificationStatus: evaluation.qualificationStatus,
              evaluatedAt: evaluation.evaluatedAt
                ? new Date(evaluation.evaluatedAt).toISOString()
                : "",
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      trainees: sanitized,
    });
  } catch (error) {
    console.error("Instructor Trainees GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { traineeId, ...updateFields } = body;

    if (!traineeId) {
      return NextResponse.json(
        { success: false, message: "Trainee ID is required." },
        { status: 400 }
      );
    }

    // Safety checks: do not overwrite password or permissions via this route
    delete updateFields._id;
    delete updateFields.password;
    delete updateFields.permissions;

    const updated = await UserModel.findByIdAndUpdate(
      traineeId,
      { $set: updateFields },
      { new: true }
    )
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "ট্রেইনি পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ট্রেইনি তথ্য সফলভাবে আপডেট করা হয়েছে!",
      trainee: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("Instructor Trainee PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
