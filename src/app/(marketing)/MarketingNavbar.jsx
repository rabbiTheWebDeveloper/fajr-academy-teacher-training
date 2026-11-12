'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Home,
  BookOpen,
  Layers,
  CalendarDays,
  GraduationCap,
  ListChecks,
  ShieldCheck,
  Play,
  HelpCircle,
  LogIn,
  LayoutDashboard,
} from 'lucide-react'
import MessengerIcon from './MessengerIcon'
import { toBengaliNumber } from '@/lib/utils'
import { FACEBOOK_MESSENGER_URL } from './contact'

const NAV_ITEMS = [
  { href: '#home', label: 'হোম', Icon: Home },
  { href: '#courses', label: 'কোর্সসমূহ', Icon: BookOpen },
  { href: '#curriculum', label: 'কারিকুলাম', Icon: Layers },
  { href: '#schedule', label: 'সেশনের তারিখ', Icon: CalendarDays },
  { href: '#instructors', label: 'শিক্ষক প্যানেল', Icon: GraduationCap },
  { href: '#process', label: 'ধাপসমূহ', Icon: ListChecks },
  { href: '#why', label: 'কেন ফজর', Icon: ShieldCheck },
  { href: '#videos', label: 'ভিডিও', Icon: Play },
  { href: '#faq', label: 'FAQ', Icon: HelpCircle },
]

/**
 * `account` is set by the server page when the visitor already has a session:
 * { href } → their own panel. The login button then becomes a "ড্যাশবোর্ড" shortcut.
 */
export default function MarketingNavbar({ settings = {}, closed = false, account = null }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const coursePrice = settings?.coursePrice || 1000

  // Secondary action: returning users sign in, signed-in users jump to their panel.
  const portal = account?.href
    ? { href: account.href, label: 'ড্যাশবোর্ড', longLabel: 'আমার ড্যাশবোর্ডে যান', Icon: LayoutDashboard }
    : { href: '/login', label: 'লগইন', longLabel: 'অ্যাকাউন্টে লগইন করুন', Icon: LogIn }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)

      // Active section scroll spy
      const sections = NAV_ITEMS.map((item) => item.href.substring(1))
      const scrollPos = window.scrollY + 120

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // While the menu sheet is open: lock page scroll and let Escape close it.
  useEffect(() => {
    if (!mobileMenuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileMenuOpen])

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <nav
      id="navbar"
      aria-label="প্রধান মেনু"
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 sm:py-3 bg-[#060D1A]/95 backdrop-blur-xl border-b border-amber-400/20 shadow-2xl shadow-black/50'
          : 'py-2.5 sm:py-4 bg-[#060D1A]/80 backdrop-blur-md border-b border-white/5'
      } px-3 sm:px-6 md:px-12 flex justify-between items-center gap-2`}
    >
      <div className="flex min-w-0 items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2 sm:gap-3 group min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400/40 p-0.5 bg-gradient-to-br from-[#0B1A45] to-[#060D1A] shadow-md shadow-amber-500/15 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="FAJR Academy Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="text-[15px] max-[359px]:text-[13px] max-[359px]:tracking-wide sm:text-lg font-black tracking-wider text-white leading-none font-serif flex items-center gap-1 whitespace-nowrap">
              <span>FAJR</span>
              <span className="text-gradient-gold">ACADEMY</span>
            </div>
            <div className="max-[359px]:hidden text-[8px] sm:text-[9px] text-amber-300/80 tracking-widest uppercase font-semibold mt-1 truncate">
              Balanced Education
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-0.5 text-sm font-medium text-slate-300">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.substring(1)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs 2xl:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-amber-300 font-semibold bg-white/[0.06]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
                )}
              </a>
            )
          })}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Admission button — visible on every screen size */}
        {!closed && (
          <a
            href="#register"
            className="cta-glow cta-shine inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-black min-h-10 px-3.5 max-[359px]:px-3 sm:px-5 rounded-full text-[13px] sm:text-sm whitespace-nowrap active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-900 max-[359px]:hidden" />
            <span>
              ভর্তি হোন<span className="hidden 2xl:inline"> ({toBengaliNumber(coursePrice)} ৳)</span>
            </span>
          </a>
        )}

        {/* Login / dashboard — quiet outline so "ভর্তি হোন" stays the primary action.
            On narrow phones it lives in the menu sheet, unless admission is closed and
            the primary button is gone. Icon-only until there is room for the label. */}
        <Link
          href={portal.href}
          aria-label={portal.longLabel}
          title={portal.longLabel}
          className={`${
            closed ? 'inline-flex' : 'hidden min-[430px]:inline-flex'
          } items-center justify-center gap-1.5 min-h-10 min-w-10 sm:px-4 rounded-full border border-white/15 bg-white/[0.05] text-slate-100 font-bold text-sm whitespace-nowrap hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 active:scale-95 transition-all duration-200 shrink-0`}
        >
          <portal.Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{portal.label}</span>
        </Link>

        {/* Between xl and 2xl the full link row needs the space; the floating Messenger
            widget covers this action on desktop. */}
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex xl:hidden 2xl:inline-flex items-center gap-1.5 bg-[#0866FF] text-white font-bold min-h-10 px-4 rounded-full text-sm hover:bg-[#0756d6] hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all duration-200 shrink-0"
          title="Facebook Messenger-এ মেসেজ পাঠান"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <MessengerIcon className="w-4 h-4 text-white" boltColor="#0866FF" />
          <span className="hidden md:inline">Messenger</span>
        </a>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="xl:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 hover:text-amber-300 active:scale-95 transition-all shrink-0"
          aria-label={mobileMenuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu sheet */}
      {mobileMenuOpen && (
        <>
          <div
            className="xl:hidden absolute left-0 right-0 top-full h-[100dvh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="xl:hidden absolute left-0 right-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain rounded-b-3xl border-b border-amber-400/20 bg-[#0A1326] px-4 pb-5 pt-4 shadow-2xl shadow-black/70 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const isActive = activeSection === href.substring(1)
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3 text-sm font-semibold transition-colors active:scale-[0.98] ${
                      isActive
                        ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                        : 'border-white/[0.07] bg-white/[0.03] text-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{label}</span>
                  </a>
                )
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-white/10 pt-4">
              {!closed && (
                <a
                  href="#register"
                  onClick={closeMenu}
                  className="cta-shine flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-[15px] font-black text-slate-950 shadow-md active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  <span>ভর্তি হোন ({toBengaliNumber(coursePrice)} ৳)</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </a>
              )}
              <Link
                href={portal.href}
                onClick={closeMenu}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-400/[0.07] text-sm font-bold text-amber-200 active:scale-[0.98] transition-transform"
              >
                <portal.Icon className="w-4 h-4" />
                <span>{portal.longLabel}</span>
              </Link>
              <a
                href={FACEBOOK_MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0866FF] text-sm font-bold text-white shadow-sm active:scale-[0.98] transition-transform"
              >
                <MessengerIcon className="w-4 h-4 text-white" boltColor="#0866FF" />
                <span>Facebook Messenger-এ কথা বলুন</span>
              </a>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
