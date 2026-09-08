import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Served at /sitemap.xml. Public marketing + legal routes only.
const BASE_URL = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/business', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/chartered-accountants', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/finance-teams', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/refund', priority: 0.4, changeFrequency: 'yearly' },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    priority,
    changeFrequency,
  }))
}
