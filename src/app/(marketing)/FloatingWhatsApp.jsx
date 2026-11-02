'use client'

import { MessageCircle } from 'lucide-react'

export default function FloatingWhatsApp({
  phone = '01410764581',
  whatsappUrl = '',
}) {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '01410764581'
  const internationalPhone = cleanPhone.startsWith('880') ? cleanPhone : `88${cleanPhone.replace(/^0/, '')}`
  const targetUrl =
    whatsappUrl ||
    `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
      'আসসালামু আলাইকুম, ফজর একাডেমি কুরআন টিচার ট্রেনিং কোর্স সম্পর্কে বিস্তারিত জানতে চাই।'
    )}`

  return (
    <aside aria-label="WhatsApp সাপোর্ট">
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-4 sm:py-3 sm:px-5 rounded-full shadow-xl shadow-green-600/30 hover:shadow-green-600/50 hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
        aria-label={`WhatsApp-এ চ্যাট করুন (${phone})`}
        title={`WhatsApp সহায়তা: ${phone}`}
        id="floating-whatsapp-btn"
      >
        <span className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-white opacity-40 animate-ping" />
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white relative z-10" />
        </span>
        <span className="hidden sm:inline font-bold text-xs sm:text-sm tracking-wide">
          WhatsApp সহায়তা
        </span>
      </a>
    </aside>
  )
}
