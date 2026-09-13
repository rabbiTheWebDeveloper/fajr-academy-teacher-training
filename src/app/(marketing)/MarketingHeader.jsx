'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import {
  Home,
  BookOpen,
  HelpCircle,
  Phone,
  MessageCircle,
  Tag,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Video,
} from 'lucide-react'

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerInner}>
        {/* ── Brand Logo & Slogan ── */}
        <a href="#" className={styles.brand} onClick={closeMobileMenu}>
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

        {/* ── Desktop Center Nav Menu ── */}
        <nav className={styles.navMenu}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
            <Home size={15} color="#F5B335" />
            <span>হোম</span>
          </a>
          <a href="#tracks-section" className={styles.navItem}>
            <span>কোর্সসমূহ</span>
          </a>
          <a href="#why-fajr" className={styles.navItem}>
            <span>কেন ফজর</span>
          </a>
          <a href="#process-section" className={styles.navItem}>
            <span>ধাপসমূহ</span>
          </a>
          <a href="#program-videos" className={styles.navItem}>
            <span>ভিডিও</span>
          </a>
          <a href="#faq" className={styles.navItem}>
            <span>FAQ</span>
          </a>
          <a href="#footer-section" className={styles.navItem}>
            <span>যোগাযোগ</span>
          </a>
        </nav>

        {/* ── Desktop Right Actions & WhatsApp ── */}
        <div className={styles.headerActions}>
          <a href="#course-men" className={styles.pillBadge}>
            <div className={`${styles.badgeIconCircle} ${styles.badgeIconBlue}`}>
              <User size={12} />
            </div>
            <div className={styles.badgeTextCol}>
              <span className={styles.badgeTitle}>TOT for Men</span>
              <span className={styles.badgeSub}>Batch 2026</span>
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
            <Tag size={13} color="#F8CE67" />
            <span>৳ ১,০০০</span>
          </div>

          <a
            href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerWhatsappBtn}
            title="WhatsApp-এ সরাসরি যোগাযোগ করুন"
          >
            <div className={styles.whatsappIconBox}>
              <MessageCircle size={15} fill="#fff" color="#25D366" />
            </div>
            <div className={styles.whatsappTextBox}>
              <span className={styles.whatsappNum}>01641028312</span>
              <span className={styles.whatsappLabel}>
                <span className={styles.onlineDot} /> WhatsApp
              </span>
            </div>
          </a>

          {/* Hamburger button for mobile/tablet */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavOverlay} onClick={closeMobileMenu}>
          <div className={styles.mobileNavDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <div className={styles.mobileDrawerBrand}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fajr-logo.png" alt="FAJR Academy" className={styles.brandLogoImgSmall} />
                <div>
                  <div className={styles.brandLogoTitle}>FAJR ACADEMY</div>
                  <div className={styles.brandSloganAccentSmall}>Dunya &amp; Akhirah</div>
                </div>
              </div>
              <button
                type="button"
                className={styles.mobileCloseBtn}
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Badges in Drawer */}
            <div className={styles.mobileBadgesRow}>
              <a href="#course-men" className={styles.mobileTrackBadge} onClick={closeMobileMenu}>
                <span className={styles.mobileBadgeIconBlue}>👨‍🏫</span>
                <span>TOT Men (৳১,০০০)</span>
              </a>
              <a href="#course-women" className={styles.mobileTrackBadge} onClick={closeMobileMenu}>
                <span className={styles.mobileBadgeIconPink}>🧕</span>
                <span>TOT Women (৳১,০০০)</span>
              </a>
            </div>

            {/* Nav Links */}
            <nav className={styles.mobileNavList}>
              <a href="#" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <Home size={18} color="#F5B335" />
                <span>হোমপেজ</span>
              </a>
              <a href="#tracks-section" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <BookOpen size={18} color="#60A5FA" />
                <span>কোর্স ও ব্যাচসমূহ</span>
              </a>
              <a href="#registration-section" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <Sparkles size={18} color="#F59E0B" />
                <span>অনলাইন রেজিস্ট্রেশন ফর্ম</span>
              </a>
              <a href="#why-fajr" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <ShieldCheck size={18} color="#10B981" />
                <span>কেন ফজর একাডেমি</span>
              </a>
              <a href="#process-section" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <span className={styles.mobileNavBullet}>❖</span>
                <span>৪টি সহজ ধাপ</span>
              </a>
              <a href="#program-videos" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <Video size={18} color="#EC4899" />
                <span>ভিডিও নির্দেশিকা</span>
              </a>
              <a href="#faq" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <HelpCircle size={18} color="#A78BFA" />
                <span>প্রশ্ন ও উত্তর (FAQ)</span>
              </a>
              <a href="#footer-section" className={styles.mobileNavLink} onClick={closeMobileMenu}>
                <Phone size={18} color="#38BDF8" />
                <span>যোগাযোগ ও হেল্পলাইন</span>
              </a>
            </nav>

            {/* Mobile Contact Action */}
            <div className={styles.mobileDrawerFooter}>
              <a
                href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileWhatsappCta}
                onClick={closeMobileMenu}
              >
                <MessageCircle size={18} fill="#fff" color="#25D366" />
                <span>WhatsApp-এ সরাসরি কথা বলুন</span>
              </a>
              <div className={styles.mobileHotlineNote}>
                হটলাইন: <strong>01641028312</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
