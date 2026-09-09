import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/service/mongo";
import { UserModel } from "@/model/user-model";
import TraineeIDCardClient from "./TraineeIDCardClient";

export const metadata = {
  title: "ট্রেইনি আইডি কার্ড | ফজর একাডেমি TOT",
  description: "অফিসিয়াল ফজর একাডেমি ট্রেনিং অব ট্রেইনার্স ডিজিটাল ট্রেইনি আইডি কার্ড।",
};

export default async function TraineeIDCardPage({ searchParams }) {
  const session = await getSessionUser();
  const params = await searchParams;
  const tranId = params?.tran_id || "";

  let user = null;
  try {
    await dbConnect();
    if (session?.email) {
      user = await UserModel.findOne({ email: session.email }).lean();
    }
    if (!user && tranId) {
      user = await UserModel.findOne({ tranId }).lean();
    }
  } catch (e) {
    console.error(e);
  }

  const isMen = user?.track === "TOT-MEN" || (!user?.track && user?.gender !== "female");
  const trackName = isMen ? "TOT TRAINEE (MEN)" : "TOT TRAINEE (WOMEN)";
  const teacherId = user?.tranId ? user.tranId.replace("TOT-PAID-", "TOT-TR-") : "TOT-TR-014";

  return (
    <TraineeIDCardClient
      user={user ? {
        fullName: user.fullName,
        gender: user.gender,
      } : null}
      trackName={trackName}
      teacherId={teacherId}
      isMen={isMen}
    />
  );
}
