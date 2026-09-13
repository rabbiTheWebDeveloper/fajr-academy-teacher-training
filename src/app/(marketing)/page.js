import styles from './page.module.css'
import RevealObserver from './RevealObserver'
import MarketingHeader from './MarketingHeader'
import RegistrationForm from './RegistrationForm'
import FloatingWhatsApp from './FloatingWhatsApp'
import { BASE_URL } from '@/constant'
import { dbConnect } from '@/service/mongo'
import { CourseModel } from '@/model/course-model'
import {
  BookOpen,
  UserCheck,
  Award,
  Clock,
  ShieldCheck,
  Users,
  Calendar,
  Heart,
  Check,
  ArrowRight,
  MessageCircle,
  CreditCard,
  Tag,
  User,
  GraduationCap,
  Monitor,
  Handshake,
  Sprout,
  BookMarked,
  Sparkles,
  Phone,
  Laptop,
  CheckCircle2,
  HelpCircle,
  Video,
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
    'ফজর একাডেমির অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে (TOT) নিবন্ধন করুন। পুরুষদের ব্যাচ (ওরিয়েন্টেশন ২০ সেপ্টেম্বর) ও নারীদের ব্যাচ ০১৪ (ওরিয়েন্টেশন ২১ সেপ্টেম্বর)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী!',
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
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Fajr Academy',
      alternateName: 'ফজর একাডেমি',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.ico`, width: 80, height: 80 },
      description: 'Balanced Education for Dunya and Akhirah — Online Quran Teacher Training in Bangladesh.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+8801641028312',
        availableLanguage: ['Bengali', 'English'],
        contactOption: 'TollFree',
      },
      sameAs: ['https://wa.me/8801641028312', 'https://youtube.com/shorts/zPXTzup-2ok'],
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-men`,
      name: 'Training of Trainers (TOT) – MEN',
      description: 'ছেলেদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী।',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Fajr Academy', sameAs: SITE_URL },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      offers: { '@type': 'Offer', price: '1000', priceCurrency: 'BDT', availability: 'https://schema.org/InStock', url: PAGE_URL },
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-women`,
      name: 'Training of Trainers (TOT) – WOMEN (Batch 014)',
      description: 'দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ (Batch 014)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী।',
      url: PAGE_URL,
      provider: { '@type': 'Organization', name: 'Fajr Academy', sameAs: SITE_URL },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      offers: { '@type': 'Offer', price: '1000', priceCurrency: 'BDT', availability: 'https://schema.org/InStock', url: PAGE_URL },
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

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */
export default async function TeacherRegistrationMarketingPage() {
  let courses = []
  try {
    await dbConnect()
    courses = await CourseModel.find({ isPublished: true }).sort({ createdAt: 1 }).lean()
  } catch (err) {
    console.error('Error fetching courses in page.js:', err)
  }

  const menCourse = courses?.find((c) => c.track === 'men' || c.courseId === 'TOT-MEN') || {
    name: 'Training of Trainers (TOT) – MEN',
    tag: '👨‍🏫 পুরুষদের জন্য বিশেষায়িত',
    fee: 1000,
    orientationDate: '২০ সেপ্টেম্বর',
    orientationTime: 'রাত ৮:০০ টা',
    summary: 'ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।',
  }

  const womenCourse = courses?.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) – WOMEN',
    tag: '🧕 নারীদের জন্য · Batch 014 (Batch 013 চলমান)',
    fee: 1000,
    orientationDate: '২১ সেপ্টেম্বর',
    orientationTime: 'রাত ৮:০০ টা',
    summary: 'জেনারেল লাইনে পড়ালিখা করা দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুযোগ।',
  }

  const sanitizedCourses = JSON.parse(JSON.stringify(courses || []))

  return (
    <div className={styles.pageRoot}>
      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Scroll Reveal ── */}
      <RevealObserver />

      {/* ════════════════════════════════════════════
          TOP ANNOUNCEMENT BAR
          ════════════════════════════════════════════ */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarAnnouncement}>
            <span className={styles.liveDot} />
            <span>
              <strong>ভর্তি চলছে:</strong> পুরুষ ব্যাচ (ওরিয়েন্টেশন ২০ সেপ্টেম্বর) • নারী ব্যাচ ০১৪ (ওরিয়েন্টেশন ২১ সেপ্টেম্বর)
            </span>
          </div>
          <div className={styles.topbarRightInfo}>
            <span>হটলাইন ও WhatsApp: </span>
            <a
              href="https://wa.me/8801641028312"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topbarPhone}
            >
              01641028312
            </a>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STICKY HEADER
          ════════════════════════════════════════════ */}
      <MarketingHeader />

      {/* ════════════════════════════════════════════
          HERO — Cinematic Luxury Islamic
          ════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroContentWrap}>
          <div className={styles.heroGrid}>

            {/* ── Left Column ── */}
            <div className={styles.heroLeft}>
              {/* Badge Row */}
              <div className={styles.heroBadgeRow}>
                <span className={styles.heroPillGold}>
                  <Sparkles size={13} /> TRAINING OF TRAINERS (TOT) • 2026
                </span>
                <span className={styles.heroPillGroup}>
                  <Users size={14} color="#E5C04A" />
                  <span>পুরুষ ও নারী আলাদা ট্র্যাক</span>
                </span>
              </div>

              {/* H1 */}
              <h1 className={styles.heroH1}>
                <span className={styles.heroH1Line}>শুদ্ধভাবে কুরআন ও</span>
                <span className={styles.heroH1Line}>ইংরেজি জানেন?</span>
                <span className={`${styles.heroH1Line} ${styles.heroH1Accent}`}>ঘরে বসেই হয়ে উঠুন</span>
                <span className={styles.heroH1Line}>প্রফেশনাল কুরআন টিচার</span>
              </h1>

              {/* Lede */}
              <p className={styles.heroLede}>
                ফজর একাডেমি নিয়ে এসেছে সম্পূর্ণ অনলাইন টিচার্স ট্রেনিং (TOT) প্রোগ্রাম। যেখানে আপনি শিখবেন আন্তর্জাতিক মানের কুরআন শিক্ষাদান পদ্ধতি ও আধুনিক পেডাগোজি। কোর্স শেষে সার্টিফিকেট এবং সফলদের জন্য রয়েছে <strong>মাসিক ১৫,০০০ থেকে ২২,০০০ টাকা</strong> সম্মানীতে শিক্ষক হিসেবে যুক্ত হওয়ার সরাসরি সুযোগ!
              </p>

              {/* 4 Feature Pills */}
              <div className={styles.heroFeaturePillRow}>
                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}><BookOpen size={20} /></div>
                  <div className={styles.heroFeatureText}>কুরআন শিক্ষার<br />আধুনিক পদ্ধতি</div>
                </div>
                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}><UserCheck size={20} /></div>
                  <div className={styles.heroFeatureText}>প্রফেশনাল<br />টিচার ট্রেনিং</div>
                </div>
                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}><Award size={20} /></div>
                  <div className={styles.heroFeatureText}>অফিসিয়াল<br />সার্টিফিকেট</div>
                </div>
                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}><Laptop size={20} /></div>
                  <div className={styles.heroFeatureText}>বিনামূল্যে ডিভাইস<br />সহায়তার সুযোগ</div>
                </div>
              </div>

              {/* Hadith Callout */}
              <div className={styles.hadithHeroCard}>
                <span className={styles.hadithQuoteGlyph}>&ldquo;</span>
                <div className={styles.hadithBody}>
                  <span className={styles.hadithArabic}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
                  <p className={styles.hadithTranslation}>
                    &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।&rdquo; — সহীহ বুখারী
                  </p>
                </div>
              </div>

              {/* CTA Row */}
              <div className={styles.ctaRow}>
                <a
                  id="hero-register-cta"
                  className={styles.btnHeroGold}
                  href="#registration-section"
                >
                  <CreditCard size={18} />
                  <span>এখনই কোর্স রেজিস্ট্রেশন করুন (৳১,০০০)</span>
                  <ArrowRight size={17} />
                </a>
                <a
                  id="hero-whatsapp-cta"
                  className={styles.btnHeroDark}
                  href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} color="#25D366" fill="#25D366" />
                  <span>WhatsApp-এ বিস্তারিত জানুন</span>
                </a>
              </div>
            </div>

            {/* ── Right Column — Islamic Arch Card ── */}
            <div className={styles.heroRight}>
              <div className={styles.islamicArchCard}>
                <div className={styles.archTopEmblem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fajr-logo.png" alt="FAJR Academy" className={styles.archLogoImg} />
                  <div className={styles.archBrandTitle}>FAJR</div>
                  <div className={styles.archBrandSub}>Academy</div>
                </div>

                <div className={styles.archCourseTitle}>কুরআন টিচার ট্রেনিং (TOT)</div>
                <div className={styles.archCourseYear}>BATCH 2026</div>

                <div className={styles.archChecklist}>
                  {[
                    'আন্তর্জাতিক কুরআন শিক্ষণ পদ্ধতি',
                    'বাচ্চাদের হ্যান্ডলিং ও সাইকোলজি কৌশল',
                    'মাসিক ১৫,০০০–২২,০০০৳ শিক্ষক নিয়োগ',
                    'অফিসিয়াল সার্টিফিকেট ও সাপোর্ট',
                  ].map((item) => (
                    <div key={item} className={styles.archCheckItem}>
                      <div className={styles.archCheckCircle}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.archActions}>
                  <a href="#registration-section" className={styles.btnArchGold}>
                    <CreditCard size={17} />
                    <span>রেজিস্ট্রেশন করুন (৳১,০০০)</span>
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnArchDark}
                  >
                    <MessageCircle size={16} color="#25D366" fill="#25D366" />
                    <span>WhatsApp-এ সরাসরি কথা বলুন</span>
                  </a>
                </div>

                <div className={styles.archFooter}>
                  <span>— আপনার বরকতময় ক্যারিয়ারের সূচনা —</span>
                  <span className={styles.archFooterStar}>✦</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Ribbon */}
        <div className={styles.heroBottomRibbon}>
          <div className={styles.ribbonGrid}>
            <div className={styles.ribbonItem}>
              <ShieldCheck size={18} className={styles.ribbonIcon} />
              <span>বিশ্বস্ত ও অভিজ্ঞ প্রশিক্ষক প্যানেল</span>
            </div>
            <div className={styles.ribbonItem}>
              <Users size={18} className={styles.ribbonIcon} />
              <span>মহিলা ও পুরুষ – সম্পূর্ণ আলাদা ব্যাচ</span>
            </div>
            <div className={styles.ribbonItem}>
              <Monitor size={18} className={styles.ribbonIcon} />
              <span>১০০% অনলাইন লাইভ ক্লাস (ঘরে বসে)</span>
            </div>
            <div className={styles.ribbonItem}>
              <Heart size={18} className={styles.ribbonIcon} />
              <span>দুনিয়া ও আখিরাতের বরকতময় ক্যারিয়ার</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          DUAL TRACKS SHOWCASE (MEN & WOMEN)
          ════════════════════════════════════════════ */}
      <section id="tracks-section" className={styles.tracksSection}>
        <div className={styles.tracksOverlay} />
        <div className={styles.tracksContentWrap}>
          <div className={styles.tracksGrid3Col}>

            {/* Column 1: Intro */}
            <div className={styles.tracksIntroCol} data-reveal>
              <div className={styles.tracksIntroBadge}>
                <GraduationCap size={15} />
                <span>প্রফেশনাল ট্রেনিং প্রোগ্রাম</span>
              </div>

              <h2 className={styles.tracksMainH2}>
                <span className={styles.tracksH2Line}>কুরআনের আলো ছড়াতে</span>
                <span className={styles.tracksH2Line}>
                  <span className={styles.tracksH2Gold}>প্রফেশনাল</span> শিক্ষক হন
                </span>
              </h2>

              <p className={styles.tracksIntroP}>
                অভিজ্ঞ ট্রেইনার ও আন্তর্জাতিক শিক্ষক পেডাগোজির মাধ্যমে ঘরে বসেই গড়ে তুলুন দক্ষ, দায়িত্বশীল ও আত্মবিশ্বাসী কুরআন শিক্ষক হিসেবে নিজেকে।
              </p>

              <div className={styles.tracksFeaturesRow}>
                {[
                  { icon: <UserCheck size={22} />, label: '৪টি প্রফেশনাল\nহ্যান্ডস-অন সেশন' },
                  { icon: <Award size={22} />,     label: 'অভিজ্ঞ\nট্রেইনার প্যানেল' },
                  { icon: <Monitor size={22} />,   label: 'সম্পূর্ণ\nঅনলাইন লাইভ' },
                  { icon: <ShieldCheck size={22} />, label: 'সার্টিফিকেট ও\nনিয়োগ সুযোগ' },
                ].map((f) => (
                  <div key={f.label} className={styles.tracksFeatureItem}>
                    <div className={styles.tracksFeatureCircle}>{f.icon}</div>
                    <span className={styles.tracksFeatureTitle}>{f.label.replace('\n', String.fromCharCode(10))}</span>
                  </div>
                ))}
              </div>

              <div className={styles.tracksHadithBox}>
                <span className={styles.tracksHadithGlyph}>&ldquo;</span>
                <div className={styles.tracksHadithInner}>
                  <span className={styles.tracksHadithArabic}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
                  <p className={styles.tracksHadithBengali}>
                    &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।&rdquo; — সহীহ বুখারী
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: MEN Batch Card */}
            <div id="course-men" className={styles.trackCard} data-reveal>
              <div className={styles.cardImgHeader}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/men-batch.jpg" alt="TOT Men Batch 2026" className={styles.cardImg} />
                <div className={`${styles.cardBadgeLeft} ${styles.cardBadgeLeftMen}`}>
                  <User size={13} /><span>MEN BATCH</span>
                </div>
                <div className={`${styles.cardBadgeRight} ${styles.cardBadgeRightMen}`}>
                  <span className={styles.feeAmount}>৳ ১,০০০</span>
                  <span className={styles.feeSub}>কোর্স ফি</span>
                </div>
              </div>

              <div className={`${styles.cardMidBanner} ${styles.cardMidMen}`}>
                <h3 className={styles.cardMidTitle}>Training of Trainers (TOT) – MEN BATCH</h3>
                <p className={styles.cardMidSub}>
                  ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।
                </p>
              </div>

              <div className={styles.cardBody}>
                <div>
                  <div className={`${styles.cardOrientationBox} ${styles.cardOrientMen}`}>
                    <Calendar size={20} className={styles.orientCalendarIcon} />
                    <div className={styles.orientTextCol}>
                      <span className={styles.orientHeading}>First Orientation Class:</span>
                      <span className={styles.orientDateTime}>
                        {menCourse.orientationDate || '২০ সেপ্টেম্বর ২০২৬'} — {menCourse.orientationTime || 'রাত ৮:০০ টা'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardPerksList}>
                    {[
                      ['মাসিক সম্মানী:', '১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত'],
                      ['৪টি প্রফেশনাল সেশন:', 'ইসলামিক পেডাগোজি ও শিক্ষাদানের কৌশল'],
                      ['অভিজ্ঞ ট্রেইনার:', 'বিশিষ্ট আলেম ও আন্তর্জাতিক শিক্ষাবিদ'],
                      ['সার্টিফিকেট প্রদান:', 'কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট'],
                      ['Training & Grooming:', 'নিয়মিত ক্যারিয়ার গ্রোথের সুযোগ'],
                    ].map(([label, desc]) => (
                      <div key={label} className={styles.cardPerkItem}>
                        <div className={`${styles.perkCheckCircle} ${styles.perkCheckMen}`}>✓</div>
                        <span><strong>{label}</strong> {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={`${styles.trackStripPill} ${styles.stripMen}`}>
                    <Users size={14} /><span>TOT – MEN BATCH (কোর্স ফি: ৳১,০০০)</span>
                  </div>
                  <a href="#registration-section" className={`${styles.btnTrackAction} ${styles.btnTrackMen}`}>
                    <span>নিবন্ধন করুন এখনই (৳১,০০০)</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: WOMEN Batch Card */}
            <div id="course-women" className={styles.trackCard} data-reveal>
              <div className={styles.cardImgHeader}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/women-batch.jpg" alt="TOT Women Batch 014" className={styles.cardImg} />
                <div className={`${styles.cardBadgeLeft} ${styles.cardBadgeLeftWomen}`}>
                  <Sparkles size={13} /><span>WOMEN BATCH 014</span>
                </div>
                <div className={`${styles.cardBadgeRight} ${styles.cardBadgeRightWomen}`}>
                  <span className={styles.feeAmount}>৳ ১,০০০</span>
                  <span className={styles.feeSub}>কোর্স ফি</span>
                </div>
              </div>

              <div className={`${styles.cardMidBanner} ${styles.cardMidWomen}`}>
                <h3 className={styles.cardMidTitle}>Training of Trainers (TOT) – WOMEN BATCH</h3>
                <p className={styles.cardMidSub}>
                  দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার এবং সম্মানজনক উপার্জনের সুযোগ।
                </p>
              </div>

              <div className={styles.cardBody}>
                <div>
                  <div className={`${styles.cardOrientationBox} ${styles.cardOrientWomen}`}>
                    <Calendar size={20} className={styles.orientCalendarIcon} />
                    <div className={styles.orientTextCol}>
                      <span className={styles.orientHeading}>First Orientation Class:</span>
                      <span className={styles.orientDateTime}>
                        {womenCourse.orientationDate || '২১ সেপ্টেম্বর ২০২৬'} — {womenCourse.orientationTime || 'রাত ৮:০০ টা'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardPerksList}>
                    {[
                      ['মাসিক সম্মানী:', '১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত'],
                      ['৪টি প্রফেশনাল সেশন:', 'ইসলামিক পেডাগোজি ও শিক্ষাদানের কৌশল'],
                      ['অভিজ্ঞ আলেমা ট্রেইনার:', 'বিশিষ্ট নারী শিক্ষাবিদ প্যানেল'],
                      ['সার্টিফিকেট প্রদান:', 'কোর্স শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট'],
                      ['পর্দা ও গৃহকোণ সুরক্ষা:', '১০০% ঘরে বসেই পাঠদানের সুযোগ'],
                    ].map(([label, desc]) => (
                      <div key={label} className={styles.cardPerkItem}>
                        <div className={`${styles.perkCheckCircle} ${styles.perkCheckWomen}`}>✓</div>
                        <span><strong>{label}</strong> {desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className={`${styles.trackStripPill} ${styles.stripWomen}`}>
                    <Users size={14} /><span>TOT – WOMEN BATCH (কোর্স ফি: ৳১,০০০)</span>
                  </div>
                  <a href="#registration-section" className={`${styles.btnTrackAction} ${styles.btnTrackWomen}`}>
                    <span>নিবন্ধন করুন এখনই (৳১,০০০)</span>
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Pill Bar */}
          <div className={styles.tracksBottomPillBar} data-reveal>
            <div className={styles.tracksPillItem}>
              <BookMarked size={17} className={styles.tracksPillIcon} />
              <span>Build Islamic Educators</span>
            </div>
            <div className={styles.tracksPillSep} />
            <div className={styles.tracksPillItem}>
              <Handshake size={17} className={styles.tracksPillIcon} />
              <span>Empower Better Community</span>
            </div>
            <div className={styles.tracksPillSep} />
            <div className={styles.tracksPillItem}>
              <Sprout size={17} className={styles.tracksPillIcon} />
              <span>A Brighter Future for Ummah</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          REGISTRATION FORM & PAYMENT
          ════════════════════════════════════════════ */}
      <section id="registration-section" className={styles.regSectionContainer}>
        <div className={styles.regSectionOverlay} />
        <div className={styles.regContentWrap}>
          {/* Top Header */}
          <div className={styles.regTopHeader}>
            <div className={styles.regBrandLockup}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fajr-logo.png" alt="FAJR Academy Logo" className={styles.regBrandLogo} />
              <div className={styles.regBrandText}>
                <span className={styles.regBrandTitle}>FAJR Academy</span>
                <span className={styles.regBrandTag}>Learn Qur&apos;an &bull; Build Future</span>
              </div>
            </div>
            <div className={styles.regHeaderCenter}>
              <div className={styles.regEyebrow}>— ❖ আপনার দক্ষতা, আমাদের সহায়তা ❖ —</div>
              <h2 className={styles.regTitle}>কোর্স নির্বাচন ও শিক্ষক নিবন্ধন ফর্ম</h2>
              <p className={styles.regSubtitle}>
                পছন্দের ট্র্যাক নির্বাচন করে ১,০০০৳ কোর্স ফি পরিশোধের মাধ্যমে আপনার নিবন্ধন সম্পন্ন করুন।
              </p>
            </div>
            <div className={styles.regCalligraphyBadge}>
              <div className={styles.regCalligraphyText}>
                আসুন<br />শিক্ষার আলো<br />ছড়াই...
              </div>
            </div>
          </div>

          <RegistrationForm initialTrack="men" courses={sanitizedCourses} />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY FAJR ACADEMY
          ════════════════════════════════════════════ */}
      <section id="why-fajr" className={`${styles.section} ${styles.why}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>কেন ফজর একাডেমি টিওটি</span>
            <h2>প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার — একটি স্বচ্ছ ও বরকতময় পথ</h2>
            <p>
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ নিশ্চিত করে।
            </p>
          </div>
          <div className={styles.whyGrid}>
            {[
              { num: '০১', title: 'ঘরে বসেই সম্পূর্ণ কাজ', body: 'কোনো ট্রাফিক জ্যাম নেই, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার ক্লাস ঘরে বসেই ল্যাপটপে সম্পন্ন করতে পারবেন।' },
              { num: '০২', title: 'মাসিক সম্মানী ১৫,০০০ – ২২,০০০৳', body: 'কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী হালাল ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।' },
              { num: '০৩', title: 'বিনামূল্যে ল্যাপটপ ও ডিভাইস সাপোর্ট', body: 'আপনার যদি কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সহায়তা প্রদান করবে।' },
              { num: '০৪', title: 'কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট', body: '৪টি প্রফেশনাল সেশন শেষে অফিসিয়াল সার্টিফিকেট প্রদান এবং নিয়মিত গ্রুমিং ও স্কিল ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ার বৃদ্ধি।' },
            ].map((c) => (
              <div key={c.num} className={styles.whyCard} data-reveal>
                <div className={styles.ic}>{c.num}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROCESS TIMELINE
          ════════════════════════════════════════════ */}
      <section id="process-section" className={`${styles.section} ${styles.process}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>নিবন্ধন থেকে নিয়োগের ধাপসমূহ</span>
            <h2>মাত্র ৪টি ধাপে হয়ে উঠুন একজন প্রফেশনাল শিক্ষক</h2>
          </div>
          <div className={styles.timeline}>
            {[
              { num: '০১', title: 'রেজিস্ট্রেশন ও ১,০০০৳ ফি',     body: 'পছন্দের ট্র্যাক (Men / Women Batch 014) নির্বাচন করে ১,০০০ টাকা ফি পরিশোধ করে নিবন্ধন সম্পন্ন করুন।' },
              { num: '০২', title: 'লাইভ ওরিয়েন্টেশন ক্লাস',       body: 'পুরুষদের ২০ সেপ্টেম্বর এবং নারীদের ২১ সেপ্টেম্বর রাত ৮:০০ টায় জুম/মিটে লাইভ ওরিয়েন্টেশন ক্লাসে যুক্ত হোন।' },
              { num: '০৩', title: '৪টি প্রফেশনাল TOT সেশন',        body: '১ মাসে ৪টি হ্যান্ডস-অন সেশনে বাচ্চাদের কুরআন ও ইংরেজি শেখানোর আধুনিক পেডাগোজি কৌশল আয়ত্ত করুন।' },
              { num: '০৪', title: 'সার্টিফিকেট ও জব অফার',         body: 'মূল্যায়নে সার্টিফিকেট অর্জন এবং ফজর একাডেমির গ্লোবাল শিক্ষক প্যানেলে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।' },
            ].map((s) => (
              <div key={s.num} className={styles.tlStep} data-reveal>
                <div className={styles.tlNum}>{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          REQUIREMENTS & FEE
          ════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.reqFee}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>প্রয়োজনীয় যোগ্যতা ও ফি</span>
            <h2>আবেদনের সাধারণ যোগ্যতা ও পেমেন্ট সংক্রান্ত তথ্য</h2>
          </div>
          <div className={styles.rfGrid}>
            {/* Requirements */}
            <div className={`${styles.card} ${styles.reqCard}`} data-reveal>
              <h3>আবেদনের সাধারণ যোগ্যতা</h3>
              <ul className={styles.reqList}>
                {[
                  'শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা',
                  'প্রাথমিক ইংরেজি জানা এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)',
                  'ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তার সুযোগ)',
                  'স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর',
                  'হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয় — শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন',
                ].map((item) => (
                  <li key={item}>
                    <span className={styles.check}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fee Card */}
            <div className={`${styles.card} ${styles.feeCard}`} data-reveal>
              <span className={styles.feeCardEyebrow}>কোর্স ফি ও পেমেন্ট তথ্য</span>
              <h3>এককালীন রেজিস্ট্রেশন ফি</h3>
              <div className={styles.feeAmount}>
                <sup>৳</sup>১,০০০
              </div>
              <div className={styles.feeRows}>
                {[
                  ['পেমেন্ট গেটওয়ে',         'SSLCommerz (বিকাশ, নগদ, কার্ড ও ব্যাংক)'],
                  ['বিকাশ মার্চেন্ট নম্বর',   '01410764581'],
                  ['রেফারেন্স',                'TOT-MEN অথবা TOT-WOMEN'],
                  ['হটলাইন / WhatsApp',        '01641028312'],
                ].map(([label, value]) => (
                  <div key={label} className={styles.feeRow}>
                    <span>{label}</span><b>{value}</b>
                  </div>
                ))}
              </div>
              <p className={styles.feeNote}>
                নিবন্ধন ফর্মে সরাসরি SSLCommerz-এর মাধ্যমে অথবা বিকাশ মার্চেন্টে পেমেন্ট করে তাৎক্ষণিক WhatsApp-এ ট্রানজেকশন আইডি পাঠিয়ে নিশ্চিত হতে পারেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VIDEO SHOWCASE & FOUNDER NOTE
          ════════════════════════════════════════════ */}
      <section id="program-videos" className={`${styles.section} ${styles.media}`}>
        <div className={`${styles.wrap} ${styles.mediaGrid}`}>
          <div className={styles.sectionHead} data-reveal style={{ textAlign: 'center', margin: '0 auto 10px' }}>
            <span className={styles.eyebrow}>অফিসিয়াল ভিডিও নির্দেশিকা</span>
            <h2>কুরআন টিচার ট্রেনিং ও ওরিয়েন্টেশন ভিডিও</h2>
            <p>
              পুরুষ ও নারী উভয় কোর্সের ট্রেনিং পদ্ধতি, ক্লাসরুম পেডাগোজি ও ক্যারিয়ার সম্ভাবনার ভিডিওগুলো সরাসরি দেখে নিন।
            </p>
          </div>

          <div className={styles.mediaVideosGrid}>
            {/* Men Video */}
            <div className={styles.videoCardContainer} data-reveal>
              <div className={styles.videoBadgeMen}>
                <span>👨‍🏫 TOT – MEN শিক্ষক প্রশিক্ষণ ভিডিও</span>
              </div>
              <div className={styles.videoCard}>
                <iframe
                  src="https://www.youtube.com/embed/UxzqLHfjrGc?rel=0&controls=1&playsinline=1"
                  title="Fajr Academy Men Teacher Training Program Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.videoIframe}
                />
              </div>
              <p className={styles.videoTitle}>পুরুষদের ওরিয়েন্টেশন ও জব গাইডলাইন</p>
            </div>

            {/* Women Video */}
            <div className={styles.videoCardContainer} data-reveal>
              <div className={styles.videoBadgeWomen}>
                <span>🧕 TOT – WOMEN Batch 014 ভিডিও</span>
              </div>
              <div className={styles.videoCard}>
                <iframe
                  src="https://www.youtube.com/embed/zPXTzup-2ok?rel=0&controls=1&playsinline=1"
                  title="Fajr Academy Women Teacher Training Program Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={styles.videoIframe}
                />
              </div>
              <p className={styles.videoTitle}>দ্বীনি বোনদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড</p>
            </div>
          </div>

          {/* Founder Note */}
          <div className={styles.founderNote} data-reveal>
            <span className={styles.quoteMark}>&ldquo;</span>
            <p>
              &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — খইরুকুম মান তাআল্লামাল কুরআনা ওয়া আল্লামাহু। আপনি যদি শুদ্ধভাবে কুরআন পড়তে পারেন এবং বেসিক ইংলিশ জানা থাকে, তাহলে ফজর একাডেমির এই টিওটি প্রোগ্রামে জয়েন করে আপনি ঘরে বসেই ১৫ থেকে ২২ হাজার টাকা মাসিক সম্মানীতে একটি সুন্দর হালাল ক্যারিয়ার গড়তে পারবেন। যাদের ল্যাপটপ নেই কিন্তু কুরআন ও ইংলিশে ভালো, ফজর একাডেমি নিজে থেকেই তাদের ল্যাপটপ সহায়তা প্রদান করবে, ইনশাআল্লাহ।&rdquo;
            </p>
            <div className={styles.founderId}>
              <div className={styles.founderAv}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/founder.jpg" alt="Hafiz Maowlana Muhammad Farabi Chowdhury" />
              </div>
              <div>
                <b>Hafiz Maowlana Muhammad Farabi Chowdhury</b>
                <span>Founder &amp; CEO, Fajr Academy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════ */}
      <section id="faq" className={`${styles.section} ${styles.faq}`}>
        <div className={`${styles.wrap} ${styles.faqContainer}`}>
          <div className={styles.sectionHead} data-reveal style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            <span className={styles.eyebrow}>সাধারণ প্রশ্ন ও উত্তর</span>
            <h2>আপনার মনে থাকা প্রশ্নগুলোর উত্তর</h2>
          </div>
          <div className={styles.faqList}>
            {[
              {
                q: 'পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে হবে?',
                a: 'পুরুষদের (TOT - MEN) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২০ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>। নারীদের (TOT - WOMEN Batch 014) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২১ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>।',
              },
              {
                q: 'কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?',
                a: 'উভয় কোর্সের এককালীন রেজিস্ট্রেশন ফি ১,০০০ টাকা। আপনি উপরের ফর্ম পূরণ করে SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, ডেবিট/ক্রেডিট কার্ড অথবা সরাসরি বিকাশ মার্চেন্ট নম্বরে (01410764581) পেমেন্ট করতে পারেন।',
              },
              {
                q: 'ল্যাপটপ বা কম্পিউটার না থাকলে কি আবেদন করা যাবে?',
                a: 'হ্যাঁ! আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজ তহবিল থেকে প্রার্থীদের ল্যাপটপ/ডিভাইস সহায়তা সুবিধা প্রদান করবে, ইনশাআল্লাহ।',
              },
              {
                q: 'আমাকে কি হাফিজ বা আলেম হতে হবে?',
                a: 'না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট। ক্লাসে বাচ্চাদের কীভাবে পড়াতে হয় তা ফজর একাডেমির ৪টি সেশনে হাতে-কলমে শেখানো হবে।',
              },
              {
                q: 'প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?',
                a: 'একদমই না! যারা প্রথম ধাপে চূড়ান্তভাবে নির্বাচিত হবেন না, তাদেরকে বাদ না দিয়ে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট করানো হবে যাতে পরবর্তী ধাপে তারা সফলভাবে শিক্ষক হিসেবে জয়েন করতে পারেন।',
              },
              {
                q: 'শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?',
                a: 'ট্রেনিং সম্পন্ন করে ফজর একাডেমিতে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।',
              },
            ].map((faq, i) => (
              <details key={i} className={styles.faqDetails} data-reveal>
                <summary className={styles.faqSummary}>{faq.q}</summary>
                <p
                  className={styles.faqText}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <div className={styles.wrap}>
          <span className={styles.finalCtaEyebrow}>Batch 2026 · সীমিত আসন সংখ্যা</span>
          <h2>আজই আপনার আসন নিশ্চিত করুন, কুরআনের খেদমতে যুক্ত হোন</h2>
          <p>
            ফর্ম পূরণ করে ১,০০০ টাকা রেজিস্ট্রেশন ফি প্রদান করুন। যেকোনো তথ্যের জন্য সরাসরি আমাদের WhatsApp হটলাইনে মেসেজ দিন।
          </p>
          <div className={styles.finalCtaRow}>
            <a
              id="footer-register-cta"
              className={`${styles.btn} ${styles.btnGold}`}
              href="#registration-section"
            >
              রেজিস্ট্রেশন ফর্মে যান (৳১,০০০) →
            </a>
            <a
              id="footer-call-cta"
              className={`${styles.btn} ${styles.btnOutline}`}
              href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} color="#25D366" fill="#25D366" />
              <span>01641028312 নম্বরে WhatsApp করুন</span>
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer id="footer-section" className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTopRow}>
            <div className={styles.footerBrandEmblem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fajr-logo.png" alt="Fajr Academy" className={styles.footerLogoImg} />
              <span className={styles.footerBrandName}>FAJR ACADEMY</span>
            </div>
            <p className={styles.footerTagline}>
              Balanced Education for Dunya and Akhirah — Training of Trainers (TOT) Program
            </p>
          </div>

          {/* SSLCommerz */}
          <div className={styles.sslPaymentCard}>
            <div className={styles.sslCardHeader}>
              <div className={styles.sslCardBadge}>🔒 OFFICIAL PAYMENT GATEWAY PARTNER</div>
              <div className={styles.sslSecurityBadge}>256-BIT SSL ENCRYPTED &amp; VERIFIED</div>
            </div>
            <div className={styles.sslWhiteContainer}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.sslcommerz.com/"
                title="SSLCommerz - 100% Secure Payment Gateway"
                className={styles.sslPayWithLink}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
                  alt="SSLCommerz Pay With - Visa, Mastercard, AMEX, bKash, Nagad, Rocket, MFS and Internet Banking"
                  className={styles.sslPayWithImg}
                />
              </a>
            </div>
            <div className={styles.sslCardFooterInfo}>
              {[
                'ভিসা, মাস্টারকার্ড ও অ্যামেক্স',
                'বিকাশ, নগদ, রকেট ও সকল মোবাইল ব্যাংকিং',
                'ইন্টারনেট ব্যাংকিং ও ইনস্ট্যান্ট ভেরিফিকেশন',
              ].map((item) => (
                <div key={item} className={styles.sslFeatureItem}>
                  <span className={styles.sslCheckIcon}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.footerBottomRow}>
            <div className={styles.footerContactLinks}>
              <span>হটলাইন: <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer">01641028312</a></span>
              <span>•</span>
              <span>হেল্পলাইন: <a href="https://wa.me/8801857381244" target="_blank" rel="noopener noreferrer">+880 1857-381244</a></span>
              <span>•</span>
              <span>ইমেইল: <a href="mailto:info@fajracademy.io">info@fajracademy.io</a></span>
            </div>
            <div className={styles.footerCopyright}>
              © 2026 Fajr Academy. All rights reserved. Registered Islamic Education Institute.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </div>
  )
}
