import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const SITE_URL = 'https://nobishiro.kids'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/growth`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/new`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/business`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/business/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/business/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const blogPages = getAllPosts().map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
