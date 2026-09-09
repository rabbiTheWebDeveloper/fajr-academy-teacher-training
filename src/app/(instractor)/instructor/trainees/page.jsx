import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import TraineesClient from "./TraineesClient";

export const metadata = {
  title: "ট্রেইনি শিক্ষক তালিকা | ইনস্ট্রাক্টর পোর্টাল",
  description: "ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স (TOT) কোর্সের নিবন্ধিত ও পেমেন্টকৃত ট্রেইনি শিক্ষক তালিকা।",
};

export default async function TraineesPage() {
  let trainees = [];
  try {
    await dbConnect();
    const data = await UserModel.find({ role: { $in: ["teacher", "student"] } })
      .sort({ createdAt: -1 })
      .select("fullName email phone track gender paymentStatus paidAmount tranId hasLaptop quranSkill englishSkill education createdAt")
      .lean();

    trainees = data.map((t) => ({
      ...t,
      _id: t._id.toString(),
      createdAt: t.createdAt ? t.createdAt.toISOString() : "",
    }));
  } catch (error) {
    console.error("Error fetching trainees:", error);
  }

  return <TraineesClient initialTrainees={trainees} />;
}
