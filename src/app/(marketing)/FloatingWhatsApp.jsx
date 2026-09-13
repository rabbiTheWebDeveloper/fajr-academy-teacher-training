'use client'

import { MessageCircle } from 'lucide-react'
import styles from './page.module.css'

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/8801641028312?text=আসসালামু%20আলাইকুম,%20ফজর%20একাডেমির%20কুরআন%20টিচার%20ট্রেনিং%20কোর্স%20সম্পর্কে%20জানতে%20চাই।"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatingWhatsApp}
      aria-label="Chat on WhatsApp"
      title="WhatsApp-এ মেসেজ দিন"
      id="floating-whatsapp-btn"
    >
      <div className={styles.floatingPulseRing} />
      <div className={styles.floatingIconBox}>
        <MessageCircle size={30} fill="#ffffff" color="#25D366" />
      </div>
      <span className={styles.floatingLabel}>
        <span className={styles.floatingDot} />
        WhatsApp সহায়তা
      </span>
    </a>
  )
}
