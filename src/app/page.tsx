import type { Metadata } from 'next'
import {
  LandingHeader,
  Hero,
  StorySection,
  FourPromises,
  ProductTour,
  DraftingSpotlight,
  FeatureGrid,
  HowItWorks,
  AudienceRouter,
  SecuritySection,
  RoiSection,
  SocialProof,
  PricingPreview,
  FaqSection,
  CTASection,
  LandingFooter,
  Reveal,
} from '@/components/landing'

const title = 'EffortlessInsight — GST notices, found, explained and answered on time'
const description =
  'EffortlessInsight finds every GST notice on the portal, explains it in plain English, reminds you before every deadline, and drafts your reply. Start free.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: 'EffortlessInsight',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
}

/**
 * Structured data: the product itself plus the FAQ answers a cautious buyer
 * searches for. Kept in sync by hand with the visible FAQ — only questions
 * actually answered on this page belong here.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'EffortlessInsight',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description,
      url: 'https://effortlessinsight.in',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free 14-day trial, no credit card required',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do you need my GST portal password?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No — and we will never ask for it. You authorize access with an OTP sent to your registered GST mobile number, and only an encrypted session token is retained. You can revoke access anytime.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often are notices synchronized?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every 6 hours by default, configurable from 1 to 24 hours, with manual sync anytime. If the GST portal is temporarily down, we retry automatically and resume as soon as it recovers.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can EffortlessInsight file a reply on the portal without me?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No — and that is by design. The platform reads and analyzes notices and prepares draft replies, but nothing is filed, changed or submitted to any authority without you. You and your CA review, decide and file.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my data encrypted, and where is it stored?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'All traffic is encrypted in transit with TLS, and sensitive fields — session tokens, GSTINs, personal data — are protected with AES-256 encryption. All storage and backups are in Indian data centres (Mumbai region).',
          },
        },
      ],
    },
  ],
}

/**
 * Homepage. A guided journey that scans in five seconds per section but
 * carries the platform's full depth behind tabs and expandables:
 * Hero (what/who/why + capability strip) → Story (the problem, felt, plus the
 * full lifecycle) → FourPromises (the solution in four beats, expandable) →
 * ProductTour (nine capabilities working, with facts) → DraftingSpotlight
 * (the strongest single reason to buy, in one visual) → FeatureGrid (the
 * supporting capabilities, one compact band) → HowItWorks (setup + the
 * 60-second pipeline) → AudienceRouter (whoever you are, this fits) →
 * Security (the access flow and the facts) → Roi (the price of the old way) →
 * SocialProof (proof you can verify today, honestly) → Pricing (real plans,
 * value-framed) → FAQ (everything a cautious buyer asks) → CTA (final push).
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingHeader />
      <Hero />
      <Reveal><StorySection /></Reveal>
      <Reveal><FourPromises /></Reveal>
      <Reveal><ProductTour /></Reveal>
      <Reveal><DraftingSpotlight /></Reveal>
      <Reveal><FeatureGrid /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><AudienceRouter /></Reveal>
      <Reveal><SecuritySection /></Reveal>
      <Reveal><RoiSection /></Reveal>
      <Reveal><SocialProof /></Reveal>
      <Reveal><PricingPreview /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><CTASection /></Reveal>
      <LandingFooter />
    </main>
  )
}
