import type { Metadata } from 'next'
import { LayoutDashboard, Users, FileCheck2, CalendarClock } from 'lucide-react'
import { AudiencePage, type AudiencePageContent } from '@/components/landing'

export const metadata: Metadata = {
  title: 'GST Notice Management for Chartered Accountants | EffortlessInsight',
  description:
    'Every client’s GST notices in one dashboard. Deadlines ranked, replies drafted, nothing slipping through — built for CA practices.',
}

const content: AudiencePageContent = {
  eyebrow: 'For Chartered Accountants & tax professionals',
  headline: 'More clients.',
  headlineAccent: 'Same team. Zero missed deadlines.',
  subheadline:
    'EffortlessInsight watches every client’s GST portal, ranks every deadline, and drafts the first reply — so you handle more clients with the same team and finalize with your name on every filing. The busywork is ours; the judgment, the filing and the fee stay yours.',
  painPoints: [
    {
      title: 'The juggling',
      body: 'Logging into client portals one by one, hoping you didn’t miss a notice that arrived last Tuesday.',
    },
    {
      title: 'The firefighting',
      body: 'Clients forwarding notice PDFs in panic — always urgent, always incomplete, always at 6 PM.',
    },
    {
      title: 'The exposure',
      body: 'One missed client deadline damages the relationship — and your reputation carries the blame.',
    },
  ],
  benefits: [
    {
      icon: LayoutDashboard,
      title: 'Your whole practice on one screen',
      body: 'Every client GSTIN, every notice, every due date — grouped by client, ranked by urgency. The morning question “who needs attention?” takes one glance.',
    },
    {
      icon: CalendarClock,
      title: 'Deadline radar for every client',
      body: 'Overdue and due-this-week across all clients, always on top. Weekly digests so nothing builds up silently.',
    },
    {
      icon: FileCheck2,
      title: 'Drafts, not blank pages',
      body: 'Each notice arrives with a structured summary, cited GST sections, and a drafted reply. You review, refine and file — the first 80% is done, and the expertise on the final 20% stays yours. We never file anything on our own.',
    },
    {
      icon: Users,
      title: 'Take on more clients, not more staff',
      body: 'Monitoring and first drafts are automated, so each client takes minutes, not hours. Grow your book without growing your team — and never lose a client to a missed notice.',
    },
  ],
  checklist: {
    title: 'Client collaboration, built in',
    items: [
      'Shared workspace per client and per notice',
      'Document requests clients can answer from their phone',
      'Threaded comments and @mentions with your staff',
      'Approval chains — preparer, reviewer, partner',
      'A dedicated CA role with the right access levels',
      'Complete activity timeline for every engagement',
    ],
  },
  workflow: [
    {
      title: 'Add your clients',
      body: 'Paste their GSTINs — 5 or 50, one go. Each client authorizes with their own OTP.',
    },
    {
      title: 'Notices flow in, pre-analyzed',
      body: 'New notices appear with summaries, risk levels and deadlines already extracted.',
    },
    {
      title: 'Work the priority list',
      body: 'Start with what’s overdue, end with what’s due next month. Draft replies are waiting for your review.',
    },
  ],
  closingLine: 'The busywork disappears. Your practice grows — with your name on every filing.',
}

export default function CharteredAccountantsPage() {
  return <AudiencePage content={content} />
}
