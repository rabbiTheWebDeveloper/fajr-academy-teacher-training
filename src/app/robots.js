import { BASE_URL } from '@/constant'

export default function robots() {
  const baseUrl = `https://${BASE_URL}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
