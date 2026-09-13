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
  Sparkles,
  Loader2,
  Clock,
  ExternalLink,
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
    orientationTime: 'রাত ৮:০০ টা',
    fee: 1000,
  }

  const womenCourse = coursesList.find((c) => c.track === 'women' || c.courseId?.includes('WOMEN')) || {
    name: 'Training of Trainers (TOT) – WOMEN (Batch 014)',
    orientationDate: '২১ সেপ্টেম্বর ২০২৬',
    orientationTime: 'রাত ৮:০০ টা',
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
    const trackName = selectedTrack === 'men' ? 'TOT - MEN BATCH' : 'TOT - WOMEN (Batch 014)'
    const msg = `আসসালামু আলাইকুম। আমি ফজর একাডেমি ${trackName} শিক্ষক প্রশিক্ষণের জন্য নিবন্ধন করেছি।\nনাম: ${formData.fullName}\nমোবাইল: ${formData.phone}\nইমেইল: ${formData.email}`
    window.open(`https://wa.me/8801641028312?text=${encodeURIComponent(msg)}`, '_blank')
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
        setErrorMsg(data.message || 'SSLCommerz পেমেন্ট গেটওয়েতে সংযোগ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সরাসরি WhatsApp-এ যোগাযোগ করুন।')
        setLoading(false)
      }
    } catch (err) {
      setErrorMsg('সার্ভারে সাময়িক সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন বা WhatsApp হেল্পলাইনে যোগাযোগ করুন।')
      setLoading(false)
    }
  }

  return (
    <div className={styles.regMainWrapper}>
      {/* ── 2 Course Selection Cards (Men & Women) ── */}
      <div className={styles.regTrackChoiceGrid}>
        {/* Track 1: MEN */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTrackChange('men')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleTrackChange('men')
          }}
          className={`${styles.regTrackCard} ${
            selectedTrack === 'men' ? styles.regTrackCardSelected : ''
          }`}
        >
          <div className={styles.regTrackCardContent}>
            <div className={styles.regTrackTopPills}>
              <span className={styles.regPillMenTag}>
                <User size={13} /> পুরুষদের জন্য বিশেষায়িত
              </span>
              <span className={styles.regPillFeeTag}>
                <Tag size={12} />
                <span>৳ {menCourse.fee || 1000}</span>
              </span>
            </div>

            <div className={styles.regTrackTitleBlock}>
              <div className={`${styles.regTrackAvatar} ${styles.avatarMen}`}>
                <User size={22} />
              </div>
              <div className={styles.regTrackInfoText}>
                <h3 className={styles.regTrackCardH3}>Training of Trainers (TOT) – MEN</h3>
                <p className={styles.regTrackCardDesc}>
                  ছেলেদের জন্য ঘরে বসে চাকরির সুবর্ণ সুযোগ। আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।
                </p>
              </div>
            </div>

            <div className={styles.regTrackDivider} />

            <div className={styles.regTrackMetaList}>
              <div className={styles.regTrackMetaItem}>
                <Calendar size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>ওরিয়েন্টেশন:</strong> {menCourse.orientationDate || '২০ সেপ্টেম্বর'} ({menCourse.orientationTime || 'রাত ৮:০০ টা'})
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
                <span>সীমিত আসন · সফলদের সরাসরি নিয়োগের সুযোগ</span>
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
              `কোর্সটি নির্বাচন করুন (৳${menCourse.fee || 1000})`
            )}
          </button>
        </div>

        {/* Track 2: WOMEN */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleTrackChange('women')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleTrackChange('women')
          }}
          className={`${styles.regTrackCard} ${
            selectedTrack === 'women' ? styles.regTrackCardSelected : ''
          }`}
        >
          <div className={styles.regTrackCardContent}>
            <div className={styles.regTrackTopPills}>
              <span className={styles.regPillWomenTag}>
                <Sparkles size={13} /> নারীদের জন্য · Batch 014
              </span>
              <span className={styles.regPillFeeTag}>
                <Tag size={12} />
                <span>৳ {womenCourse.fee || 1000}</span>
              </span>
            </div>

            <div className={styles.regTrackTitleBlock}>
              <div className={`${styles.regTrackAvatar} ${styles.avatarWomen}`}>
                <User size={22} />
              </div>
              <div className={styles.regTrackInfoText}>
                <h3 className={styles.regTrackCardH3}>Training of Trainers (TOT) – WOMEN</h3>
                <p className={styles.regTrackCardDesc}>
                  দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুযোগ।
                </p>
              </div>
            </div>

            <div className={styles.regTrackDivider} />

            <div className={styles.regTrackMetaList}>
              <div className={styles.regTrackMetaItem}>
                <Calendar size={15} className={styles.regMetaIcon} />
                <span>
                  <strong>ওরিয়েন্টেশন:</strong> {womenCourse.orientationDate || '২১ সেপ্টেম্বর'} ({womenCourse.orientationTime || 'রাত ৮:০০ টা'})
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
                <span>সীমিত আসন · সফলদের সরাসরি নিয়োগের সুযোগ</span>
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
              `কোর্সটি নির্বাচন করুন (৳${womenCourse.fee || 1000})`
            )}
          </button>
        </div>
      </div>

      {/* ── White Registration Form Card ── */}
      <div className={styles.regWhiteCard}>
        {submitted ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
            <h3 className={styles.successTitle}>রেজিস্ট্রেশন সফলভাবে গ্রহণ করা হয়েছে!</h3>
            <p className={styles.successSubtitle}>
              আপনার নির্বাচিত কোর্স:{' '}
              <strong className={styles.goldHighlight}>
                {selectedTrack === 'men'
                  ? 'TOT - MEN (পুরুষ ব্যাচ)'
                  : 'TOT - WOMEN (নারীদের Batch 014)'}
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
                <strong className={styles.goldHighlight}>৳১,০০০ (এককালীন)</strong>
              </div>
            </div>

            <div className={styles.successActions}>
              <button
                type="button"
                onClick={() => router.push('/teacher')}
                className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}
              >
                🎓 সরাসরি টিচার ড্যাশবোর্ডে যান →
              </button>
              <button
                type="button"
                onClick={handleWhatsAppConfirm}
                className={`${styles.btn} ${styles.btnOutline} ${styles.btnFull}`}
              >
                📲 WhatsApp-এ তাত্ক্ষণিক কনফার্মেশন পাঠান
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Form Header with Title and Step Indicator */}
            <div className={styles.regFormHeader}>
              <div className={styles.regFormTitleRow}>
                <div className={styles.regStepBadgeCircle}>
                  <User size={20} />
                </div>
                <div className={styles.regFormTitleBlock}>
                  <h3 className={styles.regFormTitleMain}>
                    {selectedTrack === 'men' ? '👨‍🏫 পুরুষ ব্যাচ' : '🧕 নারী ব্যাচ (Batch 014)'} — নিবন্ধন তথ্য
                  </h3>
                  <p className={styles.regFormSubtitle}>
                    সঠিক তথ্য প্রদান করে SSLCommerz পেমেন্ট গেটওয়ের মাধ্যমে নিবন্ধন সম্পন্ন করুন।
                  </p>
                </div>
              </div>

              {/* Step Progress Indicator */}
              <div className={styles.regStepIndicator}>
                <div className={styles.regStepItem}>
                  <div className={styles.regStepNumActive}>১</div>
                  <span className={styles.regStepTextActive}>তথ্য প্রদান</span>
                </div>
                <div className={styles.regStepLine} />
                <div className={styles.regStepItem}>
                  <div className={styles.regStepNumInactive}>২</div>
                  <span className={styles.regStepTextInactive}>পেমেন্ট (৳১,০০০)</span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className={styles.regErrorAlert}>
                <div className={styles.regErrorIcon}>⚠️</div>
                <div className={styles.regErrorText}>
                  <strong>পেমেন্ট সংক্রান্ত বার্তা:</strong> {errorMsg}
                </div>
              </div>
            )}

            {/* Form Inputs Grid (2 Columns with leading icons) */}
            <div className={styles.regInputsGrid}>
              {/* Full Name */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="fullName">
                  পূর্ণ নাম <span className={styles.requiredStar}>*</span>
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

              {/* Mobile Phone */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="phone">
                  মোবাইল নাম্বার (WhatsApp সহ) <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.regInputWrapper}>
                  <Phone size={17} className={styles.regInputIcon} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Email */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="email">
                  ইমেইল ঠিকানা <span className={styles.requiredStar}>*</span>
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

              {/* Account Password */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="password">
                  অ্যাকাউন্ট পাসওয়ার্ড (ড্যাশবোর্ড লগইন) <span className={styles.requiredStar}>*</span>
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

              {/* Education Background */}
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
                    placeholder="উদাঃ এইচএসসি / স্নাতক / আলিম / ফাজিল / দাওরা"
                    value={formData.education}
                    onChange={handleChange}
                    className={styles.regInputField}
                  />
                </div>
              </div>

              {/* Laptop Option */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="hasLaptop">
                  ব্যক্তিগত ল্যাপটপ / কম্পিউটার আছে কি? <span className={styles.requiredStar}>*</span>
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
                    <option value="yes">হ্যাঁ, নিজস্ব ল্যাপটপ / কম্পিউটার আছে</option>
                    <option value="no">না, ফজর একাডেমির ডিভাইস সহায়তা প্রয়োজন</option>
                  </select>
                </div>
              </div>

              {/* Quran Skill */}
              <div className={styles.regFieldGroup}>
                <label className={styles.regFieldLabel} htmlFor="quranSkill">
                  কুরআন তিলাওয়াত দক্ষতা <span className={styles.requiredStar}>*</span>
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
                  ইংরেজি যোগাযোগ দক্ষতা <span className={styles.requiredStar}>*</span>
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
                    <option value="good">সাবলীলভাবে কথা বলতে ও বোঝাতে পারি</option>
                    <option value="fluent">ফ্লুয়েন্ট (আন্তর্জাতিক শিক্ষার্থীদের পড়াতে সক্ষম)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Action / Security Bar */}
            <div className={styles.regBottomBar}>
              <div className={styles.regSecurityBlock}>
                <ShieldCheck size={24} className={styles.regShieldIcon} />
                <div className={styles.regSecurityText}>
                  <span className={styles.regSecurityTitle}>নিরাপদ ও সহজ পেমেন্ট গেটওয়ে</span>
                  <span className={styles.regSecuritySub}>
                    SSLCommerz-এর মাধ্যমে বিকাশ, নগদ, রকেট, কার্ড ও ব্যাংকে ১,০০০৳ পরিশোধ করুন।
                  </span>
                </div>
              </div>

              <div className={styles.regFeeActionWrap}>
                <div className={styles.regFeePillDark}>
                  <span className={styles.regFeePillLabel}>রেজিস্ট্রেশন ফি</span>
                  <span className={styles.regFeePillAmount}>৳১,০০০</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.regSubmitBtnGold}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className={styles.spinnerIcon} />
                      <span>গেটওয়েতে সংযোগ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>পেমেন্টে এগিয়ে যান</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
