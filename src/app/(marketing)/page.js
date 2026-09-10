import styles from './page.module.css'
import RevealObserver from './RevealObserver'
import RegistrationForm from './RegistrationForm'
import { BASE_URL } from '@/constant'
import { dbConnect } from '@/service/mongo'
import { CourseModel } from '@/model/course-model'
import {
  Home,
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
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL = `https://${BASE_URL}`
const PAGE_URL = `${SITE_URL}/`


/* ------------------------------------------------------------------ */
/*  Page-level SEO metadata                                            */
/* ------------------------------------------------------------------ */
export const metadata = {
  title: 'কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) — পুরুষ ও নারী ব্যাচ | ফজর একাডেমি',
  description:
    'ফজর একাডেমির সম্পূর্ণ অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে (TOT) নিবন্ধন করুন। পুরুষদের ব্যাচ (ওরিয়েন্টেশন ২০ সেপ্টেম্বর) ও নারীদের ব্যাচ ০১৪ (ওরিয়েন্টেশন ২১ সেপ্টেম্বর)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী!',
  alternates: {
    canonical: PAGE_URL,
  },
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
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
        width: 80,
        height: 80,
      },
      description: 'Balanced Education for Dunya and Akhirah — Online Quran Teacher Training in Bangladesh.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+8801641028312',
        availableLanguage: ['Bengali', 'English'],
        contactOption: 'TollFree',
      },
      sameAs: [
        'https://wa.me/8801641028312',
        'https://youtube.com/shorts/zPXTzup-2ok',
      ],
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-men`,
      name: 'Training of Trainers (TOT) – MEN',
      description:
        'ছেলেদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী। ফার্স্ট ওরিয়েন্টেশন ২০ সেপ্টেম্বর রাত ৮টা।',
      url: PAGE_URL,
      provider: {
        '@type': 'Organization',
        name: 'Fajr Academy',
        sameAs: SITE_URL,
      },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      numberOfCredits: 4,
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: PAGE_URL,
      },
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-women`,
      name: 'Training of Trainers (TOT) – WOMEN (Batch 014)',
      description:
        'দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ (Batch 014)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী। ফার্স্ট ওরিয়েন্টেশন ২১ সেপ্টেম্বর রাত ৮টা।',
      url: PAGE_URL,
      provider: {
        '@type': 'Organization',
        name: 'Fajr Academy',
        sameAs: SITE_URL,
      },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      numberOfCredits: 4,
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: PAGE_URL,
      },
    },
    {
      '@type': 'WebPage',
      '@id': PAGE_URL,
      url: PAGE_URL,
      name: 'কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) | ফজর একাডেমি',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${PAGE_URL}#course-men` },
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
    summary:
      'ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।',
  }

  const womenCourse = courses?.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) – WOMEN',
    tag: '🧕 নারীদের জন্য · Batch 014 (Batch 013 চলমান)',
    fee: 1000,
    orientationDate: '২১ সেপ্টেম্বর',
    orientationTime: 'রাত ৮:০০ টা',
    summary:
      'জেনারেল লাইনে পড়ালিখা করা দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুযোগ।',
  }

  const sanitizedCourses = JSON.parse(JSON.stringify(courses || []))

  return (
    <div className={styles.pageRoot}>
      {/* ── JSON-LD Structured Data ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Scroll-reveal wiring (client-only, renders nothing) ─── */}
      <RevealObserver />

      {/* ════════════════════════════════════════════════════════
          TOP BAR
          ════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════
          HEADER (Matching Reference Image)
          ════════════════════════════════════════════════════════ */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* ── Brand Logo & Slogan ── */}
          <a href="#" className={styles.brand}>
            <div className={styles.brandCrest}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fajr-logo.png" alt="FAJR Academy" className={styles.brandLogoImg} />
              <div className={styles.brandLogoText}>
                <span className={styles.brandLogoTitle}>FAJR</span>
                <span className={styles.brandLogoSub}>Academy</span>
              </div>
            </div>
            <div className={styles.brandDivider} />
            <div className={styles.brandSlogan}>
              <span className={styles.brandSloganMain}>Balanced Education for</span>
              <span className={styles.brandSloganAccent}>Dunya &amp; Akhirah</span>
            </div>
          </a>

          {/* ── Center Nav Menu ── */}
          <nav className={styles.navMenu}>
            <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
              <Home size={15} color="#F5B335" />
              <span>Home</span>
            </a>
            <a href="#tracks-section" className={styles.navItem}>
              Courses
            </a>
            <a href="#why-fajr" className={styles.navItem}>
              About
            </a>
            <a href="#footer-section" className={styles.navItem}>
              Contact
            </a>
          </nav>

          {/* ── Right Actions & WhatsApp ── */}
          <div className={styles.headerActions}>
            <a href="#course-men" className={styles.pillBadge}>
              <div className={`${styles.badgeIconCircle} ${styles.badgeIconBlue}`}>
                <User size={12} />
              </div>
              <div className={styles.badgeTextCol}>
                <span className={styles.badgeTitle}>TOT for Men</span>
                <span className={styles.badgeSub}>Batch 014</span>
              </div>
            </a>

            <a href="#course-women" className={styles.pillBadge}>
              <div className={`${styles.badgeIconCircle} ${styles.badgeIconPink}`}>
                <User size={12} />
              </div>
              <div className={styles.badgeTextCol}>
                <span className={styles.badgeTitle}>TOT for Women</span>
                <span className={styles.badgeSub}>Batch 014</span>
              </div>
            </a>

            <div className={styles.pillPrice}>
              <Tag size={14} color="#F8CE67" />
              <span>৳ 19,000</span>
            </div>

            <a
              href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerWhatsappBtn}
            >
              <div className={styles.whatsappIconBox}>
                <MessageCircle size={16} fill="#fff" color="#25D366" />
              </div>
              <div className={styles.whatsappTextBox}>
                <span className={styles.whatsappNum}>01641028312</span>
                <span className={styles.whatsappLabel}>WhatsApp Us</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO SECTION (Cinematic Islamic Design matching reference)
          ════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroContentWrap}>
          <div className={styles.heroGrid}>
            {/* ── Left Column ── */}
            <div className={styles.heroLeft}>
              <div className={styles.heroBadgeRow}>
                <span className={styles.heroPillGold}>TRAINING OF TRAINERS (TOT) • 2 SESSIONS</span>
                <span className={styles.heroPillGroup}>
                  <Users size={14} color="#F8E29E" />
                  <span>Men &amp; Women Tracks</span>
                </span>
              </div>

              <h1 className={styles.heroH1}>
                <span className={styles.heroH1Line}>শুদ্ধভাবে কুরআন ও</span>
                <span className={styles.heroH1Line}>ইংরেজি জানেন?</span>
                <span className={`${styles.heroH1Line} ${styles.heroH1Accent}`}>ঘরে বসেই হয়ে উঠুন</span>
                <span className={styles.heroH1Line}>প্রফেশনাল কুরআন টিচার</span>
              </h1>

              <p className={styles.heroLede}>
                ফজর একাডেমি নিয়ে এসেছে মাত্র ২ দিনের অনলাইন প্রশিক্ষণ (TOT) কোর্স, যেখানে আপনি শিখবেন কুরআন শিক্ষাদানের আধুনিক পদ্ধতি, সহজ টেকনিক এবং প্রফেশনাল স্কিল। ঘরে বসেই গড়ে তুলুন একটি সম্মানজনক ক্যারিয়ার — আল্লাহর পথে, মানুষের কাছে।
              </p>

              {/* ── 4 Feature highlight pills ── */}
              <div className={styles.heroFeaturePillRow}>
                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}>
                    <BookOpen size={18} />
                  </div>
                  <div className={styles.heroFeatureText}>
                    কুরআন শিক্ষার<br />আধুনিক পদ্ধতি
                  </div>
                </div>

                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}>
                    <UserCheck size={18} />
                  </div>
                  <div className={styles.heroFeatureText}>
                    প্রফেশনাল<br />টিচার ট্রেনিং
                  </div>
                </div>

                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}>
                    <Award size={18} />
                  </div>
                  <div className={styles.heroFeatureText}>
                    সার্টিফিকেট<br />প্রদান করা হবে
                  </div>
                </div>

                <div className={styles.heroFeatureItem}>
                  <div className={styles.heroFeatureIcon}>
                    <Clock size={18} />
                  </div>
                  <div className={styles.heroFeatureText}>
                    ২ দিনের<br />ইন্টেনসিভ ট্রেনিং
                  </div>
                </div>
              </div>

              {/* ── Hadith Callout Box ── */}
              <div className={styles.hadithHeroCard}>
                <span className={styles.hadithQuoteGlyph}>“</span>
                <div className={styles.hadithBody}>
                  <span className={styles.hadithArabic}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
                  <p className={styles.hadithTranslation}>
                    &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।&rdquo; — হাদিস শরীফ
                  </p>
                </div>
              </div>

              {/* ── CTA Row ── */}
              <div className={styles.ctaRow}>
                <a
                  id="hero-register-cta"
                  className={styles.btnHeroGold}
                  href="#registration-section"
                >
                  <MessageCircle size={18} fill="#071326" color="#071326" />
                  <span>এখনই কোর্স রেজিস্ট্রেশন করুন (৳১৯,০০০)</span>
                  <ArrowRight size={17} />
                </a>

                <a
                  id="hero-whatsapp-cta"
                  className={styles.btnHeroDark}
                  href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} color="#25D366" />
                  <span>WhatsApp-এ বিস্তারিত করুন</span>
                </a>
              </div>
            </div>

            {/* ── Right Column — Islamic Arched Card ── */}
            <div className={styles.heroRight}>
              <div className={styles.islamicArchCard}>
                <div className={styles.archTopEmblem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fajr-logo.png" alt="FAJR Academy" className={styles.archLogoImg} />
                  <div className={styles.archBrandTitle}>FAJR</div>
                  <div className={styles.archBrandSub}>Academy</div>
                </div>

                <div className={styles.archCourseTitle}>কুরআন টিচার ট্রেনিং</div>
                <div className={styles.archCourseYear}>২০২৬</div>

                <div className={styles.archChecklist}>
                  <div className={styles.archCheckItem}>
                    <div className={styles.archCheckCircle}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>কুরআন শিক্ষার আধুনিক কৌশল</span>
                  </div>

                  <div className={styles.archCheckItem}>
                    <div className={styles.archCheckCircle}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>প্রফেশনাল মেন্টরগাইডেন্স</span>
                  </div>

                  <div className={styles.archCheckItem}>
                    <div className={styles.archCheckCircle}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>সাপোর্টেড কমিউনিটি</span>
                  </div>

                  <div className={styles.archCheckItem}>
                    <div className={styles.archCheckCircle}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>সার্টিফিকেট প্রদান</span>
                  </div>
                </div>

                <div className={styles.archActions}>
                  <a href="#registration-section" className={styles.btnArchGold}>
                    <CreditCard size={17} />
                    <span>রেজিস্ট্রেশন করুন</span>
                    <ArrowRight size={16} />
                  </a>

                  <a
                    href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnArchDark}
                  >
                    <MessageCircle size={16} color="#25D366" />
                    <span>WhatsApp-এ বিস্তারিত করুন</span>
                  </a>
                </div>

                <div className={styles.archFooter}>
                  <span>— আপনার উজ্জ্বল ভবিষ্যতের জন্য —</span>
                  <span className={styles.archFooterStar}>✦</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Full-width Bottom Ribbon Bar ── */}
        <div className={styles.heroBottomRibbon}>
          <div className={styles.ribbonGrid}>
            <div className={styles.ribbonItem}>
              <ShieldCheck size={18} className={styles.ribbonIcon} />
              <span>বিশ্বস্ত ও অভিজ্ঞ প্রশিক্ষক</span>
            </div>

            <div className={styles.ribbonItem}>
              <Users size={18} className={styles.ribbonIcon} />
              <span>মহিলা ও পুরুষ – আলাদা ব্যাচ</span>
            </div>

            <div className={styles.ribbonItem}>
              <Calendar size={18} className={styles.ribbonIcon} />
              <span>অনলাইন (ঘরে বসে)</span>
            </div>

            <div className={styles.ribbonItem}>
              <Heart size={18} className={styles.ribbonIcon} />
              <span>দুনিয়া ও আখিরাতের জন্য উপকারী</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2 SESSIONS / DUAL TRACKS SHOWCASE (MEN & WOMEN)
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.tracksSection}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>২টি বিশেষায়িত কোর্স সেশন</span>
            <h2>ছেলে ও নারীদের জন্য ২টি আলাদা ট্রেনিং ট্র্যাক</h2>
            <p>
              আপনার সুবিধাজনক ট্র্যাকটি বেছে নিন। প্রতিটি কোর্সে রয়েছে ৪টি লাইভ ইন্টারেক্টিভ ট্রেনিং সেশন, ভেরিফায়েড সার্টিফিকেট এবং ফজর একাডেমিতে সরাসরি শিক্ষক নিয়োগের সুযোগ।
            </p>
          </div>

          <div className={styles.dualTrackGrid}>
            {/* ──────── TRACK 1: TOT - MEN ──────── */}
            <div className={`${styles.courseCard} ${styles.menCourseCard}`} data-reveal>
              <div className={styles.courseCardHeader}>
                <div className={styles.courseTagMen}>{menCourse.tag || '👨‍🏫 পুরুষদের জন্য বিশেষায়িত'}</div>
                <div className={styles.courseFeePill}>ফি: ৳{menCourse.fee || 1000}</div>
              </div>

              <h3 className={styles.courseTitle}>{menCourse.name || 'Training of Trainers (TOT) – MEN'}</h3>
              <p className={styles.courseSummary}>
                {menCourse.summary || 'ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।'}
              </p>

              <div className={styles.orientationAlert}>
                <span className={styles.orientIcon}>🔔</span>
                <div>
                  <strong>First Orientation Class:</strong>
                  <div className={styles.orientDate}>{menCourse.orientationDate} · {menCourse.orientationTime}</div>
                </div>
              </div>

              <div className={styles.perksList}>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>মাসিক সম্মানী:</strong> ১৫,০০০ থেকে ২২,০০০ টাকা অফার</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>১ মাসে ৪টি প্রফেশনাল ট্রেনিং:</strong> বাচ্চাদের পড়ানোর কৌশল ও ক্লাসরুম ম্যানেজমেন্ট</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>ল্যাপটপ / ডিভাইস সহায়তা:</strong> কুরআন ও ইংরেজিতে দক্ষ কিন্তু ল্যাপটপ নেই? ফজর একাডেমি থেকে ল্যাপটপ সাপোর্ট সুবিধা</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>হাফিজ/আলেম হওয়া বাধ্যতামূলক নয়:</strong> শুদ্ধ কুরআন তিলাওয়াত ও বেসিক ইংরেজি জানা থাকলেই যথেষ্ট</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>কন্টিনিউয়াস ট্রেনিং:</strong> প্রথম ধাপে নির্বাচিত না হলেও স্কিল গ্রুমিং ও ট্রেনিং চলমান থাকবে</span>
                </div>
              </div>

              <div className={styles.courseCardFooter}>
                <a href="#registration-section" className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}>
                  {menCourse.name} কোর্সে নিবন্ধন করুন (৳{menCourse.fee || 1000}) →
                </a>
                <a href="#program-videos" className={styles.btnWatchVideo}>
                  ▶️ পুরুষদের ওরিয়েন্টেশন ভিডিও দেখুন
                </a>
              </div>
            </div>

            {/* ──────── TRACK 2: TOT - WOMEN (Batch 014) ──────── */}
            <div className={`${styles.courseCard} ${styles.womenCourseCard}`} data-reveal>
              <div className={styles.courseCardHeader}>
                <div className={styles.courseTagWomen}>{womenCourse.tag || '🧕 নারীদের জন্য · Batch 014 (Batch 013 চলমান)'}</div>
                <div className={styles.courseFeePill}>ফি: ৳{womenCourse.fee || 1000}</div>
              </div>

              <h3 className={styles.courseTitle}>{womenCourse.name || 'Training of Trainers (TOT) – WOMEN'}</h3>
              <p className={styles.courseSummary}>
                {womenCourse.summary || 'জেনারেল লাইনে পড়ালিখা করা দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুযোগ।'}
              </p>

              <div className={styles.orientationAlert}>
                <span className={styles.orientIcon}>🔔</span>
                <div>
                  <strong>First Orientation Class:</strong>
                  <div className={styles.orientDate}>{womenCourse.orientationDate} · {womenCourse.orientationTime}</div>
                </div>
              </div>

              <div className={styles.perksList}>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>মাসিক সম্মানী:</strong> ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত জব অপরচুনিটি</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>১ মাসে ৪টি প্রফেশনাল ট্রেনিং:</strong> অনলাইনে বাচ্চাদের সাইকোলজি অনুযায়ী পাঠদান</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>স্বীকৃত সার্টিফিকেট:</strong> প্রতিটি ট্রেনিং সফলভাবে সম্পন্ন করলে অফিসিয়াল সার্টিফিকেট প্রদান</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>সরাসরি শিক্ষক নিয়োগ:</strong> ট্রেনিং শেষে ভালো পারফর্ম করা ট্রেইনারদের Fajr Academy-তে নিয়োগ</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>Training &amp; Development:</strong> যারা প্রথম ধাপে নির্বাচিত হবেন না, তাদের নিয়েও ডেভেলপমেন্ট চলতে থাকবে</span>
                </div>
              </div>

              <div className={styles.courseCardFooter}>
                <a href="#registration-section" className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}>
                  {womenCourse.name} কোর্সে নিবন্ধন করুন (৳{womenCourse.fee || 1000}) →
                </a>
                <a href="#program-videos" className={styles.btnWatchVideo}>
                  ▶️ নারীদের ওরিয়েন্টেশন ভিডিও দেখুন
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          INTERACTIVE REGISTRATION FORM & PAYMENT (2 COURSES)
          ════════════════════════════════════════════════════════ */}
      <section id="registration-section" className={`${styles.section} ${styles.regSectionContainer}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            <span className={styles.eyebrow}>অনলাইন ভর্তি ও পেমেন্ট</span>
            <h2>কোর্স নির্বাচন ও শিক্ষার্থী নিবন্ধন ফর্ম</h2>
            <p>
              নিচে আপনার কাঙ্ক্ষিত কোর্স ট্র্যাকটি নির্বাচন করুন এবং বিকাশ / কার্ড / SSLCommerz পেমেন্ট সম্পন্ন করে কোর্স নিশ্চিত করুন।
            </p>
          </div>

          <RegistrationForm initialTrack="men" courses={sanitizedCourses} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY FAJR ACADEMY & VIDEO HIGHLIGHTS
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.why}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>কেন ফজর একাডেমি টিওটি</span>
            <h2>প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার — একটি স্বচ্ছ ও বরকতময় পথ</h2>
            <p>
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ নিশ্চিত করে।
            </p>
          </div>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>১</div>
              <h3>ঘরে বসেই সম্পূর্ণ কাজ</h3>
              <p>
                আপনাকে কোনো ট্রাফিক জ্যামে পড়তে হবে না, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার কাজ ঘরে বসেই ল্যাপটপে সম্পন্ন করতে পারবেন।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>২</div>
              <h3>সম্মানী ১৫,০০০ – ২২,০০০৳</h3>
              <p>
                কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>৩</div>
              <h3>ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
              <p>
                আপনার যদি কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সাপোর্ট প্রদান করবে।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>৪</div>
              <h3>কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট</h3>
              <p>
                ৪টি প্রফেশনাল সেশন শেষে প্রদান করা হবে অফিসিয়াল সার্টিফিকেট এবং যারা প্রথম ধাপে টিকবেন না তাদের নিয়মিত গ্রুমিং ও ডেভেলপমেন্ট করা হবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROCESS TIMELINE (4 STEPS)
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.process}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>ধাপসমূহ</span>
            <h2>নিবন্ধন থেকে শিক্ষক হিসেবে নিয়োগের ৪টি ধাপ</h2>
          </div>
          <div className={styles.timeline}>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০১</div>
              <h3>রেজিস্ট্রেশন ও ১,০০০৳ ফি</h3>
              <p>পছন্দের ট্র্যাক (Men / Women Batch 014) নির্বাচন করে ১,০০০ টাকা বিকাশ পেমেন্ট সম্পন্ন করুন।</p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০২</div>
              <h3>ওরিয়েন্টেশন ক্লাস</h3>
              <p>
                পুরুষদের ২০ সেপ্টেম্বর এবং নারীদের ২১ সেপ্টেম্বর রাত ৮:০০ টায় জুম/মিটে লাইভ ওরিয়েন্টেশন ক্লাসে যুক্ত হোন।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৩</div>
              <h3>৪টি প্রফেশনাল TOT সেশন</h3>
              <p>
                ১ মাসে ৪টি হ্যান্ডস-অন সেশনে বাচ্চাদের কুরআন ও ইংরেজি শেখানোর আধুনিক কৌশল আয়ত্ত করুন।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৪</div>
              <h3>সার্টিফিকেট ও জব অফার</h3>
              <p>
                সফল মূল্যায়নে সার্টিফিকেট অর্জন এবং ফজর একাডেমির শিক্ষক প্যানেলে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          REQUIREMENTS + FEE INFO
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.reqFee}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>প্রয়োজনীয় যোগ্যতা ও ফি</span>
            <h2>আবেদনের যোগ্যতা ও পেমেন্ট সংক্রান্ত তথ্য</h2>
          </div>
          <div className={styles.rfGrid}>
            {/* Requirements */}
            <div className={`${styles.card} ${styles.reqCard}`} data-reveal>
              <h3>আবেদনের সাধারণ যোগ্যতা</h3>
              <ul className={styles.reqList}>
                <li>
                  <span className={styles.check}>✓</span>
                  শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  প্রাথমিক ইংরেজি জানা এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তার সুযোগ)
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয় — শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন
                </li>
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
                <div className={styles.feeRow}>
                  <span>বিকাশ মার্চেন্ট নম্বর</span>
                  <b>01410764581</b>
                </div>
                <div className={styles.feeRow}>
                  <span>পেমেন্ট মেথড</span>
                  <b>বিকাশ অ্যাপ · Make Payment</b>
                </div>
                <div className={styles.feeRow}>
                  <span>রেফারেন্স</span>
                  <b>TOT-MEN অথবা TOT-WOMEN</b>
                </div>
                <div className={styles.feeRow}>
                  <span>হটলাইন / WhatsApp</span>
                  <b>01641028312</b>
                </div>
              </div>
              <p className={styles.feeNote}>
                পেমেন্ট সম্পন্ন করার পর প্রাপ্ত TrxID দিয়ে উপরের ফর্মে রেজিস্ট্রেশন নিশ্চিত করুন অথবা সরাসরি WhatsApp-এ ট্রানজেকশন স্ক্রিনশট পাঠান।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          OFFICIAL VIDEO SHOWCASE (MEN & WOMEN) & FOUNDER NOTE
          ════════════════════════════════════════════════════════ */}
      <section id="program-videos" className={`${styles.section} ${styles.media}`}>
        <div className={`${styles.wrap} ${styles.mediaGrid}`}>
          {/* Section Heading */}
          <div className={styles.sectionHead} data-reveal style={{ textAlign: 'center', margin: '0 auto 10px' }}>
            <span className={styles.eyebrow}>অফিসিয়াল ভিডিও নির্দেশিকা</span>
            <h2>কুরআন টিচার ট্রেনিং ও ওরিয়েন্টেশন ভিডিও</h2>
            <p>
              পুরুষ ও নারী উভয় কোর্সের ট্রেনিং পদ্ধতি, ক্লাসরুম পেডাগোজি ও ক্যারিয়ার সম্ভাবনার ভিডিওগুলো সরাসরি দেখে নিন।
            </p>
          </div>

          {/* Dual Videos Showcase: TOT MEN & TOT WOMEN */}
          <div className={styles.mediaVideosGrid}>
            {/* Video 1: TOT - MEN Video (Shorts) */}
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
              <p className={styles.videoTitle}>পুরুষদের ওরিয়েন্টেশন ও জব গাইডলাইন</p>
            </div>

            {/* Video 2: TOT - WOMEN Video */}
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
              <p className={styles.videoTitle}>দ্বীনি বোনদের ট্রেনিং ও শিক্ষক নিয়োগ গাইড</p>
            </div>
          </div>

          {/* Founder Statement Card */}
          <div className={styles.founderNote} data-reveal>
            <span className={styles.quoteMark}>&ldquo;</span>
            <p>
              &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — খইরুকুম মান তাআল্লামাল কুরআনা ওয়া আল্লামাহু। আপনি যদি শুদ্ধভাবে কুরআন পড়তে পারেন এবং বেসিক ইংলিশ জানা থাকে, তাহলে ফজর একাডেমির এই টিওটি প্রোগ্রামে জয়েন করে আপনি ঘরে বসেই ১৫ থেকে ২২ হাজার টাকা মাসিক সম্মানীতে একটি সুন্দর হালাল ক্যারিয়ার গড়তে পারবেন। যাদের ল্যাপটপ নেই কিন্তু কুরআন ও ইংলিশে ভালো, ফজর একাডেমি নিজে থেকেই তাদের ল্যাপটপ সহায়তা প্রদান করবে, ইনশাআল্লাহ।&rdquo;
            </p>
            <div className={styles.founderId}>
              <div className={styles.founderAv}>
                <img src="/founder.jpg" alt="Muhammad Farabi Chowdhury" />
              </div>
              <div>
                <b>Hafiz Maowlana Muhammad Farabi Chowdhury</b>
                <span>Founder &amp; CEO, Fajr Academy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ SECTION
          ════════════════════════════════════════════════════════ */}
      <section id="faq" className={`${styles.section} ${styles.faq}`}>
        <div className={`${styles.wrap} ${styles.faqContainer}`}>
          <div className={`${styles.sectionHead} reveal`} data-reveal style={{ textAlign: 'center', margin: '0 auto 36px' }}>
            <span className={styles.eyebrow}>সাধারণ প্রশ্ন ও উত্তর</span>
            <h2>আপনার মনে থাকা প্রশ্নগুলোর উত্তর</h2>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে?</summary>
              <p className={styles.faqText}>
                পুরুষদের (TOT - MEN) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২০ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>। নারীদের (TOT - WOMEN Batch 014) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২১ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?</summary>
              <p className={styles.faqText}>
                উভয় কোর্সের রেজিস্ট্রেশন ফি ১,০০০ টাকা। বিকাশ অ্যাপের &lsquo;Make Payment&rsquo; অপশনে গিয়ে <strong>01410764581</strong> নম্বরে ১,০০০ টাকা পাঠিয়ে প্রাপ্ত TrxID ফর্মে সাবমিট করতে হবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ল্যাপটপ না থাকলে কি আবেদন করা যাবে?</summary>
              <p className={styles.faqText}>
                হ্যাঁ! আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজ থেকেই প্রার্থীদের ল্যাপটপ/ডিভাইস সুবিধা প্রদান করবে, ইনশাআল্লাহ।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>আমাকে কি হাফিজ বা আলেম হতে হবে?</summary>
              <p className={styles.faqText}>
                না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট। ক্লাসে বাচ্চাদের কীভাবে পড়াতে হয় তা ফজর একাডেমি শেখাবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?</summary>
              <p className={styles.faqText}>
                একদমই না! যারা প্রথম ধাপে চূড়ান্তভাবে নির্বাচিত হবেন না, তাদেরকে বাদ না দিয়ে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট করানো হবে যাতে পরবর্তী ধাপে তারা সফলভাবে শিক্ষক হিসেবে জয়েন করতে পারেন।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?</summary>
              <p className={styles.faqText}>
                ট্রেনিং সম্পন্ন করে ফজর একাডেমিতে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════════════════ */}
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
              href="https://wa.me/8801641028312"
              target="_blank"
              rel="noopener noreferrer"
            >
              📞 01641028312 নম্বরে WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LUXURY INTEGRATED FOOTER WITH SSLCOMMERZ SHOWCASE
          ════════════════════════════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {/* Brand Emblem & Subtitle */}
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

          {/* Integrated SSLCommerz Multi-Payment Showcase Card */}
          <div className={styles.sslPaymentCard}>
            <div className={styles.sslCardHeader}>
              <div className={styles.sslCardBadge}>
                <span>🔒 OFFICIAL PAYMENT GATEWAY PARTNER</span>
              </div>
              <div className={styles.sslSecurityBadge}>
                <span>256-BIT SSL ENCRYPTED & VERIFIED</span>
              </div>
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
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>ভিসা, মাস্টারকার্ড ও অ্যামেক্স</span>
              </div>
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>বিকাশ, নগদ, রকেট ও সকল মোবাইল ব্যাংকিং</span>
              </div>
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>ইন্টারনেট ব্যাংকিং ও ইনস্ট্যান্ট ভেরিফিকেশন</span>
              </div>
            </div>
          </div>

          {/* Contact & Copyright Info */}
          <div className={styles.footerBottomRow}>
            <div className={styles.footerContactLinks}>
              <span>হটলাইন: <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer">01641028312</a></span>
              <span>•</span>
              <span>হেল্পলাইন: <a href="https://wa.me/8801857381244" target="_blank" rel="noopener noreferrer">+880 1857-381244</a></span>
              <span>•</span>
              <span>ইমেইল: <a href="mailto:info@fajracademy.io">info@fajracademy.io</a></span>
            </div>
            <span>
              © 2026 Fajr Academy. All rights reserved. Registered Islamic Education Institute.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
