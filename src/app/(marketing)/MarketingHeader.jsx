'use client'

import { useState, useEffect, useRef } from 'react'
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
  GraduationCap,
  ChevronDown,
} from 'lucide-react'

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled]             = useState(false)
  const drawerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  const navLinks = [
    { href: '#',                label: 'হোম',          icon: <Home size={15} color="#E5C04A" /> },
    { href: '#tracks-section',  label: 'কোর্সসমূহ',   icon: <BookOpen size={15} /> },
    { href: '#why-fajr',        label: 'কেন ফজর',      icon: <ShieldCheck size={15} /> },
    { href: '#process-section', label: 'ধাপসমূহ',      icon: null },
    { href: '#program-videos',  label: 'ভিডিও',        icon: <Video size={15} /> },
    { href: '#faq',             label: 'FAQ',           icon: <HelpCircle size={15} /> },
    { href: '#footer-section',  label: 'যোগাযোগ',      icon: <Phone size={15} /> },
  ]

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerInner}>

        {/* ── Brand ── */}
        <a href="#" className={styles.brand} onClick={closeMenu} aria-label="Fajr Academy Home">
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

        {/* ── Desktop Nav ── */}
        <nav className={styles.navMenu} aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className={`${styles.navItem} ${link.href === '#' ? styles.navItemActive : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* ── Desktop Right Actions ── */}
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
              <Sparkles size={11} />
            </div>
            <div className={styles.badgeTextCol}>
              <span className={styles.badgeTitle}>TOT for Women</span>
              <span className={styles.badgeSub}>Batch 014</span>
            </div>
          </a>

          <div className={styles.pillPrice}>
            <Tag size={13} color="#E5C04A" />
            <span>৳ ১,০০০</span>
          </div>

          <a
            href="https://wa.me/8801410764581?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerWhatsappBtn}
            title="WhatsApp-এ সরাসরি যোগাযোগ করুন"
            id="header-whatsapp-btn"
          >
            <div className={styles.whatsappIconBox}>
              <MessageCircle size={15} fill="#fff" color="#25D366" />
            </div>
            <div className={styles.whatsappTextBox}>
              <span className={styles.whatsappNum}>01410764581</span>
              <span className={styles.whatsappLabel}>
                <span className={styles.onlineDot} /> WhatsApp
              </span>
            </div>
          </a>

          {/* Hamburger */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            id="hamburger-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavOverlay} onClick={closeMenu} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            id="mobile-nav-drawer"
            className={styles.mobileNavDrawer}
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
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
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  id="mobile-close-btn"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Track Quick Badges */}
              <div className={styles.mobileBadgesRow}>
                <a href="#course-men" className={styles.mobileTrackBadge} onClick={closeMenu} id="mobile-men-badge">
                  <span className={styles.mobileBadgeIconBlue}>👨‍🏫</span>
                  <span>TOT Men (৳১,০০০)</span>
                </a>
                <a href="#course-women" className={styles.mobileTrackBadge} onClick={closeMenu} id="mobile-women-badge">
                  <span className={styles.mobileBadgeIconPink}>🧕</span>
                  <span>TOT Women Batch 014 (৳১,০০০)</span>
                </a>
              </div>

              {/* Nav Links */}
              <nav className={styles.mobileNavList} aria-label="Mobile navigation">
                <a href="#" className={styles.mobileNavLink} onClick={closeMenu}>
                  <Home size={18} color="#E5C04A" />
                  <span>হোমপেজ</span>
                </a>
                <a href="#tracks-section" className={styles.mobileNavLink} onClick={closeMenu}>
                  <BookOpen size={18} color="#60A5FA" />
                  <span>কোর্স ও ব্যাচসমূহ</span>
                </a>
                <a href="#registration-section" className={styles.mobileNavLink} onClick={closeMenu}>
                  <Sparkles size={18} color="#F59E0B" />
                  <span>অনলাইন রেজিস্ট্রেশন ফর্ম</span>
                </a>
                <a href="#why-fajr" className={styles.mobileNavLink} onClick={closeMenu}>
                  <ShieldCheck size={18} color="#10B981" />
                  <span>কেন ফজর একাডেমি</span>
                </a>
                <a href="#process-section" className={styles.mobileNavLink} onClick={closeMenu}>
                  <span className={styles.mobileNavBullet}>❖</span>
                  <span>৪টি সহজ ধাপ</span>
                </a>
                <a href="#program-videos" className={styles.mobileNavLink} onClick={closeMenu}>
                  <Video size={18} color="#EC4899" />
                  <span>ভিডিও নির্দেশিকা</span>
                </a>
                <a href="#faq" className={styles.mobileNavLink} onClick={closeMenu}>
                  <HelpCircle size={18} color="#A78BFA" />
                  <span>প্রশ্ন ও উত্তর (FAQ)</span>
                </a>
                <a href="#footer-section" className={styles.mobileNavLink} onClick={closeMenu}>
                  <Phone size={18} color="#38BDF8" />
                  <span>যোগাযোগ ও হেল্পলাইন</span>
                </a>
              </nav>
            </div>

            {/* Drawer Footer CTA */}
            <div className={styles.mobileDrawerFooter}>
              <a
                href="https://wa.me/8801410764581?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20সম্পর্কে%20জানতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileWhatsappCta}
                onClick={closeMenu}
                id="mobile-whatsapp-cta"
              >
                <MessageCircle size={18} fill="#fff" color="#25D366" />
                <span>WhatsApp-এ সরাসরি কথা বলুন</span>
              </a>
              <div className={styles.mobileHotlineNote}>
                হটলাইন: <strong>01410764581</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
