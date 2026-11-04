'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react'
import MessengerIcon from './MessengerIcon'
import { toBengaliNumber } from '@/lib/utils'
import { FACEBOOK_MESSENGER_URL } from './contact'

const NAV_ITEMS = [
  { href: '#home', label: 'হোম' },
  { href: '#courses', label: 'কোর্সসমূহ' },
  { href: '#curriculum', label: 'কারিকুলাম' },
  { href: '#schedule', label: 'সেশনের তারিখ' },
  { href: '#instructors', label: 'শিক্ষক প্যানেল' },
  { href: '#process', label: 'ধাপসমূহ' },
  { href: '#why', label: 'কেন ফজর' },
  { href: '#videos', label: 'ভিডিও' },
  { href: '#faq', label: 'FAQ' },
]

export default function MarketingNavbar({ settings = {} }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const coursePrice = settings?.coursePrice || 1000

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

  return (
    <nav
      id="navbar"
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 sm:py-3 bg-[#060D1A]/95 backdrop-blur-xl border-b border-amber-400/20 shadow-2xl shadow-black/50'
          : 'py-3 sm:py-4 bg-[#060D1A]/70 backdrop-blur-md border-b border-white/5'
      } px-3 sm:px-6 md:px-12 flex justify-between items-center`}
    >
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-amber-400/40 p-0.5 bg-gradient-to-br from-[#0B1A45] to-[#060D1A] shadow-md shadow-amber-500/15 group-hover:border-amber-400 group-hover:scale-105 transition-all duration-300 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="FAJR Academy Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-base sm:text-lg font-black tracking-wider text-white leading-none font-serif flex items-center gap-1">
              <span>FAJR</span>
              <span className="text-gradient-gold">ACADEMY</span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-amber-300/80 tracking-widest uppercase font-semibold mt-1">
              Balanced Education
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 sm:gap-2 text-sm font-medium text-slate-300">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.substring(1)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 ${
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
      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="#register"
          className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-bold py-2 px-5 rounded-full text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>ভর্তি হোন ({toBengaliNumber(coursePrice)} ৳)</span>
        </a>

        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#0866FF] text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 rounded-full text-xs sm:text-sm hover:bg-[#0756d6] hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
          title="Facebook Messenger-এ মেসেজ পাঠান"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <MessengerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" boltColor="#0866FF" />
          <span>Messenger</span>
        </a>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-white/5 transition-colors focus:outline-none shrink-0"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#060D1A]/98 backdrop-blur-2xl border-b border-white/10 py-5 px-5 sm:px-8 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 pb-3 border-b border-white/10">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.substring(1)
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-amber-300 bg-amber-400/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="#register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span>রেজিস্ট্রেশন করুন ({toBengaliNumber(coursePrice)} ৳)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={FACEBOOK_MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#0866FF] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <MessengerIcon className="w-4 h-4 text-white" boltColor="#0866FF" />
              <span>Facebook Messenger-এ কথা বলুন</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
