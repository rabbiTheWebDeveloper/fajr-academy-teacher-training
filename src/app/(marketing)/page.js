import RevealObserver from './RevealObserver'
import MarketingNavbar from './MarketingNavbar'
import RegistrationForm from './RegistrationForm'
import FloatingWhatsApp from './FloatingWhatsApp'
import VideoShortsCard from './VideoShortsCard'
import AdmitLink from './AdmitLink'
import AdmissionHighlight from './AdmissionHighlight'
import BatchSchedule from './BatchSchedule'
import MobileActionBar from './MobileActionBar'
import { FACEBOOK_MESSENGER_URL } from './contact'
import MessengerIcon from './MessengerIcon'
import { BASE_URL } from '@/constant'
import { dbConnect } from '@/service/mongo'
import { withLiveEnrolment } from '@/service/course-service'
import { CourseModel } from '@/model/course-model'
import { admissionState } from './admission'
import { modulesFor, sessionRows, sessionRange, NO_DATE } from './course-dates'
import { SettingModel } from '@/model/setting-model'
import { InstructorModel } from '@/model/instructor-model'
import { DEFAULT_INSTRUCTORS } from '@/constant/instructor-defaults'
import { toBengaliNumber } from '@/lib/utils'
import { publicSettings } from '@/lib/public-settings'
import { getSessionUser } from '@/lib/auth'
import { accountTypeForRole, homeForRole } from '@/lib/roles'
import Link from 'next/link'
import {
  BookOpen,
  UserCheck,
  Award,
  Calendar,
  Check,
  ArrowRight,
  CreditCard,
  User,
  Users,
  Sparkles,
  Phone,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Star,
  Lock,
  Play,
  Plus,
  GraduationCap,
  Clock,
  Layers,
  Globe,
  TrendingUp,
  HelpCircle,
  LogIn,
  LayoutDashboard,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL = `https://${BASE_URL}`
const PAGE_URL = `${SITE_URL}/`

/* ------------------------------------------------------------------ */
/*  Page-level SEO metadata                                            */
/* ------------------------------------------------------------------ */
export const metadata = {
  title: 'অনলাইন কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) — পুরুষ ও নারী ব্যাচ ২০২৬ | ফজর একাডেমি',
  description:
    'ফজর একাডেমির পক্ষ থেকে ১০,০০০+ শিক্ষার্থীর সফলতার ধারাবাহিকতায় এবার ৩,০০০+ শিক্ষক তৈরি করার লক্ষ্যে প্রফেশনাল কুরআন টিচার ট্রেনিং প্রোগ্রাম। পুরুষ ও নারী ব্যাচ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী!',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'অনলাইন কুরআন টিচার ট্রেনিং ২০২৬ (TOT - Men & Women) — ফজর একাডেমি',
    description:
      'ঘরে বসেই অনলাইনে ৪টি সেশনে প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। মাসিক ১৫,০০০-২২,০০০ টাকা সম্মানী, সার্টিফিকেট ও শিক্ষক নিয়োগ।',
    url: PAGE_URL,
    images: [{ url: '/og-image.jpg', width: 1200, height: 1200, alt: 'ফজর একাডেমি কুরআন টিচার ট্রেনিং' }],
  },
}

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */
export default async function TeacherRegistrationMarketingPage() {
  // A visitor who is already signed in gets a "ড্যাশবোর্ড" shortcut instead of "লগইন".
  // Token check only (no database), and never a reason for the page to fail.
  const session = await getSessionUser().catch(() => null)
  const account =
    session?.id && accountTypeForRole(session.role) ? { href: homeForRole(session.role) } : null

  let courses = []
  let settingsDoc = null
  let instructorsData = []

  try {
    await dbConnect()
    const [coursesResult, settingsResult, instructorsResult] = await Promise.all([
      // Class links and resources are for enrolled trainees only.
      CourseModel.find({ isPublished: true }).select("-meetLink -whatsappLink -resources").sort({ createdAt: 1 }).lean(),
      SettingModel.findOne({ key: 'system_settings' }).lean(),
      InstructorModel.find({ isActive: { $ne: false } })
        .sort({ rating: -1, experienceYears: -1 })
        .select('fullName designation specialization bio experienceYears rating gender avatar track')
        .limit(6)
        .lean(),
    ])

    courses = coursesResult || []
    // Real enrolment numbers (valid payments) for the seat lines; the page still renders without them.
    try {
      courses = await withLiveEnrolment(courses)
    } catch (err) {
      console.error('Could not count live enrolment for the marketing page:', err)
    }
    settingsDoc = settingsResult ? JSON.parse(JSON.stringify(settingsResult)) : null
    instructorsData = instructorsResult || []
  } catch (err) {
    console.error('Error fetching marketing page data in page.js:', err)
  }

  // System Settings Defaults & Merging
  const defaultSettings = {
    siteTitle: 'ফজর একাডেমি | টিচার্স ট্রেনিং (TOT) প্রোগ্রাম',
    instituteName: 'Fajr Academy',
    tagline: 'শুদ্ধভাবে কুরআন ও ইংরেজি জানেন? ঘরে বসেই হয়ে উঠুন প্রফেশনাল কুরআন টিচার',
    coursePrice: 1000,
    regularCoursePrice: 2500,
    currency: 'BDT',
    currentBatch: 'BATCH 2026',
    admissionStatus: 'open', // 'open' | 'waitlist' | 'closed'
    orientationDate: '২০ ও ২১ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
    bkashMerchantNumber: '01410764581',
    nagadMerchantNumber: '01410764581',
    supportEmail: 'support@fajracademy.io',
    registrationOpen: true,
  }

  // Only public keys — the raw settings document holds gateway credentials.
  const liveSettings = publicSettings({ ...defaultSettings, ...(settingsDoc || {}) })
  const coursePrice = liveSettings.coursePrice || 1000
  const regularPrice = liveSettings.regularCoursePrice || 2500

  // Live Courses extraction
  const menCourse = courses?.find((c) => c.track === 'men' || c.courseId === 'TOT-MEN') || {
    name: 'Training of Trainers (TOT) - MEN BATCH',
    tag: 'MEN BATCH',
    fee: coursePrice,
    regularFee: regularPrice,
    orientationDate: '২০ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
    summary: 'ছেলেদের জন্য ঘরে বসে কুরআন শিক্ষার সুযোগ ও আধুনিক পদ্ধতি',
    perks: [
      'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
      '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
      'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
      'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
      'Training & Grooming: নিয়মিত ক্যারিয়ার প্রোগ্রেসের সুযোগ',
    ],
  }

  const womenCourse = courses?.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) - WOMEN BATCH',
    tag: 'WOMEN BATCH 014',
    fee: coursePrice,
    regularFee: regularPrice,
    orientationDate: '২১ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা – ৯:৩০ টা',
    summary: 'নিজের ঘরে থেকেই আন্তর্জাতিক মানের অনলাইন কুরআন শিক্ষার সুযোগ',
    perks: [
      'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
      '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
      'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
      'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
      'পর্দা ও শৃঙ্খলার সুরক্ষা: ১০০% ঘরে বসেই পাঠদানের সুযোগ',
    ],
  }

  // Active Instructors Roster (Live from InstructorModel or Fallback)
  const activeInstructors =
    instructorsData && instructorsData.length > 0
      ? JSON.parse(JSON.stringify(instructorsData))
      : DEFAULT_INSTRUCTORS.map((i) => ({
          fullName: i.fullName,
          designation: i.designation,
          specialization: i.specialization,
          bio: i.bio,
          experienceYears: i.experienceYears,
          rating: i.rating,
          gender: i.gender,
          track: i.track,
        }))

  // Curriculum and session dates per batch (course data first, then the built-in batch curriculum).
  const curriculumModules = modulesFor(menCourse, 'men')
  const menRows = sessionRows(curriculumModules)
  const womenRows = sessionRows(modulesFor(womenCourse, 'women'))

  const sanitizedCourses = JSON.parse(JSON.stringify(courses || []))

  const admission = admissionState(liveSettings)
  const menFee = menCourse.fee || coursePrice
  const womenFee = womenCourse.fee || coursePrice
  const menOrientation = `${menCourse.orientationDate || liveSettings.orientationDate}`
  const womenOrientation = `${womenCourse.orientationDate || '২১ সেপ্টেম্বর ২০২৬'}`

  /* Dynamic JSON-LD Structured Data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: liveSettings.instituteName || 'Fajr Academy',
        alternateName: 'ফজর একাডেমি',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.ico`, width: 80, height: 80 },
        description: 'Balanced Education for Dunya and Akhirah — Online Quran Teacher Training in Bangladesh.',
        sameAs: [FACEBOOK_MESSENGER_URL, 'https://youtube.com/shorts/zPXTzup-2ok'],
      },
      {
        '@type': 'Course',
        '@id': `${PAGE_URL}#course-men`,
        name: menCourse.name || 'Training of Trainers (TOT) – MEN',
        description: menCourse.summary || 'ছেলেদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী।',
        url: PAGE_URL,
        provider: { '@type': 'Organization', name: 'Fajr Academy', sameAs: SITE_URL },
        educationalLevel: 'Intermediate',
        courseMode: ['Online'],
        inLanguage: 'bn',
        offers: {
          '@type': 'Offer',
          price: String(menCourse.fee || coursePrice),
          priceCurrency: 'BDT',
          availability: 'https://schema.org/InStock',
          url: PAGE_URL,
        },
      },
      {
        '@type': 'Course',
        '@id': `${PAGE_URL}#course-women`,
        name: womenCourse.name || 'Training of Trainers (TOT) – WOMEN',
        description: womenCourse.summary || 'দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী।',
        url: PAGE_URL,
        provider: { '@type': 'Organization', name: 'Fajr Academy', sameAs: SITE_URL },
        educationalLevel: 'Intermediate',
        courseMode: ['Online'],
        inLanguage: 'bn',
        offers: {
          '@type': 'Offer',
          price: String(womenCourse.fee || coursePrice),
          priceCurrency: 'BDT',
          availability: 'https://schema.org/InStock',
          url: PAGE_URL,
        },
      },
      {
        '@type': 'WebPage',
        '@id': PAGE_URL,
        url: PAGE_URL,
        name: 'কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) | ফজর একাডেমি',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
    ],
  }

  return (
    <div className="marketing-root bg-[#060D1A] text-white font-bengali antialiased selection:bg-amber-400 selection:text-slate-950 min-h-screen pb-24 lg:pb-0">
      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Scroll Reveal Observer ── */}
      <RevealObserver />

      {/* ==================== TOP ANNOUNCEMENT BAR ==================== */}
      <div className="bg-[#040814] border-b border-white/5 px-3 sm:px-6 md:px-12 flex justify-between items-center gap-3 text-xs text-amber-300/90">
        <a href="#register" className="flex flex-1 items-center gap-2 font-medium min-w-0 py-3">
          <span
            className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
              admission.mode === 'closed'
                ? 'bg-rose-500'
                : admission.mode === 'waitlist'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] sm:text-xs truncate">{admission.label}</span>
          {!admission.closed && (
            <span className="shrink-0 text-[11px] sm:text-xs font-bold text-white underline decoration-amber-400/70 underline-offset-2">
              ভর্তি হোন →
            </span>
          )}
        </a>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden md:inline text-slate-300">
            <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
            ফার্স্ট ওরিয়েন্টেশন:{' '}
            <strong className="text-white">{menCourse.orientationDate || liveSettings.orientationDate}</strong> ও{' '}
            <strong className="text-white">{womenCourse.orientationDate || '২১ সেপ্টেম্বর'}</strong>
          </span>
          <span className="hidden md:inline text-white/10">|</span>
          <a
            href={FACEBOOK_MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hidden sm:flex items-center gap-1.5 py-3 text-amber-300 text-[11px] sm:text-xs transition-colors shrink-0"
          >
            <MessengerIcon className="w-3.5 h-3.5 text-sky-400" boltColor="#0A1424" />
            <span>Facebook Messenger</span>
          </a>
        </div>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <MarketingNavbar settings={liveSettings} closed={admission.closed} account={account} />

      {/* ==================== HERO SECTION ==================== */}
      <section
        id="home"
        className="relative lg:min-h-[90vh] flex items-center justify-center pt-6 sm:pt-14 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#060D1A] via-[#09152B] to-[#060D1A]"
      >
        {/* Soft Ambient Radial Lights */}
        <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-blue-600/15 rounded-full filter blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[460px] h-[460px] bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />

        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

        <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-10 max-w-7xl">
          {/* Left Hero Column */}
          <div data-reveal className="space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-[13px] sm:text-sm font-semibold tracking-wider shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>TRAINING OF TRAINERS (TOT) — {liveSettings.currentBatch || '2026'}</span>
            </div>

            <h1 className="text-[1.7rem] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.25] sm:leading-[1.2] text-white tracking-tight">
              শুদ্ধভাবে কুরআন ও <br />
              <span className="text-gradient-gold">ইংরেজি জানেন?</span>
              <br />
              ঘরে বসেই হয়ে উঠুন <br />
              <span className="relative inline-block mt-1">
                প্রফেশনাল কুরআন টিচার
                <span className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-transparent rounded-full" />
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              ফজর একাডেমির পক্ষ থেকে <strong className="text-white font-bold">১০,০০০+</strong> শিক্ষার্থীর সফলতার ধারাবাহিকতায় এবার{' '}
              <strong className="text-white font-bold">৩,০০০+</strong> শিক্ষক তৈরির লক্ষ্যে আন্তর্জাতিক মানের প্রফেশনাল কুরআন টিচার ট্রেনিং প্রোগ্রাম।
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2 text-left sm:flex sm:flex-wrap justify-center lg:justify-start sm:gap-3 pt-1">
              {[
                'লাইভ ইন্টারঅ্যাক্টিভ ক্লাস',
                'আজীবন ক্লাস রেকর্ডিং',
                'অফিসিয়াল মূল্যায়ন সনদ',
                'ডিভাইস ও ল্যাপটপ সহায়তা',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/10 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-full text-[12px] sm:text-sm leading-snug font-medium text-slate-200 hover:border-amber-400/40 hover:bg-white/[0.07] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Hadith Callout */}
            <div className="bg-gradient-to-r from-slate-900/90 to-[#0B1A45]/40 border-l-4 border-l-amber-400 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left max-w-xl mx-auto lg:mx-0 shadow-lg">
              <span className="text-amber-400 text-3xl font-serif leading-none shrink-0">&ldquo;</span>
              <div>
                <p className="text-[13px] sm:text-sm text-slate-200 italic leading-relaxed">
                  &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।&rdquo;
                </p>
                <span className="text-[11px] sm:text-xs text-amber-300 font-semibold mt-1 inline-block">
                  — সহীহ বুখারী ৫০২৭
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <a
                href="#register"
                className={`${admission.closed ? '' : 'cta-glow cta-shine'} w-full sm:w-auto min-h-14 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-black py-4 px-8 rounded-full text-center text-base sm:text-base md:text-lg shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5`}
              >
                <CreditCard className="w-5 h-5 text-slate-900" />
                <span>
                  {admission.closed ? 'ভর্তি সাময়িক বন্ধ — বিস্তারিত দেখুন' : `ভর্তি হোন — মাত্র ${toBengaliNumber(coursePrice)} ৳`}
                </span>
              </a>
              <a
                href={FACEBOOK_MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-12 bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-amber-400/40 text-white font-bold py-3 sm:py-4 px-7 rounded-full text-center text-sm sm:text-base md:text-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <MessengerIcon className="w-5 h-5 text-sky-400" boltColor="#0A1424" />
                <span>Facebook Messenger</span>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="text-center lg:text-left text-xs text-slate-400 pt-1 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> ১০০% নিরাপদ গেটওয়ে
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> তাৎক্ষণিক অ্যাক্সেস
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" /> সীমিত আসন সংখ্যা
              </span>
            </div>
          </div>

          {/* Right Hero Column — Executive Glass Card */}
          <div data-reveal className="relative max-w-lg mx-auto w-full hidden lg:block">
            <div className="bg-[#0A1326]/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-2xl relative z-10 shadow-black/70">
              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-3.5 border-2 border-amber-400/50 shadow-lg shadow-amber-500/20 bg-gradient-to-br from-[#0B1A45] to-[#060D1A] p-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fajr-logo.png"
                    alt="FAJR Academy Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-wide">
                  কুরআন টিচার ট্রেনিং (TOT)
                </h2>
                <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 text-xs px-3.5 py-1 rounded-full border border-amber-400/35 font-semibold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveSettings.currentBatch || 'BATCH 2026'} • সীমিত আসন</span>
                </div>
              </div>

              {/* Value Points */}
              <ul className="space-y-3 sm:space-y-3.5 mb-7 text-[13px] sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mt-0.5 shrink-0 border border-amber-400/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">আন্তর্জাতিক কুরআন শিক্ষণ পদ্ধতি ও আধুনিক পেডাগোজি</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mt-0.5 shrink-0 border border-amber-400/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">বাচ্চাদের হ্যান্ডলিং, কমিউনিকেশন ও সাইকোলজি কৌশল</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mt-0.5 shrink-0 border border-amber-400/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">
                    মাসিক <strong className="text-amber-300 font-bold">১৫,০০০ – ২২,০০০ টাকা</strong> সম্মানীতে শিক্ষকতার সরাসরি সুযোগ
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mt-0.5 shrink-0 border border-amber-400/30">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">অফিসিয়াল মূল্যায়ন সার্টিফিকেট ও আজীবন মেন্টরশিপ সাপোর্ট</span>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="#register"
                  className={`${admission.closed ? '' : 'cta-glow cta-shine'} block w-full text-center bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-black py-3.5 rounded-xl text-base shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all`}
                >
                  <CreditCard className="w-4 h-4 inline mr-2 text-slate-900" />
                  {admission.closed ? 'ভর্তি সাময়িক বন্ধ — বিস্তারিত দেখুন' : `ভর্তি হোন (${toBengaliNumber(coursePrice)} ৳)`}
                </a>
                <a
                  href={FACEBOOK_MESSENGER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-slate-200 hover:text-white font-semibold py-3 rounded-xl text-[13px] sm:text-sm transition-all"
                >
                  <MessengerIcon className="w-4 h-4 inline mr-2 text-sky-400" boltColor="#0A1424" />
                  Facebook Messenger-এ সরাসরি কথা বলুন
                </a>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>আপনার তথ্য ও পেমেন্ট সম্পূর্ণ সুরক্ষিত ও গোপনীয়</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ADMISSION HIGHLIGHT ==================== */}
      <AdmissionHighlight
        price={coursePrice}
        regularPrice={regularPrice}
        batchLabel={liveSettings.currentBatch || 'BATCH 2026'}
        mode={admission.mode}
        batches={[
          {
            key: 'men',
            label: 'পুরুষ ব্যাচ',
            cta: 'পুরুষ ব্যাচে ভর্তি হোন',
            orientation: menOrientation,
            course: { enrolledCount: menCourse.enrolledCount, maxSeats: menCourse.maxSeats },
          },
          {
            key: 'women',
            label: 'নারী ব্যাচ (০১৪)',
            cta: 'নারী ব্যাচে ভর্তি হোন',
            orientation: womenOrientation,
            course: { enrolledCount: womenCourse.enrolledCount, maxSeats: womenCourse.maxSeats },
          },
        ]}
      />

      {/* ==================== 4 METRICS TRUST BAR ==================== */}
      <section className="bg-[#050B17] border-y border-white/5 py-8 sm:py-10 mt-8 sm:mt-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 text-center hover:border-amber-400/30 transition-all">
              <Users className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">১০,০০০+</div>
              <div className="text-[13px] sm:text-sm text-slate-400 mt-1">সফল শিক্ষার্থী</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 text-center hover:border-amber-400/30 transition-all">
              <Award className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">৩,০০০+</div>
              <div className="text-[13px] sm:text-sm text-slate-400 mt-1">শিক্ষক তৈরির লক্ষ্য</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 text-center hover:border-amber-400/30 transition-all">
              <Globe className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-extrabold text-white">৫০+ দেশ</div>
              <div className="text-[13px] sm:text-sm text-slate-400 mt-1">প্রবাসী শিক্ষার্থী পরিবার</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 text-center hover:border-amber-400/30 transition-all">
              <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">১৫-২২ হাজার ৳</div>
              <div className="text-[13px] sm:text-sm text-slate-400 mt-1">সম্ভাব্য মাসিক সম্মানী</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== COURSES SECTION ==================== */}
      <section
        id="courses"
        className="py-12 sm:py-24 relative bg-gradient-to-b from-[#060D1A] via-[#08152B] to-[#060D1A]"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-[13px] sm:text-sm font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> প্রফেশনাল ট্রেনিং প্রোগ্রাম
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-3 leading-tight text-white">
              কুরআনের আলো ছড়াতে <br />
              <span className="text-gradient-gold">প্রফেশনাল শিক্ষক হন</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <p className="text-slate-300 max-w-2xl mx-auto text-[13px] sm:text-sm md:text-base leading-relaxed">
              অভিজ্ঞ ট্রেনার ও আন্তর্জাতিক শিক্ষক পেডাগগির মাধ্যমে ঘরে বসেই গড়ে তুলুন দক্ষ, দায়িত্বশীল ও আধুনিক কুরআন শিক্ষক হিসেবে নিজেকে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Course 1: MEN BATCH */}
            <div
              id="course-men"
              className="bg-gradient-to-b from-[#0B1A45]/35 via-slate-900/80 to-[#060D1A] border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-blue-400/60 transition-all duration-300 group"
              data-reveal
            >
              <div>
                <div className="relative h-44 sm:h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/men-batch.jpg"
                    alt="Men's Quran Class"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A] via-[#060D1A]/60 to-transparent" />

                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {menCourse.tag || 'MEN BATCH'}
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                    {toBengaliNumber(menCourse.fee || coursePrice)} ৳
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {menCourse.name}
                    </h3>
                    <p className="text-blue-300 text-[13px] sm:text-sm mt-1 font-medium">
                      {menCourse.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3.5 mb-5 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">
                        First Orientation Class:
                      </p>
                      <p className="text-sm font-bold text-white">
                        {menCourse.orientationDate || liveSettings.orientationDate} –{' '}
                        {menCourse.orientationTime || liveSettings.orientationTime}
                      </p>
                      <p className="text-xs text-blue-200/90 mt-1">সেশন: {sessionRange(menRows)}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 text-[13px] sm:text-sm text-slate-300">
                    {(menCourse.perks && menCourse.perks.length > 0
                      ? menCourse.perks
                      : [
                          'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
                          '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
                          'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
                          'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
                          'Training & Grooming: নিয়মিত ক্যারিয়ার প্রোগ্রেসের সুযোগ',
                        ]
                    ).map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-7 sm:pb-7">
                <AdmitLink
                  track="men"
                  className={`${admission.closed ? '' : 'cta-glow cta-shine'} flex min-h-14 items-center justify-center gap-2 text-center bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-[15px] sm:text-base`}
                >
                  {admission.closed ? 'ভর্তি সাময়িক বন্ধ — বিস্তারিত দেখুন' : `পুরুষ ব্যাচে ভর্তি হোন (${toBengaliNumber(menFee)} ৳)`}
                  <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
                </AdmitLink>
                <p className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" /> নিশ্চিত SSLCommerz ও বিকাশ পেমেন্ট
                </p>
              </div>
            </div>

            {/* Course 2: WOMEN BATCH */}
            <div
              id="course-women"
              className="bg-gradient-to-b from-[#380728]/35 via-slate-900/80 to-[#060D1A] border border-rose-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-rose-400/60 transition-all duration-300 group"
              data-reveal
            >
              <div>
                <div className="relative h-44 sm:h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/women-batch.jpg"
                    alt="Women's Quran Class"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A] via-[#060D1A]/60 to-transparent" />

                  <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {womenCourse.tag || 'WOMEN BATCH 014'}
                  </div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                    {toBengaliNumber(womenCourse.fee || coursePrice)} ৳
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {womenCourse.name}
                    </h3>
                    <p className="text-rose-300 text-[13px] sm:text-sm mt-1 font-medium">
                      {womenCourse.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 mb-5 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-rose-300 font-semibold uppercase tracking-wider">
                        First Orientation Class:
                      </p>
                      <p className="text-sm font-bold text-white">
                        {womenCourse.orientationDate || '২১ সেপ্টেম্বর ২০২৬'} –{' '}
                        {womenCourse.orientationTime || liveSettings.orientationTime}
                      </p>
                      <p className="text-xs text-rose-200/90 mt-1">সেশন: {sessionRange(womenRows)}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6 text-[13px] sm:text-sm text-slate-300">
                    {(womenCourse.perks && womenCourse.perks.length > 0
                      ? womenCourse.perks
                      : [
                          'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
                          '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
                          'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
                          'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
                          'পর্দা ও শৃঙ্খলার সুরক্ষা: ১০০% ঘরে বসেই পাঠদানের সুযোগ',
                        ]
                    ).map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-6 pb-6 sm:px-7 sm:pb-7">
                <AdmitLink
                  track="women"
                  className={`${admission.closed ? '' : 'cta-glow cta-shine'} flex min-h-14 items-center justify-center gap-2 text-center bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-rose-600/25 active:scale-[0.98] transition-all text-[15px] sm:text-base`}
                >
                  {admission.closed ? 'ভর্তি সাময়িক বন্ধ — বিস্তারিত দেখুন' : `নারী ব্যাচে ভর্তি হোন (${toBengaliNumber(womenFee)} ৳)`}
                  <ArrowRight className="w-4 h-4 stroke-[3] shrink-0" />
                </AdmitLink>
                <p className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" /> নিশ্চিত SSLCommerz ও বিকাশ পেমেন্ট
                </p>
              </div>
            </div>
          </div>

          {/* Career Opportunity Banner */}
          <div
            className="mt-10 sm:mt-12 max-w-5xl mx-auto bg-gradient-to-r from-[#0B1A45]/50 via-slate-900/80 to-[#060D1A] border border-amber-400/30 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl"
            data-reveal
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mx-auto sm:mx-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-amber-300">
                  সরাসরি শিক্ষক নিয়োগ অপরচুনিটি
                </h4>
                <p className="text-[13px] sm:text-sm text-slate-300 mt-0.5">
                  প্রশিক্ষণ শেষে উত্তীর্ণ গ্র্যাজুয়েটদের মধ্য থেকে সরাসরি ফজর একাডেমির নিজস্ব গ্লোবাল প্ল্যাটফর্মে শিক্ষক হিসেবে নিয়োগের সুযোগ রয়েছে।
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-2xl sm:text-3xl font-black text-amber-300">১৫,০০০ – ২২,০০০ ৳</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">মাসিক সম্ভাব্য সম্মানী</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CURRICULUM SECTION ==================== */}
      <section
        id="curriculum"
        className="py-12 sm:py-24 bg-[#050C19] relative border-t border-white/5"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-[13px] sm:text-sm font-semibold mb-3">
              <Layers className="w-4 h-4" /> পূর্ণাঙ্গ সিলেবাস ও সাপ্তাহিক সেশন
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              কোর্স কারিকুলাম ও <span className="text-gradient-gold">৪টি প্রফেশনাল প্যাকেজ</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <p className="text-slate-300 max-w-2xl mx-auto text-[13px] sm:text-sm md:text-base leading-relaxed">
              আন্তর্জাতিক মানের ভার্চুয়াল ক্লাসরুম আর্ট, নূরানী তাজবীদ মেথডোলজি ও শিশু-কিশোর সাইকোলজির সমন্বয়ে সাজানো ৪ সপ্তাহের কম্প্রিহেন্সিভ পাঠ্যক্রম।
            </p>
          </div>

          <p className="md:hidden -mt-4 mb-3 text-center text-[11px] font-medium text-slate-400">← সোয়াইপ করে সবগুলো দেখুন →</p>
          <div className="snap-row grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {curriculumModules.map((mod, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between shadow-xl"
                data-reveal
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-amber-400/15 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                      মডিউল {toBengaliNumber(mod.moduleNo || idx + 1)} • {mod.duration || '১ সপ্তাহ'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {mod.liveDate || mod.sessionDate || NO_DATE}
                      {mod.sessionTime ? ` • ${mod.sessionTime}` : ''}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                    {mod.title}
                  </h3>
                  {mod.subtitle && (
                    <p className="text-[13px] sm:text-sm text-amber-200/90 mb-3 font-medium">
                      {mod.subtitle}
                    </p>
                  )}
                  {mod.description && (
                    <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  )}

                  {mod.topics && mod.topics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        প্রধান আলোচ্য বিষয়সমূহ:
                      </p>
                      <ul className="space-y-1.5 text-[13px] sm:text-sm text-slate-300">
                        {mod.topics.map((t, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0 stroke-[3]" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> হ্যান্ডস-অন প্র্যাকটিস
                  </span>
                  <span className="text-amber-300 font-semibold">সম্পূর্ণ লাইভ ও রেকর্ডিং</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== DATE-WISE SCHEDULE ==================== */}
      <section id="schedule" className="py-12 sm:py-24 bg-white text-slate-900 relative border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-8 sm:mb-14" data-reveal>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1 text-blue-800 text-[13px] sm:text-sm font-semibold mb-3">
              <Calendar className="w-4 h-4" /> তারিখ অনুযায়ী ক্লাস সূচি
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
              কোন তারিখে কোন সেশন?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-[13px] sm:text-sm md:text-base leading-relaxed">
              পুরুষ ও নারী উভয় ব্যাচের ওরিয়েন্টেশন ও প্রতিটি লাইভ সেশনের তারিখ এবং সময় এক জায়গায়। তারিখ ঘোষণা না হলে সেখানে তা স্পষ্ট লেখা থাকবে।
            </p>
          </div>

          <div data-reveal>
            <BatchSchedule
              batches={[
                {
                  key: 'men',
                  label: 'পুরুষ ব্যাচ',
                  name: menCourse.name,
                  orientation: `${menOrientation} • ${menCourse.orientationTime || liveSettings.orientationTime}`,
                  range: sessionRange(menRows),
                  rows: menRows,
                },
                {
                  key: 'women',
                  label: 'নারী ব্যাচ (০১৪)',
                  name: womenCourse.name,
                  orientation: `${womenOrientation} • ${womenCourse.orientationTime || liveSettings.orientationTime}`,
                  range: sessionRange(womenRows),
                  rows: womenRows,
                },
              ]}
            />
          </div>

          {!admission.closed && (
            <div className="mt-8 flex justify-center">
              <AdmitLink className="cta-shine inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-8 text-[15px] font-black text-amber-300 shadow-lg shadow-slate-900/20 transition-transform active:scale-[0.98] sm:w-auto">
                এই সূচিতে ভর্তি হোন
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </AdmitLink>
            </div>
          )}
        </div>
      </section>

      {/* ==================== 4-STEP PROCESS ==================== */}
      <section id="process" className="py-12 sm:py-24 bg-[#FBF9F4] text-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-6xl">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 text-amber-800 text-[13px] sm:text-sm font-bold tracking-wider mb-2">
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
              নিবন্ধন থেকে নিয়োগের ধাপসমূহ
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 leading-tight">
              মাত্র ৪টি সহজ ধাপে হয়ে উঠুন <br /> একজন প্রফেশনাল শিক্ষক
            </h2>
            <p className="text-slate-600 text-[13px] sm:text-sm md:text-base max-w-xl mx-auto">
              স্বচ্ছ ও শৃঙ্খলিত প্রক্রিয়ার মাধ্যমে নিশ্চিত করুন আপনার শিক্ষা ও কর্মসংস্থানের পরবর্তী পদক্ষেপ।
            </p>
          </div>

          <p className="md:hidden -mt-4 mb-3 text-center text-[11px] font-medium text-slate-400">← সোয়াইপ করে সবগুলো দেখুন →</p>
          <div className="snap-row grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300" data-reveal>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#060D1A] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md">
                  ০১
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  রেজিস্ট্রেশন ও কোর্স ফি
                </h3>
                <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
                  পছন্দের ট্র্যাক (পুরুষ বা নারী) নির্বাচন করে {toBengaliNumber(coursePrice)} টাকা এককালীন ফি পরিশোধ করে নিবন্ধন সম্পন্ন করুন।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> অনলাইন পেমেন্ট সুবিধা
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300" data-reveal>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#060D1A] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md">
                  ০২
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  লাইভ ওরিয়েন্টেশন ক্লাস
                </h3>
                <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
                  পুরুষদের {menCourse.orientationDate} এবং নারীদের {womenCourse.orientationDate} {menCourse.orientationTime}-এ লাইভ ওরিয়েন্টেশনে যুক্ত হোন।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> সরাসরি জুম সেশন
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300" data-reveal>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#060D1A] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md">
                  ০৩
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  ৪টি প্রফেশনাল TOT প্যাকেজ
                </h3>
                <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
                  ১ মাসে ৪টি হ্যান্ডস-অন সেশনে আধুনিক পেডাগোজি, নূরানী মেথডোলজি ও আন্তর্জাতিক শিক্ষক প্রশিক্ষণ আয়ত্ত করুন।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> আজীবন রেকর্ডিং অ্যাক্সেস
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300" data-reveal>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#060D1A] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md">
                  ০৪
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  সার্টিফিকেট ও জব অফার
                </h3>
                <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
                  চূড়ান্ত মূল্যায়নে অফিসিয়াল সনদ অর্জন এবং ফজর একাডেমির নিজস্ব প্ল্যাটফর্মে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> সরাসরি কর্মসংস্থান সুযোগ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHY FAJR ACADEMY ==================== */}
      <section id="why" className="py-12 sm:py-24 bg-gradient-to-b from-[#060D1A] via-[#09152B] to-[#060D1A] relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-[13px] sm:text-sm font-semibold mb-3">
              <ShieldCheck className="w-4 h-4" /> কেন ফজর একাডেমি
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-3 text-white leading-tight">
              প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার — <br />
              <span className="text-gradient-gold">একটি স্বচ্ছ ও বরকতময় পথ</span>
            </h2>
            <p className="text-slate-300 text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি শিক্ষকতার সুযোগ প্রদান করে।
            </p>
          </div>

          <p className="md:hidden -mt-4 mb-3 text-center text-[11px] font-medium text-slate-400">← সোয়াইপ করে সবগুলো দেখুন →</p>
          <div className="snap-row grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white/[0.03] border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 sm:p-8 transition-all shadow-xl" data-reveal>
              <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg mb-4">
                ০১
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">ঘরে বসেই সম্পূর্ণ কাজ</h3>
              <p className="text-slate-300 text-[13px] sm:text-sm leading-relaxed">
                কোনো ট্রাফিক জ্যাম নেই, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার ক্লাস ঘরে বসেই ল্যাপটপে সম্পন্ন করতে পারবেন।
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 sm:p-8 transition-all shadow-xl" data-reveal>
              <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg mb-4">
                ০২
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">মাসিক সম্মানী ১৫,০০০ – ২২,০০০৳</h3>
              <p className="text-slate-300 text-[13px] sm:text-sm leading-relaxed">
                কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী হালাল ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 sm:p-8 transition-all shadow-xl" data-reveal>
              <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg mb-4">
                ০৩
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">বিনামূল্যে ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
              <p className="text-slate-300 text-[13px] sm:text-sm leading-relaxed">
                আপনার যদি কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সহায়তা প্রদান করবে।
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 sm:p-8 transition-all shadow-xl" data-reveal>
              <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300 text-lg mb-4">
                ০৪
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট</h3>
              <p className="text-slate-300 text-[13px] sm:text-sm leading-relaxed">
                ৪টি প্রফেশনাল সেশন শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট প্রদান এবং নিয়মিত গ্রুমিং ও স্কিল ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ার বৃদ্ধি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SENIOR INSTRUCTORS & FACULTY ==================== */}
      <section
        id="instructors"
        className="py-12 sm:py-24 bg-[#050B17] relative border-t border-white/5"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-[13px] sm:text-sm font-semibold mb-3">
              <GraduationCap className="w-4 h-4" /> বিশিষ্ট ট্রেইনার ও শিক্ষক পরিষদ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              আমাদের প্রখ্যাত ইনস্ট্রাক্টর ও <span className="text-gradient-gold">মাস্টার ট্রেইনার প্যানেল</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
            <p className="text-slate-300 max-w-2xl mx-auto text-[13px] sm:text-sm md:text-base leading-relaxed">
              আন্তর্জাতিক বিশ্ববিদ্যালয় ও সুপরিচিত শিক্ষক প্রশিক্ষণ কেন্দ্র থেকে অভিজ্ঞ উস্তাদ ও উস্তাজাগণ সরাসরি আপনার ক্যারিয়ার মেন্টরিং করবেন।
            </p>
          </div>

          <p className="md:hidden -mt-4 mb-3 text-center text-[11px] font-medium text-slate-400">← সোয়াইপ করে সবগুলো দেখুন →</p>
          <div className="snap-row grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {activeInstructors.map((inst, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row gap-5 items-start shadow-xl"
                data-reveal
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-[#0B1A45] border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-2xl shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
                  {inst.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={inst.avatar} alt={inst.fullName} className="w-full h-full object-cover" />
                  ) : (
                    inst.fullName.charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                      {inst.fullName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{inst.rating || 4.9}</span>
                    </div>
                  </div>

                  <p className="text-[13px] sm:text-sm text-amber-300 font-semibold mb-2">
                    {inst.designation || 'Master Trainer'}
                  </p>

                  {inst.specialization && (
                    <div className="inline-block bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-blue-200 mb-3">
                      {inst.specialization}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {inst.bio || 'আন্তর্জাতিক কুরআন শিক্ষাদান মেথডোলজি ও পেডাগোজি বিশেষজ্ঞ।'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> {inst.experienceYears || 5}+ বছরের অভিজ্ঞতা
                    </span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ভেরিফাইড ফ্যাকাল্টি
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ELIGIBILITY & PAYMENT ==================== */}
      <section
        id="payment-info"
        className="py-12 sm:py-24 bg-white text-slate-900 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl">
          <div className="text-center mb-12 sm:mb-14" data-reveal>
            <div className="inline-flex items-center gap-2 text-amber-800 text-[13px] sm:text-sm font-bold tracking-wider mb-2">
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
              প্রয়োজনীয় যোগ্যতা ও ফি
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              আবেদনের সাধারণ যোগ্যতা ও পেমেন্ট তথ্য
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Criteria Card */}
            <div className="bg-[#FBF9F4] rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm relative overflow-hidden" data-reveal>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-blue-500" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                আবেদনের সাধারণ যোগ্যতা
              </h3>

              <ul className="space-y-4 text-[13px] sm:text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#060D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#060D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    প্রাথমিক ইংরেজি জ্ঞান এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#060D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তা সুবিধা)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#060D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল Facebook অ্যাকাউন্ট
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#060D1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    হাফেজ না হয়েও আবেদন করার সুযোগ — শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন
                  </span>
                </li>
              </ul>
            </div>

            {/* Fee Card */}
            <div className="bg-[#FBF9F4] rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between" data-reveal>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-[#D4AF37]" />

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 border-b border-slate-200 pb-3">
                  কোর্স ফি ও পেমেন্ট তথ্য
                </h3>

                <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
                  <span className="text-2xl font-bold text-amber-600">৳</span>
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {toBengaliNumber(coursePrice)}
                  </span>
                  <span className="text-[13px] sm:text-sm font-medium text-slate-500 ml-2">
                    (এককালীন রেজিস্ট্রেশন ফি)
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-[13px] sm:text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-medium">পেমেন্ট গেটওয়ে</span>
                  <span className="text-slate-900 font-bold">SSLCommerz (অনলাইন পেমেন্ট)</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-medium">বিকাশ / নগদ / রকেট</span>
                  <span className="text-slate-900 font-bold">{liveSettings.bkashMerchantNumber || '01410764581'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-600 font-medium">কোর্স ট্র্যাক</span>
                  <span className="text-slate-900 font-bold">TOT-MEN / TOT-WOMEN</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-slate-600 font-medium">যোগাযোগ</span>
                  <span className="text-slate-900 font-bold">Facebook Messenger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== REGISTRATION FORM SECTION ==================== */}
      <section
        id="register"
        className="py-12 sm:py-24 bg-[#060D1A] relative overflow-x-clip border-t border-white/5"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-10 sm:mb-12" data-reveal>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-[13px] sm:text-sm font-semibold mb-3">
              ❖ আপনার দক্ষতা, আমাদের সহায়তা ❖
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
              কোর্স নির্বাচন ও শিক্ষক নিবন্ধন ফর্ম
            </h2>
            <p className="text-slate-300 text-[13px] sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              পছন্দের ট্র্যাক নির্বাচন করে {toBengaliNumber(coursePrice)}৳ কোর্স ফি পরিশোধের মাধ্যমে আপনার নিবন্ধন সম্পন্ন করুন।
            </p>
          </div>

          <RegistrationForm courses={sanitizedCourses} settings={liveSettings} />
        </div>
      </section>

      {/* ==================== VIDEO SECTION ==================== */}
      <section
        id="videos"
        className="py-12 sm:py-24 bg-[#FBF9F4] text-slate-900 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 text-amber-800 text-[13px] sm:text-sm font-bold tracking-wider mb-2">
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
              অফিসিয়াল ভিডিও ও নির্দেশিকা
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3 leading-tight">
              কুরআন টিচার ট্রেনিং ও ওরিয়েন্টেশন ভিডিও
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-[13px] sm:text-sm md:text-base">
              পুরুষ ও নারী উভয় কোর্সের ট্রেনিং পদ্ধতি, ক্লাসরুম পেডাগোজি ও ক্যারিয়ার সম্ভাবনার ভিডিওগুলো সরাসরি দেখে নিন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <VideoShortsCard
              videoId="UxzqLHfjrGc"
              title="আমাদের টিচার ট্রেনিং প্রোগ্রাম ও ফি"
              subtitle="শিক্ষকদের ওরিয়েন্টেশন ও জব গাইডলাইন"
              badgeText="TOT - MEN শিক্ষক প্রশিক্ষণ"
              badgeBg="bg-[#0B1A45]"
              thumbnailUrl="/men-batch.jpg"
            />
            <VideoShortsCard
              videoId="zPXTzup-2ok"
              title="মহিলাদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড"
              subtitle="মহিলাদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড"
              badgeText="TOT - WOMEN Batch 014"
              badgeBg="bg-[#380728]"
              thumbnailUrl="/women-batch.jpg"
            />
          </div>

          {/* Founder Quote Card */}
          <div
            className="mt-12 sm:mt-16 max-w-4xl mx-auto bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm"
            data-reveal
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-900 to-amber-500" />
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="text-amber-500 text-4xl sm:text-5xl leading-none font-serif shrink-0">&ldquo;</div>
              <div>
                <p className="text-slate-700 text-sm sm:text-base md:text-lg leading-relaxed mb-5 italic">
                  &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — &lsquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।&rsquo; — সহীহ বুখারী। আপনি যদি শুদ্ধভাবে কুরআন তিলাওয়াত ও বেসিক ইংরেজি জানেন, ফজর একাডেমির এই প্রশিক্ষণ আপনাকে একটি সম্মানজনক হালাল শিক্ষকতা পেশায় যুক্ত করবে ইনশাআল্লাহ।&rdquo;
                </p>
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/founder.jpg"
                    alt="Hafiz Maulana Muhammad Farabi Chowdhury"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-400 object-cover shadow-sm"
                  />
                  <div>
                    <h4 className="text-slate-900 font-bold text-sm sm:text-base">
                      Hafiz Maulana Muhammad Farabi Chowdhury
                    </h4>
                    <p className="text-slate-500 text-[13px] sm:text-sm">Founder &amp; CEO, Fajr Academy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section
        id="faq"
        className="py-12 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-100"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
          <div className="text-center mb-8 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 text-amber-800 text-[13px] sm:text-sm font-bold tracking-wider mb-2">
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
              সাধারণ প্রশ্ন ও উত্তর
              <span className="w-6 sm:w-8 h-[1px] bg-amber-700" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              আপনার মনে থাকা প্রশ্নগুলোর উত্তর
            </h2>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে হবে?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  পুরুষদের ({menCourse.name}) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে{' '}
                  <strong>
                    {menCourse.orientationDate} ({menCourse.orientationTime})
                  </strong>
                  । নারীদের ({womenCourse.name}) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে{' '}
                  <strong>
                    {womenCourse.orientationDate} ({womenCourse.orientationTime})
                  </strong>
                  ।
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  উভয় কোর্সের এককালীন রেজিস্ট্রেশন ফি {toBengaliNumber(coursePrice)} টাকা। SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, কার্ড অথবা সরাসরি বিকাশ মার্চেন্ট নম্বরে (<strong>{liveSettings.bkashMerchantNumber || '01410764581'}</strong>) পেমেন্ট করতে পারবেন।
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  ল্যাপটপ বা কম্পিউটার না থাকলে কি আবেদন করা যাবে?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  হ্যাঁ, আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভাষা ভালো করে জানা থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব ব্যবস্থাপনায় ডিভাইস সহায়তা প্রদান করবে।
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  আমাকে কি হাফিজ বা আলেম হতে হবে?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট।
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  একদমই না। যারা প্রথম ধাপে সরাসরি শিক্ষক হিসেবে নির্বাচিত হবেন না, তাদেরকে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট কোর্সে সুযোগ দেওয়া হবে।
                </p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="faq-item bg-[#FBF9F4] border border-amber-200/80 rounded-2xl overflow-hidden group transition-all" data-reveal>
              <summary className="flex justify-between items-center p-5 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-slate-900">
                  শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
              </summary>
              <div className="faq-answer px-5 sm:px-6 pb-5 sm:pb-6 text-[13px] sm:text-sm md:text-base text-slate-600 border-t border-amber-100 pt-4 hidden leading-relaxed">
                <p>
                  ট্রেনিং সম্পন্ন করে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA BANNER ==================== */}
      <section className="py-12 sm:py-24 bg-gradient-to-b from-[#060D1A] via-[#09152B] to-[#040814] relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 max-w-4xl" data-reveal>
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-[13px] sm:text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{liveSettings.currentBatch || 'Batch 2026'} • সীমিত আসন সংখ্যা</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-5 text-white leading-tight">
            আজই আপনার আসন নিশ্চিত করুন, <br />
            <span className="text-gradient-gold">কুরআনের খেদমতে যুক্ত হোন</span>
          </h2>

          <p className="text-slate-300 max-w-2xl mx-auto mb-9 text-sm sm:text-base md:text-lg leading-relaxed">
            ফর্ম পূরণ করে {toBengaliNumber(coursePrice)} টাকা রেজিস্ট্রেশন ফি প্রদান করুন। প্রয়োজনীয় তথ্য জানতে আমাদের সরাসরি Facebook Messenger-এ যোগাযোগ করুন।
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 max-w-md sm:max-w-none mx-auto">
            <a
              href="#register"
              className={`${admission.closed ? '' : 'cta-glow cta-shine'} min-h-14 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-black py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center`}
            >
              <CreditCard className="w-5 h-5 text-slate-900 shrink-0" />
              <span>{admission.closed ? 'ভর্তির তথ্য দেখুন' : `ভর্তি হোন — মাত্র ${toBengaliNumber(coursePrice)} ৳`}</span>
            </a>
            <a
              href={FACEBOOK_MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/20 text-white font-bold py-4 px-8 rounded-full text-base sm:text-lg transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessengerIcon className="w-5 h-5 text-sky-400 shrink-0" boltColor="#0A1424" />
              <span>Facebook Messenger</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER & PAYMENT PARTNER ==================== */}
      <footer className="bg-[#040814] border-t border-white/5 pt-14 sm:pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Logo & Info */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-amber-400/40 shadow-md shrink-0 bg-[#0B1A45] p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/fajr-logo.png"
                  alt="FAJR Academy Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-wider font-serif">
                  {liveSettings.instituteName || 'FAJR ACADEMY'}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-amber-300 tracking-widest uppercase font-medium">
                  Balanced Education for Dunya and Akhirah
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-[13px] sm:text-sm">
              Training of Trainers (TOT) Program - {liveSettings.currentBatch || 'Batch 2026'}
            </p>
          </div>

          {/* Payment Gateway Partner Box */}
          <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl p-5 sm:p-7 md:p-8 mb-10 sm:mb-12 shadow-2xl relative overflow-hidden" data-reveal>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4 text-center sm:text-left">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[13px] sm:text-sm tracking-wide">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" /> OFFICIAL PAYMENT GATEWAY PARTNER
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 shrink-0" /> 256-BIT SSL ENCRYPTED &amp; VERIFIED
              </div>
            </div>

            {/* SSLCommerz Official Banner */}
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 flex justify-center items-center mb-5 border border-slate-200 shadow-inner">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.sslcommerz.com/"
                title="SSLCommerz"
                className="inline-block transition-transform hover:scale-[1.01] max-w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
                  alt="SSLCommerz Pay With Logo"
                  className="w-full max-w-2xl h-auto object-contain mx-auto"
                />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> বিকাশ, নগদ, রকেট ও অন্যান্য
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> ভিসা, মাস্টারকার্ড ও ব্যাংক ট্রান্সফার
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> ইন্টারনেট ব্যাংকিং ও মোবাইল ব্যাংকিং
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-[13px] sm:text-sm text-slate-300 mb-6 text-center">
            <a
              href={FACEBOOK_MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2.5 hover:text-white transition-colors"
            >
              <MessengerIcon className="w-4 h-4 text-sky-400 shrink-0" boltColor="#040814" /> Facebook Messenger
            </a>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" /> ইমেইল: {liveSettings.supportEmail || 'support@fajracademy.io'}
            </span>
            <Link
              href={account?.href || '/login'}
              className="flex items-center gap-2 py-2.5 font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              {account ? (
                <>
                  <LayoutDashboard className="w-4 h-4 shrink-0" /> আমার ড্যাশবোর্ড
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 shrink-0" /> ইতোমধ্যে ভর্তি হয়েছেন? লগইন করুন
                </>
              )}
            </Link>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-5 text-center text-[11px] sm:text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} {liveSettings.instituteName || 'Fajr Academy'}. All Rights Reserved. Registered Islamic Education Institute.
            </p>
          </div>
        </div>
      </footer>

      {/* Phones: app-style bottom bar with price + "ভর্তি হোন" */}
      <MobileActionBar price={coursePrice} regularPrice={regularPrice} closed={admission.closed} />

      {/* Floating Facebook Messenger Widget (desktop; phones use the bar above) */}
      <FloatingWhatsApp />
    </div>
  )
}
