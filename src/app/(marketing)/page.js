import styles from './page.module.css'
import RevealObserver from './RevealObserver'

/* ------------------------------------------------------------------ */
/*  Fajr Academy logo — inline base64 so no external image request    */
/* ------------------------------------------------------------------ */
const LOGO_B64 =
  'data:image/png;base64,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'

/* ------------------------------------------------------------------ */
/*  Page-level metadata (replaces <title> and <meta description>)     */
/* ------------------------------------------------------------------ */
export const metadata = {
  title: 'ফিমেইল কুরআন টিচার নিবন্ধন | ফজর একাডেমি',
  description:
    'জেনারেল লাইনে পড়ালেখা করা দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমির সম্পূর্ণ অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে নিবন্ধন করুন।',
}

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */
export default function FemaleTeacherRegistrationPage() {
  return (
    <div className={styles.pageRoot}>
      {/* ── Scroll-reveal wiring (client-only, renders nothing) ─── */}
      <RevealObserver />

      {/* ════════════════════════════════════════════════════════
          TOP BAR
          ════════════════════════════════════════════════════════ */}
      <div className={styles.topbar}>
        <div className={`${styles.wrap} ${styles.topbarInner}`}>
          <span>দ্বীনে ফেরা আপুদের জন্য — সম্পূর্ণ অনলাইন কুরআন টিচার ট্রেনিং</span>
          <a className={styles.topbarPhone} href="https://wa.me/8801641028312">
            WhatsApp: 01641028312
          </a>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════ */}
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_B64} alt="Fajr Academy" className={styles.brandLogo} />
            <div className={styles.brandDivider} />
            <div>
              <div className={styles.brandName}>ফজর একাডেমি</div>
              <div className={styles.brandTag}>Balanced Education for Dunya &amp; Akhirah</div>
            </div>
          </div>
          <div className={styles.pillTags}>
            <span className={styles.pill}>Arabic Language</span>
            <span className={styles.pill}>Islamic Studies</span>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          {/* ── Left column ── */}
          <div>
            <span className={styles.eyebrow}>
              Female Quran Teacher — Batch Registration
            </span>
            <h1 className={styles.heroH1}>
              শুদ্ধভাবে কুরআন পড়তে জানেন?{' '}
              <span className={styles.heroH1Accent}>ঘরে বসেই</span> হয়ে উঠুন প্রশিক্ষিত কুরআন
              টিচার
            </h1>
            <p className={styles.heroLede}>
              জেনারেল লাইনে পড়ালেখা করা দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমি নিয়ে এসেছে সম্পূর্ণ
              অনলাইন টিচার ট্রেনিং প্রোগ্রাম। মাত্র ৪টি সেশন সম্পন্ন করেই ইনশাআল্লাহ যুক্ত হোন
              আমাদের টিচার প্যানেলে।
            </p>
            <div className={styles.ctaRow}>
              <a
                id="hero-register-cta"
                className={`${styles.btn} ${styles.btnGold}`}
                href="https://forms.gle/ASopvieNbtEHybb19"
                target="_blank"
                rel="noopener noreferrer"
              >
                রেজিস্ট্রেশন ফর্ম পূরণ করুন →
              </a>
              <a
                id="hero-whatsapp-cta"
                className={`${styles.btn} ${styles.btnOutline}`}
                href="https://wa.me/8801641028312"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp-এ জিজ্ঞাসা করুন
              </a>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <b className={styles.statValue}>৫০</b>
                <span className={styles.statLabel}>আসন সংখ্যা</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>৪</b>
                <span className={styles.statLabel}>ট্রেনিং সেশন</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>১,০০০৳</b>
                <span className={styles.statLabel}>রেজিস্ট্রেশন ফি</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>১০০%</b>
                <span className={styles.statLabel}>অনলাইন ক্লাস</span>
              </div>
            </div>
          </div>

          {/* ── Right column — arch visual ── */}
          <div className={styles.heroVisual}>
            <div className={styles.heroArch}>
              <div className={styles.centerMark}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_B64} alt="Fajr Academy" className={styles.heroLogo} />
                <div className={styles.glyphBn}>কুরআন টিচার ব্যাচ ২০২৬</div>
              </div>
              <div className={styles.miniArches}>
                <div className={styles.miniArch} />
                <div className={styles.miniArch} />
                <div className={styles.miniArch} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY SECTION
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.why}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>কেন ফজর একাডেমি</span>
            <h2>প্রশিক্ষণ থেকে সরাসরি নিয়োগ পর্যন্ত — একটি স্বচ্ছ পথ</h2>
            <p>
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে সফল আপুদের একাডেমিতে শিক্ষক হিসেবে
              কাজের সুযোগও দেয়।
            </p>
          </div>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>১</div>
              <h3>ঘরে বসেই কাজ ও ট্রেনিং</h3>
              <p>
                ট্রেনিং এবং পরবর্তী শিক্ষকতা — দুটোই সম্পূর্ণ অনলাইনে, তাই আপনি ঘরে বসেই যুক্ত
                থাকতে পারবেন।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>২</div>
              <h3>স্বীকৃত সার্টিফিকেট</h3>
              <p>
                ৪টি সেশন সফলভাবে শেষ করলে ফজর একাডেমি থেকে প্রদান করা হবে অফিসিয়াল সার্টিফিকেট।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>৩</div>
              <h3>নিশ্চিত কাজের সুযোগ</h3>
              <p>
                ট্রেনিং শেষে যোগ্য আপুদের জন্য থাকছে ফজর একাডেমিতে কুরআন টিচার হিসেবে কাজের সুযোগ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROCESS TIMELINE
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.process}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>প্রক্রিয়া</span>
            <h2>নিবন্ধন থেকে নিয়োগ পর্যন্ত ৪টি ধাপ</h2>
          </div>
          <div className={styles.timeline}>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০১</div>
              <h3>ফর্ম পূরণ ও ফি প্রদান</h3>
              <p>রেজিস্ট্রেশন ফর্মটি পূরণ করুন এবং বিকাশে ১,০০০ টাকা রেজিস্ট্রেশন ফি প্রদান করুন।</p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০২</div>
              <h3>বাছাই পর্ব</h3>
              <p>
                প্রার্থীর কুরআন তেলাওয়াতের দক্ষতা এবং ব্যক্তিগত ল্যাপটপ/ডেস্কটপ আছে কিনা যাচাই করা
                হবে।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৩</div>
              <h3>৪টি ট্রেনিং সেশন</h3>
              <p>
                নির্বাচিত প্রার্থীরা সম্পূর্ণ অনলাইনে ৪টি সেশনে অংশগ্রহণ করে প্রশিক্ষণ সম্পন্ন
                করবেন।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৪</div>
              <h3>সার্টিফিকেট ও নিয়োগ</h3>
              <p>
                সফলভাবে ট্রেনিং শেষে সার্টিফিকেট এবং ফজর একাডেমিতে শিক্ষক হিসেবে কাজের সুযোগ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          REQUIREMENTS + FEE
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.reqFee}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>আবেদনের আগে</span>
            <h2>যা যা লাগবে ও ফি সংক্রান্ত তথ্য</h2>
          </div>
          <div className={styles.rfGrid}>
            {/* Requirements */}
            <div className={`${styles.card} ${styles.reqCard}`} data-reveal>
              <h3>আবেদনের প্রয়োজনীয়তা</h3>
              <ul className={styles.reqList}>
                <li>
                  <span className={styles.check}>✓</span>
                  শুদ্ধভাবে কুরআন তেলাওয়াত করার দক্ষতা
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  ব্যক্তিগত ল্যাপটপ বা ডেস্কটপ (অনলাইন ক্লাসের জন্য অপরিহার্য)
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  স্থিতিশীল ইন্টারনেট সংযোগ
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  যোগাযোগের জন্য সচল WhatsApp নম্বর
                </li>
              </ul>
            </div>

            {/* Fee */}
            <div className={`${styles.card} ${styles.feeCard}`} data-reveal>
              <span className={styles.feeCardEyebrow}>রেজিস্ট্রেশন</span>
              <h3>ফি ও পেমেন্ট তথ্য</h3>
              <div className={styles.feeAmount}>
                <sup>৳</sup>১,০০০
              </div>
              <div className={styles.feeRows}>
                <div className={styles.feeRow}>
                  <span>বিকাশ পেমেন্ট নম্বর</span>
                  <b>01410764581</b>
                </div>
                <div className={styles.feeRow}>
                  <span>পেমেন্ট মেথড</span>
                  <b>বিকাশ অ্যাপ · Make Payment</b>
                </div>
                <div className={styles.feeRow}>
                  <span>যোগাযোগ (WhatsApp/Call)</span>
                  <b>01641028312</b>
                </div>
              </div>
              <p className={styles.feeNote}>
                পেমেন্ট সম্পন্ন করার পর রেজিস্ট্রেশন ফর্মে ট্রানজেকশন আইডি উল্লেখ করে ফর্মটি জমা
                দিন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VIDEO / SOCIAL PROOF
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.media}`}>
        <div className={`${styles.wrap} ${styles.mediaGrid}`}>
          <div className={styles.videoCard} data-reveal>
            <iframe
              src="https://www.youtube.com/embed/zPXTzup-2ok?autoplay=1&mute=1&loop=1&playlist=zPXTzup-2ok&controls=1&rel=0&playsinline=1"
              title="Fajr Academy Teacher Training Program Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className={styles.videoIframe}
            />
          </div>

          <div className={styles.founderNote} data-reveal>
            <span className={styles.quoteMark}>&ldquo;</span>
            <p>
              জেনারেল লাইনে পড়ালেখা করা যেসব আপুরা দ্বীনে ফিরে শুদ্ধভাবে কুরআন পড়তে শিখেছেন,
              তাদের জন্য এটি একটি সুন্দর সুযোগ — নিজে শেখা কুরআনকে অন্যদের কাছে পৌঁছে দেওয়ার,
              এবং একইসাথে একটি বরকতময় কাজের সুযোগ তৈরি করার।
            </p>
            <div className={styles.founderId}>
              <div className={styles.founderAv}>M</div>
              <div>
                <b>Muhammad Farabi Chowdhury</b>
                <span>Founder, Fajr Academy</span>
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
            <span className={styles.eyebrow}>সাধারণ প্রশ্ন</span>
            <h2>আপনার প্রশ্নের উত্তর</h2>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ট্রেনিংটি কি অনলাইনে?</summary>
              <p className={styles.faqText}>
                হ্যাঁ। ট্রেনিং এবং শিক্ষকতার কাজ অনলাইনে পরিচালিত হবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ট্রেনিংয়ে কয়টি সেশন থাকবে?</summary>
              <p className={styles.faqText}>
                নির্বাচিত প্রার্থীদের মোট ৪টি ট্রেনিং সেশনে অংশগ্রহণ করতে হবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ট্রেনিং ফি কত?</summary>
              <p className={styles.faqText}>
                সাধারণ ট্রেনিং ফি ৳১,০০০।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ল্যাপটপ বা ডেস্কটপ কি বাধ্যতামূলক?</summary>
              <p className={styles.faqText}>
                অনলাইনে ক্লাস নেওয়ার জন্য ব্যক্তিগত ল্যাপটপ বা ডেস্কটপ থাকা প্রয়োজন।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ট্রেনিং শেষ করলে কি শিক্ষক হিসেবে কাজের সুযোগ আছে?</summary>
              <p className={styles.faqText}>
                হ্যাঁ। সফলভাবে ট্রেনিং সম্পন্নকারীদের ফজর একাডেমিতে শিক্ষক হিসেবে কাজের সুযোগ থাকবে।
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
          <span className={styles.finalCtaEyebrow}>Batch 2026 · সীমিত ৫০ আসন</span>
          <h2>আজই নিবন্ধন করুন, ইনশাআল্লাহ হয়ে উঠুন প্রশিক্ষিত কুরআন টিচার</h2>
          <p>
            ফর্ম পূরণ করতে ৫ মিনিটের বেশি সময় লাগবে না। যেকোনো প্রশ্নে সরাসরি WhatsApp-এ যোগাযোগ
            করুন।
          </p>
          <div className={styles.finalCtaRow}>
            <a
              id="footer-register-cta"
              className={`${styles.btn} ${styles.btnGold}`}
              href="https://forms.gle/ASopvieNbtEHybb19"
              target="_blank"
              rel="noopener noreferrer"
            >
              রেজিস্ট্রেশন ফর্ম পূরণ করুন →
            </a>
            <a
              id="footer-call-cta"
              className={`${styles.btn} ${styles.btnOutline}`}
              href="https://wa.me/8801641028312"
              target="_blank"
              rel="noopener noreferrer"
            >
              01641028312 নম্বরে কল/WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_B64} alt="Fajr Academy" className={styles.footerLogo} />
          <span>
            ফজর একাডেমি · Balanced Education for Dunya and Akhirah — © 2026 · যোগাযোগ:{' '}
            <a href="https://wa.me/8801641028312">01641028312</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
