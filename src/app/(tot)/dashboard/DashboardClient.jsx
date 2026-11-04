'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  Receipt,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  X,
  Info,
} from "lucide-react";
import TOTLogoutButton from "@/components/TOTLogoutButton";
import PaymentRequiredCard, { latestUnpaidAttempt } from "../_shared/PaymentRequiredCard";
import NoticeList from "../_shared/NoticeList";
import {
  evalStatusInfo,
  formatAmount,
  toBn,
  traineeIdOf,
  trackLabel,
  usableLink,
  TONE_BADGE,
} from "../_shared/format";
import ProfileModal from "./_components/ProfileModal";
import OverviewTab from "./_components/OverviewTab";
import MyCoursesTab from "./_components/MyCoursesTab";
import CatalogTab from "./_components/CatalogTab";
import ReceiptTab from "./_components/ReceiptTab";

const TABS = [
  { id: "mycourses", label: "আমার কোর্স", icon: BookOpen },
  { id: "overview", label: "লাইভ সেশন", icon: Layers },
  { id: "courses", label: "কোর্স ক্যাটালগ", icon: GraduationCap },
  { id: "receipt", label: "ইনভয়েস", icon: Receipt },
];

export default function DashboardClient({
  user: initialUser,
  paid,
  courses = [],
  participants = [],
  materials = [],
  payments = [],
  evaluation = null,
  notices = [],
  catalog = [],
  catalogError = false,
  primaryCourseId = "",
  flash = {},
}) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState("mycourses");
  const [detailId, setDetailId] = useState(null); // course open in "আমার কোর্স" (null = list)
  const [courseIndex, setCourseIndex] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFlash, setShowFlash] = useState(Boolean(flash.enrolled || flash.noAccess));

  const course = courses[courseIndex] || courses[0] || null;
  const participant = course ? participants.find((p) => p.courseId === course.courseId) || null : null;
  const traineeId = traineeIdOf(user);
  const lastAttempt = latestUnpaidAttempt(payments, primaryCourseId);
  const latestValid = payments.find((p) => p.status === "VALID") || null;
  const evalInfo = evaluation ? evalStatusInfo(evaluation.qualificationStatus) : null;
  const avatar = usableLink(user.avatar);
  const enrolledIds = courses.map((c) => c.courseId);
  const pendingIds = participants
    .filter((p) => !["paid", "free"].includes(p.paymentStatus) && !enrolledIds.includes(p.courseId))
    .map((p) => p.courseId);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCourse = (courseId) => {
    const index = courses.findIndex((c) => c.courseId === courseId);
    if (index >= 0) setCourseIndex(index);
    setActiveTab("overview");
  };

  // Jump to one purchased course's details (links, modules, resources).
  const openDetails = (courseId) => {
    setDetailId(courseId);
    setActiveTab("mycourses");
  };

  const dismissFlash = () => {
    setShowFlash(false);
    router.replace("/dashboard", { scroll: false });
  };

  const handleProfileSaved = (updated, message) => {
    setUser((prev) => ({ ...prev, ...updated }));
    setProfileOpen(false);
    showToast("success", message);
  };

  const courseSelector =
    courses.length > 1 ? (
      <div className="flex flex-wrap items-center gap-2">
        {courses.map((c, i) => (
          <button
            key={c.courseId}
            type="button"
            onClick={() => setCourseIndex(i)}
            aria-pressed={i === courseIndex}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              i === courseIndex ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    ) : null;

  const noCourseNotice = (
    <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <p>
        আপনার পেমেন্ট সক্রিয় আছে, কিন্তু এনরোল করা কোর্সের তথ্য এখনো পাওয়া যায়নি। কিছুক্ষণ পর আবার দেখুন অথবা হেল্পলাইনে যোগাযোগ করুন।
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Post-payment / access messages */}
      {showFlash && flash.enrolled && (
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${paid ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          {paid ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />}
          <div className="flex-1 text-sm">
            <p className={`font-semibold ${paid ? "text-emerald-200" : "text-amber-200"}`}>
              {paid ? "পেমেন্ট সফল হয়েছে, ভর্তি নিশ্চিত হয়েছে" : "আপনার পেমেন্ট যাচাই প্রক্রিয়াধীন"}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {paid
                ? latestValid
                  ? `পরিশোধিত: ${formatAmount(latestValid.amount, latestValid.currency)} (ট্রানজেকশন: ${latestValid.tranId})।`
                  : "আপনার কোর্স এক্সেস সক্রিয় করা হয়েছে।"
                : "গেটওয়ে থেকে নিশ্চিতকরণ পাওয়ার পর আপনার অ্যাক্সেস সক্রিয় হবে। কয়েক মিনিট পর পেজটি রিফ্রেশ করুন।"}
            </p>
          </div>
          <button type="button" onClick={dismissFlash} aria-label="বন্ধ করুন" className="p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showFlash && flash.noAccess && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
          <p className="flex-1 text-sm">যে পেজটি খোলার চেষ্টা করেছেন সেটি দেখার অনুমতি আপনার অ্যাকাউন্টে নেই।</p>
          <button type="button" onClick={dismissFlash} aria-label="বন্ধ করুন" className="p-1 text-amber-200/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Profile header */}
      <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-lg font-semibold text-white">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={user.fullName} className="h-full w-full object-cover" />
            ) : (
              (user.fullName || "T").trim().charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-white sm:text-xl">{user.fullName}</h1>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">{trackLabel(user.track)}</span>
              {paid ? (
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">সক্রিয়</span>
              ) : (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-300">পেমেন্ট বাকি</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              ID {traineeId} · {user.email}
              {user.phone ? ` · ${user.phone}` : ""}
            </p>
            <button type="button" onClick={() => setProfileOpen(true)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              প্রোফাইল সম্পাদনা
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Link href="/results" className="rounded-lg border border-slate-700 px-3.5 py-2 text-slate-200 hover:border-slate-600 hover:text-white">
            ফলাফল
          </Link>
          <Link href="/payments" className="rounded-lg border border-slate-700 px-3.5 py-2 text-slate-200 hover:border-slate-600 hover:text-white">
            পেমেন্ট
          </Link>
          <TOTLogoutButton variant="header" className="!rounded-lg !px-3.5 !py-2" />
        </div>
      </div>

      {/* Evaluation result */}
      {evaluation && evalInfo && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-lg font-bold text-white">
              {evaluation.grade}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">মূল্যায়নের ফলাফল প্রকাশিত হয়েছে</p>
              <p className="mt-0.5 text-xs text-slate-400">
                স্কোর {toBn(evaluation.totalScore)}/১০০ · <span className={TONE_BADGE[evalInfo.tone]}>{evalInfo.label}</span>
              </p>
            </div>
          </div>
          <Link href="/results" className="whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            ফলাফল দেখুন
          </Link>
        </div>
      )}

      <NoticeList notices={notices} limit={5} title="ইনস্ট্রাক্টর নোটিশ" />

      {/* Tabs */}
      <div role="tablist" className="-mb-px flex items-center gap-6 overflow-x-auto border-b border-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${
                isActive ? "border-indigo-500 font-semibold text-white" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {!paid ? (
            <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} />
          ) : !course ? (
            noCourseNotice
          ) : (
            <>
              {courseSelector}
              <OverviewTab key={course.courseId} course={course} participant={participant} onOpenDetails={() => openDetails(course.courseId)} />
            </>
          )}
        </div>
      )}

      {/* My courses: purchased courses → details, links, modules, resources */}
      {activeTab === "mycourses" && (
        <MyCoursesTab
          paid={paid}
          courses={courses}
          participants={participants}
          materials={materials}
          payments={payments}
          primaryCourseId={primaryCourseId}
          lastAttempt={lastAttempt}
          openId={detailId}
          onOpen={setDetailId}
          onBrowse={() => setActiveTab("courses")}
        />
      )}

      {/* Receipts */}
      {activeTab === "receipt" && <ReceiptTab payments={payments} user={user} />}

      {/* Catalogue */}
      {activeTab === "courses" && (
        <CatalogTab
          catalog={catalog}
          catalogError={catalogError}
          enrolledCourses={courses}
          pendingIds={pendingIds}
          onOpenCourse={openCourse}
          onOpenDetails={openDetails}
        />
      )}

      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSaved={handleProfileSaved} />}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-2 rounded-lg border p-3.5 text-sm shadow-xl ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-slate-900 text-emerald-200"
              : "border-rose-500/30 bg-slate-900 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
