import Link from 'next/link'
import RevealObserver from './RevealObserver'
import MarketingHeader from './MarketingHeader'
import RegistrationForm from './RegistrationForm'
import FloatingWhatsApp from './FloatingWhatsApp'
import { BASE_URL } from '@/constant'
import { dbConnect } from '@/service/mongo'
import { CourseModel } from '@/model/course-model'
import {
  BookOpen, UserCheck, Award, ShieldCheck, Users, Calendar, Heart,
  Check, ArrowRight, MessageCircle, CreditCard, Tag, User, GraduationCap,
  Monitor, Handshake, Sprout, BookMarked, Sparkles, Phone, Laptop,
  Star, Zap, Globe, Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL = `https://${BASE_URL}`
const PAGE_URL = `${SITE_URL}/`

export const metadata = {
  title: 'অনলাইন কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) — পুরুষ ও নারী ব্যাচ ২০২৬ | ফজর একাডেমি',
  description: 'ফজর একাডেমির অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে (TOT) নিবন্ধন করুন। পুরুষদের ব্যাচ (ওরিয়েন্টেশন ২০ সেপ্টেম্বর) ও নারীদের ব্যাচ ০১৪ (ওরিয়েন্টেশন ২১ সেপ্টেম্বর)। মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী ও সার্টিফিকেট।',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'অনলাইন কুরআন টিচার ট্রেনিং ২০২৬ (TOT - Men & Women) — ফজর একাডেমি',
    description: 'ঘরে বসেই অনলাইনে ৪টি সেশনে প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী ও সার্টিফিকেট।',
    url: PAGE_URL,
    images: [{ url: '/og-image.jpg', width: 1200, height: 1200, alt: 'ফজর একাডেমি কুরআন টিচার ট্রেনিং ২০২৬' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কুরআন টিচার ট্রেনিং (TOT) 2026 — Fajr Academy',
    description: 'ঘরে বসে প্রফেশনাল কুরআন টিচার হোন। মাসিক ১৫,০০০–২২,০০০ টাকা।',
    images: ['/og-image.jpg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Fajr Academy',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/fajr-logo.png` },
      contactPoint: { '@type': 'ContactPoint', telephone: '+8801641028312', contactType: 'customer support' },
    },
    {
      '@type': 'Course',
      name: 'Training of Trainers (TOT) – MEN BATCH 2026',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Fajr Academy', sameAs: SITE_URL },
      offers: { '@type': 'Offer', price: '1000', priceCurrency: 'BDT', availability: 'https://schema.org/InStock' },
    },
  ],
}

/* ─── Eyebrow label component ─── */
function Eyebrow({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold-500 rounded-full" />
      <span className="text-gold-600 text-[0.77rem] font-black tracking-[0.16em] uppercase">{children}</span>
      <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold-500 rounded-full" />
    </div>
  )
}

export default async function TeacherRegistrationMarketingPage() {
  let courses = []
  try {
    await dbConnect()
    courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean()
  } catch (err) { console.error('Error fetching courses:', err) }

  const menCourse = courses?.find((c) => c.track === 'men' || c.courseId === 'TOT-MEN') || {
    orientationDate: '২০ সেপ্টেম্বর', orientationTime: 'রাত ৮:০০ টা', fee: 1000,
  }
  const womenCourse = courses?.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    orientationDate: '২১ সেপ্টেম্বর', orientationTime: 'রাত ৮:০০ টা', fee: 1000,
  }
  const sanitizedCourses = JSON.parse(JSON.stringify(courses || []))

  return (
    <div className="bg-cream-100 text-ink-900 leading-[1.7] overflow-x-hidden font-outfit">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RevealObserver />

      {/* ══════════════════════════════════════════
          TOP ANNOUNCEMENT BAR
      ══════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border-b border-gold-400/20 relative z-[110] overflow-hidden">
        {/* Animated shimmer line */}
        <div className="absolute inset-0 shimmer-sweep pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-[0.81rem] text-cream-200">
            <span className="live-badge">ভর্তি চলছে</span>
            <span className="hidden sm:inline text-white/70">পুরুষ ব্যাচ • ২০ সেপ্টেম্বর ওরিয়েন্টেশন &nbsp;|&nbsp; নারী ব্যাচ ০১৪ • ২১ সেপ্টেম্বর ওরিয়েন্টেশন</span>
            <span className="sm:hidden text-white/70">Batch 2026 — ভর্তি চলছে</span>
          </div>
          <div className="flex items-center gap-2 text-[0.81rem] text-white/70">
            <Phone size={13} className="text-gold-400" />
            <span>WhatsApp:</span>
            <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer"
              className="text-gold-300 font-extrabold hover:text-white transition-colors">
              01641028312
            </a>
          </div>
        </div>
      </div>

      <MarketingHeader />

      {/* ══════════════════════════════════════════
          HERO — Cinematic Dark Royal
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[780px] bg-navy-950 bg-[url('/hero-bg.jpg')] bg-cover bg-right bg-no-repeat text-white flex flex-col justify-between overflow-hidden">
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#02080F_0%,#050F24_24%,rgba(5,15,36,0.96)_46%,rgba(5,15,36,0.72)_70%,rgba(5,15,36,0.2)_100%)] z-[1]" />
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(217,180,74,0.10),transparent_65%)] -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(23,58,120,0.4),transparent_65%)] translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Islamic geometric ornament (top-right) */}
        <div className="absolute top-8 right-8 opacity-[0.06] pointer-events-none z-[1] hidden xl:block">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <polygon points="100,10 125,80 195,80 140,125 165,195 100,155 35,195 60,125 5,80 75,80" stroke="#D9B44A" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="100" r="70" stroke="#D9B44A" strokeWidth="0.8" fill="none" />
            <circle cx="100" cy="100" r="50" stroke="#D9B44A" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        <div className="relative z-[2] w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-16 pb-20">
          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-14 xl:gap-20 items-center">

            {/* ── Left Column ── */}
            <div className="animate-rise-in">
              {/* Batch badges */}
              <div className="flex items-center gap-3 mb-8 flex-wrap">
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-navy-800/90 border border-gold-400/50 rounded-full text-[0.72rem] font-extrabold tracking-[0.1em] text-gold-300 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <Sparkles size={12} className="text-gold-400" />
                  TRAINING OF TRAINERS (TOT) · 2026
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800/80 border border-gold-400/25 rounded-full text-[0.74rem] font-bold backdrop-blur-md">
                  <Users size={13} className="text-gold-400" />
                  পুরুষ ও নারী আলাদা ট্র্যাক
                </span>
              </div>

              {/* H1 */}
              <h1 className="text-[clamp(2.5rem,4.8vw,3.8rem)] leading-[1.13] font-black text-white mb-7 tracking-[-0.03em]">
                <span className="block">শুদ্ধভাবে কুরআন ও</span>
                <span className="block">ইংরেজি জানেন?</span>
                <span className="block text-gold-gradient animate-gold-pulse mt-1">ঘরে বসেই হয়ে উঠুন</span>
                <span className="block">প্রফেশনাল কুরআন টিচার</span>
              </h1>

              <p className="text-[1.08rem] leading-[1.9] text-white/80 mb-9 max-w-[620px]">
                ফজর একাডেমির সম্পূর্ণ অনলাইন টিচার্স ট্রেনিং প্রোগ্রামে কোর্স শেষে সার্টিফিকেট
                এবং সফলদের জন্য <strong className="text-white">মাসিক ১৫,০০০ থেকে ২২,০০০ টাকা</strong> সম্মানীতে শিক্ষক হিসেবে যোগ দেওয়ার সুযোগ!
              </p>

              {/* 4 Feature Pills */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
                {[
                  { icon: <BookOpen size={19} />, text: <>কুরআন শিক্ষার<br />আধুনিক পদ্ধতি</> },
                  { icon: <UserCheck size={19} />, text: <>প্রফেশনাল<br />টিচার ট্রেনিং</> },
                  { icon: <Award size={19} />, text: <>অফিসিয়াল<br />সার্টিফিকেট</> },
                  { icon: <Laptop size={19} />, text: <>বিনামূল্যে<br />ডিভাইস সহায়তা</> },
                ].map((f, i) => (
                  <div key={i} className="group flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 border border-gold-400/30 flex items-center justify-center text-gold-300 shrink-0 shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:border-gold-400 group-hover:shadow-[0_12px_30px_rgba(217,180,74,0.3)]">
                      {f.icon}
                    </div>
                    <div className="text-[0.76rem] font-bold leading-tight text-white/85">{f.text}</div>
                  </div>
                ))}
              </div>

              {/* Hadith Card */}
              <div className="relative bg-gradient-to-br from-navy-800/95 to-navy-900/95 border border-gold-400/25 border-l-[3px] border-l-gold-400 rounded-2xl px-7 py-5 mb-9 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute -top-3 right-6 text-[6rem] text-gold-400/10 leading-none font-serif select-none pointer-events-none">&ldquo;</div>
                <div className="relative z-10">
                  <span className="block font-amiri text-[1.45rem] text-gold-300 text-right mb-3 font-bold [text-shadow:0_2px_14px_rgba(217,180,74,0.4)]" dir="rtl">
                    خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
                  </span>
                  <p className="text-[0.88rem] text-white/80 italic leading-[1.7] m-0">
                    &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।&rdquo;
                    <span className="ml-2 text-gold-400 font-semibold not-italic">— সহীহ বুখারী</span>
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-4 flex-wrap">
                <a href="#registration-section"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gold-gradient text-navy-950 font-extrabold text-[0.95rem] shadow-gold hover:-translate-y-1 hover:shadow-gold-lg hover:brightness-105 transition-all duration-300">
                  <CreditCard size={18} />
                  <span>এখনই রেজিস্ট্রেশন করুন (৳১,০০০)</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম%2C%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-navy-800/80 border-[1.5px] border-white/20 text-white font-extrabold text-[0.95rem] backdrop-blur-md hover:bg-navy-700/90 hover:border-[#25D366] hover:-translate-y-0.5 transition-all duration-300">
                  <MessageCircle size={18} color="#25D366" fill="#25D366" />
                  <span>WhatsApp-এ জানুন</span>
                </a>
              </div>
            </div>

            {/* ── Right Column — Islamic Arch Card ── */}
            <div className="hidden lg:flex justify-center animate-rise-in-slow">
              <div className="relative w-full max-w-[390px] animate-drift">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-t-[200px] rounded-b-3xl bg-[radial-gradient(ellipse,rgba(217,180,74,0.18),transparent_70%)] blur-2xl scale-110 pointer-events-none" />
                <div className="relative bg-[linear-gradient(200deg,#0C2048_0%,#050F24_55%,#02080F_100%)] border-2 border-gold-400/35 rounded-t-[200px] rounded-b-3xl pt-12 px-8 pb-9 text-center shadow-[0_40px_90px_rgba(0,0,0,0.8),0_0_60px_rgba(217,180,74,0.14)] overflow-hidden">
                  {/* Inner dashed border */}
                  <div className="absolute inset-3 border border-dashed border-gold-400/15 rounded-t-[190px] rounded-b-2xl pointer-events-none" />
                  {/* Top radial glow */}
                  <div className="absolute top-0 inset-x-0 h-[55%] bg-[radial-gradient(ellipse_at_top,rgba(217,180,74,0.1),transparent_70%)] pointer-events-none" />

                  {/* Logo */}
                  <div className="relative z-10 flex flex-col items-center mb-5">
                    <div className="relative mb-3">
                      <div className="absolute inset-0 rounded-2xl bg-gold-400/20 blur-xl scale-125 animate-gold-ripple" />
                      <img src="/fajr-logo.png" alt="FAJR Academy" className="relative w-[72px] h-[72px] rounded-2xl object-cover border-2 border-gold-400/50 shadow-[0_8px_28px_rgba(0,0,0,0.6),0_0_20px_rgba(217,180,74,0.3)]" />
                    </div>
                    <div className="font-black text-[1.28rem] tracking-[0.16em] text-white">FAJR</div>
                    <div className="text-[0.6rem] tracking-[0.3em] text-gold-300 uppercase">Academy</div>
                  </div>

                  <div className="relative z-10 text-[1.45rem] font-black text-white leading-tight mb-2">
                    কুরআন টিচার ট্রেনিং (TOT)
                  </div>
                  <div className="relative z-10 inline-block text-[0.73rem] font-extrabold text-gold-400 tracking-[0.16em] bg-gold-400/12 border border-gold-400/30 px-5 py-1.5 rounded-full mb-6">
                    BATCH 2026
                  </div>

                  {/* Checklist */}
                  <div className="relative z-10 flex flex-col gap-3 text-left mb-7 px-1">
                    {[
                      'আন্তর্জাতিক কুরআন শিক্ষণ পদ্ধতি',
                      'বাচ্চাদের হ্যান্ডলিং ও সাইকোলজি কৌশল',
                      'মাসিক ১৫,০০০–২২,০০০৳ শিক্ষক নিয়োগ',
                      'অফিসিয়াল সার্টিফিকেট ও মেন্টরিং',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-[0.83rem] text-white/90">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(34,197,94,0.5)]">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA buttons */}
                  <div className="relative z-10 flex flex-col gap-2.5 mb-6">
                    <a href="#registration-section"
                      className="flex items-center justify-center gap-2 bg-gold-gradient text-navy-950 font-extrabold text-[0.88rem] px-5 py-3.5 rounded-full shadow-gold hover:brightness-110 hover:-translate-y-0.5 transition-all">
                      <CreditCard size={16} />
                      <span>রেজিস্ট্রেশন করুন (৳১,০০০)</span>
                      <ArrowRight size={15} />
                    </a>
                    <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white/[0.06] border border-white/20 text-white font-bold text-[0.82rem] px-4 py-3 rounded-full hover:border-[#25D366] hover:bg-[#25D366]/10 backdrop-blur-md transition-all">
                      <MessageCircle size={15} color="#25D366" fill="#25D366" />
                      <span>WhatsApp-এ সরাসরি কথা বলুন</span>
                    </a>
                  </div>

                  <div className="relative z-10 text-[0.68rem] text-white/45 flex items-center justify-center gap-2">
                    <span className="text-gold-400">✦</span>
                    <span>আপনার বরকতময় ক্যারিয়ারের সূচনা</span>
                    <span className="text-gold-400">✦</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Ribbon */}
        <div className="relative z-[2] bg-navy-950/96 border-t border-gold-400/18 py-5">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
            {[
              { icon: <ShieldCheck size={17} />, text: 'বিশ্বস্ত ও অভিজ্ঞ প্রশিক্ষক প্যানেল' },
              { icon: <Users size={17} />, text: 'মহিলা ও পুরুষ – সম্পূর্ণ আলাদা ব্যাচ' },
              { icon: <Monitor size={17} />, text: '১০০% অনলাইন লাইভ ক্লাস (ঘরে বসে)' },
              { icon: <Heart size={17} />, text: 'দুনিয়া ও আখিরাতের বরকতময় ক্যারিয়ার' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-center gap-2.5 text-white/80 text-[0.82rem] font-semibold">
                <span className="text-gold-400 shrink-0">{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DUAL TRACKS SHOWCASE
      ══════════════════════════════════════════ */}
      <section id="tracks-section" className="relative bg-navy-900 bg-[url('/tracks-bg.jpg')] bg-cover bg-center text-white py-28 lg:py-36">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,15,36,0.95)_0%,rgba(8,24,50,0.99)_100%)] pointer-events-none" />

        <div className="relative z-[2] max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[0.85fr_1.07fr_1.07fr] gap-8 items-stretch mb-14">

            {/* ── Intro Column ── */}
            <div className="flex flex-col justify-between" data-reveal>
              <div>
                <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 px-4 py-2 rounded-full text-gold-300 text-[0.75rem] font-extrabold tracking-[0.08em] mb-6">
                  <GraduationCap size={14} /> প্রফেশনাল ট্রেনিং প্রোগ্রাম
                </div>
                <h2 className="text-[clamp(1.9rem,3vw,2.5rem)] font-black leading-[1.18] mb-5 tracking-[-0.025em]">
                  <span className="block">কুরআনের আলো ছড়াতে</span>
                  <span className="block text-gold-gradient">প্রফেশনাল শিক্ষক হন</span>
                </h2>
                <p className="text-[0.97rem] text-white/75 leading-[1.82] mb-8">
                  অভিজ্ঞ ট্রেইনার ও আন্তর্জাতিক শিক্ষক পেডাগোজির মাধ্যমে ঘরে বসেই গড়ে তুলুন দক্ষ, দায়িত্বশীল ও আত্মবিশ্বাসী কুরআন শিক্ষক হিসেবে নিজেকে।
                </p>
                {/* Feature Icons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: <UserCheck size={20} />, label: '৪টি হ্যান্ডস-অন সেশন' },
                    { icon: <Award size={20} />, label: 'অভিজ্ঞ ট্রেইনার প্যানেল' },
                    { icon: <Monitor size={20} />, label: 'সম্পূর্ণ অনলাইন লাইভ' },
                    { icon: <ShieldCheck size={20} />, label: 'সার্টিফিকেট ও নিয়োগ' },
                  ].map((f, i) => (
                    <div key={i} className="group flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-navy-700/80 border border-gold-400/30 flex items-center justify-center text-gold-300 shadow-md transition-all duration-300 group-hover:bg-navy-600 group-hover:border-gold-400 group-hover:-translate-y-1 group-hover:shadow-[0_10px_28px_rgba(217,180,74,0.25)]">
                        {f.icon}
                      </div>
                      <span className="text-[0.72rem] font-bold text-white/85 leading-tight">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Stats Box */}
              <div className="bg-gradient-to-br from-navy-800/95 to-navy-950 border border-gold-400/30 rounded-2xl px-6 py-6 backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 text-[0.73rem] font-extrabold text-gold-300 tracking-[0.08em] uppercase mb-4">
                  <Sparkles size={14} className="text-gold-400" />
                  ক্যারিয়ার অপরচুনিটি
                </div>
                <div className="flex items-center justify-between gap-4 bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-4 mb-4">
                  <div>
                    <div className="text-[1.25rem] font-black text-gold-300">৳১৫,০০০–২২,০০০</div>
                    <div className="text-[0.65rem] text-white/55">মাসিক সম্ভাব্য সম্মানী</div>
                  </div>
                  <div className="w-px h-9 bg-white/12" />
                  <div>
                    <div className="text-[1.25rem] font-black">১০০%</div>
                    <div className="text-[0.65rem] text-white/55">ঘরে বসে অনলাইন</div>
                  </div>
                </div>
                <p className="text-[0.74rem] text-gold-200/85 leading-[1.6] m-0">
                  ✦ প্রশিক্ষণ শেষে উত্তীর্ণ প্রার্থীদের ফজর একাডেমির গ্লোবাল শিক্ষক প্যানেলে অগ্রাধিকার ভিত্তিতে যুক্ত করা হবে।
                </p>
              </div>
            </div>

            {/* MEN Card */}
            <TrackCard
              id="course-men"
              variant="men"
              badge="MEN BATCH"
              title="Training of Trainers (TOT) – MEN BATCH"
              desc="ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।"
              img="/men-batch.jpg"
              orientation={`${menCourse.orientationDate} — ${menCourse.orientationTime}`}
              perks={[
                ['মাসিক সম্মানী:', '১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত'],
                ['৪টি প্রফেশনাল সেশন:', 'ইসলামিক পেডাগোজি ও শিক্ষাদানের কৌশল'],
                ['অভিজ্ঞ ট্রেইনার:', 'বিশিষ্ট আলেম ও আন্তর্জাতিক শিক্ষাবিদ'],
                ['সার্টিফিকেট প্রদান:', 'কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট'],
                ['Training & Grooming:', 'নিয়মিত ক্যারিয়ার গ্রোথের সুযোগ'],
              ]}
            />

            {/* WOMEN Card */}
            <TrackCard
              id="course-women"
              variant="women"
              badge="WOMEN BATCH 014"
              title="Training of Trainers (TOT) – WOMEN BATCH"
              desc="দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার এবং সম্মানজনক উপার্জনের সুযোগ।"
              img="/women-batch.jpg"
              orientation={`${womenCourse.orientationDate} — ${womenCourse.orientationTime}`}
              perks={[
                ['মাসিক সম্মানী:', '১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত'],
                ['৪টি প্রফেশনাল সেশন:', 'ইসলামিক পেডাগোজি ও শিক্ষাদানের কৌশল'],
                ['অভিজ্ঞ আলেমা ট্রেইনার:', 'বিশিষ্ট নারী শিক্ষাবিদ প্যানেল'],
                ['সার্টিফিকেট প্রদান:', 'কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট'],
                ['পর্দা ও গৃহকোণ সুরক্ষা:', '১০০% ঘরে বসেই পাঠদানের সুযোগ'],
              ]}
            />
          </div>

          {/* Mission Pill Bar */}
          <div className="bg-navy-950/85 border border-gold-400/22 rounded-full px-8 py-4 flex items-center justify-center gap-8 flex-wrap backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)]" data-reveal>
            {[
              { icon: <BookMarked size={16} />, text: 'Build Islamic Educators' },
              { icon: <Handshake size={16} />, text: 'Empower Better Community' },
              { icon: <Sprout size={16} />, text: 'A Brighter Future for Ummah' },
            ].map((item, i, arr) => (
              <div key={i} className="flex items-center gap-7">
                <div className="flex items-center gap-2.5 text-[0.86rem] font-bold text-white/90">
                  <span className="text-gold-400">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
                {i < arr.length - 1 && <div className="hidden md:block w-px h-5 bg-gold-400/22" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REGISTRATION FORM
      ══════════════════════════════════════════ */}
      <section id="registration-section" className="relative bg-navy-950 bg-[url('/reg-bg.jpg')] bg-cover bg-center text-white py-28">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,15,0.97)_0%,rgba(8,24,50,0.98)_100%)] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />

        <div className="relative z-[2] max-w-[1160px] mx-auto px-6 lg:px-10">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-6 mb-14 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gold-400/20 blur-lg scale-125" />
                <img src="/fajr-logo.png" alt="FAJR Academy"
                  className="relative w-12 h-12 rounded-xl object-cover border-[1.5px] border-gold-400/50 shadow-[0_4px_16px_rgba(0,0,0,0.5)]" />
              </div>
              <div>
                <div className="font-black text-[1.2rem] tracking-[0.07em]">FAJR Academy</div>
                <div className="text-[0.65rem] text-gold-300 tracking-[0.14em]">Learn Qur&apos;an · Build Future</div>
              </div>
            </div>
            <div className="text-center flex-2">
              <Eyebrow>আপনার দক্ষতা, আমাদের সহায়তা</Eyebrow>
              <h2 className="text-[clamp(1.65rem,2.8vw,2.3rem)] font-black leading-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
                কোর্স নির্বাচন ও শিক্ষক নিবন্ধন ফর্ম
              </h2>
              <p className="text-[0.93rem] text-white/75 mt-2">
                পছন্দের ট্র্যাক নির্বাচন করে ১,০০০৳ কোর্স ফি পরিশোধের মাধ্যমে নিবন্ধন সম্পন্ন করুন।
              </p>
            </div>
            <div className="flex-1 hidden lg:flex justify-end">
              <div className="text-white text-[1.05rem] font-extrabold leading-[1.5] text-right border-b-2 border-gold-400 pb-1.5">
                আসুন<br />শিক্ষার আলো<br />ছড়াই...
              </div>
            </div>
          </div>
          <RegistrationForm initialTrack="men" courses={sanitizedCourses} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY FAJR — 4 Feature Cards
      ══════════════════════════════════════════ */}
      <section id="why-fajr" className="py-28 lg:py-36 bg-cream-100">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center max-w-[780px] mx-auto mb-16" data-reveal>
            <Eyebrow>কেন ফজর একাডেমি টিওটি</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-black text-navy-900 leading-[1.2] tracking-[-0.025em] mb-5">
              প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার —<br />একটি স্বচ্ছ ও বরকতময় পথ
            </h2>
            <p className="text-[1.04rem] text-ink-500 leading-[1.82]">
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ নিশ্চিত করে।
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '০১', icon: <Monitor size={24} />, title: 'ঘরে বসেই সম্পূর্ণ কাজ', body: 'কোনো ট্রাফিক জ্যাম নেই, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার ক্লাস ঘরে বসেই ল্যাপটপে সম্পন্ন।' },
              { num: '০২', icon: <Tag size={24} />, title: 'মাসিক সম্মানী ১৫,০০০–২২,০০০৳', body: 'কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক ও স্বাবলম্বী হালাল ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।' },
              { num: '০৩', icon: <Laptop size={24} />, title: 'বিনামূল্যে ল্যাপটপ ও ডিভাইস সাপোর্ট', body: 'আপনার কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকলে কিন্তু ডিভাইস না থাকলে, ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সহায়তা দেবে।' },
              { num: '০৪', icon: <Award size={24} />, title: 'কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট', body: '৪টি প্রফেশনাল সেশন শেষে অফিসিয়াল সার্টিফিকেট এবং নিয়মিত গ্রুমিং ও স্কিল ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ার বৃদ্ধি।' },
            ].map((c) => (
              <div key={c.num} className="group bg-white rounded-3xl px-7 py-9 border border-cream-300 shadow-sm transition-all duration-350 relative overflow-hidden hover:-translate-y-2 hover:shadow-lg hover:border-gold-400/50" data-reveal>
                {/* Top gold bar */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 origin-left scale-x-0 transition-transform duration-400 group-hover:scale-x-100 rounded-t-3xl" />
                {/* Num badge */}
                <div className="flex items-center justify-between mb-7">
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-950 text-gold-300 flex items-center justify-center shadow-[0_10px_26px_rgba(8,24,50,0.35)]">
                    {c.icon}
                  </div>
                  <span className="text-[2.5rem] font-black text-cream-300 leading-none">{c.num}</span>
                </div>
                <h3 className="text-[1.1rem] font-extrabold text-navy-900 mb-3 leading-tight">{c.title}</h3>
                <p className="text-ink-500 text-[0.9rem] leading-[1.8]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROCESS — 4 Steps
      ══════════════════════════════════════════ */}
      <section id="process-section" className="py-28 lg:py-36 bg-process-gradient relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(217,180,74,0.06),transparent_70%)]" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center max-w-[740px] mx-auto mb-16" data-reveal>
            <Eyebrow>নিবন্ধন থেকে নিয়োগের ধাপসমূহ</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-black text-navy-900 leading-[1.2] tracking-[-0.025em]">
              মাত্র ৪টি ধাপে হয়ে উঠুন<br />একজন প্রফেশনাল শিক্ষক
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative mt-6">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 z-0 opacity-60" />
            {[
              { num: '০১', title: 'রেজিস্ট্রেশন ও ১,০০০৳ ফি', body: 'পছন্দের ট্র্যাক নির্বাচন করে ১,০০০ টাকা ফি পরিশোধ করুন।' },
              { num: '০২', title: 'লাইভ ওরিয়েন্টেশন ক্লাস', body: 'পুরুষ ২০ সেপ্টেম্বর ও নারী ২১ সেপ্টেম্বর রাত ৮:০০ টায় যুক্ত হোন।' },
              { num: '০৩', title: '৪টি প্রফেশনাল TOT সেশন', body: '১ মাসে ৪টি হ্যান্ডস-অন সেশনে আধুনিক পেডাগোজি কৌশল আয়ত্ত করুন।' },
              { num: '০৪', title: 'সার্টিফিকেট ও জব অফার', body: 'সার্টিফিকেট অর্জন এবং ফজর একাডেমির শিক্ষক প্যানেলে যোগ দিন।' },
            ].map((s, i) => (
              <div key={s.num} className="group relative z-10 flex flex-col items-center text-center" data-reveal>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-700 to-navy-950 text-gold-300 flex items-center justify-center font-black text-[1.15rem] mb-6 shadow-[0_12px_34px_rgba(8,24,50,0.45)] border-[2.5px] border-gold-400 transition-all duration-300 group-hover:scale-[1.15] group-hover:shadow-[0_16px_44px_rgba(8,24,50,0.6),0_0_30px_rgba(217,180,74,0.4)]">
                  {s.num}
                </div>
                <div className="bg-white rounded-2xl px-5 py-6 border border-cream-300 shadow-sm w-full transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                  <h3 className="text-[1.02rem] font-extrabold text-navy-900 mb-3 leading-tight">{s.title}</h3>
                  <p className="text-ink-500 text-[0.88rem] leading-[1.75]">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REQUIREMENTS & FEE
      ══════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="text-center max-w-[720px] mx-auto mb-16" data-reveal>
            <Eyebrow>প্রয়োজনীয় যোগ্যতা ও ফি</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-black text-navy-900 leading-[1.2] tracking-[-0.025em]">
              আবেদনের সাধারণ যোগ্যতা ও পেমেন্ট তথ্য
            </h2>
          </div>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-stretch">
            {/* Requirements */}
            <div className="bg-cream-50 rounded-2xl p-10 lg:p-12 border border-cream-300 shadow-sm relative overflow-hidden" data-reveal>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700 rounded-t-2xl" />
              <h3 className="text-[1.28rem] font-extrabold text-navy-900 mb-7 pb-5 border-b-2 border-cream-300">আবেদনের সাধারণ যোগ্যতা</h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-5">
                {[
                  'শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা',
                  'প্রাথমিক ইংরেজি জানা এবং বোঝার দক্ষতা',
                  'ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ডিভাইস সহায়তা)',
                  'স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর',
                  'হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয় — শেখানোর সদিচ্ছা প্রয়োজন',
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start text-[0.95rem] leading-[1.7] text-ink-700">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-gold-300 text-[0.72rem] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-[0_4px_14px_rgba(8,24,50,0.28)]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fee Card */}
            <div className="rounded-2xl p-10 lg:p-12 bg-fee-gradient border border-gold-400/28 shadow-[0_22px_60px_rgba(8,24,50,0.45)] relative overflow-hidden shimmer-sweep" data-reveal>
              <div className="absolute bottom-[-80px] right-[-80px] w-[260px] h-[260px] rounded-full bg-[radial-gradient(circle,rgba(217,180,74,0.12),transparent_65%)] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-t-2xl" />
              <span className="text-gold-300 text-[0.8rem] font-extrabold tracking-[0.12em] uppercase mb-2 block relative z-10">কোর্স ফি ও পেমেন্ট তথ্য</span>
              <h3 className="text-[1.28rem] font-black text-white mb-5 relative z-10">এককালীন রেজিস্ট্রেশন ফি</h3>
              <div className="text-[2.8rem] font-black text-gold-300 leading-none relative z-10 mb-7">
                <sup className="text-[1.3rem] align-super">৳</sup>১,০০০
              </div>
              <div className="relative z-10 flex flex-col gap-1 mb-7">
                {[
                  ['পেমেন্ট গেটওয়ে', 'SSLCommerz'],
                  ['বিকাশ মার্চেন্ট', '01410764581'],
                  ['রেফারেন্স', 'TOT-MEN / TOT-WOMEN'],
                  ['হটলাইন / WhatsApp', '01641028312'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-white/10 text-[0.88rem] text-white">
                    <span className="text-white/70">{label}</span>
                    <b className="text-gold-300 font-extrabold">{value}</b>
                  </div>
                ))}
              </div>
              <p className="text-[0.82rem] leading-[1.72] text-white/70 px-4 py-3.5 bg-white/[0.06] rounded-xl border-l-[3px] border-l-gold-400 relative z-10">
                নিবন্ধন ফর্মে সরাসরি SSLCommerz-এর মাধ্যমে অথবা বিকাশ মার্চেন্টে পেমেন্ট করে WhatsApp-এ ট্রানজেকশন আইডি পাঠিয়ে নিশ্চিত হতে পারেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VIDEOS & FOUNDER QUOTE
      ══════════════════════════════════════════ */}
      <section id="program-videos" className="py-28 lg:py-36 bg-gradient-to-br from-cream-200 to-cream-300">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col gap-16">
          {/* Header */}
          <div className="text-center max-w-[780px] mx-auto" data-reveal>
            <Eyebrow>অফিসিয়াল ভিডিও নির্দেশিকা</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-black text-navy-900 leading-[1.2] tracking-[-0.025em] mb-5">
              কুরআন টিচার ট্রেনিং ও ওরিয়েন্টেশন ভিডিও
            </h2>
            <p className="text-[1.04rem] text-ink-500 leading-[1.82]">পুরুষ ও নারী উভয় কোর্সের ট্রেনিং পদ্ধতি, ক্লাসরুম পেডাগোজি ও ক্যারিয়ার সম্ভাবনার ভিডিওগুলো সরাসরি দেখে নিন।</p>
          </div>

          {/* Video Cards */}
          <div className="flex justify-center gap-10 flex-wrap">
            {[
              { badge: '👨‍🏫 TOT – MEN শিক্ষক প্রশিক্ষণ', src: 'https://www.youtube.com/embed/UxzqLHfjrGc?rel=0&controls=1&playsinline=1', title: 'পুরুষদের ওরিয়েন্টেশন ও জব গাইডলাইন', variant: 'men' },
              { badge: '🧕 TOT – WOMEN Batch 014', src: 'https://www.youtube.com/embed/zPXTzup-2ok?rel=0&controls=1&playsinline=1', title: 'দ্বীনি বোনদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড', variant: 'women' },
            ].map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-5 w-full max-w-[330px]" data-reveal>
                <div className={`inline-flex items-center gap-2 text-[0.76rem] font-extrabold px-5 py-2 rounded-full shadow-md ${
                  v.variant === 'men'
                    ? 'text-gold-400 bg-navy-950 border border-gold-400/40'
                    : 'text-white bg-gradient-to-br from-[#4A044E] to-[#701A75] border border-pink-400/40'
                }`}>
                  {v.badge}
                </div>
                <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(8,24,50,0.4)] border-2 border-gold-400/20 transition-all duration-350 hover:-translate-y-2 hover:border-gold-400/60 hover:shadow-[0_40px_80px_rgba(8,24,50,0.55),0_0_28px_rgba(217,180,74,0.2)]">
                  <iframe src={v.src} title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0 w-full h-full border-0" />
                </div>
                <p className="text-[0.95rem] font-extrabold text-navy-900 text-center">{v.title}</p>
              </div>
            ))}
          </div>

          {/* Founder Quote */}
          <div className="bg-white rounded-2xl px-10 lg:px-14 py-12 border border-cream-300 shadow-md relative overflow-hidden" data-reveal>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300" />
            <div className="absolute top-6 left-8 text-[7rem] text-gold-400/12 leading-none font-serif select-none pointer-events-none">&ldquo;</div>
            <p className="text-[1.05rem] text-slate-700 mb-8 leading-[1.9] italic relative z-10 max-w-[820px]">
              &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — খইরুকুম মান তাআল্লামাল কুরআনা ওয়া আল্লামাহু। আপনি যদি শুদ্ধভাবে কুরআন পড়তে পারেন এবং বেসিক ইংলিশ জানা থাকে, তাহলে ফজর একাডেমির এই টিওটি প্রোগ্রামে জয়েন করে আপনি ঘরে বসেই ১৫ থেকে ২২ হাজার টাকা মাসিক সম্মানীতে একটি সুন্দর হালাল ক্যারিয়ার গড়তে পারবেন।&rdquo;
            </p>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full border-2 border-gold-400 overflow-hidden shadow-[0_6px_20px_rgba(8,24,50,0.2)] shrink-0">
                <img src="/founder.jpg" alt="Founder" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <b className="block text-navy-900 text-[1rem] font-extrabold">Hafiz Maowlana Muhammad Farabi Chowdhury</b>
                <span className="text-[0.83rem] text-slate-500">Founder & CEO, Fajr Academy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section id="faq" className="py-28 lg:py-36 bg-white">
        <div className="max-w-[820px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-14" data-reveal>
            <Eyebrow>সাধারণ প্রশ্ন ও উত্তর</Eyebrow>
            <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] font-black text-navy-900 leading-[1.2] tracking-[-0.025em]">
              আপনার মনে থাকা প্রশ্নগুলোর উত্তর
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { q: 'পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে হবে?', a: 'পুরুষদের (TOT - MEN) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২০ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>। নারীদের (TOT - WOMEN Batch 014) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২১ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>।' },
              { q: 'কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?', a: 'উভয় কোর্সের এককালীন রেজিস্ট্রেশন ফি ১,০০০ টাকা। SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, কার্ড অথবা সরাসরি বিকাশ মার্চেন্ট নম্বরে (01410764581) পেমেন্ট করতে পারেন।' },
              { q: 'ল্যাপটপ বা কম্পিউটার না থাকলে কি আবেদন করা যাবে?', a: 'হ্যাঁ! আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজ তহবিল থেকে ল্যাপটপ/ডিভাইস সহায়তা প্রদান করবে।' },
              { q: 'আমাকে কি হাফিজ বা আলেম হতে হবে?', a: 'না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট।' },
              { q: 'প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?', a: 'একদমই না! যারা প্রথম ধাপে চূড়ান্তভাবে নির্বাচিত হবেন না, তাদেরকে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট করানো হবে।' },
              { q: 'শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?', a: 'ট্রেনিং সম্পন্ন করে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।' },
            ].map((faq, i) => (
              <details key={i} className="group bg-cream-50 border border-cream-300 rounded-2xl overflow-hidden transition-all shadow-xs open:border-gold-400/60 open:shadow-[0_10px_28px_rgba(8,24,50,0.1)]" data-reveal>
                <summary className="list-none [&::-webkit-details-marker]:hidden text-[1.02rem] font-extrabold text-navy-900 cursor-pointer flex justify-between items-center px-7 py-5 transition-all hover:text-gold-600 hover:bg-gold-400/[0.03] select-none after:content-['+'] after:text-[1.3rem] after:font-black after:w-8 after:h-8 after:rounded-full after:bg-navy-900 after:text-gold-300 after:flex after:items-center after:justify-center after:shrink-0 after:transition-all group-open:after:content-['−'] group-open:after:bg-gold-400 group-open:after:text-navy-900">
                  {faq.q}
                </summary>
                <p className="px-7 pb-6 text-ink-500 text-[0.96rem] leading-[1.84] border-t border-dashed border-cream-300 m-0 pt-5 animate-rise-in" dangerouslySetInnerHTML={{ __html: faq.a }} />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="relative bg-cta-gradient text-white text-center py-28 lg:py-36 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(217,180,74,0.1),transparent_65%)]" />
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(23,58,120,0.35),transparent_65%)] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(23,58,120,0.35),transparent_65%)] translate-x-1/3 translate-y-1/3" />
        </div>
        {/* Top gold line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-gold-400/15 border border-gold-400/35 rounded-full px-5 py-2 text-gold-300 text-[0.76rem] font-extrabold tracking-[0.1em] mb-6">
            <Clock size={13} /> Batch 2026 · সীমিত আসন সংখ্যা
          </div>
          <h2 className="text-[clamp(1.9rem,3.8vw,2.9rem)] font-black my-6 leading-tight tracking-[-0.025em] max-w-[780px] mx-auto">
            আজই আপনার আসন নিশ্চিত করুন,<br />কুরআনের খেদমতে যুক্ত হোন
          </h2>
          <p className="text-white/75 max-w-[580px] mx-auto mb-12 text-[1.03rem] leading-[1.85]">
            ফর্ম পূরণ করে ১,০০০ টাকা রেজিস্ট্রেশন ফি প্রদান করুন। যেকোনো তথ্যের জন্য সরাসরি WhatsApp হটলাইনে মেসেজ দিন।
          </p>
          <div className="flex gap-5 justify-center flex-wrap">
            <a href="#registration-section"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gold-gradient text-navy-950 font-extrabold text-[0.97rem] shadow-gold hover:-translate-y-1 hover:shadow-gold-lg hover:brightness-105 transition-all duration-300">
              <CreditCard size={18} />
              রেজিস্ট্রেশন ফর্মে যান (৳১,০০০)
              <ArrowRight size={16} />
            </a>
            <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-white/[0.07] border-[1.5px] border-white/25 text-white font-extrabold text-[0.97rem] backdrop-blur-md hover:bg-white/[0.14] hover:border-[#25D366] hover:-translate-y-0.5 transition-all duration-300">
              <MessageCircle size={18} color="#25D366" fill="#25D366" />
              01641028312 নম্বরে WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer id="footer-section" className="bg-navy-950 text-white/55 py-16 pb-10 text-[0.85rem] border-t border-gold-400/18">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col items-center text-center">
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3.5 mb-4">
              <img src="/fajr-logo.png" alt="Fajr Academy" className="w-12 h-12 object-cover rounded-xl border border-gold-400/38 shadow-[0_6px_18px_rgba(0,0,0,0.5)]" />
              <span className="font-black text-[1.35rem] tracking-[0.12em] text-white">FAJR ACADEMY</span>
            </div>
            <p className="text-[0.84rem] text-gold-300/80">Balanced Education for Dunya and Akhirah</p>
            <p className="text-[0.78rem] text-white/40 mt-1">Training of Trainers (TOT) Program · Batch 2026</p>
          </div>

          {/* SSLCommerz badge */}
          <div className="w-full max-w-[920px] bg-navy-800/70 border border-gold-400/25 rounded-xl p-7 mb-10 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="text-[0.72rem] font-extrabold text-gold-300 tracking-[0.08em]">🔒 OFFICIAL PAYMENT GATEWAY PARTNER</div>
              <div className="text-[0.7rem] font-extrabold text-green-500">256-BIT SSL ENCRYPTED & VERIFIED</div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3.5 flex items-center justify-center mb-5">
              <a target="_blank" rel="noopener noreferrer" href="https://www.sslcommerz.com/" className="block w-full">
                <img src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png" alt="SSLCommerz" className="w-full max-h-14 object-contain" />
              </a>
            </div>
            <div className="flex items-center justify-center gap-8 flex-wrap text-[0.78rem] text-white/80">
              {['ভিসা, মাস্টারকার্ড ও অ্যামেক্স', 'বিকাশ, নগদ, রকেট ও সকল মোবাইল ব্যাংকিং', 'ইন্টারনেট ব্যাংকিং ও ইনস্ট্যান্ট ভেরিফিকেশন'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-green-500 font-black">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Copyright */}
          <div className="flex flex-col items-center gap-4 pt-7 border-t border-white/10 w-full">
            <div className="flex items-center justify-center gap-5 flex-wrap text-[0.88rem] text-white/75">
              <span>হটলাইন: <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer" className="text-gold-300 font-bold hover:text-white transition-colors">01641028312</a></span>
              <span className="text-white/25">|</span>
              <span>হেল্পলাইন: <a href="https://wa.me/8801857381244" target="_blank" rel="noopener noreferrer" className="text-gold-300 font-bold hover:text-white transition-colors">+880 1857-381244</a></span>
              <span className="text-white/25">|</span>
              <span>ইমেইল: <a href="mailto:info@fajracademy.io" className="text-gold-300 font-bold hover:text-white transition-colors">info@fajracademy.io</a></span>
            </div>
            <div className="text-[0.76rem] text-white/35">© 2026 Fajr Academy. All rights reserved.</div>
          </div>
        </div>
      </footer>

      <FloatingWhatsApp />
    </div>
  )
}

/* ─── TrackCard reusable component ─── */
function TrackCard({ id, variant, badge, title, desc, img, orientation, perks }) {
  const isMen = variant === 'men'
  return (
    <div id={id}
      className="group bg-card-gradient border border-gold-400/20 rounded-2xl overflow-hidden shadow-[0_22px_56px_rgba(0,0,0,0.55)] flex flex-col relative transition-all duration-350 hover:-translate-y-2 hover:border-gold-400/55 hover:shadow-[0_40px_90px_rgba(0,0,0,0.7),0_0_40px_rgba(217,180,74,0.16)]"
      data-reveal>
      {/* Top hover bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
        <div className={`absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-[0.07em] backdrop-blur-md border ${
          isMen ? 'bg-men/85 border-men-light/50' : 'bg-women/85 border-women-light/50'
        }`}>
          {isMen ? <User size={12} /> : <Sparkles size={12} />}
          <span>{badge}</span>
        </div>
        <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-navy-950/90 border border-gold-400/40 backdrop-blur-md">
          <div className="text-[1.05rem] font-black text-gold-300 leading-tight">৳ ১,০০০</div>
          <div className="text-[0.56rem] text-white/60">কোর্স ফি</div>
        </div>
      </div>

      {/* Title Banner */}
      <div className={`px-6 py-5 border-b border-white/[0.07] ${isMen ? 'bg-men/[0.13]' : 'bg-women/[0.17]'}`}>
        <h3 className="text-[1.08rem] font-black mb-1.5 leading-tight text-white">{title}</h3>
        <p className="text-[0.8rem] text-white/75 leading-[1.58] m-0">{desc}</p>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          {/* Orientation date */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 ${
            isMen ? 'bg-men/[0.14] border border-men-light/30' : 'bg-women/[0.14] border border-women-light/30'
          }`}>
            <Calendar size={19} className="text-gold-400 shrink-0" />
            <div>
              <div className="text-[0.68rem] text-white/55">First Orientation Class:</div>
              <div className="text-[0.88rem] font-extrabold text-white">{orientation}</div>
            </div>
          </div>
          {/* Perks */}
          <div className="flex flex-col gap-2.5 mb-7">
            {perks.map(([label, desc]) => (
              <div key={label} className="flex items-start gap-3 text-[0.83rem] leading-[1.58] text-white/88">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.66rem] font-black shrink-0 mt-0.5 ${isMen ? 'bg-men' : 'bg-women'}`}>✓</div>
                <span><strong className="text-white">{label}</strong> {desc}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Action */}
        <div className="flex flex-col gap-2">
          <a href="#registration-section"
            className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-full bg-gold-gradient text-navy-950 font-extrabold text-[0.93rem] shadow-gold transition-all hover:-translate-y-0.5 hover:shadow-gold-lg hover:brightness-105">
            <CreditCard size={16} />
            <span>নিবন্ধন করুন এখনই (৳১,০০০)</span>
            <ArrowRight size={15} />
          </a>
          <span className="text-[0.7rem] text-white/50 text-center">🔒 নিরাপদ SSLCommerz ও বিকাশ পেমেন্ট</span>
        </div>
      </div>
    </div>
  )
}