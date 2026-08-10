import localFont from "next/font/local";
import "./globals.css";
import { BASE_URL } from "@/constant";

const banglaFont = localFont({
  src: "../../public/Li Ador Noirrit Regular.ttf",
  variable: "--font-bangla",
  display: "swap",
});

const SITE_URL = `https://${BASE_URL}`;

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "ফজর একাডেমি | Fajr Academy — Quran Teacher Training",
    template: "%s | ফজর একাডেমি",
  },

  description:
    "ফজর একাডেমির অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে যোগ দিন। দ্বীনে ফেরা আপুদের জন্য ঘরে বসে ৪টি সেশনে প্রশিক্ষিত হয়ে সার্টিফিকেট ও শিক্ষক হিসেবে কাজের সুযোগ পান। Fajr Academy — Balanced Education for Dunya and Akhirah.",

  keywords: [
    "ফজর একাডেমি",
    "Fajr Academy",
    "কুরআন টিচার ট্রেনিং",
    "Quran Teacher Training Bangladesh",
    "অনলাইন কুরআন শিক্ষক",
    "female quran teacher training",
    "online quran teaching job",
    "Islamic teacher training Bangladesh",
    "quran teacher certificate",
    "দ্বীনে ফেরা",
    "Islamic education online",
    "careers fajr academy",
  ],

  authors: [{ name: "Fajr Academy", url: SITE_URL }],
  creator: "Fajr Academy",
  publisher: "Fajr Academy",

  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
    },
  },

  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "Fajr Academy",
    title: "ফজর একাডেমি — অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রাম",
    description:
      "ঘরে বসেই ৪টি সেশনে প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। সার্টিফিকেট ও শিক্ষক নিয়োগ — ফজর একাডেমি।",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ফজর একাডেমি — Female Quran Teacher Training Program",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ফজর একাডেমি — অনলাইন কুরআন টিচার ট্রেনিং",
    description:
      "ঘরে বসেই প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। মাত্র ৪টি সেশন, সার্টিফিকেট ও নিশ্চিত কাজের সুযোগ।",
    images: ["/og-image.png"],
    site: "@FajrAcademy",
    creator: "@FajrAcademy",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    google: "UVZxrX59NHGD8jZvXOZnbTUKlcWCquG9SE5e4x_xd-4"
    // yandex: "YOUR_YANDEX_VERIFICATION_CODE",
  },

  category: "education",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      className={`${banglaFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

