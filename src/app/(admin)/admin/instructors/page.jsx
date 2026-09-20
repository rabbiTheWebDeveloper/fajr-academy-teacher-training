import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import AdminInstructorsClient from "./AdminInstructorsClient";

export const metadata = {
  title: "ইনস্ট্রাক্টর ও ট্রেইনার প্যানেল | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Senior Trainer Faculty, Profiles & Coordinator Management.",
};

export const dynamic = "force-dynamic";

const DEFAULT_INSTRUCTORS = [
  {
    fullName: "Shaykh Abdullah Al-Mahmud",
    email: "instructor.men@fajracademy.io",
    phone: "01711223344",
    role: "instructor",
    track: "TOT-MEN",
    gender: "male",
    designation: "Senior Lead Master Trainer",
    specialization: "মাখরাজ, আন্তর্জাতিক তাজবীদ ও নূরানী মেথডোলজি",
    bio: "আল-আজহার বিশ্ববিদ্যালয় থেকে গ্রাজুয়েট ও ১০+ বছরের অনলাইন আন্তর্জাতিক কুরআন শিক্ষকতা অভিজ্ঞতা সম্পন্ন ট্রেইনার।",
    experienceYears: 10,
    rating: 4.95,
    paymentStatus: "paid",
    isActive: true,
  },
  {
    fullName: "Ustadha Farhana Chowdhury",
    email: "instructor.women@fajracademy.io",
    phone: "01811223344",
    role: "instructor",
    track: "TOT-WOMEN-014",
    gender: "female",
    designation: "Lead Female Faculty Coordinator",
    specialization: "নাজেরা পেডাগজি, ফিমেল লার্নার সাইকোলজি ও অনলাইন ক্লাস আর্ট",
    bio: "আন্তর্জাতিক অনলাইন কুরআন শিক্ষিকা, দ্বীনে ফেরা মা-বোনদের দ্রুত বিশুদ্ধ তিলাওয়াত ও শিক্ষকতা গড়ার বিশেষজ্ঞ ট্রেইনার।",
    experienceYears: 7,
    rating: 4.92,
    paymentStatus: "paid",
    isActive: true,
  },
];

export default async function AdminInstructorsPage() {
  let initialInstructors = [];
  try {
    await dbConnect();
    let data = await UserModel.find({ role: { $in: ["instructor", "admin"] } })
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!data || data.length === 0) {
      for (const inst of DEFAULT_INSTRUCTORS) {
        const exists = await UserModel.findOne({ email: inst.email });
        if (!exists) {
          await UserModel.create({
            ...inst,
            password: "Fajr@Instructor2026",
            tranId: `INST-${Date.now().toString().slice(-4)}`,
            enrolledAt: new Date(),
          });
        }
      }
      data = await UserModel.find({ role: { $in: ["instructor", "admin"] } })
        .sort({ createdAt: -1 })
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .lean();
    }

    initialInstructors = data.map((i) => ({
      ...i,
      _id: i._id.toString(),
      createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : "",
    }));
  } catch (error) {
    console.error("Error fetching instructors:", error);
    initialInstructors = DEFAULT_INSTRUCTORS.map((d, idx) => ({
      ...d,
      _id: `default-inst-${idx}`,
      createdAt: new Date().toISOString(),
    }));
  }

  return <AdminInstructorsClient initialInstructors={initialInstructors} />;
}
