'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  CreditCard,
  FileText,
  ShieldCheck,
  Award,
  Layers,
  Receipt,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  X,
  Download,
  Info,
} from "lucide-react";
import { OfficialIDCard } from "@/components/TeacherOfficialIDCard";
import TOTLogoutButton from "@/components/TOTLogoutButton";
import PaymentRequiredCard, { latestUnpaidAttempt } from "../_shared/PaymentRequiredCard";
import MaterialCard from "../_shared/MaterialCard";
import NoticeList from "../_shared/NoticeList";
import {
  evalStatusInfo,
  formatAmount,
  formatDate,
  toBn,
  traineeIdOf,
  trackLabel,
  usableLink,
  TONE_BADGE,
} from "../_shared/format";
import ProfileModal from "./_components/ProfileModal";
import OverviewTab from "./_components/OverviewTab";
import CurriculumTab from "./_components/CurriculumTab";
import CatalogTab from "./_components/CatalogTab";
import ReceiptTab from "./_components/ReceiptTab";

const TABS = [
  { id: "overview", label: "লাইভ সেশন হাব", icon: Layers },
  { id: "courses", label: "কোর্স ক্যাটালগ ও নতুন কোর্স ক্রয়", icon: GraduationCap },
  { id: "curriculum", label: "কোর্স কারিকুলাম ও মডিউলস", icon: BookOpen },
  { id: "idcard", label: "ট্রেইনি আইডি কার্ড", icon: CreditCard },
  { id: "materials", label: "বুকস ও স্টাডি শিটস", icon: FileText },
  { id: "receipt", label: "ইনভয়েস ও ট্রানজেকশন", icon: Award },
];

const MATERIALS_PREVIEW = 6;

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
  const [activeTab, setActiveTab] = useState("overview");
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
        <span className="text-[11px] text-slate-400 font-semibold">আপনার কোর্স:</span>
        {courses.map((c, i) => (
          <button
            key={c.courseId}
            type="button"
            onClick={() => setCourseIndex(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              i === courseIndex
                ? "bg-gradient-to-r from-[#C59B27] to-[#D4AF37] text-[#051329] border-[#FDFBF7]/30"
                : "bg-[#051329] text-slate-300 border-[#C59B27]/30 hover:text-white"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    ) : null;

  const noCourseNotice = (
    <div className="p-6 rounded-3xl bg-[#081A3A]/80 border border-[#C59B27]/30 text-xs text-slate-300 flex items-start gap-3">
      <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
      <p>
        আপনার পেমেন্ট সক্রিয় আছে, কিন্তু এনরোল করা কোর্সের তথ্য এখনো পাওয়া যায়নি। কিছুক্ষণ পর আবার দেখুন অথবা হেল্পলাইনে যোগাযোগ করুন।
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Post-payment welcome / access-denied messages */}
      {showFlash && flash.enrolled && (
        <div
          className={`rounded-3xl p-4 sm:p-5 flex items-start gap-4 shadow-2xl border ${
            paid ? "bg-gradient-to-r from-[#051329] via-[#0B2545] to-[#081A3A] border-[#C59B27]/60" : "bg-amber-500/10 border-amber-500/40"
          }`}
        >
          <div className={`p-2.5 rounded-2xl border ${paid ? "bg-[#C59B27]/20 border-[#C59B27]/40" : "bg-amber-500/15 border-amber-500/40"}`}>
            {paid ? <Sparkles className="w-6 h-6 text-[#D4AF37]" /> : <Clock className="w-6 h-6 text-amber-300" />}
          </div>
          <div className="flex-1">
            <h3 className={`text-base sm:text-lg font-bold ${paid ? "text-[#D4AF37]" : "text-amber-200"}`}>
              {paid ? "🎉 অভিনন্দন! আপনার পেমেন্ট সফল হয়েছে ও ভর্তি নিশ্চিত হয়েছে" : "আপনার পেমেন্ট যাচাই প্রক্রিয়াধীন"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {paid
                ? latestValid
                  ? `পরিশোধিত: ${formatAmount(latestValid.amount, latestValid.currency)} (ট্রানজেকশন: ${latestValid.tranId})। আপনার ট্রেইনি আইডি ও কোর্স এক্সেস সক্রিয় করা হয়েছে।`
                  : "আপনার ট্রেইনি আইডি ও কোর্স এক্সেস সক্রিয় করা হয়েছে।"
                : "গেটওয়ে থেকে নিশ্চিতকরণ পাওয়ার পর আপনার অ্যাক্সেস সক্রিয় হবে। কয়েক মিনিট পর পেজটি রিফ্রেশ করুন।"}
            </p>
          </div>
          <button type="button" onClick={dismissFlash} aria-label="বন্ধ করুন" className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showFlash && flash.noAccess && (
        <div className="rounded-2xl p-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/40 text-amber-100">
          <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="flex-1 text-xs sm:text-sm">
            যে পেজটি খোলার চেষ্টা করেছেন সেটি দেখার অনুমতি আপনার অ্যাকাউন্টে নেই, তাই আপনাকে আপনার ড্যাশবোর্ডে আনা হয়েছে।
          </p>
          <button type="button" onClick={dismissFlash} aria-label="বন্ধ করুন" className="p-1 text-amber-200/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Trainee header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051329] via-[#081A3A] to-[#0B2545] border border-[#C59B27]/35 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#C59B27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#134074]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#C59B27] via-[#D4AF37] to-[#E5B842] text-[#051329] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl shadow-[#C59B27]/25 border-2 border-[#FDFBF7]/40 overflow-hidden shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                (user.fullName || "T").trim().charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">{user.fullName}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#081A3A] text-[#D4AF37] border border-[#C59B27]/40">
                  {trackLabel(user.track)}
                </span>
                {paid ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED TRAINEE
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> পেমেন্ট বাকি
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  <strong>ID:</strong> {traineeId}
                </span>
                <span>•</span>
                <span>
                  <strong>Email:</strong> {user.email}
                </span>
                <span>•</span>
                <span>
                  <strong>Phone:</strong> {user.phone || "যোগ করা হয়নি"}
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-bold bg-[#C59B27]/15 px-2.5 py-0.5 rounded-full border border-[#C59B27]/30"
                >
                  ✎ প্রোফাইল এডিট
                </button>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <Link
              href="/results"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C59B27]/20 hover:bg-[#C59B27]/30 text-[#D4AF37] border border-[#C59B27]/40 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Award className="w-4 h-4 text-[#D4AF37]" /> ফলাফল
            </Link>
            <Link
              href="/payments"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#081A3A] hover:bg-[#0B2545] text-[#D4AF37] border border-[#C59B27]/40 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Receipt className="w-4 h-4 text-[#D4AF37]" /> ইনভয়েস
            </Link>
            <button
              type="button"
              onClick={() => setActiveTab("idcard")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C59B27]/20 hover:bg-[#C59B27]/30 text-[#D4AF37] border border-[#C59B27]/40 flex items-center justify-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" /> আইডি কার্ড
            </button>
            <TOTLogoutButton variant="header" className="!py-2 !px-3" />
          </div>
        </div>
      </div>

      {/* Evaluation result banner */}
      {evaluation && evalInfo && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-[#081A3A] to-emerald-950 border-2 border-[#C59B27]/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C59B27] via-[#D4AF37] to-[#B8860B] text-[#051329] font-black text-xl flex items-center justify-center shadow-lg shrink-0">
              {evaluation.grade}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm text-white">আপনার শিক্ষক মূল্যায়নের ফলাফল প্রকাশিত হয়েছে</h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  স্কোর: {toBn(evaluation.totalScore)}/১০০
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${TONE_BADGE[evalInfo.tone]}`}>{evalInfo.label}</span>
              </div>
              <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">{evalInfo.title}</p>
            </div>
          </div>
          <Link
            href="/results"
            className="px-4 py-2 rounded-xl bg-[#C59B27] hover:bg-[#D4AF37] text-[#051329] font-black text-xs shadow-md transition-all whitespace-nowrap"
          >
            {evalInfo.passed ? "পূর্ণাঙ্গ ফলাফল ও সনদ দেখুন →" : "পূর্ণাঙ্গ ফলাফল দেখুন →"}
          </Link>
        </div>
      )}

      <NoticeList notices={notices} limit={5} title="ইনস্ট্রাক্টর নোটিশ ও গুরুত্বপূর্ণ আপডেট" />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#C59B27]/20 overflow-x-auto pb-2 scrollbar-none" role="tablist">
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
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#B8860B] text-[#051329] shadow-md shadow-[#C59B27]/20 border border-[#FDFBF7]/30"
                  : "text-slate-300 hover:text-white hover:bg-[#0B2545]/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {!paid ? (
            <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} />
          ) : !course ? (
            noCourseNotice
          ) : (
            <>
              {courseSelector}
              <OverviewTab key={course.courseId} course={course} participant={participant} />
            </>
          )}
        </div>
      )}

      {/* CURRICULUM */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {!paid ? (
            <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} compact />
          ) : !course ? (
            noCourseNotice
          ) : (
            <>
              {courseSelector}
              <CurriculumTab key={course.courseId} course={course} />
            </>
          )}
        </div>
      )}

      {/* ID CARD */}
      {activeTab === "idcard" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" /> আপনার অফিসিয়াল টিচার্স ট্রেনিং আইডি কার্ড
              </h2>
              <p className="text-xs text-slate-300 mt-1">ফজর একাডেমি ট্রেনিং বোর্ডের অনুমোদিত ডিজিটাল ট্রেইনি পরিচিতিপত্র</p>
            </div>
            {paid && (
              <Link
                href="/id-card"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C59B27] text-[#051329] font-black text-xs flex items-center gap-2 shadow-md transition-all border border-[#FDFBF7]/30"
              >
                <Download className="w-4 h-4" /> কার্ড ডাউনলোড / প্রিন্ট পেজ
              </Link>
            )}
          </div>

          {!paid ? (
            <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} compact />
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
              <OfficialIDCard
                cardId="dashboard-id-card"
                profile={{
                  fullName: user.fullName,
                  designation: user.designation || "TOT Trainee Teacher",
                  teacherId: traineeId,
                  bloodGroup: user.bloodGroup,
                  avatar: user.avatar,
                  track: user.track,
                  department: user.department,
                }}
              />

              <div className="max-w-sm space-y-4 text-xs text-slate-300">
                <div className="bg-[#051329] border border-[#C59B27]/30 p-4 rounded-2xl space-y-2 shadow-lg">
                  <h4 className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> ভেরিফিকেশন তথ্য
                  </h4>
                  <p>
                    <strong>আইডি নম্বর:</strong> {traineeId}
                  </p>
                  <p>
                    <strong>ট্র্যাক:</strong> {trackLabel(user.track)}
                  </p>
                  <p>
                    <strong>রক্তের গ্রুপ:</strong> {user.bloodGroup || "দেওয়া হয়নি"}
                  </p>
                  {user.enrolledAt && (
                    <p>
                      <strong>ভর্তির তারিখ:</strong> {formatDate(user.enrolledAt)}
                    </p>
                  )}
                  <p>
                    <strong>ইস্যুকারী:</strong> ফজর একাডেমি টিচার্স ট্রেনিং বোর্ড
                  </p>
                </div>
                {!user.bloodGroup && (
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="w-full py-2 rounded-xl bg-[#081A3A] border border-[#C59B27]/30 text-[#D4AF37] font-bold"
                  >
                    কার্ডে রক্তের গ্রুপ যোগ করুন
                  </button>
                )}
                <p className="text-slate-400 leading-relaxed">
                  এই ডিজিটাল কার্ডটি ফজর একাডেমি লাইভ ক্লাস ও ট্রেইনার কমিউনিটিতে আপনার পরিচয়পত্র হিসেবে গণ্য হবে।
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">কোর্স স্টাডি শিটস, লেসন প্ল্যান ও সহায়ক বই</h2>
            {paid && materials.length > 0 && (
              <Link href="/materials" className="text-xs font-bold text-[#D4AF37] hover:underline">
                সব ম্যাটেরিয়াল ({toBn(materials.length)}টি) দেখুন →
              </Link>
            )}
          </div>

          {!paid ? (
            <PaymentRequiredCard courseId={primaryCourseId} lastAttempt={lastAttempt} compact />
          ) : materials.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#081A3A]/70 border border-[#C59B27]/20 text-center text-xs text-slate-400 space-y-1">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p>আপনার কোর্সের জন্য এখনো কোনো স্টাডি ম্যাটেরিয়াল প্রকাশ করা হয়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.slice(0, MATERIALS_PREVIEW).map((item) => (
                <MaterialCard key={item.key} item={item} showCourse={courses.length > 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* RECEIPT */}
      {activeTab === "receipt" && <ReceiptTab payments={payments} user={user} />}

      {/* CATALOGUE */}
      {activeTab === "courses" && (
        <CatalogTab
          catalog={catalog}
          catalogError={catalogError}
          enrolledCourses={courses}
          pendingIds={pendingIds}
          onOpenCourse={openCourse}
        />
      )}

      {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSaved={handleProfileSaved} />}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-start gap-2 ${
            toast.type === "success" ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-200" : "bg-rose-950/95 border-rose-500/50 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
