import AdminCoursesClient from "./AdminCoursesClient";

export const metadata = {
  title: "কোর্স ও সেশন কনফিগারেশন | অ্যাডমিন প্যানেল",
  description: "Fajr Academy TOT Course, Batch Timetable & Live Class Room Manager.",
};

export default function AdminCoursesPage() {
  const initialBatches = [
    {
      id: "TOT-MEN",
      name: "Training of Trainers (TOT) – MEN BATCH",
      tag: "পুরুষ ব্যাচ",
      status: "Active & Enrolling",
      orientationDate: "২০ সেপ্টেম্বর ২০২৬",
      orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
      routine: "রবিবার, মঙ্গলবার ও বৃহস্পতিবার (রাত ৮:০০)",
      meetLink: "https://meet.google.com/tot-fajr-men-2026",
      whatsappLink: "https://chat.whatsapp.com/tot-fajr-men-batch",
      instructor: "উস্তাদ আব্দুল্লাহ আল-মাহমুদ",
      enrolledCount: 42,
      maxSeats: 60,
    },
    {
      id: "TOT-WOMEN-014",
      name: "Training of Trainers (TOT) – WOMEN (BATCH 014)",
      tag: "মহিলা এক্সক্লুসিভ ব্যাচ",
      status: "Active & Enrolling",
      orientationDate: "২১ সেপ্টেম্বর ২০২৬",
      orientationTime: "রাত ৮:০০ টা – ৯:৩০ টা",
      routine: "শনিবার, সোমবার ও বুধবার (রাত ৮:০০)",
      meetLink: "https://meet.google.com/tot-fajr-women-014",
      whatsappLink: "https://chat.whatsapp.com/tot-fajr-women-batch014",
      instructor: "উস্তাজা ফারহানা চৌধুরী",
      enrolledCount: 58,
      maxSeats: 60,
    },
  ];

  return <AdminCoursesClient initialBatches={initialBatches} />;
}
