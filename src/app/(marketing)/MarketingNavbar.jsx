'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Menu, X, Phone, MessageCircle } from 'lucide-react'

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          ? 'py-3 shadow-xl bg-[#0B1120]/95 backdrop-blur-md border-b border-white/10'
          : 'py-4 glass-dark border-b border-white/5'
      } px-6 md:px-12 flex justify-between items-center`}
    >
      <div className="flex items-center gap-8">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-fajr-blue border border-fajr-gold/50 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-fajr-gold" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-wider text-white leading-tight">FAJR</div>
            <div className="text-[10px] text-fajr-gold tracking-widest uppercase font-semibold">Academy</div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-fajr-gold transition-colors nav-link">
            হোম
          </a>
          <a href="#courses" className="hover:text-fajr-gold transition-colors nav-link">
            কোর্সসমূহ
          </a>
          <a href="#process" className="hover:text-fajr-gold transition-colors nav-link">
            ধাপসমূহ
          </a>
          <a href="#why" className="hover:text-fajr-gold transition-colors nav-link">
            কেন ফজর একাডেমি
          </a>
          <a href="#videos" className="hover:text-fajr-gold transition-colors nav-link">
            ভিডিওস
          </a>
          <a href="#faq" className="hover:text-fajr-gold transition-colors nav-link">
            FAQ
          </a>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        <a
          href="#register"
          className="hidden md:inline-flex items-center justify-center bg-gradient-to-r from-fajr-gold to-yellow-600 text-fajr-dark font-bold py-2.5 px-6 rounded-full text-sm hover:shadow-lg hover:shadow-fajr-gold/30 hover:scale-105 transition-all duration-300"
        >
          ভর্তি হোন
        </a>
        <a
          href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] text-white font-bold py-2 px-4 md:px-5 rounded-full text-xs md:text-sm hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transition-all duration-300"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>01641028312</span>
        </a>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-fajr-gold hover:bg-white/5 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0B1120]/95 backdrop-blur-xl border-b border-white/10 py-6 px-8 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
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
              ভর্তি হোন (৫,০০০ ৳)
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
