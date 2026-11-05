/**
 * Web app manifest (served at /manifest.webmanifest). Makes the portals installable
 * ("Add to Home Screen"), which iPhones require before they allow push notifications.
 * The installed app opens /open, which sends each account to its own portal.
 */
export default function manifest() {
  return {
    id: "/open",
    name: "ফজর একাডেমি — TOT পোর্টাল",
    short_name: "ফজর একাডেমি",
    description: "ফজর একাডেমির ট্রেইনি, ইনস্ট্রাক্টর ও অ্যাডমিন পোর্টাল — নোটিশ, পেমেন্ট ও ফলাফলের নোটিফিকেশনসহ।",
    lang: "bn",
    start_url: "/open",
    scope: "/",
    display: "standalone",
    background_color: "#0b1a44",
    theme_color: "#6d4ae8",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
