import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import AdminUsersClient from "./AdminUsersClient";

export const metadata = {
  title: "ইউজার ও ট্রেইনি ম্যানেজমেন্ট | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT User and Teacher Candidate Database Management.",
};

export default async function AdminUsersPage() {
  let initialUsers = [];
  try {
    await dbConnect();
    const data = await UserModel.find()
      .sort({ createdAt: -1 })
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    initialUsers = data.map((u) => ({
      ...u,
      _id: u._id.toString(),
      createdAt: u.createdAt ? u.createdAt.toISOString() : "",
      enrolledAt: u.enrolledAt ? u.enrolledAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
  }

  return <AdminUsersClient initialUsers={initialUsers} />;
}
