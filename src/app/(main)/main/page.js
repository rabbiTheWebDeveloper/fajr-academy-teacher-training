import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  House,
  Laptop,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Quote,
  ShieldCheck,
  Star,
  Video,
  Wallet,
} from 'lucide-react'
import MainNav from './MainNav'
import { getMainPageData } from './get-main-data'
import { toBengaliNumber } from '@/lib/utils'
import styles from './main.module.css'

// Served from the cache and refreshed in the background every 5 minutes,
// so visitors never wait on MongoDB (admin changes appear within 5 minutes).
export const revalidate = 300

export const metadata = {
  title: 'প্রফেশনাল কুরআন টিচার ট্রেনিং (TOT) ২০২৬',
  description:
    'ঘরে বসেই প্রফেশনাল কুরআন টিচার হোন — ফজর একাডেমির ৪টি লাইভ সেশনের টিচার্স ট্রেনিং (TOT), অফিসিয়াল সার্টিফিকেট এবং মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানীতে শিক্ষকতার সুযোগ। পুরুষ ও নারীদের আলাদা ব্যাচ।',
  alternates: { canonical: '/main' },
  openGraph: {
    title: 'প্রফেশনাল কুরআন টিচার ট্রেনিং (TOT) ২০২৬ — ফজর একাডেমি',
    description: 'ঘরে বসেই ৪টি লাইভ সেশনে প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী।',
    url: '/main',
    images: [{ url: '/og-image.jpg', width: 1200, height: 1200, alt: 'ফজর একাডেমি কুরআন টিচার ট্রেনিং' }],
  },
}

export const viewport = {
  themeColor: '#040712',
}

// Registration + payment live in the form on the home page.
const REGISTER_HREF = '/#register'

const ADMISSION = {
  open: 'ভর্তি চলছে — সীমিত আসন',
  waitlist: 'অপেক্ষমাণ তালিকা চলছে — আসন সীমিত',
  closed: 'ভর্তি সাময়িক সমাপ্ত — পরবর্তী ব্যাচ শীঘ্রই',
}

const STATS = [
  { value: '১০,০০০+', label: 'সফল শিক্ষার্থী' },
  { value: '৩,০০০+', label: 'শিক্ষক তৈরির লক্ষ্য' },
  { value: '৫০+', label: 'দেশে শিক্ষার্থী' },
  { value: '৪টি', label: 'প্রফেশনাল লাইভ সেশন' },
]

const HIGHLIGHTS = [
  'লাইভ ক্লাস',
  'ক্লাস রেকর্ডিং',
  'অফিসিয়াল সার্টিফিকেট',
  'ডিভাইস সহায়তা',
  '১০০% হালাল উপার্জন',
  'লাইফটাইম সাপোর্ট',
  'আন্তর্জাতিক কুরআন শিক্ষণ পদ্ধতি',
  'বাচ্চাদের হ্যান্ডলিং ও সাইকোলজি কৌশল',
  'ঘরে বসেই পাঠদান',
]

const ELIGIBILITY = [
  'শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা',
  'প্রাথমিক ইংরেজি জ্ঞান এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)',
  'ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তা সুবিধা)',
  'স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর',
  'হাফেজ না হয়েও আবেদন করার সুযোগ – শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন',
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
// Digit-for-digit conversion for labels — toBengaliNumber formats as a number,
// which drops leading zeros ("01" → "১") and adds separators ("2026" → "২,০২৬").
const toBnDigits = (value) => String(value).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
const bnPad = (n) => toBnDigits(String(n).padStart(2, '0'))

// "মাসিক সম্মানী: ১৫,০০০ ..." → ['মাসিক সম্মানী', '১৫,০০০ ...']
function splitPerk(text = '') {
  const i = text.indexOf(':')
  return i > 0 ? [text.slice(0, i).trim(), text.slice(i + 1).trim()] : [null, text]
}

function initials(name = '') {
  const words = name
    .replace(/^(shaykh|sheikh|ustadha|ustadh|ustaz|qari|hafez|hafiz|mufti|maulana|dr\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => Array.from(w)[0])
    .join('')
    .toUpperCase()
}

function SectionHead({ id, kicker, title, accent, lead, align = 'center' }) {
  return (
    <header className={`${styles.head} ${align === 'left' ? styles.headLeft : ''} ${styles.reveal}`}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 id={id} className={styles.title}>
        {title}
        {accent && (
          <>
            {' '}
            <span className={styles.titleAccent}>{accent}</span>
          </>
        )}
      </h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </header>
  )
}

function ProgramCard({ course, tone, fallbackFee, fallbackRegular }) {
  const fee = course.fee || fallbackFee
  const regular = course.regularFee || fallbackRegular
  const perks = course.perks?.length ? course.perks : []

  return (
    <article className={`${styles.program} ${styles.reveal}`} data-tone={tone}>
      <div className={styles.programInner}>
        <div>
          <span className={styles.programTag}>{course.tag || (tone === 'men' ? 'MEN BATCH' : 'WOMEN BATCH')}</span>
          <h3 className={styles.programName}>{course.name}</h3>
          {course.summary && <p className={styles.programSummary}>{course.summary}</p>}
        </div>

        <div className={styles.price}>
          <span className={styles.priceNow}>৳{toBengaliNumber(fee)}</span>
          {regular > fee && (
            <>
              <del>৳{toBengaliNumber(regular)}</del>
              <span className={styles.priceSave}>সাশ্রয় ৳{toBengaliNumber(regular - fee)}</span>
            </>
          )}
          <span className={styles.priceNote}>এককালীন রেজিস্ট্রেশন ফি</span>
        </div>

        <ul className={styles.programMeta}>
          <li>
            <CalendarDays aria-hidden="true" />
            <span>
              ওরিয়েন্টেশন: <strong>{course.orientationDate}</strong>
            </span>
          </li>
          <li>
            <Clock aria-hidden="true" />
            <span>{course.orientationTime}</span>
          </li>
        </ul>

        {perks.length > 0 && (
          <ul className={styles.perks}>
            {perks.map((perk) => {
              const [label, text] = splitPerk(perk)
              return (
                <li key={perk}>
                  <Check aria-hidden="true" />
                  <span>
                    {label && <strong>{label}: </strong>}
                    {text}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <a href={REGISTER_HREF} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnBlock}`}>
          এই ব্যাচে ভর্তি হোন <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default async function MainPage() {
  const {
    settings,
    coursePrice,
    regularPrice,
    menCourse,
    womenCourse,
    curriculum,
    instructors,
    helplinePhone,
    whatsappUrl,
  } = await getMainPageData()

  const admission = ADMISSION[settings.admissionStatus] ? settings.admissionStatus : 'open'
  const sessionCount = toBengaliNumber(curriculum.length)
  const fee = toBengaliNumber(coursePrice)

  const steps = [
    {
      icon: CreditCard,
      title: `রেজিস্ট্রেশন ও ${fee} টাকা ফি`,
      text: `পছন্দের ট্র্যাক নির্বাচন করে ${fee} টাকা ফি পরিশোধ করে নিবন্ধন সম্পন্ন করুন।`,
    },
    {
      icon: Video,
      title: 'লাইভ ওরিয়েন্টেশন ক্লাস',
      text: `পুরুষদের ${menCourse.orientationDate} এবং নারীদের ${womenCourse.orientationDate} ${menCourse.orientationTime}-এ লাইভ ওরিয়েন্টেশন ক্লাসে যুক্ত হোন।`,
    },
    {
      icon: BookOpen,
      title: `${sessionCount}টি প্রফেশনাল TOT প্যাকেজ`,
      text: `১ মাসে ${sessionCount}টি হ্যান্ডস-অন সেশনে আধুনিক পেডাগোজি ও আন্তর্জাতিক শিক্ষক প্রশিক্ষণ আয়ত্ত করুন।`,
    },
    {
      icon: BadgeCheck,
      title: 'সার্টিফিকেট ও জব অফার',
      text: 'মূল্যায়নে সার্টিফিকেট অর্জন এবং ফজর একাডেমির নিজস্ব প্ল্যাটফর্মে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।',
    },
  ]

  const faqs = [
    {
      q: 'পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে হবে?',
      a: (
        <>
          পুরুষদের ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে{' '}
          <strong>
            {menCourse.orientationDate} ({menCourse.orientationTime})
          </strong>
          । নারীদের ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে{' '}
          <strong>
            {womenCourse.orientationDate} ({womenCourse.orientationTime})
          </strong>
          ।
        </>
      ),
    },
    {
      q: 'কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?',
      a: (
        <>
          উভয় কোর্সের এককালীন রেজিস্ট্রেশন ফি {fee} টাকা। SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, কার্ড অথবা সরাসরি
          বিকাশ মার্চেন্ট নম্বরে (<strong>{settings.bkashMerchantNumber}</strong>) পেমেন্ট করতে পারবেন।
        </>
      ),
    },
    {
      q: 'ল্যাপটপ বা কম্পিউটার না থাকলে কি আবেদন করা যাবে?',
      a: 'হ্যাঁ, আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভাষা ভালো করে জ্ঞান থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব ব্যবস্থাপনায় ডিভাইস সহায়তা প্রদান করবে।',
    },
    {
      q: 'আমাকে কি হাফিজ বা আলেম হতে হবে?',
      a: 'না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট।',
    },
    {
      q: 'প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?',
      a: 'একদমই না। যারা প্রথম ধাপে নির্বাচিত হবেন না, তাদেরকে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট কোর্সে সুযোগ দেওয়া হবে।',
    },
    {
      q: 'শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?',
      a: 'ট্রেনিং সম্পন্ন করে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।',
    },
  ]

  const telHref = `tel:${helplinePhone.replace(/[^0-9+]/g, '')}`
  const year = toBnDigits(new Date().getFullYear())

  return (
    <div className={styles.page}>
      <MainNav registerHref={REGISTER_HREF} />

      <main>
        {/* ==================== HERO — "Fajr" dawn over the horizon ==================== */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.aurora} aria-hidden="true">
            <span className={`${styles.blob} ${styles.blobA}`} />
            <span className={`${styles.blob} ${styles.blobB}`} />
            <span className={styles.stars} />
          </div>

          <div className={`${styles.container} ${styles.heroInner}`}>
            <p className={styles.heroBadge} data-tone={admission}>
              <span className={styles.liveDot} aria-hidden="true" />
              {ADMISSION[admission]}
              <span className={styles.heroBadgeSep} aria-hidden="true" />
              <span className={styles.heroBatch} lang="en">
                {settings.currentBatch}
              </span>
            </p>

            <h1 id="hero-title" className={styles.heroTitle}>
              ঘরে বসেই হয়ে উঠুন
              <span className={styles.heroGradient}>প্রফেশনাল কুরআন টিচার</span>
            </h1>

            <p className={styles.heroLead}>
              শুদ্ধভাবে কুরআন ও ইংরেজি জানেন? ফজর একাডেমির <strong>১০,০০০+</strong> শিক্ষার্থীর সফলতার ধারাবাহিকতায় এবার{' '}
              <strong>৩,০০০+</strong> শিক্ষক তৈরির লক্ষ্যে প্রফেশনাল টিচার্স ট্রেনিং (TOT) প্রোগ্রাম।
            </p>

            <div className={styles.heroCtas}>
              <a href={REGISTER_HREF} className={`${styles.btn} ${styles.btnPrimary}`}>
                রেজিস্ট্রেশন করুন — ৳{fee} <ArrowRight aria-hidden="true" />
              </a>
              <a href="#programs" className={`${styles.btn} ${styles.btnGhost}`}>
                প্রোগ্রাম দেখুন <ChevronRight aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={styles.heroStage}>
            <div className={styles.horizonGlow} aria-hidden="true" />
            <div className={styles.horizon} aria-hidden="true" />

            <div className={`${styles.container} ${styles.heroStageInner}`}>
              <dl className={styles.heroPanel}>
                <div className={styles.panelCell}>
                  <dt className={styles.panelLabel}>
                    <CalendarDays aria-hidden="true" /> লাইভ ওরিয়েন্টেশন
                  </dt>
                  <dd className={styles.panelRows}>
                    <span>
                      <small>পুরুষ</small> {menCourse.orientationDate}
                    </span>
                    <span>
                      <small>নারী</small> {womenCourse.orientationDate}
                    </span>
                  </dd>
                  <dd className={styles.panelSub}>{menCourse.orientationTime}</dd>
                </div>
                <div className={styles.panelCell}>
                  <dt className={styles.panelLabel}>
                    <CreditCard aria-hidden="true" /> রেজিস্ট্রেশন ফি
                  </dt>
                  <dd className={styles.panelValue}>
                    ৳{fee}
                    {regularPrice > coursePrice && <del>৳{toBengaliNumber(regularPrice)}</del>}
                  </dd>
                  <dd className={styles.panelSub}>এককালীন · বিকাশ / নগদ / রকেট / কার্ড</dd>
                </div>
                <div className={styles.panelCell}>
                  <dt className={styles.panelLabel}>
                    <Wallet aria-hidden="true" /> মাসিক সম্মানী
                  </dt>
                  <dd className={styles.panelValue}>১৫–২২ হাজার ৳</dd>
                  <dd className={styles.panelSub}>শিক্ষক হিসেবে কাজের সুযোগ পেলে</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ==================== STATS + HIGHLIGHTS ==================== */}
        <section className={`${styles.dark} ${styles.statsSection} ${styles.lazy}`} aria-label="ফজর একাডেমি এক নজরে">
          <div className={styles.container}>
            <ul className={styles.stats}>
              {STATS.map((s, i) => (
                <li key={s.label} className={styles.reveal} style={{ '--d': `${i * 3}%`, '--pos': `${i * 33}%` }}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.marquee}>
            <div className={styles.marqueeRail}>
              {[0, 1].map((copy) => (
                <ul key={copy} className={styles.marqueeList} aria-hidden={copy === 1 || undefined}>
                  {HIGHLIGHTS.map((h) => (
                    <li key={h} className={styles.chip}>
                      <CheckCircle2 aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== WHY — bento grid ==================== */}
        <section id="why" className={`${styles.section} ${styles.lazy} ${styles.light}`} aria-labelledby="why-title">
          <div className={styles.container}>
            <SectionHead
              id="why-title"
              kicker="কেন ফজর একাডেমি"
              title="প্রশিক্ষণ থেকে সরাসরি"
              accent="ক্যারিয়ার।"
              lead="শুধু সার্টিফিকেট নয় — প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের ফজর একাডেমির নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ। একটি স্বচ্ছ ও বরকতময় পথ।"
            />

            <div className={styles.bento}>
              <article className={`${styles.tile} ${styles.tileHome} ${styles.reveal}`}>
                <div className={styles.tileBody}>
                  <span className={`${styles.tileIcon} ${styles.iconBlue}`}>
                    <House aria-hidden="true" />
                  </span>
                  <h3>ঘরে বসেই সম্পূর্ণ কাজ</h3>
                  <p>
                    কোনো ট্রাফিক জ্যাম নেই, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার ক্লাস ঘরে বসেই
                    ল্যাপটপে সম্পন্ন করতে পারবেন।
                  </p>
                </div>
                <div className={styles.classMock} aria-hidden="true">
                  <div className={styles.mockBar}>
                    <i />
                    <i />
                    <i />
                    <span>অনলাইন ক্লাসরুম</span>
                  </div>
                  <div className={styles.mockBody}>
                    <span className={styles.mockLive}>
                      <span className={styles.liveDot} /> LIVE
                    </span>
                    <div className={styles.eq}>
                      {Array.from({ length: 9 }, (_, i) => (
                        <span key={i} style={{ '--i': i }} />
                      ))}
                    </div>
                    <div className={styles.mockPeople}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </article>

              <article className={`${styles.tile} ${styles.tileIncome} ${styles.reveal}`} style={{ '--d': '4%' }}>
                <p className={styles.incomeLabel}>মাসিক সম্মানী</p>
                <p className={styles.incomeFigure}>
                  <b>১৫,০০০৳</b>
                  <small>থেকে</small>
                  <b>২২,০০০৳</b>
                </p>
                <p>কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী হালাল ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।</p>
                <span className={styles.halal}>
                  <ShieldCheck aria-hidden="true" /> ১০০% হালাল উপার্জন
                </span>
              </article>

              <article className={`${styles.tile} ${styles.reveal}`}>
                <span className={`${styles.tileIcon} ${styles.iconSunset}`}>
                  <Laptop aria-hidden="true" />
                </span>
                <h3>বিনামূল্যে ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
                <p>
                  কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকলে কিন্তু ডিভাইস না থাকলে, ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ
                  সহায়তা প্রদান করবে।
                </p>
              </article>

              <article className={`${styles.tile} ${styles.reveal}`} style={{ '--d': '4%' }}>
                <span className={`${styles.tileIcon} ${styles.iconGold}`}>
                  <Award aria-hidden="true" />
                </span>
                <h3>সার্টিফিকেট ও কন্টিনিউয়াস মেন্টরিং</h3>
                <p>
                  {sessionCount}টি প্রফেশনাল সেশন শেষে অফিসিয়াল মূল্যায়ন সার্টিফিকেট এবং নিয়মিত গ্রুমিং ও স্কিল
                  ডেভেলপমেন্টের মাধ্যমে ক্যারিয়ার বৃদ্ধি।
                </p>
              </article>

              <article className={`${styles.tile} ${styles.tileHadith} ${styles.reveal}`}>
                <Quote className={styles.quoteMark} aria-hidden="true" />
                <blockquote>
                  <p>তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শেখায়।</p>
                  <footer>
                    <cite>— সহীহ বুখারী</cite>
                  </footer>
                </blockquote>
              </article>

              <article className={`${styles.tile} ${styles.tileSafe} ${styles.reveal}`} style={{ '--d': '4%' }}>
                <span className={`${styles.tileIcon} ${styles.iconGreen}`}>
                  <ShieldCheck aria-hidden="true" />
                </span>
                <h3>পর্দা ও শৃঙ্খলার সুরক্ষা</h3>
                <p>
                  পুরুষ ও নারীদের জন্য আলাদা ব্যাচ — ১০০% ঘরে বসেই পাঠদানের সুযোগ, ক্লাস রেকর্ডিং ও লাইফটাইম
                  সাপোর্ট।
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ==================== PROGRAMS ==================== */}
        <section id="programs" className={`${styles.section} ${styles.lazy} ${styles.dark}`} aria-labelledby="programs-title">
          <div className={styles.sectionGlow} aria-hidden="true" />
          <div className={styles.container}>
            <SectionHead
              id="programs-title"
              kicker="প্রোগ্রাম"
              title="আপনার ব্যাচ"
              accent="বেছে নিন।"
              lead="পুরুষ ও নারী — আলাদা ব্যাচ, একই আন্তর্জাতিক মানের প্রফেশনাল ট্রেনিং।"
            />
            <div className={styles.programs}>
              <ProgramCard course={menCourse} tone="men" fallbackFee={coursePrice} fallbackRegular={regularPrice} />
              <ProgramCard course={womenCourse} tone="women" fallbackFee={coursePrice} fallbackRegular={regularPrice} />
            </div>
          </div>
        </section>

        {/* ==================== CURRICULUM ==================== */}
        <section id="curriculum" className={`${styles.section} ${styles.lazy} ${styles.white}`} aria-labelledby="curriculum-title">
          <div className={styles.container}>
            <SectionHead
              id="curriculum-title"
              kicker="কারিকুলাম"
              title={`${sessionCount}টি লাইভ সেশন।`}
              accent="একটি নতুন পরিচয়।"
              lead={`১ মাসে ${sessionCount}টি হ্যান্ডস-অন সেশনে আধুনিক পেডাগোজি ও আন্তর্জাতিক শিক্ষক প্রশিক্ষণ আয়ত্ত করুন — অভিজ্ঞ ট্রেইনারদের সাথে সরাসরি।`}
            />

            <ol className={styles.sessions}>
              {curriculum.map((m, i) => (
                <li
                  key={m.moduleNo ?? i}
                  className={`${styles.session} ${styles.reveal}`}
                  style={{ '--d': `${(i % 2) * 4}%` }}
                >
                  <div className={styles.sessionHead}>
                    <span className={styles.sessionNo}>{bnPad(m.moduleNo ?? i + 1)}</span>
                    <span className={styles.sessionBadge} lang="en">
                      {m.sessionBadge || `SESSION ${String(i + 1).padStart(2, '0')}`}
                    </span>
                  </div>
                  <h3>{m.subtitle || m.title}</h3>
                  {m.description && <p>{m.description}</p>}
                  {m.topics?.length > 0 && (
                    <ul className={styles.topics}>
                      {m.topics.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                  {(m.trainerName || m.liveDate) && (
                    <div className={styles.sessionFoot}>
                      {m.trainerName && (
                        <div className={styles.trainer}>
                          <span className={styles.trainerAvatar} aria-hidden="true">
                            {initials(m.trainerName)}
                          </span>
                          <span>
                            <strong>{m.trainerName}</strong>
                            {m.trainerRole && <small>{m.trainerRole}</small>}
                          </span>
                        </div>
                      )}
                      {m.liveDate && (
                        <span className={styles.sessionDate}>
                          <CalendarDays aria-hidden="true" />
                          {m.liveDate}
                          {m.sessionTime && ` · ${m.sessionTime}`}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ==================== JOURNEY + ELIGIBILITY ==================== */}
        <section id="journey" className={`${styles.section} ${styles.lazy} ${styles.dark}`} aria-labelledby="journey-title">
          <div className={styles.container}>
            <SectionHead
              id="journey-title"
              kicker="নিবন্ধন থেকে নিয়োগ"
              title="মাত্র ৪টি ধাপে"
              accent="প্রফেশনাল শিক্ষক।"
              lead="স্বচ্ছ প্রক্রিয়া — প্রতিটি ধাপে ফজর একাডেমি টিম আপনার পাশে।"
            />

            <div className={styles.stepsWrap}>
              <div className={styles.stepsLine} aria-hidden="true">
                <span />
              </div>
              <ol className={styles.steps}>
                {steps.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className={`${styles.step} ${styles.reveal}`} style={{ '--d': `${i * 4}%` }}>
                    <span className={styles.stepIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span className={styles.stepNo}>ধাপ {bnPad(i + 1)}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.ready}>
              <div className={`${styles.readyCard} ${styles.reveal}`}>
                <h3>আবেদনের সাধারণ যোগ্যতা</h3>
                <ul className={styles.checklist}>
                  {ELIGIBILITY.map((item) => (
                    <li key={item}>
                      <CheckCircle2 aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.readyCard} ${styles.reveal}`} style={{ '--d': '4%' }}>
                <h3>কোর্স ফি ও পেমেন্ট তথ্য</h3>
                <p className={styles.readyPrice}>
                  ৳{fee} <span>এককালীন রেজিস্ট্রেশন ফি</span>
                </p>
                <dl className={styles.payList}>
                  <div>
                    <dt>পেমেন্ট গেটওয়ে</dt>
                    <dd>SSLCommerz (অনলাইন পেমেন্ট)</dd>
                  </div>
                  <div>
                    <dt>বিকাশ / নগদ / রকেট</dt>
                    <dd>{settings.bkashMerchantNumber}</dd>
                  </div>
                  <div>
                    <dt>কোর্স ট্র্যাক</dt>
                    <dd>TOT-MEN / TOT-WOMEN</dd>
                  </div>
                  <div>
                    <dt>হটলাইন / WhatsApp</dt>
                    <dd>{helplinePhone}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== INSTRUCTORS ==================== */}
        <section id="instructors" className={`${styles.section} ${styles.lazy} ${styles.light}`} aria-labelledby="instructors-title">
          <div className={styles.container}>
            <SectionHead
              id="instructors-title"
              kicker="প্রশিক্ষক"
              title="যাঁদের কাছে"
              accent="শিখবেন।"
              lead="অভিজ্ঞ ট্রেইনার ও আন্তর্জাতিক শিক্ষাবিদদের সাথে সরাসরি লাইভ সেশনে শিখুন।"
            />
            <ul className={styles.faculty}>
              {instructors.map((t, i) => (
                <li key={t.fullName} className={`${styles.member} ${styles.reveal}`} style={{ '--d': `${(i % 4) * 3}%` }}>
                  <span className={styles.memberAvatar}>
                    {t.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded avatars come from arbitrary hosts
                      <img src={t.avatar} alt="" width={82} height={82} loading="lazy" decoding="async" />
                    ) : (
                      <span aria-hidden="true">{initials(t.fullName)}</span>
                    )}
                  </span>
                  <h3>{t.fullName}</h3>
                  {t.designation && <p className={styles.memberRole}>{t.designation}</p>}
                  {t.specialization && <p className={styles.memberSpec}>{t.specialization}</p>}
                  <p className={styles.memberStats}>
                    {t.experienceYears > 0 && <span>{toBengaliNumber(t.experienceYears)}+ বছর অভিজ্ঞতা</span>}
                    {t.rating > 0 && (
                      <span>
                        <Star aria-hidden="true" /> {toBengaliNumber(t.rating)}
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ==================== FAQ ==================== */}
        <section id="faq" className={`${styles.section} ${styles.lazy} ${styles.white}`} aria-labelledby="faq-title">
          <div className={`${styles.container} ${styles.faqLayout}`}>
            <div className={styles.faqAside}>
              <SectionHead
                id="faq-title"
                align="left"
                kicker="প্রশ্নোত্তর"
                title="প্রশ্ন আছে?"
                accent="উত্তর এখানে।"
                lead="আরও কিছু জানার থাকলে সরাসরি আমাদের সাথে কথা বলুন।"
              />
              <div className={styles.faqContact}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnWa}`}>
                  <MessageCircle aria-hidden="true" /> WhatsApp
                </a>
                <a href={telHref} className={`${styles.btn} ${styles.btnSoft}`}>
                  <Phone aria-hidden="true" /> {helplinePhone}
                </a>
              </div>
            </div>

            <div className={styles.faqList}>
              {faqs.map((f, i) => (
                <details key={f.q} name="faq" className={`${styles.faq} ${styles.reveal}`} open={i === 0}>
                  <summary>
                    {f.q}
                    <span className={styles.faqIcon} aria-hidden="true">
                      <Plus />
                    </span>
                  </summary>
                  <p className={styles.faqAnswer}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section className={`${styles.cta} ${styles.lazy}`} aria-labelledby="cta-title">
          <div className={styles.ctaGlow} aria-hidden="true" />
          <div className={`${styles.container} ${styles.ctaInner} ${styles.reveal}`}>
            <p className={styles.ctaKicker}>ফজর মানেই নতুন ভোর</p>
            <h2 id="cta-title" className={styles.ctaTitle}>
              ফজরের আলোয় শুরু হোক <span className={styles.titleAccent}>আপনার কুরআনি ক্যারিয়ার।</span>
            </h2>
            <p className={styles.ctaLead}>
              আসন সীমিত — আজই নিবন্ধন করে <span lang="en">{settings.currentBatch}</span>-এ আপনার জায়গা নিশ্চিত করুন।
            </p>
            <div className={styles.ctaActions}>
              <a href={REGISTER_HREF} className={`${styles.btn} ${styles.btnLight}`}>
                রেজিস্ট্রেশন করুন — ৳{fee} <ArrowRight aria-hidden="true" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnGhost}`}>
                <MessageCircle aria-hidden="true" /> WhatsApp-এ কথা বলুন
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className={`${styles.footer} ${styles.lazy}`}>
        <div className={styles.container}>
          <div className={styles.footTop}>
            <div className={styles.footBrand}>
              <Image src="/fajr-logo.png" alt="" width={44} height={44} />
              <div>
                <strong>{settings.instituteName || 'Fajr Academy'}</strong>
                <span lang="en">Balanced Education for Dunya and Akhirah</span>
              </div>
            </div>

            <div className={styles.footCols}>
              <div>
                <p className={styles.footTitle}>যোগাযোগ</p>
                <ul>
                  <li>
                    <a href={telHref}>
                      <Phone aria-hidden="true" /> {helplinePhone}
                    </a>
                  </li>
                  {settings.supportEmail && (
                    <li>
                      <a href={`mailto:${settings.supportEmail}`}>
                        <Mail aria-hidden="true" /> {settings.supportEmail}
                      </a>
                    </li>
                  )}
                  <li>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle aria-hidden="true" /> WhatsApp
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className={styles.footTitle}>প্রোগ্রাম</p>
                <ul>
                  <li>
                    <a href="#programs">ব্যাচসমূহ</a>
                  </li>
                  <li>
                    <a href="#curriculum">কারিকুলাম</a>
                  </li>
                  <li>
                    <a href="#faq">প্রশ্নোত্তর</a>
                  </li>
                  <li>
                    <a href={REGISTER_HREF}>রেজিস্ট্রেশন</a>
                  </li>
                </ul>
              </div>
              <div>
                <p className={styles.footTitle}>অ্যাকাউন্ট</p>
                <ul>
                  <li>
                    <Link href="/login" prefetch={false}>
                      লগইন
                    </Link>
                  </li>
                  <li>
                    <Link href="/" prefetch={false}>
                      মূল ওয়েবসাইট
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footBottom}>
            <span>
              © {year} <span lang="en">Fajr Academy</span>। সর্বস্বত্ব সংরক্ষিত।
            </span>
            <span>পেমেন্ট সুরক্ষিত — SSLCommerz</span>
          </div>
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.waFab}
        aria-label="WhatsApp-এ যোগাযোগ করুন"
      >
        <MessageCircle aria-hidden="true" />
      </a>
    </div>
  )
}
