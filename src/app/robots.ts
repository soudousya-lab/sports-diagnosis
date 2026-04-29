import { MetadataRoute } from 'next'

const SITE_URL = 'https://nobishiro.kids'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/edit/',
          '/nbs-ctrl-8x7k2m/',
          '/trainer-private/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
