import { getSessionUser } from '@/lib/auth'
import { dbConnect } from '@/service/mongo'
import { UserModel } from '@/model/user-model'
import Link from 'next/link'
import styles from './teacher.module.css'

export const metadata = {
  title: 'টিচার ট্রেনিং ড্যাশবোর্ড ও কোর্স ম্যাটেরিয়ালস | ফজর একাডেমি',
  description: 'ফজর একাডেমি ট্রেনিং অফ ট্রেইনার্স (TOT) কোর্সের অফিসিয়াল ড্যাশবোর্ড ও ক্লাস এক্সেস।',
}

export default async function TeacherDashboardPage({ searchParams }) {
  const session = await getSessionUser()
  const params = await searchParams
  const tranIdParam = params?.tran_id || ''

  let user = null

  if (session?.email) {
    try {
      await dbConnect()
      user = await UserModel.findOne({ email: session.email }).lean()
    } catch (e) {
      console.error(e)
    }
  }

  // Fallback if not logged in via cookie yet or accessed directly with tran_id
  if (!user && tranIdParam) {
    try {
      await dbConnect()
      user = await UserModel.findOne({ tranId: tranIdParam }).lean()
    } catch (e) {
      console.error(e)
    }
  }

  const isMenTrack = user?.track === 'TOT-MEN' || (!user?.track && user?.gender !== 'female')
  const trackName = isMenTrack
    ? 'Training of Trainers (TOT) – MEN'
    : 'Training of Trainers (TOT) – WOMEN (Batch 014)'
  const orientationDate = isMenTrack ? '২০ সেপ্টেম্বর ২০২৬' : '২১ সেপ্টেম্বর ২০২৬'
  const orientationTime = 'রাত ৮:০০ টা'

  return (
    <div className={styles.dashboardRoot}>
      {/* Top Bar */}
      <header className={styles.dashHeader}>
        <div className={styles.dashContainer}>
          <div className={styles.dashBrand}>
            <Link href="/" className={styles.brandTitle}>
              ফজর একাডেমি
            </Link>
            <span className={styles.brandBadge}>Teacher Portal</span>
          </div>

          <div className={styles.userMenu}>
            <div className={styles.userAvatar}>
              {user?.fullName ? user.fullName[0].toUpperCase() : 'T'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.fullName || 'Candidate Teacher'}</span>
              <span className={styles.userRole}>
                {user?.paymentStatus === 'paid' ? '✓ Enrolled Teacher' : 'Candidate Teacher'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.dashContainer}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeLeft}>
            <div className={styles.welcomeBadge}>
              🎉 অভিনন্দন! আপনার রেজিস্ট্রেশন ও পেমেন্ট সফল হয়েছে
            </div>
            <h1 className={styles.welcomeTitle}>
              স্বাগতম, <span className={styles.goldText}>{user?.fullName || 'সম্মানিত শিক্ষক'}</span>
            </h1>
            <p className={styles.welcomeLede}>
              আপনি সফলভাবে <strong>{trackName}</strong> কোর্সে যুক্ত হয়েছেন। নিচে আপনার লাইভ ওরিয়েন্টেশন ক্লাসের লিঙ্ক ও কোর্স মডিউলগুলো দেখুন।
            </p>
          </div>

          <div className={styles.welcomeRight}>
            <div className={styles.receiptCard}>
              <div className={styles.receiptLabel}>কোর্স এনরোলমেন্ট স্ট্যাটাস</div>
              <div className={styles.receiptAmount}>৳ ১,০০০ (পরিশোধিত)</div>
              <div className={styles.receiptMeta}>
                <span>TrxID: {user?.tranId || tranIdParam || 'SSL-PAID-2026'}</span>
                <span>গেটওয়ে: SSLCommerz Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Orientation Alert Card */}
        <div className={styles.orientationHeroCard}>
          <div className={styles.orientIconWrapper}>🔔</div>
          <div className={styles.orientDetails}>
            <div className={styles.orientEyebrow}>পরবর্তী লাইভ ক্লাস ও ওরিয়েন্টেশন</div>
            <h2 className={styles.orientMainHeading}>
              First Live Orientation Class — {orientationDate} ({orientationTime})
            </h2>
            <p className={styles.orientText}>
              ওরিয়েন্টেশন ক্লাসে ফজর একাডেমির প্রতিষ্ঠাতা মাওলানা মুহাম্মদ ফারাবী চৌধুরী ও সিনিয়র ট্রেইনাররা আপনাদের সাথে সরাসরি যুক্ত হবেন এবং সম্পূর্ণ ট্রেনিং রোডম্যাপ বুঝিয়ে দিবেন।
            </p>
          </div>

          <div className={styles.orientActions}>
            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnMeet}`}
            >
              📹 Google Meet ক্লাসরুম লিঙ্ক
            </a>
            <a
              href="https://wa.me/8801641028312?text=I%20have%20joined%20the%20TOT%20Teacher%20Training%20Course."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.btn} ${styles.btnWhatsApp}`}
            >
              💬 টিচার WhatsApp গ্রুপে যোগ দিন
            </a>
          </div>
        </div>

        {/* Course Modules Grid */}
        <div className={styles.sectionHeader}>
          <h2>কোর্স কারিকুলাম ও ৪টি প্রফেশনাল ট্রেনিং সেশন</h2>
          <p>প্রতিটি সেশন সম্পন্ন করে লাইভ প্র্যাকটিস ও অ্যাসাইনমেন্ট জমা দিন।</p>
        </div>

        <div className={styles.modulesGrid}>
          {/* Module 1 */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleTag}>সেশন ০১</span>
              <span className={styles.moduleDuration}>১ম সপ্তাহ</span>
            </div>
            <h3 className={styles.moduleTitle}>বাচ্চাদের সাইকোলজি ও কুরআন পাঠদানের আধুনিক পেডাগোজি</h3>
            <p className={styles.moduleDesc}>
              অনলাইনে ছোট বাচ্চাদের মনোযোগ ধরে রাখা, ভীতি দূর করে আনন্দের সাথে মাখরাজ ও সহীহ নূরানী কায়দা শেখানোর আন্তর্জাতিক কৌশল।
            </p>
            <div className={styles.moduleFeatures}>
              <div className={styles.featureItem}>📖 লেকচার শিট ও পেডাগোজি গাইড (PDF)</div>
              <div className={styles.featureItem}>🎥 ক্লাসরুম সাইকোলজি প্র্যাকটিক্যাল ভিডিও</div>
            </div>
            <div className={styles.moduleFooter}>
              <span className={styles.statusBadgeActive}>সক্রিয় মডিউল</span>
            </div>
          </div>

          {/* Module 2 */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleTag}>সেশন ০২</span>
              <span className={styles.moduleDuration}>২য় সপ্তাহ</span>
            </div>
            <h3 className={styles.moduleTitle}>অনলাইন ক্লাসরুম টেকনোলজি ও ডিজিটাল টুলস ম্যানেজমেন্ট</h3>
            <p className={styles.moduleDesc}>
              Zoom ও Google Meet-এ ড্রয়িং বোর্ড, ডিজিটাল হাইলাইটার, স্ক্রিন শেয়ারিং এবং ইন্টারেক্টিভ কুরআন সফটওয়্যার পরিচালনা।
            </p>
            <div className={styles.moduleFeatures}>
              <div className={styles.featureItem}>💻 ডিজিটাল হোয়াইটবোর্ড সেটআপ টিউটোরিয়াল</div>
              <div className={styles.featureItem}>🛠 ক্লাসরুম ইন্টারঅ্যাকশন সফটওয়্যার প্যাক</div>
            </div>
            <div className={styles.moduleFooter}>
              <span className={styles.statusBadgeNext}>পরবর্তী সেশন</span>
            </div>
          </div>

          {/* Module 3 */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleTag}>সেশন ০৩</span>
              <span className={styles.moduleDuration}>৩য় সপ্তাহ</span>
            </div>
            <h3 className={styles.moduleTitle}>বেসিক ইংলিশ কমিউনিকেশন ও গ্লোবাল স্টুডেন্ট হ্যান্ডলিং</h3>
            <p className={styles.moduleDesc}>
              প্রবাসী ও ইংলিশ মিডিয়ামের শিক্ষার্থীদের সাথে সহজে ও সাবলীলভাবে ইংরেজিতে কথা বলে তাজবীদ ও ইসলামিয়াত শিক্ষা দেওয়া।
            </p>
            <div className={styles.moduleFeatures}>
              <div className={styles.featureItem}>🗣 প্রয়োজনীয় স্পোকেন ইংলিশ ডায়ালগ বুক</div>
              <div className={styles.featureItem}>🌍 বিদেশি শিক্ষার্থীদের কালচারাল গাইড</div>
            </div>
            <div className={styles.moduleFooter}>
              <span className={styles.statusBadgeNext}>পরবর্তী সেশন</span>
            </div>
          </div>

          {/* Module 4 */}
          <div className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <span className={styles.moduleTag}>সেশন ০৪</span>
              <span className={styles.moduleDuration}>৪র্থ সপ্তাহ</span>
            </div>
            <h3 className={styles.moduleTitle}>লাইভ ডেমো ক্লাস, সার্টিফিকেট ও ১৫k–২২k৳ জব অনবোর্ডিং</h3>
            <p className={styles.moduleDesc}>
              ফাইনাল অ্যাসেসমেন্ট, ভেরিফায়েড অফিসিয়াল সার্টিফিকেট প্রদান এবং উত্তীর্ণদের ফজর একাডেমির শিক্ষক প্যানেলে সরাসরি জব অফার।
            </p>
            <div className={styles.moduleFeatures}>
              <div className={styles.featureItem}>🎓 অফিসিয়াল ভেরিফায়েড সার্টিফিকেট</div>
              <div className={styles.featureItem}>💼 মাসিক ১৫,০০০–২২,০০০৳ শিক্ষক পদে চুক্তি</div>
            </div>
            <div className={styles.moduleFooter}>
              <span className={styles.statusBadgeNext}>ফাইনাল সেশন</span>
            </div>
          </div>
        </div>

        {/* Device Support & Assistance Card */}
        {user?.hasLaptop === 'no' && (
          <div className={styles.deviceSupportBanner}>
            <div className={styles.deviceIcon}>💻</div>
            <div>
              <h3>ফজর একাডেমি ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
              <p>
                আপনি রেজিস্ট্রেশনের সময় উল্লেখ করেছেন যে আপনার ডিভাইস সহায়তা প্রয়োজন। আমাদের সাপোর্ট টিম আপনার কুরআন ও ইংরেজি দক্ষতার প্রাথমিক মূল্যায়নের পর আপনার ঠিকানায় ডিভাইস পৌঁছানোর প্রক্রিয়া শুরু করবে।
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
