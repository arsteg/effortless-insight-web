import type { Metadata } from 'next'
import { LayoutDashboard, GitBranch, ScrollText, BarChart3 } from 'lucide-react'
import { AudiencePage, type AudiencePageContent } from '@/components/landing'

export const metadata: Metadata = {
  title: 'GST Notice Management for Finance Teams | EffortlessInsight',
  description:
    'Enterprise-grade compliance operations: multi-GSTIN dashboards, workflows with approvals and SLAs, audit trails, and exportable reporting.',
}

const content: AudiencePageContent = {
  eyebrow: 'For finance teams & enterprises',
  headline: 'Compliance operations',
  headlineAccent: 'that survive audits and handovers.',
  subheadline:
    'Notices across entities and states, tracked in spreadsheets and inboxes, is how deadlines get missed. Give your team one system with ownership, approvals and an audit trail.',
  painPoints: [
    {
      title: 'The spreadsheet',
      body: 'The notice tracker lives in Excel, updated by whoever remembers. When its owner goes on leave, so does the process.',
    },
    {
      title: 'The handoffs',
      body: '“I thought tax was handling it.” Notices bounce between teams over email with no owner, no stage, no SLA.',
    },
    {
      title: 'The audit scramble',
      body: 'When auditors ask who saw the notice, when you replied and who approved it — the answer is an archaeology project.',
    },
  ],
  benefits: [
    {
      icon: LayoutDashboard,
      title: 'One command centre, every entity',
      body: 'Active notices, due-this-week, high-risk and compliance score — across all GSTINs and entities, entity-wise when you need it.',
    },
    {
      icon: GitBranch,
      title: 'Workflows with real ownership',
      body: 'Auto-assignment rules, linear or parallel stages, approval chains and SLA-based escalation. Every notice has an owner and a stage — always.',
    },
    {
      icon: ScrollText,
      title: 'Governance by default',
      body: 'Role-based access from owner to view-only, two-factor authentication, and a timestamped audit trail of every action — exportable for auditors.',
    },
    {
      icon: BarChart3,
      title: 'Reporting leadership actually reads',
      body: '30+ metrics on exposure, aging, response times and team performance. Export to CSV, Excel or PDF, or schedule it monthly.',
    },
  ],
  checklist: {
    title: 'Built for enterprise operations',
    items: [
      'Multi-GSTIN and multi-entity dashboards',
      'SLA tracking with escalation to managers',
      'Approval chains and sign-offs before filing',
      'Document requests tracked to closure',
      '8-year record retention, in line with GST rules',
      'Data encrypted and hosted in India',
    ],
  },
  workflow: [
    {
      title: 'Connect entities, invite the team',
      body: 'GSTINs authorized by OTP; teammates join with the right role — from admin to view-only.',
    },
    {
      title: 'Set assignment and escalation rules',
      body: 'Route notices by entity or type; set SLAs so anything stuck surfaces before it becomes overdue.',
    },
    {
      title: 'Run compliance from one screen',
      body: 'Owners work their queues, approvers sign off, leadership watches the dashboard. Auditors get the trail.',
    },
  ],
  closingLine: 'The spreadsheet retires. The process survives handovers.',
}

export default function FinanceTeamsPage() {
  return <AudiencePage content={content} />
}
