import type { Metadata } from 'next'
import { Eye, ShieldCheck, BellRing, Briefcase } from 'lucide-react'
import { AudiencePage, type AudiencePageContent } from '@/components/landing'

export const metadata: Metadata = {
  title: 'GST Notice Management for Business Owners | EffortlessInsight',
  description:
    'From GST notice panic to complete control. Plain-English explanations, WhatsApp deadline reminders, and draft replies — built for business owners.',
}

const content: AudiencePageContent = {
  eyebrow: 'For business owners',
  headline: 'From notice panic',
  headlineAccent: 'to complete control.',
  subheadline:
    'You built a business, not a tax department. When a notice arrives, you deserve to know what it says, how serious it is, and what to do next — in minutes, in language you actually speak.',
  painPoints: [
    {
      title: 'The panic',
      body: 'A DRC-01 lands and your stomach drops. Legal language, big numbers, and no idea whether this is routine or serious.',
    },
    {
      title: 'The confusion',
      body: 'Which documents? Which deadline — 15 days or 30? From the issue date or the day you saw it? Everyone tells you something different.',
    },
    {
      title: 'The deadline anxiety',
      body: 'Compliance lives in your head and a diary. One busy fortnight and a reply date slips — with interest and penalties attached.',
    },
  ],
  benefits: [
    {
      icon: Eye,
      title: 'Instant clarity, in your language',
      body: 'Within minutes of a notice arriving you get a plain-English (or Hindi) summary, a risk score with the reasoning, and a step-by-step action list.',
    },
    {
      icon: BellRing,
      title: 'Deadlines that chase you',
      body: 'Reminders at 7, 3 and 1 day before every due date — by email, push, and WhatsApp on the Professional plan. Ask the WhatsApp assistant "deadlines" anytime.',
    },
    {
      icon: ShieldCheck,
      title: 'Lower risk, fewer penalties',
      body: 'Every GSTIN in one dashboard with risk levels visible, so nothing festers unseen. Draft replies mean responses go out early, not at midnight.',
    },
    {
      icon: Briefcase,
      title: 'Your time back',
      body: 'Forward the analysis and draft reply to your CA in one click and get back to running the business. The platform keeps the history for next time.',
    },
  ],
  workflow: [
    {
      title: 'Connect your GSTIN',
      body: 'Two minutes, one OTP — the same one the portal sends you. No password shared, ever.',
    },
    {
      title: 'Existing notices appear, explained',
      body: 'Anything already waiting on the portal is fetched and analyzed — you may learn something today.',
    },
    {
      title: 'Set your reminders and relax',
      body: 'Pick WhatsApp, email or push. From now on, deadlines find you — not the other way around.',
    },
  ],
  closingLine: 'Stop losing sleep over brown envelopes.',
}

export default function BusinessPage() {
  return <AudiencePage content={content} />
}
