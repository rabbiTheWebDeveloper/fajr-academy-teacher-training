'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function RegistrationForm({ initialTrack = 'men' }) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState(initialTrack)
  const [paymentMethod, setPaymentMethod] = useState('sslcommerz') // 'sslcommerz' | 'bkash_manual'

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
    bkashNumber: '',
    trxId: '',
  })

  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleCopyBkash = () => {
    navigator.clipboard.writeText('01410764581')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // Handle Form Submission with SSLCommerz or bKash
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const trackKey = selectedTrack === 'men' ? 'TOT-MEN' : 'TOT-WOMEN-014'

    if (paymentMethod === 'sslcommerz') {
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
    } else {
      // Manual bKash TrxID submission
      setTimeout(() => {
        setLoading(false)
        setSubmitted(true)
      }, 600)
    }
  }

  const handleWhatsAppConfirm = () => {
    const trackTitle =
      selectedTrack === 'men'
        ? 'TOT - MEN (Orientation: 20 Sep, 8 PM)'
        : 'TOT - WOMEN Batch 014 (Orientation: 21 Sep, 8 PM)'

    const message = `*Fajr Academy TOT Teacher Registration*%0A%0A` +
      `*কোর্স:* ${trackTitle}%0A` +
      `*নাম:* ${formData.fullName}%0A` +
      `*মোবাইল/WhatsApp:* ${formData.phone}%0A` +
      `*ইমেইল:* ${formData.email || 'N/A'}%0A` +
      `*ল্যাপটপ স্ট্যাটাস:* ${formData.hasLaptop === 'yes' ? 'ল্যাপটপ আছে' : 'ল্যাপটপ নেই (ডিভাইস সহায়তা প্রয়োজন)'}%0A` +
      `*কুরআন পাঠ দক্ষতা:* ${formData.quranSkill}%0A` +
      `*ইংরেজি দক্ষতা:* ${formData.englishSkill}%0A` +
      `*শিক্ষাগত ব্যাকগ্রাউন্ড:* ${formData.education || 'N/A'}%0A` +
      `*রেজিস্ট্রেশন ফি:* ১,০০০ ৳%0A` +
      `*পেমেন্ট মেথড:* ${paymentMethod === 'sslcommerz' ? 'SSLCommerz Online Gateway' : 'bKash Manual'}%0A` +
      `*বিকাশ নম্বর / TrxID:* ${formData.bkashNumber || 'N/A'} / ${formData.trxId || 'N/A'}%0A%0A` +
      `আমার অ্যাকাউন্ট সক্রিয় করে ক্লাসরুমে যুক্ত করুন। ধন্যবাদ!`

    window.open(`https://wa.me/8801641028312?text=${message}`, '_blank')
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
                <span>বিকাশ TrxID:</span>
                <code>{formData.trxId || 'N/A'}</code>
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

            {/* Step 2: Payment Gateway Selection */}
            <div className={styles.formSectionGroup}>
              <h4 className={styles.sectionSubhead}>২. পেমেন্ট মেথড ও কোর্স ফি (৳১,০০০)</h4>

              {/* Payment Method Switcher */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '20px'
              }}>
                <div
                  onClick={() => setPaymentMethod('sslcommerz')}
                  style={{
                    border: paymentMethod === 'sslcommerz' ? '2px solid #059669' : '1.5px solid #D1D5DB',
                    background: paymentMethod === 'sslcommerz' ? '#ECFDF5' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#065F46', fontSize: '0.98rem' }}>
                    💳 SSLCommerz অনলাইন পেমেন্ট (১,০০০৳)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '4px' }}>
                    বিকাশ, নগদ, রকেট, ভিসা, মাস্টারকার্ড — ইনস্ট্যান্ট স্বয়ংক্রিয় কোর্স অ্যাক্সেস
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('bkash_manual')}
                  style={{
                    border: paymentMethod === 'bkash_manual' ? '2px solid #C9A24B' : '1.5px solid #D1D5DB',
                    background: paymentMethod === 'bkash_manual' ? '#FFFBEB' : '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#92400E', fontSize: '0.98rem' }}>
                    📱 বিকাশ মার্চেন্ট পেমেন্ট (ম্যানুয়াল TrxID)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#B45309', marginTop: '4px' }}>
                    01410764581 নম্বরে পেমেন্ট করে TrxID দিয়ে সাবমিট
                  </div>
                </div>
              </div>

              {paymentMethod === 'sslcommerz' ? (
                <div style={{
                  background: 'linear-gradient(135deg, #0B1A45 0%, #1E3A8A 100%)',
                  color: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#F0D97A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      অফিসিয়াল পেমেন্ট গেটওয়ে
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                      SSLCommerz Secure Checkout
                    </div>
                    <div style={{ fontSize: '0.86rem', opacity: 0.85, marginTop: '4px' }}>
                      পেমেন্ট সফল হওয়ামাত্রই আপনার টিচার আইডি ও কোর্স অ্যাকাউন্ট তৈরি হবে।
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>কোর্স ফি</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F0D97A' }}>
                      ৳১,০০০
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.paymentInstructionBox}>
                    <div className={styles.paymentBoxLeft}>
                      <div className={styles.bkashLogoBadge}>bKash Merchant</div>
                      <div className={styles.paymentAmountTag}>
                        <span>কোর্স ফি:</span>
                        <strong>১,০০০ ৳</strong>
                      </div>
                      <div className={styles.paymentNumberDisplay}>
                        <span>বিকাশ মার্চেন্ট নম্বর:</span>
                        <strong className={styles.bkashNumberText}>01410764581</strong>
                        <button
                          type="button"
                          onClick={handleCopyBkash}
                          className={styles.copyBtn}
                        >
                          {copied ? '✓ কপি হয়েছে' : '📋 কপি করুন'}
                        </button>
                      </div>
                    </div>

                    <div className={styles.paymentBoxRight}>
                      <p className={styles.instructionStepTitle}>💡 কীভাবে বিকাশ পেমেন্ট করবেন:</p>
                      <ol className={styles.instructionList}>
                        <li>বিকাশ অ্যাপ ওপেন করে <strong>Make Payment</strong> সিলেক্ট করুন।</li>
                        <li>নম্বর দিন: <strong>01410764581</strong></li>
                        <li>টাকার পরিমাণ লিখুন: <strong>1000</strong></li>
                        <li>রেফারেন্সে লিখুন: <strong>{selectedTrack === 'men' ? 'TOT-MEN' : 'TOT-WOMEN'}</strong></li>
                        <li>পেমেন্ট সফল হলে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> নিচের বক্সে লিখুন।</li>
                      </ol>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel} htmlFor="bkashNumber">
                        যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন *
                      </label>
                      <input
                        id="bkashNumber"
                        name="bkashNumber"
                        type="tel"
                        required={paymentMethod === 'bkash_manual'}
                        placeholder="01XXXXXXXXX"
                        value={formData.bkashNumber}
                        onChange={handleChange}
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.inputLabel} htmlFor="trxId">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        id="trxId"
                        name="trxId"
                        type="text"
                        required={paymentMethod === 'bkash_manual'}
                        placeholder="উদাঃ BAF71829XQ"
                        value={formData.trxId}
                        onChange={handleChange}
                        className={styles.textInput}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit CTA */}
            <div className={styles.formSubmitRow}>
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${styles.btnGold} ${styles.btnSubmitLarge}`}
              >
                {loading
                  ? 'পেমেন্ট গেটওয়েতে সংযোগ হচ্ছে...'
                  : paymentMethod === 'sslcommerz'
                  ? '🔒 SSLCommerz-এ ১,০০০৳ পে করুন ও অ্যাকাউন্ট সক্রিয় করুন →'
                  : '✓ ম্যানুয়াল রেজিস্ট্রেশন সম্পন্ন করুন (১,০০০৳)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
