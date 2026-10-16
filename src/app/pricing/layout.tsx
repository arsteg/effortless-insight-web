import type { Metadata } from 'next'
import { COMPANY } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Pricing Plans - GST Notice Management Software | EffortlessInsight',
  description:
    'Simple, transparent pricing for GST notice management. Start with a free 14-day trial. Plans for business owners, CAs, and finance teams. No credit card required.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing Plans - GST Notice Management Software | EffortlessInsight',
    description:
      'Simple, transparent pricing for GST notice management. Start with a free 14-day trial. Plans for business owners, CAs, and finance teams.',
    url: '/pricing',
    siteName: COMPANY.brand,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: COMPANY.brand }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans - GST Notice Management Software | EffortlessInsight',
    description:
      'Simple, transparent pricing for GST notice management. Free 14-day trial, no credit card required.',
    images: ['/og-image.png'],
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
