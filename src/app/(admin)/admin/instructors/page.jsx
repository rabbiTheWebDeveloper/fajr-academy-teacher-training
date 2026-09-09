import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import AdminInstructorsClient from "./AdminInstructorsClient";

export const metadata = {
  title: "ইনস্ট্রাক্টর ও ট্রেইনার প্যানেল | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Senior Trainer Faculty & Coordinator Management.",
};

export default async function AdminInstructorsPage() {
  let initialInstructors = [];
  try {
    await dbConnect();
    const data = await UserModel.find({ role: { $in: ["instructor", "admin"] } })
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    initialInstructors = data.map((i) => ({
      ...i,
      _id: i._id.toString(),
      createdAt: i.createdAt ? i.createdAt.toISOString() : "",
    }));
  } catch (error) {
    console.error("Error fetching instructors:", error);
  }

  return <AdminInstructorsClient initialInstructors={initialInstructors} />;
}
