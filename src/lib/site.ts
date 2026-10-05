/**
 * Public site URL configuration.
 *
 * Sourced from `NEXT_PUBLIC_SITE_URL` (see `.env.local` / `.env.example`), with
 * a production fallback. Used for metadata (`metadataBase`), canonical URLs,
 * robots.txt, the sitemap, and JSON-LD structured data — so the domain lives in
 * one place instead of being hardcoded across those files.
 *
 * Referenced as a literal `process.env.NEXT_PUBLIC_SITE_URL` on purpose — Next.js
 * only inlines literal env references into the client bundle.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://effortlessinsight.in'
).replace(/\/$/, '')
