import PaymentsClient from "./PaymentsClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import {
  loadTraineeDashboard,
  getCourseCatalog,
  loadPublicSettings,
  primaryCourseIdFor,
  courseNameMap,
  withCourseNames,
} from "../_shared/load-trainee";

export const metadata = {
  title: "পেমেন্ট হিস্টোরি ও ইনভয়েস | ফজর একাডেমি TOT",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) কোর্সের পেমেন্ট হিস্টোরি, ট্রানজেকশন বিবরণ ও ডাউনলোডযোগ্য অফিসিয়াল ইনভয়েস।",
};

/** Only the signed-in user's own payments. (The old ?tran_id= lookup exposed other people's invoices.) */
export default async function TOTPaymentsPage({ searchParams }) {
  const params = (await searchParams) || {};
  const { data, error } = await loadTraineeDashboard();
  if (!data) return <TraineeLoadError error={error} retryHref="/payments" />;

  let catalog = [];
  try {
    catalog = await getCourseCatalog();
  } catch (err) {
    // Names fall back to the course code; nothing else depends on the catalogue here.
    console.error("[TOT] course catalogue load failed:", err?.message || err);
  }
  const settings = await loadPublicSettings();

  return (
    <PaymentsClient
      user={data.user}
      paid={data.paid}
      payments={withCourseNames(data.payments, courseNameMap(catalog, data.courses))}
      enrolledCourses={data.courses.map((c) => ({ courseId: c.courseId, name: c.name }))}
      primaryCourseId={primaryCourseIdFor(data.user)}
      initialInvoice={typeof params.invoice === "string" ? params.invoice : ""}
      contact={{
        instituteName: settings.instituteName || "Fajr Academy",
        helplinePhone: settings.helplinePhone || "",
        supportEmail: settings.supportEmail || "",
      }}
    />
  );
}
