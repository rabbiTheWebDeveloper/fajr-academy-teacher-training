'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import styles from './main.module.css'

const BN = '০১২৩৪৫৬৭৮৯'
const toAscii = (s) => s.replace(/[০-৯]/g, (d) => BN.indexOf(d))
const toBn = (s) => s.replace(/[0-9]/g, (d) => BN[d])

/* ------------------------------------------------------------------ */
/*  Pointer effects — one delegated listener for the whole page.       */
/*  [data-spot]  → --mx / --my (cursor spotlight + glowing rim)        */
/*  [data-tilt]  → --rx / --ry (gentle 3D tilt toward the cursor)      */
/*  [data-glow]  → --hx / --hy (hero aurora that follows the cursor)   */
/*  Desktop pointers only; touch devices never pay for it.             */
/* ------------------------------------------------------------------ */
export default function MainFx() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let evt = null
    let spot = null
    let rect = null

    const clearTilt = (el) => {
      el.style.removeProperty('--rx')
      el.style.removeProperty('--ry')
    }

    const apply = () => {
      raf = 0
      const e = evt
      const target = e.target instanceof Element ? e.target : null

      const glow = target?.closest('[data-glow]')
      if (glow) {
        const r = glow.getBoundingClientRect()
        glow.style.setProperty('--hx', `${e.clientX - r.left}px`)
        glow.style.setProperty('--hy', `${e.clientY - r.top}px`)
      }

      const el = target?.closest('[data-spot]') || null
      if (el !== spot) {
        if (spot) clearTilt(spot)
        spot = el
        rect = el ? el.getBoundingClientRect() : null
      }
      if (!el || !rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)

      if (!still && el.hasAttribute('data-tilt')) {
        const px = x / rect.width - 0.5
        const py = y / rect.height - 0.5
        el.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${(-py * 5).toFixed(2)}deg`)
      }
    }

    const onMove = (e) => {
      evt = e
      if (!raf) raf = requestAnimationFrame(apply)
    }
    // Cached rect goes stale when the page scrolls under a resting cursor.
    const onScroll = () => {
      rect = spot ? spot.getBoundingClientRect() : null
    }
    const onLeave = (e) => {
      if (e.relatedTarget) return
      if (spot) clearTilt(spot)
      spot = null
      rect = null
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}

/* ------------------------------------------------------------------ */
/*  CountUp — "১০,০০০+" counts up from ০ the first time it scrolls in. */
/*  The server renders the final value, so no-JS / SEO see real text.  */
/* ------------------------------------------------------------------ */
export function CountUp({ value, className, duration = 1600 }) {
  const ref = useRef(null)
  const [text, setText] = useState(value)

  useEffect(() => {
    const el = ref.current
    const match = toAscii(value).match(/^(\D*)([\d,]+)(.*)$/)
    if (!el || !match) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Already on screen when the script arrives — leave the real number alone.
    if (el.getBoundingClientRect().top < window.innerHeight) return

    const [, prefix, digits, suffix] = match
    const target = Number(digits.replace(/,/g, ''))
    const grouped = digits.includes(',')
    const format = (n) => prefix + toBn(grouped ? n.toLocaleString('en-US') : String(n)) + suffix

    let raf = 0
    setText(format(0))

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) // easeOutExpo
          setText(format(Math.round(target * eased)))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  CopyButton — one tap copies the bKash / helpline number.           */
/* ------------------------------------------------------------------ */
export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API needs a secure context; fall back for plain-http previews.
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      className={styles.copyBtn}
      data-copied={copied}
      onClick={copy}
      aria-label={`${label} কপি করুন`}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'কপি হয়েছে' : 'কপি'}</span>
    </button>
  )
}
