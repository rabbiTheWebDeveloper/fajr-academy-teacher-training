'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function RegistrationForm({ initialTrack = 'men' }) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState(initialTrack)

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
    <div id="registration-section" className={styles.regSectionWrapper}>
      {/* Track Selector Tabs / 2 Course Cards */}
      <div className={styles.trackSelectorContainer}>
        <div className={styles.trackCardsGrid}>
          {/* Track 1: MEN */}
          <div
            onClick={() => handleTrackChange('men')}
            className={`${styles.trackChoiceCard} ${
              selectedTrack === 'men' ? styles.trackChoiceActive : ''
            }`}
          >
            <div className={styles.trackBadge}>
              <span>👨‍🏫 পুরুষ শিক্ষক প্রার্থীদের জন্য</span>
              <span className={styles.trackBadgeFee}>ফি: ৳১,০০০</span>
            </div>
            <h3 className={styles.trackCardTitle}>Training of Trainers (TOT) – MEN</h3>
            <p className={styles.trackCardDesc}>
              ছেলেদের জন্য ফজর একাডেমির সাথে মাত্র ১ মাসে ৪টি প্রফেশনাল ট্রেনিং ও নিশ্চিত ক্যারিয়ার গড়ার সুযোগ।
            </p>
            <div className={styles.trackMetaInfo}>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>📅</span>
                <span>
                  <strong>First Orientation:</strong> ২০ সেপ্টেম্বর, রাত ৮:০০ টা
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>💰</span>
                <span>
                  <strong>মাসিক সম্মানী:</strong> ১৫,০০০ – ২২,০০০ টাকা
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>💻</span>
                <span>
                  <strong>ল্যাপটপ সুবিধা:</strong> ডিভাইস না থাকলে একাডেমির সহায়তা
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.trackSelectBtn} ${
                selectedTrack === 'men' ? styles.trackSelectBtnActive : ''
              }`}
            >
              {selectedTrack === 'men' ? '✓ কোর্সটি নির্বাচিত' : 'এই কোর্সটি নির্বাচন করুন (৳১,০০০)'}
            </button>
          </div>

          {/* Track 2: WOMEN */}
          <div
            onClick={() => handleTrackChange('women')}
            className={`${styles.trackChoiceCard} ${
              selectedTrack === 'women' ? styles.trackChoiceActive : ''
            }`}
          >
            <div className={styles.trackBadge}>
              <span>🧕 নারী শিক্ষক প্রার্থীদের জন্য · Batch 014</span>
              <span className={styles.trackBadgeFee}>ফি: ৳১,০০০</span>
            </div>
            <h3 className={styles.trackCardTitle}>Training of Trainers (TOT) – WOMEN</h3>
            <p className={styles.trackCardDesc}>
              Batch 013 চলমান! নতুন Batch 014-এ মাত্র ১ মাসে ৪টি ট্রেনিং সেশনে সার্টিফিকেট ও শিক্ষক পদে নিয়োগ।
            </p>
            <div className={styles.trackMetaInfo}>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>📅</span>
                <span>
                  <strong>First Orientation:</strong> ২১ সেপ্টেম্বর, রাত ৮:০০ টা
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>💰</span>
                <span>
                  <strong>মাসিক সম্মানী:</strong> ১৫,০০০ – ২২,০০০ টাকা
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaIcon}>📜</span>
                <span>
                  <strong>সার্টিফিকেট:</strong> প্রতিটি ট্রেনিং শেষে অফিসিয়াল সনদ
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.trackSelectBtn} ${
                selectedTrack === 'women' ? styles.trackSelectBtnActive : ''
              }`}
            >
              {selectedTrack === 'women' ? '✓ কোর্সটি নির্বাচিত' : 'এই কোর্সটি নির্বাচন করুন (৳১,০০০)'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Registration Form & Payment Box */}
      <div className={styles.regFormCard}>
        {submitted ? (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🎉</div>
            <h3 className={styles.successTitle}>রেজিস্ট্রেশন ও পেমেন্ট তথ্য সফলভাবে গ্রহণ করা হয়েছে!</h3>
            <p className={styles.successSubtitle}>
              আপনার নির্বাচিত কোর্স:{' '}
              <strong className={styles.goldText}>
                {selectedTrack === 'men'
                  ? 'TOT - MEN (Orientation: ২০ সেপ্টেম্বর, রাত ৮:০০ টা)'
                  : 'TOT - WOMEN Batch 014 (Orientation: ২১ সেপ্টেম্বর, রাত ৮:০০ টা)'}
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
              <div className={styles.receiptRow}>
                <span>ট্রানজেকশন ID (SSLCommerz):</span>
                <code>{formData.trxId || 'Auto Verified'}</code>
              </div>
              <div className={styles.receiptRow}>
                <span>ল্যাপটপ স্ট্যাটাস:</span>
                <span>{formData.hasLaptop === 'yes' ? 'ব্যক্তিগত ডিভাইস আছে' : 'ডিভাইস সহায়তা প্রয়োজন'}</span>
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
          <form onSubmit={handleSubmit} className={styles.formElement}>
            <div className={styles.formHeader}>
              <div className={styles.formBadge}>
                {selectedTrack === 'men' ? '👨‍🏫 TOT MEN Teacher Application' : '🧕 TOT WOMEN Batch 014 Application'}
              </div>
              <h2 className={styles.formHeading}>
                {selectedTrack === 'men'
                  ? 'TOT – MEN শিক্ষক নিবন্ধন ও পেমেন্ট'
                  : 'TOT – WOMEN Batch 014 শিক্ষক নিবন্ধন ও পেমেন্ট'}
              </h2>
              <p className={styles.formLede}>
                তথ্য পূরণ করে ১,০০০ টাকা ফি প্রদান করুন। পেমেন্টের সাথে সাথেই আপনার শিক্ষক অ্যাকাউন্ট সক্রিয় হবে এবং কোর্স ড্যাশবোর্ড দেখা যাবে।
              </p>
            </div>

            {errorMsg && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #EF4444',
                color: '#B91C1C',
                padding: '12px 18px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.92rem',
                fontWeight: '600'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 1: Personal & Account Info */}
            <div className={styles.formSectionGroup}>
              <h4 className={styles.sectionSubhead}>১. শিক্ষক প্রার্থীর প্রাথমিক ও লগইন তথ্য</h4>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="fullName">
                    পূর্ণ নাম (Full Name) *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="phone">
                    WhatsApp / মোবাইল নম্বর *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="email">
                    ইমেইল ঠিকানা (Email Address) *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="teacher@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="password">
                    অ্যাকাউন্ট পাসওয়ার্ড (ড্যাশবোর্ড লগইনের জন্য) *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.textInput}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="education">
                    শিক্ষাগত যোগ্যতা ও ব্যাকগ্রাউন্ড
                  </label>
                  <input
                    id="education"
                    name="education"
                    type="text"
                    placeholder="উদাঃ স্নাতক / আলিম / ফাজিল / মাস্টার্স / অন্যান্য"
                    value={formData.education}
                    onChange={handleChange}
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="hasLaptop">
                    ব্যক্তিগত ল্যাপটপ / কম্পিউটার আছে কি? *
                  </label>
                  <select
                    id="hasLaptop"
                    name="hasLaptop"
                    value={formData.hasLaptop}
                    onChange={handleChange}
                    className={styles.selectInput}
                  >
                    <option value="yes">হ্যাঁ, নিজস্ব ল্যাপটপ/পিসি আছে</option>
                    <option value="no">না, ফজর একাডেমির ডিভাইস সহায়তা প্রয়োজন</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="quranSkill">
                    কুরআন তিলাওয়াত দক্ষতা *
                  </label>
                  <select
                    id="quranSkill"
                    name="quranSkill"
                    value={formData.quranSkill}
                    onChange={handleChange}
                    className={styles.selectInput}
                  >
                    <option value="fluent">শুদ্ধ ও সুন্দরভাবে তিলাওয়াত করতে পারি</option>
                    <option value="tajweed">তাজবীদ ও মাখরাজসহ পারি</option>
                    <option value="hafez">আমি হাফেজ / হিফজ সম্পন্ন</option>
                    <option value="basic">মাঝারি মানের (ইমপ্রুভমেন্ট দরকার)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="englishSkill">
                    ইংরেজি যোগাযোগ দক্ষতা *
                  </label>
                  <select
                    id="englishSkill"
                    name="englishSkill"
                    value={formData.englishSkill}
                    onChange={handleChange}
                    className={styles.selectInput}
                  >
                    <option value="basic">বেসিক ইংরেজি জানি ও বুঝি</option>
                    <option value="good">সাবলীলভাবে কথা বলতে পারি</option>
                    <option value="fluent">ফ্লুয়েন্ট (আন্তর্জাতিক শিক্ষার্থীদের পড়াতে সক্ষম)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Official SSLCommerz Payment Gateway */}
            <div className={styles.formSectionGroup}>
              <h4 className={styles.sectionSubhead}>২. কোর্স ফি ও অফিসিয়াল পেমেন্ট গেটওয়ে</h4>

              <div style={{
                background: 'linear-gradient(135deg, #051329 0%, #081A3A 50%, #0B2545 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1.5px solid rgba(197, 155, 39, 0.4)',
                boxShadow: '0 12px 30px rgba(5, 19, 41, 0.25)',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '1px solid rgba(197, 155, 39, 0.25)',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Official SSLCommerz Logo */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://securepay.sslcommerz.com/public/image/sslcommerz.png"
                      alt="SSLCommerz Official Payment Gateway"
                      style={{
                        height: '38px',
                        width: 'auto',
                        objectFit: 'contain',
                        background: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#D4AF37', fontWeight: '800', letterSpacing: '0.04em' }}>
                        OFFICIAL PAYMENT GATEWAY
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#FFFFFF' }}>
                        SSLCommerz 256-Bit Secure
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>রেজিস্ট্রেশন ফি</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#D4AF37' }}>
                      ৳ ১,০০০ <span style={{ fontSize: '0.85rem', color: '#FDFBF7' }}>BDT</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '0.82rem',
                  color: '#E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10B981', fontSize: '1rem' }}>✓</span>
                    <span>বিকাশ, নগদ, রকেট, ভিসা, মাস্টারকার্ড ও সকল ইন্টারনেট ব্যাংকিং সাপোর্টেড</span>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: '700'
                  }}>
                    ইনস্ট্যান্ট অটো-ভেরিফিকেশন
                  </div>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className={styles.formSubmitRow}>
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${styles.btnGold} ${styles.btnSubmitLarge}`}
              >
                {loading
                  ? '⏳ SSLCommerz পেমেন্ট গেটওয়েতে সংযোগ হচ্ছে...'
                  : '🔒 SSLCommerz গেটওয়েতে ১,০০০৳ পরিশোধ করুন ও অ্যাকাউন্ট সক্রিয় করুন →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
