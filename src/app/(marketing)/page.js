import styles from './page.module.css'
import RevealObserver from './RevealObserver'
import RegistrationForm from './RegistrationForm'
import { BASE_URL } from '@/constant'

const SITE_URL = `https://${BASE_URL}`
const PAGE_URL = `${SITE_URL}/`

/* ------------------------------------------------------------------ */
/*  Fajr Academy logo — inline base64 so no external image request    */
/* ------------------------------------------------------------------ */
const LOGO_B64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAEYCAYAAADhzqpvAAAWyElEQVR4nO3dPXPbPBYGUDrjwoVr///f59qFO2+R1RtFESV+XAAXwDkzO7O7SUQSvAAegRS5LAAAwb6/Pn++vz5/Wu/HKH613gEAYCyCWjyBDQAopnR4myUcCmwAQJiaAWqWsLYsy/LaegcAAPaYKahdWGEDAELUCFIzhrVlEdgAgACPglRUyJo1rC2LwAYAdGDmsLYsAhsAcJJfgpYnsAEAxR0NXcLabwIbAHBYyUAlrP0hsAEA6QhrfxPYAIBD9oaqrX9fWPuXwAYAkJzABgDsVmoVzOrafQIbAFBNjQfsjkhgAwCaE9YeE9gAgF2Eq/oENgCgqbMBcIYAKbABAM3MELYiCGwAwGYCVhsCGwBQzdv7x8vlv0eFv+vPHJXABgCQnMAGAFRRYnVtFgIbAEzm++vzZ5TANMPl0GUR2ABgWqVe3l7rc2YJa8sisAHA1GqttEWHq5nC2rIIbAAwvd4ukc4W1pZFYAMA/q9GaDu7jRnD2rIIbADAlcwrbbOGtWUR2ACAG9GXSCOU1sxhbVkENgCgksyrd9kJbADAXVkC1uyra8sisAEAiQlrvwlsAMCqlr/qFNb+ENgAgE16D1C9PW/umsAGAJNpEbz2BqXofbzefo+hTWADAFIpGdYe/X+ZCWwAwEO9hZtr1/t+GwR7Oi6BDQAmlPV+tMj9uhfWeg1tAhsAdK5m6Mga9G49WlnrMbQJbAAwgMsvIEuFjx5CzcVaWLtun95Cm8AGAIPZGt6yrZZF7M+jsHb733sKbQIbAAysxMpbtqB3sSWs3f5/vYQ2gQ0AJnEvvO0JXyXDzNkQuCes3f5ZD6FNYAOAzmVd8arlSFi7/TvZQ5vABgATOrvKliUknglrt383c2gT2ABgAEcCVO+PA4kIa7f/JmtoE9gAgKarbGfD5tmwdvtvM4Y2gQ0ABhEZfDIrEdZuPyNbaBPYAGByR0Lb1lW26KBTMqzdflam0CawAcBAjq6S9bDSViOs3X5mltAmsAHAYCJC256/3yLgXbZdMkC1vgx6TWADAP7x9v7xsiWI7QltZ4Ndi9Wu2220Wn0U2ABgQFGrbNHv9zyr5eXaltsW2ABgULVCW+1Loy2CU+v7+gQ2ABhYttB2++dH969mgGod1pZFYAOA4WUIbWuXRc9cLq0RpDKEtWUR2ABgCrVD294/O6pkoMoS1pZFYAOAaZwJbbfPQHv0Wd9fnz+P/jw6CJUIVpnC2rIIbAAwla2P67hnz2rbWmgr9SiOyICVLawti8AGAFNqGdpKidhWxrC2LMuScqcAgHqOrnptfZDt2/vHy72gV+pxIFHHk0naHQMA6iod3Lb++wgZ9iFS6p0DAOqLCG57PqNUWNq6D9nD2rIIbADAiprBrVVo6yGsLYvABgBsdCTAXQJRy+D06N66UtuM1s2OAgB5RD+eo3R4KvFS+5q62lkAIK/sr5mq/ZL6SN3tMACwX+SK2JHAs2X7PQapWjQMAAym1NsEnhkxcGW5/224hgWAGbUKaWtmCm8XJY95uMYEgFlkumdslMdn7FHzmIdrPAAYXS9P8c9yObGWksc7ZIMBwKhaP4j2rOv9z7qPEe6dpzPHO2xDAcBoRrvs+P31+dPbPu8V9fy3oRsJAEYx2+XFkUSEtl9xuwMA1CSs9eH2PB35sYgTDTCBTL8mZL/o+6Fo48z9e6/xuwNAa1HP5BIK5rGnZkaqi1b30e3d7jANDjCzEg9NHWlS7lnk6lqNh+tmqZusfeLoKpsVNoBOWUXjkVZvPoj6VeSZbdbcTq3+o5MCdMS9aPPZGhKyvZrqVu03K7Ty7DiPBlqdFyC5oxOTgDaGRxN81tDyzJna7OmY147zyGVRnRkgqV5eP0Q5rcPJpaZK7ceemm11C0CJ7QpsAAMQ1LjIeuP8rbP7+WifMq8wR5wfgQ2gM7M+VoF1JYNQSUf2O+Lhshn6Ran9bn5gALMT1Fgzwmprycu6GY/32tZjF9gAkosc0BnLiLURGd56Ou5leXzsAhtAUiNOxsQ6O8FnNvvjaY482qP7gwboiaDGVjO8P3T22wH2/Fp0uIMHyEpYY49LvYxeD8/6xejHv5VGAKhgS1gzMTGzGVYUz9AQAAVZVYPtZllVPEKDABRiVQ2I8qv1DgCMSFgDIhksAIIJaxzlPi7WKAKAQH7xxproJ/6rpbm8tt4BgFEIa1wr+Uom5vOyLIqql0F0tsmg5StMRugTo9VDdrP1T9bVGD9K1lOm8S9zv6nVTpc2sMK27HvSMPRibTBR4/GENZal3AQ+Szi7J8P83LqNLtsX2G70/AyY76/Pnx73m7qOvMOOdcIaJSb0mUNaBhnbSGBbkS38ZCwexpDhG2yvhDV6+SFBq8u0Pc1d2fdVYBtMtqBJX3peYa5NWKPlfbZb9bb610LJNor87NfrD76WPWnWkCX8OBf1zd4nBLfHhDVmDGsj1nVPbbS6wlYiHULPZuwTgtu/hDWyh7WeQkgrPbbR00uib+8fLyUnqOzfLFqvsh05jtb7PLqsfaLkPqmp34Q1sn9h6zGI1JY9cK/ZdA9b6QmqhNkvaVFWxj5xXfMl9k1og1jR/anXIFJTz220+eXvI5y8t/ePl56O40xhZQsTI8pcS6Vq/fvr82fW2rK6RubJPvO+ZdF7G20ObCPpLbjBUdlvOeiFsEZmvQeRGkZoo12BbbQTmfl4IoprtkmV+zLXeQ+ENZYl74Sfdb8yGaWNplxhuzZqgVJHL/XTwy/RgH1GCSK9aN1G0we2ZWl/EqAGoW0/q2tEUzN1jTRGCWwJRRbYSMUKNQlrXGQcR62uPTdaGwls/5fhZEBpVtmAa+a+57K0kcCWTKnnZ0V/Jv3KMvhkZnWNEqLqxpj+3IhtJLABp404OK4R1uYycm2r5ecytZHAdqX1iRl5YIBe6Idkpj6fG7WNBLZJjFrAHNP6y0mvtBujUMv9EdiSEKjo3Qg1PMIxADGyhVqBbSImI1jnhwZkZwx/buQ2EtgAoDCBn7MEtgRqfiMY+dsHHGV1jZmo5z69tt6BbBQyAMviC+7MMmYBK2yNGRAgt4wDNzAfgS05rxKCsvQHGMPofVlga2j04gIghvkCgS2xy+qaVTYow48NgF4IbI0ITADAVgIbwB1W14BMBLakbicLl0UhlvoHeiKwNWCiYERWpADKEdgSWpv4rLIRxXl/TPgEshHYKjNRQnv6IdAbgS2ZZ9/srbJxVonzbUUKoCyBrSLBCAA4QmBLxCoFpVlde2604wHGILBVEjlRuiwKx6l1oEcCG0zC6hpAvwS2JPZOfFbZ2ENYA0Y3+pj02noHZiAI0YraAxiDFbYEMn0rMMGPo9S5fHv/eMlUs1CKOieT5itsLQNCjc5Y8vje3j9eBCxula65Up9dw7O26f34gHE1D2yzM0EQoUZwV6sA7QhsBdWaRKO38/31+WNybifbqqlaAGaTcR50DxsAQHJW2BrKlt7hmvoEyMMKWyE1L2t5JhtRLr8AFdaAHo08dglsjYxcVPRHSAP4W7aFi+aXREecJFqcZD8+YC/nFqAfVtgaMFHSmhoERjXq+NZ8hW002ZZQz7LKVt+99h6trgB6kGkOtMI2kCxFRX4CIEBfBLZAWyZBoYoj/BL4vNmOF2Y24lwrsA3GxD6uEQcggOyyzIECW0UmXLLJMhABRBttzhXYgmSa+KyyjWu0AQigBxnmQIGtEhMtWWUYiGrQB9lrlr4xssh+37oeBLYArU8ic7GCCjAfga2CFt/sTepjs1oEsM0oq2wC20lCDKNQy8CoRght3nRQwUgTYaanPs+uxPtjgbHNPH5Hjpkt5kIrbCeYLBnN7DU9+/FTjtoaT+1zKrCxm4EnD/cqAmwXPWbWHC8FNujczJc4gO2MFb/1GtoEtoOsQjAy9Q2M7O3946W3HyIIbBxiQs/FN2fgEWPEfT2FNoHtAGGFGYxY51sG5xGPm7kJa49Fh7ZSY4jHehSQtXNEF5FHfORS4jEfzjGzKjHptuhP+u82l3bK/NgPK2w7+fZNZgZnYFni79GaReZLpAJbMB2E0fiSAv0Q1M7L2oYC2w69T1ye2TWHjANNb9Q1pUTX1iVcZA0ZPcvWpu5hA55yLxu0pf+1c932Xv4+iB46lFW2OTjP63rop7Q1Sq0Tr+VqpsC2kQ5MbwSTc/R5SlFbY7i9HF16zBXYgvQ0OVp94SjnGWBdyQAnsG1gkqJXwjnkpB+xl8AWoKfVNWB7nzWpzsc5JyuB7YlRO6+Vl3k415CTfsQeAttJVtf+ZgDKSWg7bpbjBHIT2B4YfaAWNjmr5z6i/rnVop577kPUJbCdMMKAb+VlHiPUaytqmj32/kJQfbGFwAYTEdDhPnVMdgLbipk6r0l8Ls73H1YdiXa0pnrtQ9QjsB002kBvEp+L873f6Mc3s1Lndm8/U2M8IrDdMWunMYlzVo/n271GZKLGWCOwHTDa6lppBqCcStXx99fnj3NOLyJr9V6fOtLP9B/uEdhuzN5RTOJzKfnlo6fzbZWNbNQZtwS2nWZYXSvx0toLwS2f0qHN+Sar0qtrZ+k7XBPYrugcf6sxka+1uXNRV+kvIs/OdwZW2SjlTP9Sa1wIbDvMsLp2a8ZjnlXJldVro0xAoxzHrLKvrl1TayyLwPYfHWJdrYmcHGY+1zMf+0xajPdna8schcDGZoLbPJzrbUyi7OknEaFNzc3rtfUO9MLk9cdtW2QfQJy74y5tl/0cR3p7/3jZc7zfX58/aqwfPV0KXaPm8qg5NjrhFHVdzK1u6jawxTpzbno5F0eOsZdjm1n05JrhNVTZ6673Y830ZTX1iWZevXdy+ie0jSVLWMu2L6X1NpZnCmi3XBIlncwdhnnsvTQKW0XX1uWzMge3jHrr3350ABCktwlgFhlXtEo9aFcNPtbDMyHXWGFjaL5xcsaRlRA3hOeSMayVZsXtjx6D2RorbADBRpokepb9PNR6w0jJbWTU8yraI9Onb3KZ8dsw+R2tS/XXTonJuuQ7lkt87j21a7LGjw5GC2ZrDCak0tsvipiH0NaPnsLaRY9vX9ii1Jg+S0i7ZiAhDatrZCe05ddjWLtoGUJGWD0cnXvYGJIJkkxMWnX03s4tx63r+756b8dRmdRIweoavThbq2qzjFIho+d7vkpp9daamb29f7wYOGhOWKM3Qlsuo4S1a4IO1wQ2mur5XhMQ2torGWoynB+hjQuBjSZG/DbMnCJqWd0eM3pYuxDaWBaBjYpKDzqZBljmIrTVN0tYuxDaENioxqoaI4uqb/X82Mxf/IS2ub29f7x4rAddenv/eMk8uDKXqFo0Kd9X41ET2ceT7PtHeQqAKlw2Ygbe1BGvRojtra0F+/m4JEo1RwaY3gZRWBaPqYlSK5T02r5CWxtn6uXMORPYAArwyJrjRn4RegmCWxnZ3rMqsAEU4oc2+9QOHiO1o9B2XvaHJAtsAAXN9viJIwS1OILbdhnr4NH5E9gAKpj9F463WgWL3trpKMHtvh7O/9q5E9gAKpn9JvrWISJru5TWut1b6vWc356zy3GEH8y94ui10WbmV50Qr8Xkmf3enBqMTXnORUmjn2eBjbuOdm7nGp5rPXlG99PWx7PGeHRf1vN1xEznWGDjqb2d2/mG50aaNLMxBm3XWx3OfG6rfcuauZFHsbVjO9ewXW8TZnbGn3Oy1aPz+YfAxi5bnxdTY19gFNkmyR4Zd8rwIOM8whrHRD4H5xnKEdyOMea045aZel5b7wAAv10mM8FtG5N/e85BPSENvfd9WBHbpA33sUE9gtu/jC3MygobQFJW3P4Q1Jjd6cBmIAEoa+bgJqjBb9VX2L6/Pn90QID9rsfO0cObeQL+5pIoQIdGW3UT0OCxUx3kzEDRunOu7Xut/cr4RojrfVrbl1Y/Olh7GW4WW9qu5ud5JuK8egpwahG2Cw1sb+8fL1l/RdgyXGYNtkeen1Pr/JZ8tk/EMUT/Mjry81o/Fynjl5GZZQpwM9WB23+IdriY1gblbIEtcrDau88tt/1IjQH86P6e3bfocHT7mdHhu0SYP/KZpevLxJVL6TFg9vMdveIOyxIY2I5MaplWj7baus8lth99qa2kluH22faPBpqIfYy+7yhytS2qP2a/fA0l+cJCKWGrIJkC29EVlKj93vs5NSbV0m2y9u+3KNVeLcN1TZGriiUuZZusmIV7RympSGBb+zv31Lh/5sh2z3S8o/+2ZJtFvAO0RLA8s1+R7zWNuowYGXBb3Sd3pk8KbMzKe5Yp7dfef5B5QI6ckN7eP16ij+vZ55UKF1EDSYtw/WibJe5X2+JRbexto2eflaVvHdX7/sMWW8eZ3lfzaWt3YIsWVcClVg+i7sXa+jnZQlFLNferxfmp3e6lLxGbjJhRiS/QcM/pwBa10lBDq30qHRJ7VOum+8htbVV7ZXZZ2t83CjPy5YaadgW2rEVW+yfqGdphyz5YXeOoiFUD55CRnZ0HMswj9OXUClure7KOMHnk0WKgMjgCUWrfygPLsiOwzV5Ye+5xuv1P6X0jn4yXai9qfJFS94wqut/OPrey3eEVtuibtN0LEGumdhEO2pqp1phbqVrXh9hiU2DrvZha3AQOmWW6XQF6ULov6Gs80/yxHj3Jdomzxns3oxmUxpepj0CEWuOW8ZFHXo/8oyOPqdj6q8bZBnsdlFYi3o+qfhld7RqfcR5km6eBzYAcQzvuo73yMIEwq1bjkD7HPbsviR4tohnvmfn++vy5/Kf1vkANJhlG0Xrcbr198nm4wnavYBTRNtqJHpy5XUGNM6ostW2ljWuH7mErrfciPdLZ7x1vlkEDYBbZxt3e50PirAa2bEXbiz3tphOu0zb1HFll8yoqRpR13hPaWBaP9Qi15wXcOh9AHlnD2kX2/aO8uytspb89e8THvCIeJUG8s+dFX6Vnt7X/aCW5lnv7YF6cmxW2IHtW10rvy1aCE3v51TOjeVTPrcbrR9vV/+a1KbC1erVTVGEqcHgu05cJqOXZD75q94vr7blXlGv/BLbewo3ivU+7UItao3dZQpuwxiNPV9hKFYjCm9eWc9/bFwegb61Dm7DGM38FtoyTZKbLoiO+uWCkY7k12rmqwaTAzFqFNmGNLR6usPVSJDX2s8ULgM9+RubzV3rfbn9ZVXJbM8tcY3BE7dAmrLHVf4GtxaQW+eODkpfZorYfub0ZlDxfrDNBMLtaoU1YY4/mj/XI/ovR6E70bPvRYSMqyJa4vFgiZBv06tGujKx0aBPW2Gs1sNUslqjQFhn+1gLKo23s2f69zy61MnQ2GJVcsSodKA16x2g3KBfahDWOeF2Wvi4hXfZ1raD3vBdx77ajO1HNdt/SLq3qoNS+GfSAs+6NT9dvHNj7lhBhjaPurrC1KJi979d8dImuxLs6t35e5L0NrY7h2WeUqI+Mx8o67ctMolbahDXO+JVtdS2yYEvcGLr175/Z9vW/zRRkSu7X5TMj7gsx6MXQjvDH2dAmrHHWP0u5GYsm6l1vR5etz4p4z2iJDp51vx599pqIbUb/GjjqnstSn3dmmxnHCajh2Zh39s9hjSIBVplc4F97QpmwRpTmj/UAgJ5svTwqrBFJYAM2M8HAb3vuaRPWiCCwAXdl+0ESZPMstN3732v/Dp4R2ADgoEehTVgjksAGbGKigfu2rLSt/T3YSmAD/uFyKOyz5zlscITABvzFygAc8+iVibX3hfEIbMB/rKzBObfhTFgjikIClmXxVgOAzAzEMLEWr7sCYD+DMUwm4h2yANTlHjbgH8IaQC6vrXcAyEFIA8jrfymYoklVRx3QAAAAAElFTkSuQmCC'

/* ------------------------------------------------------------------ */
/*  Page-level SEO metadata                                            */
/* ------------------------------------------------------------------ */
export const metadata = {
  title: 'কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) — পুরুষ ও নারী ব্যাচ | ফজর একাডেমি',
  description:
    'ফজর একাডেমির সম্পূর্ণ অনলাইন কুরআন টিচার ট্রেনিং প্রোগ্রামে (TOT) নিবন্ধন করুন। পুরুষদের ব্যাচ (ওরিয়েন্টেশন ২০ সেপ্টেম্বর) ও নারীদের ব্যাচ ০১৪ (ওরিয়েন্টেশন ২১ সেপ্টেম্বর)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী!',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'অনলাইন কুরআন টিচার ট্রেনিং ২০২৬ (TOT - Men & Women) — ফজর একাডেমি',
    description:
      'ঘরে বসেই অনলাইনে ৪টি সেশনে প্রশিক্ষিত কুরআন টিচার হওয়ার সুযোগ। মাসিক ১৫,০০০-২২,০০০ টাকা সম্মানী, সার্টিফিকেট ও শিক্ষক নিয়োগ।',
    url: PAGE_URL,
    images: [{ url: '/og-image.jpg', width: 1200, height: 1200, alt: 'ফজর একাডেমি কুরআন টিচার ট্রেনিং' }],
  },
}

/* ------------------------------------------------------------------ */
/*  JSON-LD Structured Data                                            */
/* ------------------------------------------------------------------ */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Fajr Academy',
      alternateName: 'ফজর একাডেমি',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
        width: 80,
        height: 80,
      },
      description: 'Balanced Education for Dunya and Akhirah — Online Quran Teacher Training in Bangladesh.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+8801641028312',
        availableLanguage: ['Bengali', 'English'],
        contactOption: 'TollFree',
      },
      sameAs: [
        'https://wa.me/8801641028312',
        'https://youtube.com/shorts/zPXTzup-2ok',
      ],
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-men`,
      name: 'Training of Trainers (TOT) – MEN',
      description:
        'ছেলেদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী। ফার্স্ট ওরিয়েন্টেশন ২০ সেপ্টেম্বর রাত ৮টা।',
      url: PAGE_URL,
      provider: {
        '@type': 'Organization',
        name: 'Fajr Academy',
        sameAs: SITE_URL,
      },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      numberOfCredits: 4,
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: PAGE_URL,
      },
    },
    {
      '@type': 'Course',
      '@id': `${PAGE_URL}#course-women`,
      name: 'Training of Trainers (TOT) – WOMEN (Batch 014)',
      description:
        'দ্বীনে ফেরা আপুদের জন্য ফজর একাডেমি অনলাইন কুরআন শিক্ষক প্রশিক্ষণ (Batch 014)। ৪টি প্রফেশনাল সেশন, সার্টিফিকেট ও মাসিক ১৫,০০০–২২,০০০ টাকা সম্মানী। ফার্স্ট ওরিয়েন্টেশন ২১ সেপ্টেম্বর রাত ৮টা।',
      url: PAGE_URL,
      provider: {
        '@type': 'Organization',
        name: 'Fajr Academy',
        sameAs: SITE_URL,
      },
      educationalLevel: 'Intermediate',
      courseMode: ['Online'],
      inLanguage: 'bn',
      numberOfCredits: 4,
      offers: {
        '@type': 'Offer',
        price: '1000',
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: PAGE_URL,
      },
    },
    {
      '@type': 'WebPage',
      '@id': PAGE_URL,
      url: PAGE_URL,
      name: 'কুরআন টিচার ট্রেনিং ও জব অপরচুনিটি (TOT) | ফজর একাডেমি',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${PAGE_URL}#course-men` },
    },
  ],
}

/* ------------------------------------------------------------------ */
/*  Page Component (Server Component)                                  */
/* ------------------------------------------------------------------ */
export default function TeacherRegistrationMarketingPage() {
  return (
    <div className={styles.pageRoot}>
      {/* ── JSON-LD Structured Data ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Scroll-reveal wiring (client-only, renders nothing) ─── */}
      <RevealObserver />

      {/* ════════════════════════════════════════════════════════
          TOP BAR
          ════════════════════════════════════════════════════════ */}
      <div className={styles.topbar}>
        <div className={`${styles.wrap} ${styles.topbarInner}`}>
          <div className={styles.topbarAnnouncement}>
            <span className={styles.liveDot} />
            <span>ছেলে ও নারীদের জন্য সম্পূর্ণ অনলাইন কুরআন টিচার ট্রেনিং (TOT) · মাসিক সম্মানী ১৫,০০০ – ২২,০০০৳</span>
          </div>
          <a className={styles.topbarPhone} href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer">
            <span>WhatsApp: 01641028312</span>
          </a>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════════════════ */}
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <div className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_B64} alt="Fajr Academy" className={styles.brandLogo} />
            <div className={styles.brandDivider} />
            <div>
              <div className={styles.brandName}>ফজর একাডেমি</div>
              <div className={styles.brandTag}>Balanced Education for Dunya &amp; Akhirah</div>
            </div>
          </div>
          <div className={styles.pillTags}>
            <span className={styles.pill}>👨‍🏫 TOT for Men</span>
            <span className={styles.pill}>🧕 TOT for Women (Batch 014)</span>
            <span className={`${styles.pill} ${styles.pillGold}`}>ফি ৳১,০০০</span>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          {/* ── Left column ── */}
          <div>
            <div className={styles.heroBadgeRow}>
              <span className={styles.eyebrow}>Training of Trainers (TOT) · 2 Sessions</span>
              <span className={styles.heroBatchTag}>Men &amp; Women Tracks</span>
            </div>

            <h1 className={styles.heroH1}>
              শুদ্ধভাবে কুরআন ও ইংরেজি জানেন?{' '}
              <span className={styles.heroH1Accent}>ঘরে বসেই</span> হয়ে উঠুন প্রফেশনাল কুরআন টিচার
            </h1>

            <p className={styles.heroLede}>
              ফজর একাডেমি নিয়ে এসেছে ছেলে ও দ্বীনে ফেরা আপুদের জন্য ১ মাসের প্রফেশনাল টিচার ট্রেনিং প্রোগ্রাম (TOT)।
              মাত্র ৪টি সেশন সম্পন্ন করে অর্জন করুন অফিসিয়াল সার্টিফিকেট এবং ঘরে বসেই <strong>মাসিক ১৫,০০০ থেকে ২২,০০০ টাকা</strong> সম্মানীতে কাজ করার সুযোগ।
            </p>

            {/* Hadith Callout */}
            <div className={styles.hadithHeroCard}>
              <span className={styles.hadithArabic}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
              <p className={styles.hadithTranslation}>
                &ldquo;তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শিখে এবং অন্যকে শেখায়।&rdquo; — আল হাদিস
              </p>
            </div>

            <div className={styles.ctaRow}>
              <a
                id="hero-register-cta"
                className={`${styles.btn} ${styles.btnGold}`}
                href="#registration-section"
              >
                এখনই কোর্স নির্বাচন ও রেজিস্ট্রেশন করুন (৳১,০০০) ↓
              </a>
              <a
                id="hero-whatsapp-cta"
                className={`${styles.btn} ${styles.btnOutline}`}
                href="https://wa.me/8801641028312"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 WhatsApp-এ জিজ্ঞাসা করুন
              </a>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <b className={styles.statValue}>১৫k–২২k৳</b>
                <span className={styles.statLabel}>মাসিক সম্মানী</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>৪টি</b>
                <span className={styles.statLabel}>প্রফেশনাল সেশন</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>১,০০০৳</b>
                <span className={styles.statLabel}>কোর্স ফি</span>
              </div>
              <div className={styles.stat}>
                <b className={styles.statValue}>১০০%</b>
                <span className={styles.statLabel}>অনলাইন (ঘরে বসে)</span>
              </div>
            </div>
          </div>

          {/* ── Right column — Course Highlights Card ── */}
          <div className={styles.heroVisual}>
            <div className={styles.heroArch}>
              <div className={styles.centerMark}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_B64} alt="Fajr Academy" className={styles.heroLogo} />
                <div className={styles.glyphBn}>কুরআন টিচার ট্রেনিং ২০২৬</div>
                <div className={styles.heroFeaturePills}>
                  <div className={styles.featurePillItem}>✓ কোনো ট্রাফিক জ্যাম নেই</div>
                  <div className={styles.featurePillItem}>✓ ল্যাপটপ সাপোর্ট সুবিধা</div>
                  <div className={styles.featurePillItem}>✓ কন্টিনিউয়াস মেন্টরিং</div>
                </div>
              </div>
              <div className={styles.miniArches}>
                <div className={styles.miniArch} />
                <div className={styles.miniArch} />
                <div className={styles.miniArch} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2 SESSIONS / DUAL TRACKS SHOWCASE (MEN & WOMEN)
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.tracksSection}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>২টি বিশেষায়িত কোর্স সেশন</span>
            <h2>ছেলে ও নারীদের জন্য ২টি আলাদা ট্রেনিং ট্র্যাক</h2>
            <p>
              আপনার সুবিধাজনক ট্র্যাকটি বেছে নিন। প্রতিটি কোর্সে রয়েছে ৪টি লাইভ ইন্টারেক্টিভ ট্রেনিং সেশন, ভেরিফায়েড সার্টিফিকেট এবং ফজর একাডেমিতে সরাসরি শিক্ষক নিয়োগের সুযোগ।
            </p>
          </div>

          <div className={styles.dualTrackGrid}>
            {/* ──────── TRACK 1: TOT - MEN ──────── */}
            <div className={`${styles.courseCard} ${styles.menCourseCard}`} data-reveal>
              <div className={styles.courseCardHeader}>
                <div className={styles.courseTagMen}>👨‍🏫 পুরুষদের জন্য বিশেষায়িত</div>
                <div className={styles.courseFeePill}>ফি: ৳১,০০০</div>
              </div>

              <h3 className={styles.courseTitle}>Training of Trainers (TOT) – MEN</h3>
              <p className={styles.courseSummary}>
                ছেলেদের জন্য ঘরে বসে চাকরির বিশেষ সুযোগ। বাচ্চাদের আধুনিক পদ্ধতিতে কুরআন পাঠদানের আন্তর্জাতিক টিওটি পেডাগোজি প্রশিক্ষণ।
              </p>

              <div className={styles.orientationAlert}>
                <span className={styles.orientIcon}>🔔</span>
                <div>
                  <strong>First Orientation Class:</strong>
                  <div className={styles.orientDate}>২০ সেপ্টেম্বর · রাত ৮:০০ টা</div>
                </div>
              </div>

              <div className={styles.perksList}>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>মাসিক সম্মানী:</strong> ১৫,০০০ থেকে ২২,০০০ টাকা অফার</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>১ মাসে ৪টি প্রফেশনাল ট্রেনিং:</strong> বাচ্চাদের পড়ানোর কৌশল ও ক্লাসরুম ম্যানেজমেন্ট</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>ল্যাপটপ / ডিভাইস সহায়তা:</strong> কুরআন ও ইংরেজিতে দক্ষ কিন্তু ল্যাপটপ নেই? ফজর একাডেমি থেকে ল্যাপটপ সাপোর্ট সুবিধা</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>হাফিজ/আলেম হওয়া বাধ্যতামূলক নয়:</strong> শুদ্ধ কুরআন তিলাওয়াত ও বেসিক ইংরেজি জানা থাকলেই যথেষ্ট</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>কন্টিনিউয়াস ট্রেনিং:</strong> প্রথম ধাপে নির্বাচিত না হলেও স্কিল গ্রুমিং ও ট্রেনিং চলমান থাকবে</span>
                </div>
              </div>

              <div className={styles.courseCardFooter}>
                <a href="#registration-section" className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}>
                  TOT - MEN কোর্সে নিবন্ধন করুন (৳১,০০০) →
                </a>
              </div>
            </div>

            {/* ──────── TRACK 2: TOT - WOMEN (Batch 014) ──────── */}
            <div className={`${styles.courseCard} ${styles.womenCourseCard}`} data-reveal>
              <div className={styles.courseCardHeader}>
                <div className={styles.courseTagWomen}>🧕 নারীদের জন্য · Batch 014 (Batch 013 চলমান)</div>
                <div className={styles.courseFeePill}>ফি: ৳১,০০০</div>
              </div>

              <h3 className={styles.courseTitle}>Training of Trainers (TOT) – WOMEN</h3>
              <p className={styles.courseSummary}>
                জেনারেল লাইনে পড়ালিখা করা দ্বীনে ফেরা আপুদের জন্য ঘরে বসেই আন্তর্জাতিক মানের অনলাইন কুরআন টিচার হওয়ার সুযোগ।
              </p>

              <div className={styles.orientationAlert}>
                <span className={styles.orientIcon}>🔔</span>
                <div>
                  <strong>First Orientation Class:</strong>
                  <div className={styles.orientDate}>২১ সেপ্টেম্বর · রাত ৮:০০ টা</div>
                </div>
              </div>

              <div className={styles.perksList}>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>মাসিক সম্মানী:</strong> ১৫,০০০ থেকে ২২,০০০ টাকা পর্যন্ত জব অপরচুনিটি</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>১ মাসে ৪টি প্রফেশনাল ট্রেনিং:</strong> অনলাইনে বাচ্চাদের সাইকোলজি অনুযায়ী পাঠদান</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>স্বীকৃত সার্টিফিকেট:</strong> প্রতিটি ট্রেনিং সফলভাবে সম্পন্ন করলে অফিসিয়াল সার্টিফিকেট প্রদান</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>সরাসরি শিক্ষক নিয়োগ:</strong> ট্রেনিং শেষে ভালো পারফর্ম করা ট্রেইনারদের Fajr Academy-তে নিয়োগ</span>
                </div>
                <div className={styles.perkItem}>
                  <span className={styles.perkCheck}>✓</span>
                  <span><strong>Training &amp; Development:</strong> যারা প্রথম ধাপে নির্বাচিত হবেন না, তাদের নিয়েও ডেভেলপমেন্ট চলতে থাকবে</span>
                </div>
              </div>

              <div className={styles.courseCardFooter}>
                <a href="#registration-section" className={`${styles.btn} ${styles.btnGold} ${styles.btnFull}`}>
                  TOT - WOMEN Batch 014-এ নিবন্ধন করুন (৳১,০০০) →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          INTERACTIVE REGISTRATION FORM & PAYMENT (2 COURSES)
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.regSectionContainer}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            <span className={styles.eyebrow}>অনলাইন ভর্তি ও পেমেন্ট</span>
            <h2>কোর্স নির্বাচন ও শিক্ষার্থী নিবন্ধন ফর্ম</h2>
            <p>
              নিচে আপনার কাঙ্ক্ষিত কোর্স ট্র্যাকটি নির্বাচন করুন এবং বিকাশ পেমেন্টের ট্রানজেকশন আইডি (TrxID) দিয়ে ফর্মটি সাবমিট করুন।
            </p>
          </div>

          <RegistrationForm initialTrack="men" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY FAJR ACADEMY & VIDEO HIGHLIGHTS
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.why}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>কেন ফজর একাডেমি টিওটি</span>
            <h2>প্রশিক্ষণ থেকে সরাসরি ক্যারিয়ার — একটি স্বচ্ছ ও বরকতময় পথ</h2>
            <p>
              শুধু সার্টিফিকেট নয়, ফজর একাডেমি প্রশিক্ষণ শেষে যোগ্য শিক্ষক-শিক্ষিকাদের নিজস্ব গ্লোবাল প্ল্যাটফর্মে সরাসরি নিয়োগ নিশ্চিত করে।
            </p>
          </div>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>১</div>
              <h3>ঘরে বসেই সম্পূর্ণ কাজ</h3>
              <p>
                আপনাকে কোনো ট্রাফিক জ্যামে পড়তে হবে না, রোদে পুড়তে হবে না। সম্পূর্ণ ট্রেনিং ও পরবর্তী শিক্ষকতার কাজ ঘরে বসেই ল্যাপটপে সম্পন্ন করতে পারবেন।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>২</div>
              <h3>সম্মানী ১৫,০০০ – ২২,০০০৳</h3>
              <p>
                কুরআনের খেদমতের সাথে সাথে একটি সম্মানজনক এবং স্বাবলম্বী ক্যারিয়ার গড়ার নিশ্চয়তা ইনশাআল্লাহ।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>৩</div>
              <h3>ল্যাপটপ ও ডিভাইস সাপোর্ট</h3>
              <p>
                আপনার যদি কুরআন তিলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজস্ব তহবিল থেকে ল্যাপটপ সাপোর্ট প্রদান করবে।
              </p>
            </div>
            <div className={styles.whyCard} data-reveal>
              <div className={styles.ic}>৪</div>
              <h3>কন্টিনিউয়াস মেন্টরিং ও সার্টিফিকেট</h3>
              <p>
                ৪টি প্রফেশনাল সেশন শেষে প্রদান করা হবে অফিসিয়াল সার্টিফিকেট এবং যারা প্রথম ধাপে টিকবেন না তাদের নিয়মিত গ্রুমিং ও ডেভেলপমেন্ট করা হবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROCESS TIMELINE (4 STEPS)
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.process}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>ধাপসমূহ</span>
            <h2>নিবন্ধন থেকে শিক্ষক হিসেবে নিয়োগের ৪টি ধাপ</h2>
          </div>
          <div className={styles.timeline}>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০১</div>
              <h3>রেজিস্ট্রেশন ও ১,০০০৳ ফি</h3>
              <p>পছন্দের ট্র্যাক (Men / Women Batch 014) নির্বাচন করে ১,০০০ টাকা বিকাশ পেমেন্ট সম্পন্ন করুন।</p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০২</div>
              <h3>ওরিয়েন্টেশন ক্লাস</h3>
              <p>
                পুরুষদের ২০ সেপ্টেম্বর এবং নারীদের ২১ সেপ্টেম্বর রাত ৮:০০ টায় জুম/মিটে লাইভ ওরিয়েন্টেশন ক্লাসে যুক্ত হোন।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৩</div>
              <h3>৪টি প্রফেশনাল TOT সেশন</h3>
              <p>
                ১ মাসে ৪টি হ্যান্ডস-অন সেশনে বাচ্চাদের কুরআন ও ইংরেজি শেখানোর আধুনিক কৌশল আয়ত্ত করুন।
              </p>
            </div>
            <div className={styles.tlStep} data-reveal>
              <div className={styles.tlNum}>০৪</div>
              <h3>সার্টিফিকেট ও জব অফার</h3>
              <p>
                সফল মূল্যায়নে সার্টিফিকেট অর্জন এবং ফজর একাডেমির শিক্ষক প্যানেলে ১৫-২২ হাজার মাসিক সম্মানীতে যোগ দিন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          REQUIREMENTS + FEE INFO
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.reqFee}`}>
        <div className={styles.wrap}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>প্রয়োজনীয় যোগ্যতা ও ফি</span>
            <h2>আবেদনের যোগ্যতা ও পেমেন্ট সংক্রান্ত তথ্য</h2>
          </div>
          <div className={styles.rfGrid}>
            {/* Requirements */}
            <div className={`${styles.card} ${styles.reqCard}`} data-reveal>
              <h3>আবেদনের সাধারণ যোগ্যতা</h3>
              <ul className={styles.reqList}>
                <li>
                  <span className={styles.check}>✓</span>
                  শুদ্ধ ও স্পষ্ট উচ্চারণে কুরআন তেলাওয়াত করার প্রাথমিক দক্ষতা
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  প্রাথমিক ইংরেজি জানা এবং বোঝার দক্ষতা (প্রশিক্ষণে আরও ডেভেলপ করা হবে)
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  ব্যক্তিগত ল্যাপটপ/ডেস্কটপ (না থাকলে ফজর একাডেমির ডিভাইস সহায়তার সুযোগ)
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  স্থিতিশীল ইন্টারনেট সংযোগ এবং সচল WhatsApp নম্বর
                </li>
                <li>
                  <span className={styles.check}>✓</span>
                  হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয় — শেখানোর সদিচ্ছা ও একাগ্রতা প্রয়োজন
                </li>
              </ul>
            </div>

            {/* Fee Card */}
            <div className={`${styles.card} ${styles.feeCard}`} data-reveal>
              <span className={styles.feeCardEyebrow}>কোর্স ফি ও পেমেন্ট তথ্য</span>
              <h3>এককালীন রেজিস্ট্রেশন ফি</h3>
              <div className={styles.feeAmount}>
                <sup>৳</sup>১,০০০
              </div>
              <div className={styles.feeRows}>
                <div className={styles.feeRow}>
                  <span>বিকাশ মার্চেন্ট নম্বর</span>
                  <b>01410764581</b>
                </div>
                <div className={styles.feeRow}>
                  <span>পেমেন্ট মেথড</span>
                  <b>বিকাশ অ্যাপ · Make Payment</b>
                </div>
                <div className={styles.feeRow}>
                  <span>রেফারেন্স</span>
                  <b>TOT-MEN অথবা TOT-WOMEN</b>
                </div>
                <div className={styles.feeRow}>
                  <span>হটলাইন / WhatsApp</span>
                  <b>01641028312</b>
                </div>
              </div>
              <p className={styles.feeNote}>
                পেমেন্ট সম্পন্ন করার পর প্রাপ্ত TrxID দিয়ে উপরের ফর্মে রেজিস্ট্রেশন নিশ্চিত করুন অথবা সরাসরি WhatsApp-এ ট্রানজেকশন স্ক্রিনশট পাঠান।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VIDEO / FOUNDER STATEMENT
          ════════════════════════════════════════════════════════ */}
      <section className={`${styles.section} ${styles.media}`}>
        <div className={`${styles.wrap} ${styles.mediaGrid}`}>
          <div className={styles.videoCard} data-reveal>
            <iframe
              src="https://www.youtube.com/embed/zPXTzup-2ok?autoplay=1&mute=1&loop=1&playlist=zPXTzup-2ok&controls=1&rel=0&playsinline=1"
              title="Fajr Academy Teacher Training Program Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className={styles.videoIframe}
            />
          </div>

          <div className={styles.founderNote} data-reveal>
            <span className={styles.quoteMark}>&ldquo;</span>
            <p>
              &ldquo;আমাদের প্রিয় নবী (সাঃ) বলেছেন — খইরুকুম মান তাআল্লামাল কুরআনা ওয়া আল্লামাহু। আপনি যদি শুদ্ধভাবে কুরআন পড়তে পারেন এবং বেসিক ইংলিশ জানা থাকে, তাহলে ফজর একাডেমির এই টিওটি প্রোগ্রামে জয়েন করে আপনি ঘরে বসেই ১৫ থেকে ২২ হাজার টাকা মাসিক সম্মানীতে একটি সুন্দর হালাল ক্যারিয়ার গড়তে পারবেন। যাদের ল্যাপটপ নেই কিন্তু কুরআন ও ইংলিশে ভালো, ফজর একাডেমি নিজে থেকেই তাদের ল্যাপটপ সহায়তা প্রদান করবে, ইনশাআল্লাহ।&rdquo;
            </p>
            <div className={styles.founderId}>
              <div className={styles.founderAv}>
                <img src="/founder.jpg" alt="Muhammad Farabi Chowdhury" />
              </div>
              <div>
                <b>Hafiz Maowlana Muhammad Farabi Chowdhury</b>
                <span>Founder &amp; CEO, Fajr Academy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ SECTION
          ════════════════════════════════════════════════════════ */}
      <section id="faq" className={`${styles.section} ${styles.faq}`}>
        <div className={`${styles.wrap} ${styles.faqContainer}`}>
          <div className={`${styles.sectionHead} reveal`} data-reveal style={{ textAlign: 'center', margin: '0 auto 36px' }}>
            <span className={styles.eyebrow}>সাধারণ প্রশ্ন ও উত্তর</span>
            <h2>আপনার মনে থাকা প্রশ্নগুলোর উত্তর</h2>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>পুরুষ ও নারীদের ওরিয়েন্টেশন ক্লাস কবে?</summary>
              <p className={styles.faqText}>
                পুরুষদের (TOT - MEN) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২০ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>। নারীদের (TOT - WOMEN Batch 014) ফার্স্ট ওরিয়েন্টেশন ক্লাস হবে <strong>২১ সেপ্টেম্বর, রাত ৮:০০ টায়</strong>।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>কোর্সের ফি কত এবং কীভাবে পেমেন্ট করব?</summary>
              <p className={styles.faqText}>
                উভয় কোর্সের রেজিস্ট্রেশন ফি ১,০০০ টাকা। বিকাশ অ্যাপের &lsquo;Make Payment&rsquo; অপশনে গিয়ে <strong>01410764581</strong> নম্বরে ১,০০০ টাকা পাঠিয়ে প্রাপ্ত TrxID ফর্মে সাবমিট করতে হবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>ল্যাপটপ না থাকলে কি আবেদন করা যাবে?</summary>
              <p className={styles.faqText}>
                হ্যাঁ! আপনার যদি কুরআন তেলাওয়াত ও ইংরেজি ভালো থাকে কিন্তু ডিভাইস না থাকে, তবে ফজর একাডেমি নিজ থেকেই প্রার্থীদের ল্যাপটপ/ডিভাইস সুবিধা প্রদান করবে, ইনশাআল্লাহ।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>আমাকে কি হাফিজ বা আলেম হতে হবে?</summary>
              <p className={styles.faqText}>
                না, হাফিজ বা আলেম হওয়া বাধ্যতামূলক নয়। শুদ্ধভাবে কুরআন পড়তে জানা এবং বেসিক ইংরেজি জানা থাকলেই যথেষ্ট। ক্লাসে বাচ্চাদের কীভাবে পড়াতে হয় তা ফজর একাডেমি শেখাবে।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>প্রথম ধাপে নির্বাচিত না হলে কি সুযোগ শেষ?</summary>
              <p className={styles.faqText}>
                একদমই না! যারা প্রথম ধাপে চূড়ান্তভাবে নির্বাচিত হবেন না, তাদেরকে বাদ না দিয়ে নিয়মিত ট্রেনিং ও স্কিল ডেভেলপমেন্ট করানো হবে যাতে পরবর্তী ধাপে তারা সফলভাবে শিক্ষক হিসেবে জয়েন করতে পারেন।
              </p>
            </details>

            <details className={styles.faqDetails} data-reveal>
              <summary className={styles.faqSummary}>শিক্ষক হিসেবে মাসিক সম্মানী কেমন হবে?</summary>
              <p className={styles.faqText}>
                ট্রেনিং সম্পন্ন করে ফজর একাডেমিতে শিক্ষক হিসেবে কাজের সুযোগ পেলে মাসিক সম্মানী হবে ১৫,০০০ টাকা থেকে ২২,০০০ টাকা পর্যন্ত।
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════════════════ */}
      <section className={styles.finalCta}>
        <div className={styles.wrap}>
          <span className={styles.finalCtaEyebrow}>Batch 2026 · সীমিত আসন সংখ্যা</span>
          <h2>আজই আপনার আসন নিশ্চিত করুন, কুরআনের খেদমতে যুক্ত হোন</h2>
          <p>
            ফর্ম পূরণ করে ১,০০০ টাকা রেজিস্ট্রেশন ফি প্রদান করুন। যেকোনো তথ্যের জন্য সরাসরি আমাদের WhatsApp হটলাইনে মেসেজ দিন।
          </p>
          <div className={styles.finalCtaRow}>
            <a
              id="footer-register-cta"
              className={`${styles.btn} ${styles.btnGold}`}
              href="#registration-section"
            >
              রেজিস্ট্রেশন ফর্মে যান (৳১,০০০) →
            </a>
            <a
              id="footer-call-cta"
              className={`${styles.btn} ${styles.btnOutline}`}
              href="https://wa.me/8801641028312"
              target="_blank"
              rel="noopener noreferrer"
            >
              📞 01641028312 নম্বরে WhatsApp করুন
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LUXURY INTEGRATED FOOTER WITH SSLCOMMERZ SHOWCASE
          ════════════════════════════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {/* Brand Emblem & Subtitle */}
          <div className={styles.footerTopRow}>
            <div className={styles.footerBrandEmblem}>
              <div className={styles.footerEmblemIcon}>ف</div>
              <span className={styles.footerBrandName}>FAJR ACADEMY</span>
            </div>
            <p className={styles.footerTagline}>
              Balanced Education for Dunya and Akhirah — Training of Trainers (TOT) Program
            </p>
          </div>

          {/* Integrated SSLCommerz Multi-Payment Showcase Card */}
          <div className={styles.sslPaymentCard}>
            <div className={styles.sslCardHeader}>
              <div className={styles.sslCardBadge}>
                <span>🔒 OFFICIAL PAYMENT GATEWAY PARTNER</span>
              </div>
              <div className={styles.sslSecurityBadge}>
                <span>256-BIT SSL ENCRYPTED & VERIFIED</span>
              </div>
            </div>

            <div className={styles.sslWhiteContainer}>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.sslcommerz.com/"
                title="SSLCommerz - 100% Secure Payment Gateway"
                className={styles.sslPayWithLink}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-01.png"
                  alt="SSLCommerz Pay With - Visa, Mastercard, AMEX, bKash, Nagad, Rocket, MFS and Internet Banking"
                  className={styles.sslPayWithImg}
                />
              </a>
            </div>

            <div className={styles.sslCardFooterInfo}>
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>ভিসা, মাস্টারকার্ড ও অ্যামেক্স</span>
              </div>
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>বিকাশ, নগদ, রকেট ও সকল মোবাইল ব্যাংকিং</span>
              </div>
              <div className={styles.sslFeatureItem}>
                <span className={styles.sslCheckIcon}>✓</span>
                <span>ইন্টারনেট ব্যাংকিং ও ইনস্ট্যান্ট ভেরিফিকেশন</span>
              </div>
            </div>
          </div>

          {/* Contact & Copyright Info */}
          <div className={styles.footerBottomRow}>
            <div className={styles.footerContactLinks}>
              <span>হটলাইন: <a href="https://wa.me/8801641028312" target="_blank" rel="noopener noreferrer">01641028312</a></span>
              <span>•</span>
              <span>হেল্পলাইন: <a href="https://wa.me/8801857381244" target="_blank" rel="noopener noreferrer">+880 1857-381244</a></span>
              <span>•</span>
              <span>ইমেইল: <a href="mailto:info@fajracademy.io">info@fajracademy.io</a></span>
            </div>
            <span>
              © 2026 Fajr Academy. All rights reserved. Registered Islamic Education Institute.
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
