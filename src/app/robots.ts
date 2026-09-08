import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Served at /robots.txt. Marketing/legal pages are crawlable; the logged-in
// product and auth routes are kept out of search indexes.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/notices',
        '/tasks',
        '/team',
        '/calendar',
        '/reports',
        '/notifications',
        '/gst-sync',
        '/checkout',
        '/select-plan',
        '/settings',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/onboarding',
        '/invitations',
        '/auth',
        '/subscription-required',
        '/delete-account',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
