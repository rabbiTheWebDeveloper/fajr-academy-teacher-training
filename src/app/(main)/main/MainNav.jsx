'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './main.module.css'

const LINKS = [
  { href: '#programs', label: 'প্রোগ্রাম' },
  { href: '#why', label: 'কেন ফজর' },
  { href: '#curriculum', label: 'কারিকুলাম' },
  { href: '#journey', label: 'ধাপসমূহ' },
  { href: '#instructors', label: 'প্রশিক্ষক' },
  { href: '#faq', label: 'প্রশ্নোত্তর' },
]

export default function MainNav({ registerHref }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const headerRef = useRef(null)

  // Scroll-spy: the section crossing a thin band at mid-viewport lights up its nav link.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean)
    if (!sections.length) return
    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)))
        const current = sections.find((s) => visible.has(s.id))
        setActive(current ? `#${current.id}` : '')
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // Off-screen sections skip rendering (content-visibility: auto) and only have estimated heights.
  // Before the first in-page jump, render them all so the browser scrolls to the target's real position.
  useEffect(() => {
    const page = headerRef.current?.closest(`.${styles.page}`)
    if (!page) return
    const onClick = (e) => {
      if (!e.target.closest?.('a[href^="#"]')) return
      page.dataset.full = 'true'
      document.removeEventListener('click', onClick, true)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // While the mobile menu is open: lock page scroll, close on Escape or when the viewport grows to desktop.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const desktop = window.matchMedia('(min-width: 1069px)')
    const close = () => setOpen(false)
    const onKey = (e) => e.key === 'Escape' && close()
    const onResize = (e) => e.matches && close()

    root.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      root.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

  return (
    <header ref={headerRef} className={styles.nav} data-open={open}>
      <nav className={styles.navBar} aria-label="প্রধান নেভিগেশন">
        <Link href="/main" prefetch={false} className={styles.brand} onClick={() => setOpen(false)}>
          <Image src="/fajr-logo.png" alt="" width={28} height={28} loading="eager" className={styles.brandLogo} />
          <span>ফজর একাডেমি</span>
        </Link>

        <ul className={styles.navLinks}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={active === l.href ? 'location' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <a href={registerHref} className={styles.navCta}>
            রেজিস্ট্রেশন
          </a>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label={open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div id="main-menu" className={styles.menu} inert={!open}>
        <ul>
          {LINKS.map((l, i) => (
            <li key={l.href} style={{ '--i': i }}>
              <a
                href={l.href}
                aria-current={active === l.href ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className={styles.menuIdx} aria-hidden="true">
                  {String(i + 1).padStart(2, '0').replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d])}
                </span>
                {l.label}
              </a>
            </li>
          ))}
          <li style={{ '--i': LINKS.length }}>
            <a href={registerHref} className={styles.menuCta} onClick={() => setOpen(false)}>
              রেজিস্ট্রেশন করুন
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
