import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { EvaluationModel, calculateGradeAndStatus } from "@/model/evaluation-model";
import { UserModel } from "@/model/user-model";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");
    const traineeId = searchParams.get("traineeId");
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");

    const query = {};

    if (track && track !== "all") {
      if (track === "men") query.track = "TOT-MEN";
      else if (track === "women") query.track = { $regex: /WOMEN/i };
      else query.track = track;
    }

    if (traineeId) query.traineeId = traineeId;
    if (grade && grade !== "all") query.grade = grade;
    if (status && status !== "all") query.qualificationStatus = status;

    const evaluations = await EvaluationModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const sanitized = evaluations.map((e) => ({
      ...e,
      _id: e._id.toString(),
      traineeId: e.traineeId ? e.traineeId.toString() : "",
      createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : "",
      updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : "",
      evaluatedAt: e.evaluatedAt ? new Date(e.evaluatedAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      evaluations: sanitized,
    });
  } catch (error) {
    console.error("Evaluations GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      traineeId,
      scores = {},
      remarks = "",
      instructorName = "ফজর একাডেমি ফ্যাকাল্টি",
      instructorEmail = "instructor@fajracademy.io",
      courseId = "TOT-MEN",
    } = body;

    if (!traineeId) {
      return NextResponse.json(
        { success: false, message: "ট্রেইনি নির্বাচন আবশ্যক।" },
        { status: 400 }
      );
    }

    const trainee = await UserModel.findById(traineeId).lean();
    if (!trainee) {
      return NextResponse.json(
        { success: false, message: "নির্বাচিত ট্রেইনি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Clamp score values between 0 and 25
    const makhraj = Math.min(Math.max(Number(scores.makhrajTajweed) || 0, 0), 25);
    const pedagogy = Math.min(Math.max(Number(scores.childPsychologyPedagogy) || 0, 0), 25);
    const digital = Math.min(Math.max(Number(scores.digitalClassroomTools) || 0, 0), 25);
    const demo = Math.min(Math.max(Number(scores.microTeachingDemo) || 0, 0), 25);

    const totalScore = makhraj + pedagogy + digital + demo;
    const { grade, status: qualificationStatus } = calculateGradeAndStatus(totalScore);

    const evaluationData = {
      traineeId: trainee._id,
      traineeName: trainee.fullName,
      traineeEmail: trainee.email,
      traineePhone: trainee.phone || "",
      track: trainee.track || (trainee.gender === "female" ? "TOT-WOMEN-014" : "TOT-MEN"),
      courseId: courseId || trainee.track || "TOT-MEN",
      instructorName,
      instructorEmail,
      scores: {
        makhrajTajweed: makhraj,
        childPsychologyPedagogy: pedagogy,
        digitalClassroomTools: digital,
        microTeachingDemo: demo,
      },
      totalScore,
      grade,
      qualificationStatus,
      remarks: remarks.trim(),
      evaluatedAt: new Date(),
    };

    const evaluation = await EvaluationModel.findOneAndUpdate(
      { traineeId: trainee._id },
      { $set: evaluationData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: `মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে! মোট স্কোর: ${totalScore}/১০০, গ্রেড: ${grade}`,
      evaluation: {
        ...evaluation,
        _id: evaluation._id.toString(),
        traineeId: evaluation.traineeId.toString(),
      },
    });
  } catch (error) {
    console.error("Evaluation POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "মূল্যায়ন ID আবশ্যক।" },
        { status: 400 }
      );
    }

    await EvaluationModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "মূল্যায়ন সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Evaluation DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
