'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Menu, X, Phone, MessageCircle } from 'lucide-react'

import { toBengaliNumber } from '@/lib/utils'

export default function MarketingNavbar({ settings = {} }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const helplinePhone = settings?.helplinePhone || '01410764581'
  const coursePrice = settings?.coursePrice || 1000
  const cleanPhone = helplinePhone.replace(/[^0-9]/g, '')
  const intlPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`
  const whatsappUrl =
    settings?.whatsappSupport ||
    `https://wa.me/${intlPhone}?text=${encodeURIComponent(
      'আসসালামু আলাইকুম, কুরআন টিচার ট্রেনিং কোর্স সম্পর্কে জানতে চাই।'
    )}`

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 sm:py-3 shadow-xl bg-[#0B1120]/95 backdrop-blur-md border-b border-white/10'
          : 'py-3 sm:py-4 glass-dark border-b border-white/5'
      } px-3 sm:px-6 md:px-12 flex justify-between items-center`}
    >
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-fajr-gold/50 shadow-md shadow-fajr-gold/15 group-hover:border-fajr-gold group-hover:scale-105 transition-all shrink-0 bg-[#0B1A45]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fajr-logo.png"
              alt="FAJR Academy Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-lg sm:text-xl font-extrabold tracking-wider text-white leading-none font-serif">
              FAJR <span className="text-gradient-gold">ACADEMY</span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-fajr-gold tracking-widest uppercase font-semibold mt-1">
              Balanced Education
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-fajr-gold transition-colors nav-link">
            হোম
          </a>
          <a href="#courses" className="hover:text-fajr-gold transition-colors nav-link">
            কোর্সসমূহ
          </a>
          <a href="#curriculum" className="hover:text-fajr-gold transition-colors nav-link">
            কারিকুলাম
          </a>
          <a href="#instructors" className="hover:text-fajr-gold transition-colors nav-link">
            শিক্ষক প্যানেল
          </a>
          <a href="#process" className="hover:text-fajr-gold transition-colors nav-link">
            ধাপসমূহ
          </a>
          <a href="#why" className="hover:text-fajr-gold transition-colors nav-link">
            কেন ফজর
          </a>
          <a href="#videos" className="hover:text-fajr-gold transition-colors nav-link">
            ভিডিও
          </a>
          <a href="#faq" className="hover:text-fajr-gold transition-colors nav-link">
            FAQ
          </a>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <a
          href="#register"
          className="hidden md:inline-flex items-center justify-center bg-gradient-to-r from-fajr-gold to-yellow-600 text-fajr-dark font-bold py-2.5 px-6 rounded-full text-sm hover:shadow-lg hover:shadow-fajr-gold/30 hover:scale-105 transition-all duration-300"
        >
          ভর্তি হোন ({toBengaliNumber(coursePrice)} ৳)
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] text-white font-bold py-1.5 px-3 sm:py-2 sm:px-4 md:px-5 rounded-full text-xs sm:text-sm hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300 shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
          <span className="hidden xs:inline sm:inline">{helplinePhone}</span>
          <span className="inline xs:hidden sm:hidden">WhatsApp</span>
        </a>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-300 hover:text-fajr-gold hover:bg-white/5 transition-colors focus:outline-none shrink-0"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0B1120]/95 backdrop-blur-xl border-b border-white/10 py-5 px-5 sm:px-8 flex flex-col gap-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#home"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            হোম
          </a>
          <a
            href="#courses"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            কোর্সসমূহ
          </a>
          <a
            href="#curriculum"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            কারিকুলাম
          </a>
          <a
            href="#instructors"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            শিক্ষক প্যানেল
          </a>
          <a
            href="#process"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            ধাপসমূহ
          </a>
          <a
            href="#why"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            কেন ফজর একাডেমি
          </a>
          <a
            href="#videos"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            ভিডিওস
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-base text-gray-200 hover:text-fajr-gold font-medium py-1 border-b border-white/5"
          >
            FAQ
          </a>
          <div className="pt-2 flex flex-col gap-3">
            <a
              href="#register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-gradient-to-r from-fajr-gold to-yellow-600 text-fajr-dark font-bold py-3 rounded-full text-sm shadow-md"
            >
              ভর্তি হোন ({toBengaliNumber(coursePrice)} ৳)
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}


