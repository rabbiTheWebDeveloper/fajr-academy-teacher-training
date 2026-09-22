import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import { DEFAULT_INSTRUCTORS } from "@/constant/instructor-defaults";

// GET: Retrieve all instructors
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");
    const search = searchParams.get("search");

    const query = { role: { $in: ["instructor", "admin"] } };

    if (track && track !== "all") {
      query.track = track;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    let instructors = await UserModel.find(query)
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    // Auto-seed default senior instructors if empty
    if (!instructors || instructors.length === 0) {
      for (const inst of DEFAULT_INSTRUCTORS) {
        const exists = await UserModel.findOne({ email: inst.email });
        if (!exists) {
          await UserModel.create(inst);
        }
      }
      instructors = await UserModel.find(query)
        .sort({ createdAt: -1 })
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .lean();
    }

    const sanitized = instructors.map((i) => ({
      ...i,
      _id: i._id.toString(),
      createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      instructors: sanitized,
    });
  } catch (error) {
    console.error("Instructors GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Add new instructor
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const {
      fullName,
      email,
      phone = "",
      password = "Fajr@Instructor2026",
      track = "TOT-MEN",
      gender = "male",
      designation = "Senior Lead Master Trainer",
      specialization = "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ",
      bio = "",
      experienceYears = 5,
      avatar = "",
    } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "ইনস্ট্রাক্টরের পূর্ণ নাম ও ইমেইল আবশ্যক।" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.role === "instructor" || existing.role === "admin") {
        return NextResponse.json(
          { success: false, message: "এই ইমেইলে ইতিমধ্যে একজন ইনস্ট্রাক্টর একাউন্ট সক্রিয় আছে।" },
          { status: 409 }
        );
      }
      // Upgrade existing teacher to instructor
      existing.role = "instructor";
      existing.designation = designation;
      existing.track = track;
      if (avatar) existing.avatar = avatar;
      if (specialization) existing.specialization = specialization;
      if (bio) existing.bio = bio;
      await existing.save();

      return NextResponse.json({
        success: true,
        message: "বর্তমান ব্যবহারকারীকে ইনস্ট্রাক্টরে উন্নীত করা হয়েছে!",
        instructor: {
          _id: existing._id.toString(),
          fullName: existing.fullName,
          email: existing.email,
          phone: existing.phone,
          role: existing.role,
          track: existing.track,
          designation: existing.designation,
          specialization: existing.specialization,
          bio: existing.bio,
          avatar: existing.avatar || "",
        },
      });
    }

    const tranId = `INST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInstructor = await UserModel.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      role: "instructor",
      track,
      gender: gender === "female" ? "female" : "male",
      designation: designation || "TOT Master Trainer",
      specialization: specialization || "আন্তর্জাতিক কুরআন টিচিং পেডাগজি ও তাজবীদ",
      bio: bio || "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের সম্মানিত প্রশিক্ষক।",
      experienceYears: Number(experienceYears) || 5,
      rating: 4.9,
      paymentStatus: "paid",
      paidAmount: 1000,
      tranId,
      avatar: avatar || "",
      isActive: true,
      enrolledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "নতুন ইনস্ট্রাক্টর সফলভাবে যুক্ত হয়েছে!",
      instructor: {
        _id: newInstructor._id.toString(),
        fullName: newInstructor.fullName,
        email: newInstructor.email,
        phone: newInstructor.phone,
        role: newInstructor.role,
        track: newInstructor.track,
        gender: newInstructor.gender,
        designation: newInstructor.designation,
        specialization: newInstructor.specialization,
        bio: newInstructor.bio,
        experienceYears: newInstructor.experienceYears,
        rating: newInstructor.rating,
        tranId: newInstructor.tranId,
        avatar: newInstructor.avatar || "",
        createdAt: newInstructor.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Instructors POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Update instructor details
export async function PATCH(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { instructorId, ...updateFields } = body;

    if (!instructorId) {
      return NextResponse.json(
        { success: false, message: "ইনস্ট্রাক্টর ID আবশ্যক।" },
        { status: 400 }
      );
    }

    delete updateFields._id;
    delete updateFields.password;

    const updated = await UserModel.findByIdAndUpdate(
      instructorId,
      { $set: updateFields },
      { new: true }
    )
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "ইনস্ট্রাক্টর পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ইনস্ট্রাক্টর প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
      instructor: {
        ...updated,
        _id: updated._id.toString(),
      },
    });
  } catch (error) {
    console.error("Instructors PATCH Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove instructor
export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ইনস্ট্রাক্টর ID আবশ্যক।" },
        { status: 400 }
      );
    }

    await UserModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "ইনস্ট্রাক্টর সফলভাবে মুছে ফেলা হয়েছে।",
    });
  } catch (error) {
    console.error("Instructors DELETE Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
