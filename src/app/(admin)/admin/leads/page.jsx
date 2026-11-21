import { dbConnect } from "@/service/mongo";
import { DEFAULT_LEAD_LIMIT, queryAdminLeads } from "@/lib/lead-server";
import { requireAdminPage } from "../../_shared/server";
import AdminLeadsClient from "./AdminLeadsClient";

export const metadata = {
  title: "লিড ম্যানেজমেন্ট | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Pending & Cancelled Payment Lead Management, Assignment & Note History.",
};

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const access = await requireAdminPage("leads");

  let initialLeads = [];
  let initialPagination = {
    page: 1,
    limit: DEFAULT_LEAD_LIMIT,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    from: 0,
    to: 0,
  };
  let initialSummary = null;
  let initialAssigneeBreakdown = [];
  let staff = [];
  let loadError = null;

  try {
    await dbConnect();
    const res = await queryAdminLeads({
      page: 1,
      limit: DEFAULT_LEAD_LIMIT,
      hidePaid: true,
      currentAdminId: access.id,
    });
    if (res.error) {
      loadError = res.error;
    } else {
      initialLeads = res.leads;
      initialPagination = res.pagination;
      initialSummary = res.summary;
      initialAssigneeBreakdown = res.assigneeBreakdown;
      staff = res.staff;
    }
  } catch (err) {
    console.error("Error loading leads for admin page:", err);
    loadError = "ডাটাবেজের সাথে সংযোগ করা যায়নি — লিড তালিকা লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }

  return (
    <AdminLeadsClient
      initialLeads={initialLeads}
      initialPagination={initialPagination}
      initialSummary={initialSummary}
      initialAssigneeBreakdown={initialAssigneeBreakdown}
      staff={staff}
      currentAdminId={access.id}
      loadError={loadError}
    />
  );
}
