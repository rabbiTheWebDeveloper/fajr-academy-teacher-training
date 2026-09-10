'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import {
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Laptop,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CreditCard,
  Check,
  ArrowRight,
  Tag,
  Users,
} from 'lucide-react'

export default function RegistrationForm({ initialTrack = 'men', courses: initialCourses = [] }) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState(initialTrack)
  const [coursesList, setCoursesList] = useState(initialCourses)

  useEffect(() => {
    if (!initialCourses || initialCourses.length === 0) {
      fetch('/api/courses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.courses?.length > 0) {
            setCoursesList(data.courses)
          }
        })
        .catch(() => {})
    }
  }, [initialCourses])

  const menCourse = coursesList.find((c) => c.track === 'men' || c.courseId === 'TOT-MEN') || {
    name: 'Training of Trainers (TOT) – MEN',
    orientationDate: '২০ সেপ্টেম্বর ২০২৬',
    orientationTime: 'সকাল ১০:০০ টা – ১:০০ টা',
    fee: 1000,
  }

  const womenCourse = coursesList.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) – WOMEN (BATCH 01)',
    orientationDate: '২০ সেপ্টেম্বর ২০২৬',
    orientationTime: 'সকাল ১০:০০ টা – ১:০০ টা',
    fee: 1000,
  }

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    gender: initialTrack === 'women' ? 'female' : 'male',
    hasLaptop: 'yes',
    quranSkill: 'fluent',
    englishSkill: 'basic',
    education: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleWhatsAppConfirm = () => {
    const msg = `আসসালামু আলাইকুম। আমি ফজর একাডেমি TOT শিক্ষক প্রশিক্ষণের জন্য আবেদন করেছি।\nনাম: ${formData.fullName}\nমোবাইল: ${formData.phone}\nকোর্স: ${selectedTrack === 'men' ? 'TOT - MEN' : 'TOT - WOMEN Batch 014'}`
    window.open(`https://wa.me/8801410764581?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleTrackChange = (track) => {
    setSelectedTrack(track)
    setFormData((prev) => ({
      ...prev,
      gender: track === 'women' ? 'female' : 'male',
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Form Submission with SSLCommerz Gateway
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const trackKey = selectedTrack === 'men' ? 'TOT-MEN' : 'TOT-WOMEN-014'

    try {
      const res = await fetch('/api/payment/sslcommerz/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || 'Fajr@Teacher2026',
          gender: selectedTrack === 'women' ? 'female' : 'male',
          track: trackKey,
          hasLaptop: formData.hasLaptop,
          quranSkill: formData.quranSkill,
          englishSkill: formData.englishSkill,
          education: formData.education,
          amount: 1000,
        }),
      })

      const data = await res.json()

      if (data.success && data.gatewayUrl) {
        window.location.href = data.gatewayUrl
        return
      } else {
        setErrorMsg(data.message || 'SSLCommerz পেমেন্ট গেটওয়েতে সংযোগ করতে ব্যর্থ হয়েছে।')
        setLoading(false)
      }
    } catch (err) {
      setErrorMsg('সার্ভারে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ── 2 Course Selection Cards (Men & Women) ── */}
      <div className={styles.regTrackChoiceGrid}>
        {/* Track 1: MEN */}
        <div
          onClick={() => handleTrackChange('men')}
          className={`${styles.regTrackCard} ${
            selectedTrack === 'men' ? styles.regTrackCardSelected : ''
          }`}
        >
          <div>
            <div className={styles.regTrackTopPills}>
              <span className={styles.regPillPopular}>জনপ্রিয় কোর্স</span>
              <span className={styles.regPillFeeTag}>
                <Tag size={13} />
                <span>৳ {menCourse.fee || 1000}</span>
              </span>
            </div>

            <div className={styles.regTrackTitleBlock}>
              <div className={`${styles.regTrackAvatar} ${styles.avatarMen}`}>
                <User size={20} />
              </div>
              <div className={styles.regTrackInfoText}>
                <h3 className={styles.regTrackCardH3}>Training of Trainers (TOT) – MEN</h3>
                <p className={styles.regTrackCardDesc}>
                  দক্ষ ও আত্মবিশ্বাসী প্রশিক্ষক তৈরির লক্ষ্যে বিশেষায়িত প্রশিক্ষণ কোর্স।
                </p>
              </div>
            </div>

            <div className={styles.regTrackDivider} />

            <div className={styles.regTrackMetaList}>
              <div className={styles.regTrackMetaItem}>
                <Calendar size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>First Orientation:</strong> {menCourse.orientationDate || '২০ সেপ্টেম্বর ২০২৬'}, {menCourse.orientationTime || 'সকাল ১০:০০ টা – ১:০০ টা'}
                </span>
              </div>
              <div className={styles.regTrackMetaItem}>
                <CreditCard size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>কোর্স ফি:</strong> ৳{menCourse.fee || 1000} (এককালীন)
                </span>
              </div>
              <div className={styles.regTrackMetaItem}>
                <Users size={15} className={styles.regMetaIcon} />
                <span>সীমিত আসন, নির্বাচিতদের অগ্রাধিকার।</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={selectedTrack === 'men' ? styles.regCardBtnSelected : styles.regCardBtnUnselected}
          >
            {selectedTrack === 'men' ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>কোর্সটি নির্বাচন করা হয়েছে</span>
              </>
            ) : (
              `এই কোর্সটি নির্বাচন করুন (৳${menCourse.fee || 1000})`
            )}
          </button>
        </div>

        {/* Track 2: WOMEN */}
        <div
          onClick={() => handleTrackChange('women')}
          className={`${styles.regTrackCard} ${
            selectedTrack === 'women' ? styles.regTrackCardSelected : ''
          }`}
        >
          <div>
            <div className={styles.regTrackTopPills}>
              <span className={styles.regPillWomenTag}>নারী প্রশিক্ষকদের জন্য</span>
              <span className={styles.regPillFeeTag}>
                <Tag size={13} />
                <span>৳ {womenCourse.fee || 1000}</span>
              </span>
            </div>

            <div className={styles.regTrackTitleBlock}>
              <div className={`${styles.regTrackAvatar} ${styles.avatarWomen}`}>
                <User size={20} />
              </div>
              <div className={styles.regTrackInfoText}>
                <h3 className={styles.regTrackCardH3}>Training of Trainers (TOT) – WOMEN (BATCH 01)</h3>
                <p className={styles.regTrackCardDesc}>
                  দক্ষ ও আত্মবিশ্বাসী প্রশিক্ষক তৈরির লক্ষ্যে বিশেষায়িত প্রশিক্ষণ কোর্স।
                </p>
              </div>
            </div>

            <div className={styles.regTrackDivider} />

            <div className={styles.regTrackMetaList}>
              <div className={styles.regTrackMetaItem}>
                <Calendar size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>First Orientation:</strong> {womenCourse.orientationDate || '২০ সেপ্টেম্বর ২০২৬'}, {womenCourse.orientationTime || 'সকাল ১০:০০ টা – ১:০০ টা'}
                </span>
              </div>
              <div className={styles.regTrackMetaItem}>
                <CreditCard size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>কোর্স ফি:</strong> ৳{womenCourse.fee || 1000} (এককালীন)
                </span>
              </div>
              <div className={styles.regTrackMetaItem}>
                <Users size={15} className={styles.regMetaIcon} />
                <span>সীমিত আসন, নির্বাচিতদের অগ্রাধিকার।</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={selectedTrack === 'women' ? styles.regCardBtnSelected : styles.regCardBtnUnselected}
          >
            {selectedTrack === 'women' ? (
              <>
                <Check size={16} strokeWidth={3} />
                <span>কোর্সটি নির্বাচন করা হয়েছে</span>
              </>
            ) : (
              `এই কোর্সটি নির্বাচন করুন (৳${womenCourse.fee || 1000})`
            )}
          </button>
        </div>
      </div>

      {/* ── White Registration Form Card ── */}
      <div className={styles.regWhiteCard}>
        {submitted ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
            <h3 className={styles.successTitle}>রেজিস্ট্রেশন ও পেমেন্ট তথ্য সফলভাবে গ্রহণ করা হয়েছে!</h3>
            <p className={styles.successSubtitle}>
              আপনার নির্বাচিত কোর্স:{' '}
              <strong className={styles.goldText}>
                {selectedTrack === 'men'
                  ? 'TOT - MEN'
                  : 'TOT - WOMEN (BATCH 01)'}
              </strong>
            </p>

            <div className={styles.receiptSummary}>
              <div className={styles.receiptRow}>
                <span>আবেদনকারীর নাম:</span>
                <strong>{formData.fullName}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>মোবাইল নম্বর:</span>
                <strong>{formData.phone}</strong>
              </div>
              <div className={styles.receiptRow}>
                <span>রেজিস্ট্রেশন ফি:</span>
                <strong className={styles.goldText}>৳১,০০০ (পরিশোধিত)</strong>
              </div>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                onClick={() => router.push('/teacher')}
                className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}
              >
                🎓 সরাসরি টিচার ড্যাশবোর্ড ও ক্লাসরুমে যান →
              </button>
              <button
                type="button"
                onClick={handleWhatsAppConfirm}
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnFull}`}
              >
                📲 WhatsApp-এ তাৎক্ষণিক কনফার্মেশন পাঠান
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Form Header with Title and Step Indicator */}
            <div className={styles.regFormHeader}>
              <div className={styles.regFormTitleRow}>
                <div className={styles.regStepBadgeCircle}>
                  <User size={22} />
                </div>
                <div className={styles.regFormTitleBlock}>
                  <h3 className={styles.regFormTitleMain}>১. তথ্য প্রদান করুন</h3>
                  <p className={styles.regFormSubtitle}>নিচের ফরমটি পূরণ করে আপনার নিবন্ধন সম্পন্ন করুন।</p>
                </div>
              </div>

              {/* Step Progress Indicator */}
              <div className={styles.regStepIndicator}>
                <div className={styles.regStepItem}>
                  <div className={styles.regStepNumActive}>1</div>
                  <span className={styles.regStepTextActive}>ব্যক্তিগত তথ্য</span>
                </div>
                <div className={styles.regStepLine} />
                <div className={styles.regStepItem}>
                  <div className={styles.regStepNumInactive}>2</div>
                  <span className={styles.regStepTextInactive}>কোর্স ও নিরাপত্তা</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #EF4444',
                color: '#B91C1C',
                padding: '12px 18px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Form Inputs Grid (2 Columns with leading icons) */}
            <div className={styles.regInputsGrid}>
              {/* Full Name */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="fullName">
                  পূর্ণ নাম *
                </label>
                <div className={styles.regInputWrapper}>
                  <User size={17} className={styles.regInputIcon} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Email */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="email">
                  ইমেইল *
                </label>
                <div className={styles.regInputWrapper}>
                  <Mail size={17} className={styles.regInputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="phone">
                  মোবাইল নাম্বার *
                </label>
                <div className={styles.regInputWrapper}>
                  <Phone size={17} className={styles.regInputIcon} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="মোবাইল নাম্বার লিখুন"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="password">
                  অ্যাকাউন্ট পাসওয়ার্ড (লগইনের জন্য) *
                </label>
                <div className={styles.regInputWrapper}>
                  <Lock size={17} className={styles.regInputIcon} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Education */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="education">
                  শিক্ষাগত যোগ্যতা ও ব্যাকগ্রাউন্ড
                </label>
                <div className={styles.regInputWrapper}>
                  <GraduationCap size={17} className={styles.regInputIcon} />
                  <input
                    id="education"
                    name="education"
                    type="text"
                    placeholder="উদাঃ স্নাতক / আলিম / ফাজিল / মাস্টার্স"
                    value={formData.education}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Laptop Option */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="hasLaptop">
                  ব্যক্তিগত ল্যাপটপ / কম্পিউটার আছে কি? *
                </label>
                <div className={styles.regInputWrapper}>
                  <Laptop size={17} className={styles.regInputIcon} />
                  <select
                    id="hasLaptop"
                    name="hasLaptop"
                    value={formData.hasLaptop}
                    onChange={handleChange}
                    className={styles.regSelectField}
                  >
                    <option value="yes">হ্যাঁ, নিজস্ব ল্যাপটপ/পিসি আছে</option>
                    <option value="no">না, ফজর একাডেমির ডিভাইস সহায়তা প্রয়োজন</option>
                  </select>
                </div>
              </div>

              {/* Quran Skill */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="quranSkill">
                  কুরআন তিলাওয়াত দক্ষতা *
                </label>
                <div className={styles.regInputWrapper}>
                  <BookOpen size={17} className={styles.regInputIcon} />
                  <select
                    id="quranSkill"
                    name="quranSkill"
                    value={formData.quranSkill}
                    onChange={handleChange}
                    className={styles.regSelectField}
                  >
                    <option value="fluent">শুদ্ধ ও সুন্দরভাবে তিলাওয়াত করতে পারি</option>
                    <option value="tajweed">তাজবীদ ও মাখরাজসহ পারি</option>
                    <option value="hafez">আমি হাফেজ / হিফজ সম্পন্ন</option>
                    <option value="basic">মাঝারি মানের (ইমপ্রুভমেন্ট দরকার)</option>
                  </select>
                </div>
              </div>

              {/* English Skill */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="englishSkill">
                  ইংরেজি যোগাযোগ দক্ষতা *
                </label>
                <div className={styles.regInputWrapper}>
                  <MessageSquare size={17} className={styles.regInputIcon} />
                  <select
                    id="englishSkill"
                    name="englishSkill"
                    value={formData.englishSkill}
                    onChange={handleChange}
                    className={styles.regSelectField}
                  >
                    <option value="basic">বেসিক ইংরেজি জানি ও বুঝি</option>
                    <option value="good">সাবলীলভাবে কথা বলতে পারি</option>
                    <option value="fluent">ফ্লুয়েন্ট (আন্তর্জাতিক শিক্ষার্থীদের পড়াতে সক্ষম)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Action / Security Bar */}
            <div className={styles.regBottomBar}>
              <div className={styles.regSecurityBlock}>
                <ShieldCheck size={26} className={styles.regShieldIcon} />
                <div className={styles.regSecurityText}>
                  <span className={styles.regSecurityTitle}>নিরাপদ ও সহজ নিবন্ধন প্রক্রিয়া</span>
                  <span className={styles.regSecuritySub}>আপনার তথ্য সম্পূর্ণ গোপনীয়ভাবে সংরক্ষিত থাকবে।</span>
                </div>
              </div>

              <div className={styles.regFeeActionWrap}>
                <div className={styles.regFeePillDark}>
                  <span className={styles.regFeePillLabel}>কোর্স ফি (এককালীন)</span>
                  <span className={styles.regFeePillAmount}>৳১,০০০</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.regSubmitBtnGold}
                >
                  <span>{loading ? 'পেমেন্টে সংযোগ হচ্ছে...' : 'পরবর্তী ধাপ'}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
