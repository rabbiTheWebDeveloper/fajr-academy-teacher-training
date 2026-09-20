import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { EvaluationModel } from "@/model/evaluation-model";
import { UserModel } from "@/model/user-model";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email") || session?.email;
    const tranIdParam = searchParams.get("tran_id");

    let trainee = null;
    if (emailParam) {
      trainee = await UserModel.findOne({ email: emailParam.toLowerCase().trim() }).lean();
    } else if (tranIdParam) {
      trainee = await UserModel.findOne({ tranId: tranIdParam }).lean();
    }

    let evaluation = null;
    if (trainee) {
      evaluation = await EvaluationModel.findOne({ traineeId: trainee._id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Return latest evaluation for demo
      evaluation = await EvaluationModel.findOne().sort({ createdAt: -1 }).lean();
    }

    if (!evaluation) {
      return NextResponse.json({
        success: true,
        evaluation: null,
        message: "আপনার মূল্যায়ন এখনো সম্পন্ন হয়নি। কোর্স চলাকালীন ট্রেইনার আপনার মাইক্রো-টিচিং মূল্যায়ন সম্পন্ন করবেন।",
      });
    }

    const sanitized = {
      ...evaluation,
      _id: evaluation._id.toString(),
      traineeId: evaluation.traineeId ? evaluation.traineeId.toString() : "",
      createdAt: evaluation.createdAt ? new Date(evaluation.createdAt).toISOString() : "",
      evaluatedAt: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toISOString() : "",
    };

    return NextResponse.json({
      success: true,
      evaluation: sanitized,
    });
  } catch (error) {
    console.error("TOT Evaluations GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
