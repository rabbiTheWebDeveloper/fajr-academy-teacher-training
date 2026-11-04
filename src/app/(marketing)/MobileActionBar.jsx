'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Lock } from 'lucide-react'
import MessengerIcon from './MessengerIcon'
import { FACEBOOK_MESSENGER_URL } from './contact'
import { toBengaliNumber } from '@/lib/utils'

/**
 * App-style bottom bar for phones: price + the "ভর্তি হোন" button, always one thumb away.
 * It appears after a short scroll and steps aside while the registration form is on screen
 * (the form has its own sticky pay bar).
 */
export default function MobileActionBar({ price = 1000, regularPrice = 0, closed = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [formInView, setFormInView] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 160)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const target = document.getElementById('register')
    if (!target || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), { threshold: 0 })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  const visible = scrolled && !formInView
  const hasDiscount = Number(regularPrice) > Number(price)

  return (
    <div
      role="region"
      aria-label="ভর্তি অ্যাকশন বার"
      aria-hidden={!visible}
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 px-2.5 pt-2 transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-[130%] pointer-events-none'
      }`}
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/35 bg-[#0A1326]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl">
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visible ? 0 : -1}
          aria-label="Facebook Messenger-এ কথা বলুন"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0866FF] active:scale-95 transition-transform"
        >
          <MessengerIcon className="h-6 w-6 text-white" boltColor="#0866FF" />
        </a>

        <div className="min-w-0 flex-1 leading-tight">
          {closed ? (
            <>
              <p className="text-[11px] font-semibold text-rose-300">ভর্তি সাময়িক বন্ধ</p>
              <p className="truncate text-sm font-bold text-white">পরবর্তী ব্যাচের আপডেট জানুন</p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                ভর্তি চলছে
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-amber-300">৳{toBengaliNumber(price)}</span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">৳{toBengaliNumber(regularPrice)}</span>
                )}
                <span className="hidden min-[390px]:flex items-center gap-1 text-[10px] text-slate-400">
                  <Lock className="h-3 w-3" /> নিরাপদ পেমেন্ট
                </span>
              </p>
            </>
          )}
        </div>

        {closed ? (
          <a
            href={FACEBOOK_MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={visible ? 0 : -1}
            className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            জানুন
          </a>
        ) : (
          <a
            href="#register"
            tabIndex={visible ? 0 : -1}
            className="cta-glow cta-shine flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C59B27] px-5 text-[15px] font-black text-slate-950 active:scale-95 transition-transform"
          >
            ভর্তি হোন
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </a>
        )}
      </div>
    </div>
  )
}
