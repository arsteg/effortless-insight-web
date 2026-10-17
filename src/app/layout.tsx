import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './product.css'
import { Providers } from '@/components/providers'
import { RouteTracker } from '@/components/analytics/route-tracker'
import { COMPANY } from '@/lib/company'
import { SITE_URL } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${COMPANY.brand} - GST Notice Management`,
  description: 'AI-powered GST Notice Operating System for Indian businesses',
  manifest: '/manifest.json',
  icons: {
    // .ico first as the universal fallback (old browsers, RSS readers,
    // Google result favicons), SVG for everything modern
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/small-logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/small-logo.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: COMPANY.brand,
  },
  // Site-wide social-share fallback; individual pages (e.g. the homepage) may override.
  openGraph: {
    siteName: COMPANY.brand,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: COMPANY.brand }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}

// No maximumScale: pinch-zoom must stay available for low-vision users
export const viewport: Viewport = {
  themeColor: '#1f79ad',
  width: 'device-width',
  initialScale: 1,
}

// Organization schema for site-wide entity identification
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: COMPANY.brand,
  legalName: COMPANY.legalName,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'AI-powered GST Notice Operating System for Indian businesses',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Aravali Heights, Sector 24',
    addressLocality: 'Dharuhera',
    addressRegion: 'Haryana',
    postalCode: '123106',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: COMPANY.phone,
    email: COMPANY.email,
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: Object.values(COMPANY.socials).filter(Boolean),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Providers>
          <RouteTracker />
          {children}
        </Providers>
      </body>
    </html>
  )
}
