'use client'

import { MessageCircle } from 'lucide-react'
import styles from './page.module.css'

export default function FloatingWhatsApp({
  phone = '01410764581',
  whatsappUrl = '',
}) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '01410764581'
  const internationalPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`
  const targetUrl =
    whatsappUrl ||
    `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
      'আসসালামু আলাইকুম, ফজর একাডেমির কুরআন টিচার ট্রেনিং কোর্স সম্পর্কে জানতে চাই।'
    )}`

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatingWhatsApp}
      aria-label="Chat on WhatsApp"
      title={`WhatsApp-এ মেসেজ দিন (${phone})`}
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

