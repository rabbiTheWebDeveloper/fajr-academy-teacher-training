import { Playfair_Display, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google'
import './globals.css'

/* ---------- Google Fonts ---------- */
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['500', '600', '700'],
  variable: '--font-noto-bn',
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'ফজর একাডেমি | Fajr Academy',
    template: '%s | ফজর একাডেমি',
  },
  description: 'Balanced Education for Dunya and Akhirah — Online Quran Teacher Training',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${playfairDisplay.variable} ${notoSerifBengali.variable} ${hindSiliguri.variable}`}
    >
      <body
        style={{
          fontFamily: "var(--font-hind), 'Hind Siliguri', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  )
}
