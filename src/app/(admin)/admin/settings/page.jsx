import AdminSettingsClient from "./AdminSettingsClient";

export const metadata = {
  title: "সিস্টেম সেটিংস | অ্যাডমিন প্যানেল",
  description: "Fajr Academy Global TOT Settings & Gateway Configuration.",
};

export default function AdminSettingsPage() {
  const initialSettings = {
    coursePrice: 1000,
    currency: "BDT",
    sslcommerzMode: "Sandbox / Live",
    sslStoreId: "fajra6aa249a39ddb2",
    helplinePhone: "01410764581",
    supportEmail: "support@fajracademy.io",
    whatsappSupport: "https://wa.me/8801410764581",
    certificatePrefix: "FJR-TOT-2026",
    autoApprovePayment: true,
  };

  return <AdminSettingsClient initialSettings={initialSettings} />;
}
