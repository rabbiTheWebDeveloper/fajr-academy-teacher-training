import DashboardClient from "./DashboardClient";
import TraineeLoadError from "../_shared/TraineeLoadError";
import {
  loadTraineeDashboard,
  getCourseCatalog,
  primaryCourseIdFor,
  courseNameMap,
  withCourseNames,
} from "../_shared/load-trainee";

export const metadata = {
  title: "TOT ড্যাশবোর্ড ও লার্নিং পোর্টাল | ফজর একাডেমি",
  description: "ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল ড্যাশবোর্ড, লাইভ ক্লাস এক্সেস ও মেটেরিয়ালস।",
};

export default async function TOTDashboardPage({ searchParams }) {
  const params = (await searchParams) || {};
  const { data, error } = await loadTraineeDashboard();
  if (!data) return <TraineeLoadError error={error} retryHref="/dashboard" />;

  // Catalogue for "buy another course" — failure here must not break the dashboard.
  let catalog = [];
  let catalogError = false;
  try {
    catalog = await getCourseCatalog();
  } catch (err) {
    console.error("[TOT] course catalogue load failed:", err?.message || err);
    catalogError = true;
  }

  const names = courseNameMap(catalog, data.courses);

  return (
    <DashboardClient
      user={data.user}
      paid={data.paid}
      courses={data.courses}
      participants={data.participants}
      materials={data.materials}
      payments={withCourseNames(data.payments, names)}
      evaluation={data.evaluation}
      notices={data.notices}
      catalog={catalog}
      catalogError={catalogError}
      primaryCourseId={primaryCourseIdFor(data.user)}
      flash={{
        enrolled: params.enrolled === "1" || params.enrolled === "true",
        noAccess: params.error === "no_access",
      }}
    />
  );
}
