import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { enrollUserInCourse } from "@/service/participant-service";

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const {
      userId,
      userEmail,
      courseId,
      tranId,
      amount,
      currency,
      status,
      paymentStatus,
      setRoleAsParticipant,
      notes,
    } = body;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: "ব্যবহারকারীর আইডি অথবা ইমেইল আবশ্যক।" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "কোর্স আইডি (courseId) আবশ্যক।" },
        { status: 400 }
      );
    }

    const result = await enrollUserInCourse({
      userId,
      userEmail,
      courseId,
      tranId,
      amount,
      currency,
      status,
      paymentStatus,
      setRoleAsParticipant,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: result.isNew
        ? "কোর্সে সফলভাবে অংশগ্রহণকারী (Participant) হিসেবে যুক্ত করা হয়েছে।"
        : "অংশগ্রহণকারীর তথ্য ইতিমধ্যে বিদ্যমান এবং সফলভাবে আপডেট হয়েছে।",
      participant: result.participant,
      isNew: result.isNew,
    });
  } catch (error) {
    console.error("Course Enroll Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "কোর্সে এনরোল করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
