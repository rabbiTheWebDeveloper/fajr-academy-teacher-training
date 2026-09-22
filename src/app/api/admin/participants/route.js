import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { ParticipantModel } from "@/model/participant-model";
import { CourseModel } from "@/model/course-model";
import { enrollUserInCourse } from "@/service/participant-service";

// GET: Retrieve all participants with filter & search
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const courseId = searchParams.get("courseId");
    const track = searchParams.get("track");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query = {};

    if (courseId && courseId !== "all") {
      query.courseId = courseId;
    }

    if (track && track !== "all") {
      query.track = track;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { tranId: { $regex: search, $options: "i" } },
        { courseName: { $regex: search, $options: "i" } },
      ];
    }

    const participants = await ParticipantModel.find(query)
      .sort({ enrolledAt: -1 })
      .populate("user", "fullName email phone avatar track gender designation")
      .populate("course", "name courseId fee schedule orientationDate")
      .lean();

    const sanitized = participants.map((p) => ({
      ...p,
      _id: p._id.toString(),
      enrolledAt: p.enrolledAt ? new Date(p.enrolledAt).toISOString() : "",
      completedAt: p.completedAt ? new Date(p.completedAt).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      participants: sanitized,
    });
  } catch (error) {
    console.error("Admin Participants GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Admin manually enrolls a user into a course
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      userId,
      userEmail,
      courseId,
      status = "active",
      paymentStatus = "paid",
      paidAmount = 0,
      notes = "",
      setRoleAsParticipant = false,
    } = body;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { success: false, message: "ব্যবহারকারীর আইডি অথবা ইমেইল আবশ্যক।" },
        { status: 400 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "কোর্স আইডি (courseId) নির্বাচন করুন।" },
        { status: 400 }
      );
    }

    const result = await enrollUserInCourse({
      userId,
      userEmail,
      courseId,
      status,
      paymentStatus,
      amount: paidAmount,
      notes,
      setRoleAsParticipant,
    });

    return NextResponse.json({
      success: true,
      message: result.isNew
        ? "নতুন পার্টিসিপেন্ট সফলভাবে কোর্সে যুক্ত হয়েছে!"
        : "পার্টিসিপেন্ট রেকর্ড সফলভাবে আপডেট করা হয়েছে!",
      participant: result.participant,
    });
  } catch (error) {
    console.error("Admin Participants POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update participant progress, status, evaluation, or notes
export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { participantId, ...updateFields } = body;

    if (!participantId) {
      return NextResponse.json(
        { success: false, message: "পার্টিসিপেন্ট আইডি আবশ্যক।" },
        { status: 400 }
      );
    }

    delete updateFields._id;
    delete updateFields.user;
    delete updateFields.course;

    if (updateFields.status === "completed" && !updateFields.completedAt) {
      updateFields.completedAt = new Date();
    }

    const updated = await ParticipantModel.findByIdAndUpdate(
      participantId,
      { $set: updateFields },
      { new: true }
    )
      .populate("user", "fullName email phone avatar")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "পার্টিসিপেন্ট পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "পার্টিসিপেন্ট তথ্য সফলভাবে আপডেট হয়েছে!",
      participant: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("Admin Participants PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove or unenroll participant
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "পার্টিসিপেন্ট আইডি আবশ্যক।" },
        { status: 400 }
      );
    }

    const participant = await ParticipantModel.findByIdAndDelete(id);

    if (participant?.course) {
      await CourseModel.findByIdAndUpdate(participant.course, {
        $inc: { enrolledCount: -1 },
      });
    }

    return NextResponse.json({
      success: true,
      message: "পার্টিসিপেন্ট সফলভাবে কোর্স থেকে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Admin Participants DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
