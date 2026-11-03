'use client'

import MessengerIcon from './MessengerIcon'
import { FACEBOOK_MESSENGER_URL } from './contact'

export default function FloatingWhatsApp() {
  return (
    <aside aria-label="Facebook Messenger সাপোর্ট">
      <a
        href={FACEBOOK_MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 bg-[#0866FF] hover:bg-[#0756d6] text-white py-2.5 px-4 sm:py-3 sm:px-5 rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
        aria-label="Facebook Messenger-এ চ্যাট করুন"
        title="Facebook Messenger সহায়তা"
        id="floating-messenger-btn"
      >
        <span className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-white opacity-40 animate-ping" />
          <MessengerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" boltColor="#0866FF" />
        </span>
        <span className="hidden sm:inline font-bold text-xs sm:text-sm tracking-wide">
          Messenger সহায়তা
        </span>
      </a>
    </aside>
  )
}
