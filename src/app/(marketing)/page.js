import styles from './page.module.css'
import RevealObserver from './RevealObserver'
import MarketingNavbar from './MarketingNavbar'
import RegistrationForm from './RegistrationForm'
import FloatingWhatsApp from './FloatingWhatsApp'
import VideoShortsCard from './VideoShortsCard'
import { BASE_URL } from '@/constant'
import { dbConnect } from '@/service/mongo'
import { CourseModel, DEFAULT_TOT_CURRICULUM } from '@/model/course-model'
import { SettingModel } from '@/model/setting-model'
import { UserModel } from '@/model/user-model'
import { DEFAULT_INSTRUCTORS } from '@/constant/instructor-defaults'
import { toBengaliNumber } from '@/lib/utils'
import {
  BookOpen,
  UserCheck,
  Award,
  Calendar,
  Check,
  ArrowRight,
  MessageCircle,
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
  let courses = []
  let settingsDoc = null
  let instructorsData = []

  try {
    await dbConnect()
    const [coursesResult, settingsResult, instructorsResult] = await Promise.all([
      CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean(),
      SettingModel.findOne({ key: 'system_settings' }).lean(),
      UserModel.find({ role: { $in: ['instructor', 'admin'] }, isActive: { $ne: false } })
        .sort({ rating: -1, experienceYears: -1 })
        .select('fullName designation specialization bio experienceYears rating gender avatar track')
        .limit(6)
        .lean(),
    ])

    courses = coursesResult || []
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
    helplinePhone: '01410764581',
    supportEmail: 'support@fajracademy.io',
    whatsappSupport: 'https://wa.me/8801410764581',
    registrationOpen: true,
  }

  const liveSettings = { ...defaultSettings, ...(settingsDoc || {}) }
  const coursePrice = liveSettings.coursePrice || 1000
  const regularPrice = liveSettings.regularCoursePrice || 2500
  const helplinePhone = liveSettings.helplinePhone || '01410764581'
  const cleanPhone = helplinePhone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`
  const whatsappUrl =
    liveSettings.whatsappSupport ||
    `https://wa.me/${intlPhone}?text=${encodeURIComponent(
      'আসসালামু আলাইকুম, কুরআন টিচার ট্রেনিং কোর্স সম্পর্কে জানতে চাই।'
    )}`

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

  // Active Instructors Roster (Live from UserModel or Fallback)
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

  // Dynamic Curriculum from Course Model
  const curriculumModules =
    (menCourse?.curriculum && menCourse.curriculum.length > 0)
      ? menCourse.curriculum
      : DEFAULT_TOT_CURRICULUM

  const sanitizedCourses = JSON.parse(JSON.stringify(courses || []))

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
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: `+88${cleanPhone.replace(/^88/, '')}`,
          availableLanguage: ['Bengali', 'English'],
          contactOption: 'TollFree',
        },
        sameAs: [whatsappUrl, 'https://youtube.com/shorts/zPXTzup-2ok'],
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
    <div className="bg-fajr-dark text-white font-bengali antialiased selection:bg-fajr-gold selection:text-fajr-dark min-h-screen">
      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Scroll Reveal Observer ── */}
      <RevealObserver />

      {/* ==================== TOP BAR ==================== */}
      <div className="bg-fajr-gold/10 border-b border-white/5 py-2 px-3 sm:px-6 md:px-12 flex justify-between items-center text-xs md:text-sm text-fajr-gold">
        <div className="flex items-center gap-1.5 sm:gap-2 font-medium">
          <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${liveSettings.admissionStatus === 'closed' ? 'bg-red-500' : liveSettings.admissionStatus === 'waitlist' ? 'bg-amber-400' : 'bg-green-500'}`}></span>
          <span className="text-[11px] sm:text-xs md:text-sm">
            {liveSettings.admissionStatus === 'closed'
              ? 'ভর্তি সাময়িক সমাপ্ত — পরবর্তী ব্যাচ শীঘ্রই'
              : liveSettings.admissionStatus === 'waitlist'
              ? 'অপেক্ষমাণ তালিকা চলছে — আসন সীমিত'
              : 'ভর্তি চলছে — সীমিত আসন'}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden md:inline">
            <Calendar className="w-3.5 h-3.5 inline mr-1" /> ফার্স্ট ওরিয়েন্টেশন: {menCourse.orientationDate || liveSettings.orientationDate} ও {womenCourse.orientationDate || '২১ সেপ্টেম্বর'}
          </span>
          <span className="hidden md:inline text-fajr-gold/40">|</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 text-fajr-gold text-[11px] sm:text-xs md:text-sm shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp: {helplinePhone}
          </a>
        </div>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <MarketingNavbar settings={liveSettings} />

      {/* ==================== HERO SECTION ==================== */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center bg-gradient-hero pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-fajr-gold rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Hero Column */}
          <div data-reveal className="space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-3.5 py-1 text-fajr-gold text-[11px] sm:text-xs font-semibold tracking-wide">
              <Star className="w-3.5 h-3.5 fill-fajr-gold text-fajr-gold" />
              <span>TRAINING OF TRAINERS (TOT) — {liveSettings.currentBatch || '2026'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.25] text-shadow text-white">
              শুদ্ধভাবে কুরআন ও <br />
              <span className="text-gradient-gold">ইংরেজি জানেন?</span><br />
              ঘরে বসেই হয়ে উঠুন <br />
              <span className="relative inline-block mt-1">
                প্রফেশনাল কুরআন টিচার
                <span className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-fajr-gold via-yellow-400 to-transparent rounded-full"></span>
              </span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              ফজর একাডেমির পক্ষ থেকে <strong className="text-white font-bold">১০,০০০+</strong> শিক্ষার্থীর সফলতার ধারাবাহিকতায় এবার <strong className="text-white font-bold">৩,০০০+</strong> শিক্ষক তৈরি করার লক্ষ্যে প্রফেশনাল কুরআন টিচার ট্রেনিং প্রোগ্রাম।
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 pt-1">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 text-xs sm:text-sm font-medium text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" />
                <span>লাইভ ক্লাস</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 text-xs sm:text-sm font-medium text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" />
                <span>ক্লাস রেকর্ডিং</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 text-xs sm:text-sm font-medium text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" />
                <span>অফিসিয়াল সার্টিফিকেট</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 text-xs sm:text-sm font-medium text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" />
                <span>ডিভাইস সহায়তা</span>
              </div>
            </div>

            {/* Hadith Callout */}
            <div className="bg-fajr-blue/40 border border-fajr-gold/25 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex items-start gap-3 text-left max-w-xl mx-auto lg:mx-0">
              <span className="text-fajr-gold text-2xl font-serif leading-none">&ldquo;</span>
              <div>
                <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।&rdquo;
                </p>
                <span className="text-[11px] sm:text-xs text-fajr-gold font-semibold mt-1 inline-block">— সহীহ বুখারী</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <a
                href="#register"
                className="w-full sm:w-auto btn-glow bg-gradient-to-r from-fajr-gold via-yellow-500 to-yellow-600 text-fajr-dark font-bold py-3.5 px-6 sm:py-4 sm:px-8 rounded-full text-center text-sm sm:text-base md:text-lg shadow-lg shadow-fajr-gold/25 flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>রেজিস্ট্রেশন করুন ({toBengaliNumber(coursePrice)} ৳)</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto btn-glow border border-fajr-gold/50 text-fajr-gold font-bold py-3.5 px-6 sm:py-4 sm:px-8 rounded-full text-center text-sm sm:text-base md:text-lg hover:bg-fajr-gold/10 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 fill-green-400" />
                <span>WhatsApp-এ কথা বলুন</span>
              </a>
            </div>
          </div>

          {/* Right Hero Column — 3D Glass Card */}
          <div data-reveal className="relative max-w-lg mx-auto w-full">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-fajr-gold rounded-full filter blur-3xl opacity-20 floating"></div>
            
            <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 shadow-2xl relative z-10 card-3d border-gradient">
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-fajr-gold/50 shadow-lg shadow-fajr-gold/20 bg-[#0B1A45]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/fajr-logo.png"
                    alt="FAJR Academy Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-wide">কুরআন টিচার ট্রেনিং (TOT)</h2>
                <span className="inline-block bg-fajr-gold/20 text-fajr-gold text-[11px] sm:text-xs px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-fajr-gold/40 font-semibold tracking-wider">
                  {liveSettings.currentBatch || 'BATCH 2026'}
                </span>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-5 h-5 rounded-full bg-fajr-gold/20 flex items-center justify-center text-fajr-gold mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">আন্তর্জাতিক কুরআন শিক্ষণ পদ্ধতি ও আধুনিক পেডাগোজি</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-5 h-5 rounded-full bg-fajr-gold/20 flex items-center justify-center text-fajr-gold mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">বাচ্চাদের হ্যান্ডলিং ও সাইকোলজি কৌশল</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-5 h-5 rounded-full bg-fajr-gold/20 flex items-center justify-center text-fajr-gold mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">মাসিক ১৫,০০০ - ২২,০০০ টাকা পর্যন্ত আয়ের সরাসরি সুযোগ</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-5 h-5 rounded-full bg-fajr-gold/20 flex items-center justify-center text-fajr-gold mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="font-medium">অফিসিয়াল মূল্যায়ন সার্টিফিকেট ও আজীবন মেন্টরশিপ</span>
                </li>
              </ul>

              <div className="space-y-2.5 sm:space-y-3">
                <a
                  href="#register"
                  className="block w-full text-center btn-glow bg-gradient-to-r from-fajr-gold to-yellow-600 text-fajr-dark font-bold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base md:text-lg shadow-md"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                  রেজিস্ট্রেশন করুন ({toBengaliNumber(coursePrice)} ৳)
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-fajr-gold/50 text-fajr-gold font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-base hover:bg-fajr-gold/10 transition-all"
                >
                  <MessageCircle className="w-4 h-4 inline mr-2 text-green-400 fill-green-400" />
                  WhatsApp-এ সরাসরি কথা বলুন
                </a>
              </div>
              
              <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-3 sm:mt-4 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-fajr-gold shrink-0" />
                <span>আপনার তথ্য সম্পূর্ণ সুরক্ষিত ও গোপন রাখা হবে</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUST BAR ==================== */}
      <div className="bg-fajr-blue/60 border-y border-white/5 py-3.5 sm:py-4">
        <div className="container mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-12 text-xs sm:text-sm text-gray-300 font-medium">
          <span className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" /> ১০,০০০+ শিক্ষার্থী
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" /> ৫০+ দেশে শিক্ষার্থী
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" /> ১০০% হালাল উপার্জন
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fajr-gold" /> লাইফটাইম সাপোর্ট
          </span>
        </div>
      </div>

      {/* ==================== COURSES SECTION ==================== */}
      <section id="courses" className="py-14 sm:py-20 md:py-24 relative bg-gradient-to-b from-fajr-dark via-fajr-blue/15 to-fajr-dark">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-3.5 py-1 text-fajr-gold text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Sparkles className="w-4 h-4" /> প্রফেশনাল ট্রেনিং প্রোগ্রাম
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              কুরআনের আলো ছড়াতে <br /> <span className="text-gradient-gold">প্রফেশনাল শিক্ষক হন</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-fajr-gold to-transparent mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
              অভিজ্ঞ ট্রেনার ও আন্তর্জাতিক শিক্ষক পেডাগগির মাধ্যমে ঘরে বসেই গড়ে তুলুন দক্ষ, দায়িত্বশীল ও আধুনিক কুরআন শিক্ষক হিসেবে নিজেকে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            
            {/* Course 1: MEN BATCH */}
            <div id="course-men" className="card-3d glass-dark rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 group relative flex flex-col justify-between" data-reveal>
              <div>
                <div className="relative h-52 sm:h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/men-batch.jpg"
                    alt="Men's Quran Class"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-fajr-dark via-fajr-dark/60 to-transparent"></div>
                  
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-blue-600 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    {menCourse.tag || 'MEN BATCH'}
                  </div>
                  <div className="absolute top-3 sm:top-4 right-3 sm:top-4 bg-fajr-gold text-fajr-dark text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    {toBengaliNumber(menCourse.fee || coursePrice)} ৳
                  </div>
                  
                  <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                    <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">{menCourse.name}</h3>
                    <p className="text-blue-300 text-xs sm:text-sm mt-1 font-medium">{menCourse.summary}</p>
                  </div>
                </div>
                
                <div className="p-5 sm:p-8">
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-3.5 sm:p-4 mb-5 sm:mb-6 flex items-start gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] sm:text-xs text-blue-300 font-semibold uppercase tracking-wider">First Orientation Class:</p>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {menCourse.orientationDate || liveSettings.orientationDate} – {menCourse.orientationTime || liveSettings.orientationTime}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 sm:space-y-3.5 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-300">
                    {(menCourse.perks && menCourse.perks.length > 0 ? menCourse.perks : [
                      'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
                      '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
                      'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
                      'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
                      'Training & Grooming: নিয়মিত ক্যারিয়ার প্রোগ্রেসের সুযোগ',
                    ]).map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 text-fajr-gold mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                <a
                  href="#register"
                  className="block text-center btn-glow bg-gradient-to-r from-fajr-gold to-yellow-600 text-fajr-dark font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-fajr-gold/30 transition-all text-sm sm:text-base md:text-lg"
                >
                  রেজিস্ট্রেশন করুন এখনই ({toBengaliNumber(menCourse.fee || coursePrice)} ৳)
                </a>
                <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-2.5 sm:mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-fajr-gold shrink-0" /> নিশ্চিত SSLCommerz ও বিকাশ পেমেন্ট
                </p>
              </div>
            </div>

            {/* Course 2: WOMEN BATCH */}
            <div id="course-women" className="card-3d glass-dark rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 group relative flex flex-col justify-between" data-reveal>
              <div>
                <div className="relative h-52 sm:h-64 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/women-batch.jpg"
                    alt="Women's Quran Class"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-fajr-dark via-fajr-dark/60 to-transparent"></div>
                  
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-purple-600 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    {womenCourse.tag || 'WOMEN BATCH 014'}
                  </div>
                  <div className="absolute top-3 sm:top-4 right-3 sm:top-4 bg-fajr-gold text-fajr-dark text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    {toBengaliNumber(womenCourse.fee || coursePrice)} ৳
                  </div>
                  
                  <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                    <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight">{womenCourse.name}</h3>
                    <p className="text-purple-300 text-xs sm:text-sm mt-1 font-medium">{womenCourse.summary}</p>
                  </div>
                </div>
                
                <div className="p-5 sm:p-8">
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-3.5 sm:p-4 mb-5 sm:mb-6 flex items-start gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] sm:text-xs text-purple-300 font-semibold uppercase tracking-wider">First Orientation Class:</p>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {womenCourse.orientationDate || '২১ সেপ্টেম্বর ২০২৬'} – {womenCourse.orientationTime || liveSettings.orientationTime}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 sm:space-y-3.5 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-300">
                    {(womenCourse.perks && womenCourse.perks.length > 0 ? womenCourse.perks : [
                      'মাসিক সম্মানী: ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত',
                      '৪টি প্রফেশনাল প্যাকেজ: ইসলামিক পেডাগগি ও শিক্ষাদানের কৌশল',
                      'অভিজ্ঞ ট্রেনার: বিশেষ আলোচনা ও আন্তর্জাতিক শিক্ষাবিদ',
                      'সার্টিফিকেট প্রদান: কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট',
                      'পর্দা ও শৃঙ্খলার সুরক্ষা: ১০০% ঘরে বসেই পাঠদানের সুযোগ',
                    ]).map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-8 sm:pb-8">
                <a
                  href="#register"
                  className="block text-center btn-glow bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3.5 sm:py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm sm:text-base md:text-lg"
                >
                  রেজিস্ট্রেশন করুন এখনই ({toBengaliNumber(womenCourse.fee || coursePrice)} ৳)
                </a>
                <p className="text-center text-[11px] sm:text-xs text-gray-400 mt-2.5 sm:mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-fajr-gold shrink-0" /> নিশ্চিত SSLCommerz ও বিকাশ পেমেন্ট
                </p>
              </div>
            </div>
          </div>
          
          {/* Career Highlight Box */}
          <div className="mt-8 sm:mt-12 max-w-4xl mx-auto glass-dark border border-fajr-gold/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xl" data-reveal>
            <div className="flex items-center gap-3.5 sm:gap-4 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-fajr-gold/20 flex items-center justify-center text-fajr-gold shrink-0 mx-auto sm:mx-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-fajr-gold">ক্যারিয়ার অপরচুনিটি</h4>
                <p className="text-xs sm:text-sm text-gray-300">প্রশিক্ষণ শেষে উত্তীর্ণ গ্র্যাজুয়েটরা ফজর একাডেমির ব্র্যান্ড শিক্ষক হিসেবে যুক্ত হবেন।</p>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-2xl sm:text-3xl font-bold text-fajr-gold">১৫,০০০ - ২২,০০০ ৳</p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">মাসিক সম্ভাব্য সম্মানী</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CURRICULUM SECTION (LIVE FROM ADMIN) ==================== */}
      <section id="curriculum" className="py-14 sm:py-20 md:py-24 bg-[#0A1128] relative border-t border-white/5 font-bengali">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-10 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-3.5 py-1 text-fajr-gold text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Layers className="w-4 h-4" /> পূর্ণাঙ্গ সিলেবাস ও সাপ্তাহিক সেশন
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              কোর্স কারিকুলাম ও <span className="text-gradient-gold">৪টি প্রফেশনাল প্যাকেজ</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-fajr-gold to-transparent mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
              আন্তর্জাতিক মানের ভার্চুয়াল ক্লাসরুম আর্ট, নূরানী তাজবীদ মেথডোলজি ও শিশু-কিশোর সাইকোলজির সমন্বয়ে সাজানো ৪ সপ্তাহের কম্প্রিহেন্সিভ পাঠ্যক্রম।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {curriculumModules.map((mod, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d flex flex-col justify-between"
                data-reveal
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-fajr-gold/20 text-fajr-gold text-xs font-bold px-3 py-1 rounded-full border border-fajr-gold/30">
                      মডিউল {toBengaliNumber(mod.moduleNo || idx + 1)} • {mod.duration || '১ সপ্তাহ'}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-fajr-gold" /> {mod.liveDate || 'লাইভ সেশন'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                    {mod.title}
                  </h3>
                  {mod.subtitle && (
                    <p className="text-xs sm:text-sm text-yellow-400/90 mb-3 font-medium">
                      {mod.subtitle}
                    </p>
                  )}
                  {mod.description && (
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">
                      {mod.description}
                    </p>
                  )}

                  {mod.topics && mod.topics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <p className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        প্রধান আলোচ্য বিষয়সমূহ:
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-gray-300">
                        {mod.topics.map((t, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-fajr-gold mt-0.5 shrink-0 stroke-[3]" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-fajr-gold" /> হ্যান্ডস-অন প্র্যাকটিস
                  </span>
                  <span className="text-fajr-gold font-semibold">সম্পূর্ণ লাইভ ও রেকর্ডিং</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4-STEP PROCESS ==================== */}
      <section id="process" className="py-14 sm:py-20 md:py-24 bg-[#F8F5EE] text-gray-800 font-bengali relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16 md:mb-20" data-reveal>
            <div className="inline-flex items-center gap-2 text-yellow-700 text-xs sm:text-sm font-bold tracking-wider mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
              নিবন্ধন থেকে নিয়োগের ধাপসমূহ
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              মাত্র ৪টি ধাপে হয়ে উঠুন <br /> একজন প্রফেশনাল শিক্ষক
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-[2px] bg-yellow-300/70 z-0"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group" data-reveal>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1120] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg mb-4 sm:mb-6 border-4 border-[#F8F5EE] group-hover:scale-110 transition-transform duration-300">
                  ০১
                </div>
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 w-full hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">রেজিস্ট্রেশন ও {toBengaliNumber(coursePrice)} টাকা ফি</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">পছন্দের ট্র্যাক নির্বাচন করে {toBengaliNumber(coursePrice)} টাকা ফি পরিশোধ করে নিবন্ধন সম্পন্ন করুন।</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group" data-reveal>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1120] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg mb-4 sm:mb-6 border-4 border-[#F8F5EE] group-hover:scale-110 transition-transform duration-300">
                  ০২
                </div>
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 w-full hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">লাইভ ওরিয়েন্টেশন ক্লাস</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">পুরুষদের {menCourse.orientationDate} এবং নারীদের {womenCourse.orientationDate} {menCourse.orientationTime}-এ লাইভ ওরিয়েন্টেশন ক্লাসে যুক্ত হোন।</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group" data-reveal>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1120] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg mb-4 sm:mb-6 border-4 border-[#F8F5EE] group-hover:scale-110 transition-transform duration-300">
                  ০৩
                </div>
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 w-full hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">৪টি প্রফেশনাল TOT প্যাকেজ</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">১ মাসে ৪টি হ্যান্ডস-অন সেশনে আধুনিক পেডাগোজি ও আন্তর্জাতিক শিক্ষক প্রশিক্ষণ আয়ত্ত করুন।</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group" data-reveal>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1120] text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-lg mb-4 sm:mb-6 border-4 border-[#F8F5EE] group-hover:scale-110 transition-transform duration-300">
                  ০৪
                </div>
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200/80 w-full hover:shadow-md transition-shadow duration-300 h-full flex flex-col justify-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">সার্টিফিকেট ও জব অফার</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">মূল্যায়নে সার্টিফিকেট অর্জন এবং ফজর একাডেমির নিজস্ব প্ল্যাটফর্মে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHY FAJR ACADEMY ==================== */}
      <section id="why" className="py-14 sm:py-20 md:py-24 bg-gradient-to-b from-[#0B1120] via-[#0D1527] to-[#0B1120] relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center mb-10 sm:mb-14 md:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-4 py-1.5 text-fajr-gold text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <ShieldCheck className="w-4 h-4" /> কেন ফজর একাডেমি
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
              প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার — <br />
              <span className="text-gradient-gold">একটি স্বচ্ছ ও বরকতময় পথ</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ নিশ্চিত করে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <div className="glass rounded-2xl p-5 sm:p-7 md:p-8 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d" data-reveal>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-fajr-gold/20 flex items-center justify-center font-bold text-fajr-gold text-lg sm:text-xl mb-4">
                ০১
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">ঘরে বসেই সম্পূর্ণ কাজ</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                কোনো ট্রাফিক জ্যাম নেই, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার ক্লাস ঘরে বসেই ল্যাপটপে সম্পন্ন করতে পারবেন।
              </p>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-7 md:p-8 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d" data-reveal>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-fajr-gold/20 flex items-center justify-center font-bold text-fajr-gold text-lg sm:text-xl mb-4">
                ০২
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">মাসিক সম্মানী ১৫,০০০ – ২২,০০০৳</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী হালাল ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।
              </p>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-7 md:p-8 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d" data-reveal>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-fajr-gold/20 flex items-center justify-center font-bold text-fajr-gold text-lg sm:text-xl mb-4">
                ০৩
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">বিনামূল্যে ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                আপনার যদি কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সহায়তা প্রদান করবে।
              </p>
            </div>

            <div className="glass rounded-2xl p-5 sm:p-7 md:p-8 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d" data-reveal>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-fajr-gold/20 flex items-center justify-center font-bold text-fajr-gold text-lg sm:text-xl mb-4">
                ০৪
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                ৪টি প্রফেশনাল সেশন শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট প্রদান এবং নিয়মিত গ্রুমিং ও স্কিল ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ার বৃদ্ধি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SENIOR INSTRUCTORS & FACULTY (LIVE FROM ADMIN) ==================== */}
      <section id="instructors" className="py-14 sm:py-20 md:py-24 bg-[#070D1E] relative border-t border-white/5 font-bengali">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <div className="text-center mb-10 sm:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-3.5 py-1 text-fajr-gold text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <GraduationCap className="w-4 h-4" /> বিশিষ্ট ট্রেইনার ও শিক্ষক পরিষদ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              আমাদের প্রখ্যাত ইনস্ট্রাক্টর ও <span className="text-gradient-gold">মাস্টার ট্রেইনার প্যানেল</span>
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-fajr-gold to-transparent mx-auto mb-4 sm:mb-6"></div>
            <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
              আন্তর্জাতিক বিশ্ববিদ্যালয় ও সুপরিচিত শিক্ষক প্রশিক্ষণ কেন্দ্র থেকে অভিজ্ঞ উস্তাদ ও উস্তাজাগণ সরাসরি আপনার ক্যারিয়ার মেন্টরিং করবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {activeInstructors.map((inst, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-fajr-gold/40 transition-all card-3d flex flex-col sm:flex-row gap-5 items-start"
                data-reveal
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-fajr-gold/20 via-blue-900/40 to-[#0B1A45] border border-fajr-gold/40 flex items-center justify-center text-fajr-gold font-bold text-2xl shrink-0 shadow-lg shadow-fajr-gold/10 overflow-hidden">
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
                    <div className="flex items-center gap-1 text-xs bg-fajr-gold/20 text-fajr-gold px-2.5 py-0.5 rounded-full font-bold border border-fajr-gold/30 shrink-0">
                      <Star className="w-3 h-3 fill-fajr-gold" />
                      <span>{inst.rating || 4.9}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-yellow-400 font-semibold mb-2">
                    {inst.designation || 'Master Trainer'}
                  </p>

                  {inst.specialization && (
                    <div className="inline-block bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs text-blue-200 mb-3">
                      {inst.specialization}
                    </div>
                  )}

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {inst.bio || 'আন্তর্জাতিক কুরআন শিক্ষাদান মেথডোলজি ও পেডাগোজি বিশেষজ্ঞ।'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-fajr-gold" /> {inst.experienceYears || 5}+ বছরের অভিজ্ঞতা
                    </span>
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> ভেরিফাইড ফ্যাকাল্টি
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== ELIGIBILITY & PAYMENT ==================== */}
      <section id="payment-info" className="py-14 sm:py-20 md:py-24 bg-white text-gray-800 font-bengali relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-14" data-reveal>
            <div className="inline-flex items-center gap-2 text-yellow-700 text-xs sm:text-sm font-bold tracking-wider mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
              প্রয়োজনীয় যোগ্যতা ও ফি
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">আবেদনের সাধারণ যোগ্যতা ও পেমেন্ট তথ্য</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Criteria Card */}
            <div className="bg-[#F8F5EE] rounded-3xl p-5 sm:p-7 md:p-8 border border-yellow-200/70 shadow-sm relative overflow-hidden" data-reveal>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-blue-500"></div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 sm:mb-6 border-b border-gray-300/60 pb-3 sm:pb-4">আবেদনের সাধারণ যোগ্যতা</h3>
              
              <ul className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
                <li className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1120] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-gray-700 font-medium">শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা</span>
                </li>
                <li className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1120] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-gray-700 font-medium">প্রাথমিক ইংরেজি জ্ঞান এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)</span>
                </li>
                <li className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1120] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-gray-700 font-medium">ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তা সুবিধা)</span>
                </li>
                <li className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1120] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-gray-700 font-medium">স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর</span>
                </li>
                <li className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0B1120] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-gray-700 font-medium">হাফেজ না হয়েও আবেদন করার সুযোগ – শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন</span>
                </li>
              </ul>
            </div>

            {/* Fee Card */}
            <div className="bg-[#F8F5EE] rounded-3xl p-5 sm:p-7 md:p-8 border border-yellow-200/70 shadow-sm relative overflow-hidden flex flex-col justify-between" data-reveal>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-fajr-gold"></div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 sm:mb-6 border-b border-gray-300/60 pb-3 sm:pb-4">কোর্স ফি ও পেমেন্ট তথ্য</h3>
                
                <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
                  <span className="text-xl sm:text-2xl font-bold text-fajr-gold">৳</span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">{toBengaliNumber(coursePrice)}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-500 ml-1 sm:ml-2">(এককালীন রেজিস্ট্রেশন ফি)</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 sm:pb-3">
                  <span className="text-gray-600 font-medium">পেমেন্ট গেটওয়ে</span>
                  <span className="text-gray-900 font-bold">SSLCommerz (অনলাইন পেমেন্ট)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 sm:pb-3">
                  <span className="text-gray-600 font-medium">বিকাশ / নগদ / রকেট</span>
                  <span className="text-gray-900 font-bold">{liveSettings.bkashMerchantNumber || '01410764581'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 sm:pb-3">
                  <span className="text-gray-600 font-medium">কোর্স ট্র্যাক</span>
                  <span className="text-gray-900 font-bold">TOT-MEN / TOT-WOMEN</span>
                </div>
                <div className="flex justify-between items-center pb-1 sm:pb-2">
                  <span className="text-gray-600 font-medium">হটলাইন / WhatsApp</span>
                  <span className="text-gray-900 font-bold">{helplinePhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== REGISTRATION FORM SECTION ==================== */}
      <section id="register" className="py-14 sm:py-20 md:py-24 bg-[#0B1120] relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-8 sm:mb-12" data-reveal>
            <div className="inline-flex items-center gap-2 bg-fajr-gold/10 border border-fajr-gold/30 rounded-full px-3.5 py-1 text-fajr-gold text-[11px] sm:text-xs font-semibold mb-3 sm:mb-4">
              ❖ আপনার দক্ষতা, আমাদের সহায়তা ❖
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">কোর্স নির্বাচন ও শিক্ষক নিবন্ধন ফর্ম</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              পছন্দের ট্র্যাক নির্বাচন করে {toBengaliNumber(coursePrice)}৳ কোর্স ফি পরিশোধের মাধ্যমে আপনার নিবন্ধন সম্পন্ন করুন।
            </p>
          </div>

          <RegistrationForm initialTrack="men" courses={sanitizedCourses} settings={liveSettings} />
        </div>
      </section>

      {/* ==================== VIDEO SECTION ==================== */}
      <section id="videos" className="py-14 sm:py-20 md:py-24 bg-[#F8F5EE] text-gray-800 font-bengali relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 text-yellow-700 text-xs sm:text-sm font-bold tracking-wider mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
              অফিসিয়াল ভিডিও ও নির্দেশিকা
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              কুরআন টিচার ট্রেনিং ও ওরিয়েন্টেশন ভিডিও
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
              পুরুষ ও নারী উভয় কোর্সের ট্রেনিং পদ্ধতি, ক্লাসরুম পেডাগোজি ও ক্যারিয়ার সম্ভাবনার ভিডিওগুলো সরাসরি দেখে নিন।
            </p>
          </div>

          {/* Video Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 max-w-4xl mx-auto">
            <VideoShortsCard
              videoId="UxzqLHfjrGc"
              title="আমাদের টিচার ট্রেনিং প্রোগ্রাম ও ফি"
              subtitle="শিক্ষকদের ওরিয়েন্টেশন ও জব গাইডলাইন"
              badgeText="TOT - MEN শিক্ষক প্রশিক্ষণ"
              badgeBg="bg-[#0B1120]"
              thumbnailUrl="/men-batch.jpg"
            />
            <VideoShortsCard
              videoId="zPXTzup-2ok"
              title="মহিলাদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড"
              subtitle="মহিলাদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড"
              badgeText="TOT - WOMEN Batch 014"
              badgeBg="bg-[#6B21A8]"
              thumbnailUrl="/women-batch.jpg"
            />
          </div>

          {/* Quote Box */}
          <div className="mt-10 sm:mt-16 max-w-4xl mx-auto bg-white border border-yellow-200/80 rounded-3xl p-5 sm:p-7 md:p-8 relative overflow-hidden shadow-sm" data-reveal>
            <div className="absolute top-0 left-0 w-1.5 sm:w-2 h-full bg-gradient-to-b from-blue-900 to-blue-500"></div>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="text-yellow-500 text-4xl sm:text-5xl leading-none font-serif shrink-0">&ldquo;</div>
              <div>
                <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 italic">
                  &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — &lsquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।&rsquo; — সহীহ বুখারী। আপনি যদি শুদ্ধভাবে কুরআন তিলাওয়াত ও বেসিক ইংরেজি জানেন, ফজর একাডেমির এই প্রশিক্ষণ আপনাকে একটি সম্মানজনক হালাল শিক্ষকতা পেশায় যুক্ত করবে ইনশাআল্লাহ।&rdquo;
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/founder.jpg"
                    alt="Hafiz Maulana Muhammad Farabi Chowdhury"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-yellow-400 object-cover shadow-sm"
                  />
                  <div>
                    <h4 className="text-gray-900 font-bold text-sm sm:text-base">Hafiz Maulana Muhammad Farabi Chowdhury</h4>
                    <p className="text-gray-500 text-xs sm:text-sm">Founder &amp; CEO, Fajr Academy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section id="faq" className="py-14 sm:py-20 md:py-24 bg-white text-gray-800 font-bengali relative overflow-hidden border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative z-10">
          <div className="text-center mb-10 sm:mb-14 md:mb-16" data-reveal>
            <div className="inline-flex items-center gap-2 text-yellow-700 text-xs sm:text-sm font-bold tracking-wider mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
              সাধারণ প্রশ্ন ও উত্তর
              <span className="w-6 sm:w-8 h-[1px] bg-yellow-600"></span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">আপনার মনে থাকা প্রশ্নগুলোর উত্তর</h2>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {/* FAQ 1 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে হবে?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>পুরুষদের ({menCourse.name}) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>{menCourse.orientationDate} ({menCourse.orientationTime})</strong>। নারীদের ({womenCourse.name}) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>{womenCourse.orientationDate} ({womenCourse.orientationTime})</strong>।</p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>উভয় কোর্সের এককালীন রেজিস্ট্রেশন ফি {toBengaliNumber(coursePrice)} টাকা। SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, কার্ড অথবা সরাসরি বিকাশ মার্চেন্ট নম্বরে (<strong>{liveSettings.bkashMerchantNumber || '01410764581'}</strong>) পেমেন্ট করতে পারবেন।</p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">ল্যাপটপ বা কম্পিউটার না থাকলে কি আবেদন করা যাবে?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>হ্যাঁ, আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভাষা ভালো করে জ্ঞান থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব ব্যবস্থাপনায় ডিভাইস সহায়তা প্রদান করবে।</p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">আমাকে কি হাফিজ বা আলেম হতে হবে?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট।</p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>একদমই না। যারা প্রথম ধাপে নির্বাচিত হবেন না, তাদেরকে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট কোর্সে সুযোগ দেওয়া হবে।</p>
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="faq-item bg-[#F8F5EE] border border-yellow-200/80 rounded-2xl overflow-hidden group" data-reveal>
              <summary className="flex justify-between items-center p-4 sm:p-6 cursor-pointer select-none">
                <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900">শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white faq-icon transition-transform duration-300 shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </summary>
              <div className="faq-answer px-4 sm:px-6 pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-gray-600 border-t border-yellow-100 pt-3 sm:pt-4 hidden leading-relaxed">
                <p>ট্রেনিং সম্পন্ন করে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA SECTION ==================== */}
      <section className="py-14 sm:py-20 md:py-24 bg-gradient-cta relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fajr-gold rounded-full mix-blend-screen filter blur-3xl opacity-15 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10" data-reveal>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 sm:px-4 py-1.5 text-gray-300 text-xs sm:text-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-fajr-gold animate-pulse"></span>
            <span>{liveSettings.currentBatch || 'Batch 2026'} • সীমিত আসন সংখ্যা</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            আজই আপনার আসন নিশ্চিত করুন, <br /> 
            <span className="text-gradient-gold">কুরআনের খেদমতে যুক্ত হোন</span>
          </h2>
          
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-10 text-sm sm:text-base md:text-lg leading-relaxed">
            ফর্ম পূরণ করে {toBengaliNumber(coursePrice)} টাকা রেজিস্ট্রেশন ফি প্রদান করুন। প্রয়োজনীয় তথ্য জানতে আমাদের সরাসরি WhatsApp হটলাইনে যোগাযোগ করুন।
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <a
              href="#register"
              className="btn-glow bg-gradient-to-r from-fajr-gold via-yellow-500 to-yellow-600 text-fajr-dark font-bold py-3.5 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg shadow-lg shadow-fajr-gold/20 flex items-center justify-center gap-2 hover:scale-105 transition-all text-center"
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>রেজিস্ট্রেশন ফর্মে যান ({toBengaliNumber(coursePrice)} ৳)</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glow border border-white/20 text-white font-bold py-3.5 sm:py-4 px-6 sm:px-10 rounded-full text-base sm:text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-5 h-5 text-green-400 fill-green-400 shrink-0" />
              <span>WhatsApp হটলাইন</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER & PAYMENT GATEWAY ==================== */}
      <footer className="bg-[#0A1128] border-t border-white/5 pt-12 sm:pt-16 pb-8 font-bengali">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Logo & Info */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-fajr-gold/50 shadow-md shrink-0 bg-[#0B1A45]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/fajr-logo.png"
                  alt="FAJR Academy Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-wider font-serif">{liveSettings.instituteName || 'FAJR ACADEMY'}</h3>
                <p className="text-[9px] sm:text-[10px] text-fajr-gold tracking-widest uppercase font-medium">Balanced Education for Dunya and Akhirah</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">Training of Trainers (TOT) Program - {liveSettings.currentBatch || 'Batch 2026'}</p>
          </div>

          {/* Payment Gateway Partner Box */}
          <div className="max-w-4xl mx-auto bg-white text-gray-900 rounded-2xl p-5 sm:p-7 md:p-8 mb-10 sm:mb-12 shadow-2xl relative overflow-hidden" data-reveal>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4 sm:mb-5 text-center sm:text-left">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-xs sm:text-sm tracking-wide">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-fajr-gold shrink-0" /> OFFICIAL PAYMENT GATEWAY PARTNER
              </div>
              <div className="flex items-center gap-1.5 text-green-600 text-[11px] sm:text-xs font-bold">
                <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" /> 256-BIT SSL ENCRYPTED &amp; VERIFIED
              </div>
            </div>
            
            {/* SSLCommerz Official Pay-With Banner */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex justify-center items-center mb-5 sm:mb-6 border border-gray-200/80 shadow-inner">
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
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" /> বিকাশ, নগদ, রকেট ও অন্যান্য
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" /> ভিসা, মাস্টারকার্ড ও ব্যাংক ট্রান্সফার
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" /> ইন্টারনেট ব্যাংকিং ও মোবাইল ব্যাংকিং
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-12 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8 text-center">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-fajr-gold shrink-0" /> হটলাইন: {helplinePhone}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-fajr-gold shrink-0" /> হেল্পলাইন: {liveSettings.helplinePhone || helplinePhone}
            </span>
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-fajr-gold shrink-0" /> ইমেইল: {liveSettings.supportEmail || 'info@fajracademy.io'}
            </span>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-5 sm:pt-6 text-center text-[11px] sm:text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} {liveSettings.instituteName || 'Fajr Academy'}. All Rights Reserved. Registered Islamic Education Institute.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      <FloatingWhatsApp phone={helplinePhone} whatsappUrl={whatsappUrl} />
    </div>
  )
}
