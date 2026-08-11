'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  RefreshCw,
  Sparkles,
  MessageSquareText,
  FileEdit,
  MessageCircle,
  BarChart3,
  Users,
  Smartphone,
  Check,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Interactive product tour: one capability per tab, shown as a rich mockup
 * with the concrete facts listed beside it — breadth AND depth without a
 * single wall of text.
 *
 * TODO(marketing): Replace each mockup with a real product screenshot once
 * final UI polish lands — keep the same aspect and framing.
 */

// ---------------------------------------------------------------------------
// Mockup building blocks
// ---------------------------------------------------------------------------

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-gray-400">
          app.effortlessinsight.in
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function PhoneFrame({ children, header }: { children: React.ReactNode; header: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-white shadow-xl">
      {header}
      <div className="p-3">{children}</div>
    </div>
  )
}

function DashboardMock() {
  const stats = [
    { label: 'Active notices', value: '12', tone: 'text-gray-900' },
    { label: 'Due this week', value: '4', tone: 'text-orange-600' },
    { label: 'Overdue', value: '2', tone: 'text-red-600' },
    { label: 'Amount at stake', value: '₹8.4L', tone: 'text-gray-900' },
  ]
  const rows = [
    { id: 'DRC-01', client: 'Sharma Textiles', due: '3 days', tone: 'bg-red-50 text-red-700' },
    { id: 'ASMT-10', client: 'GreenLeaf Foods', due: '12 days', tone: 'bg-orange-50 text-orange-700' },
    { id: 'GSTR-3A', client: 'Apex Traders', due: '21 days', tone: 'bg-gray-100 text-gray-600' },
  ]
  return (
    <BrowserFrame>
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
            <p className={cn('text-xl font-bold', s.tone)}>{s.value}</p>
            <p className="mt-0.5 text-[11px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
            <span className="rounded-md bg-primary-50 px-2 py-1 text-[11px] font-bold text-primary-700">
              {r.id}
            </span>
            <span className="text-sm font-medium text-gray-800">{r.client}</span>
            <span className={cn('ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold', r.tone)}>
              due in {r.due}
            </span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

function SyncMock() {
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <p className="font-semibold text-gray-900">Connected GSTINs</p>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
          Auto-sync on
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="rounded-xl border border-gray-100 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-gray-800">29AAACR5055K1ZN</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-green-700">
              <Check className="h-3 w-3" /> OTP verified
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              ['Every 6h', 'Sync interval'],
              ['2h ago', 'Last synced'],
              ['12', 'Notices found'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-gray-50 py-1.5">
                <p className="text-xs font-bold text-gray-900">{v}</p>
                <p className="text-[10px] text-gray-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-primary-50 p-3 text-xs text-primary-800">
          <RefreshCw className="h-4 w-4 flex-shrink-0 text-primary-600" aria-hidden />
          New DRC-01 fetched from portal · analysis started automatically
        </div>
        <p className="text-center text-[11px] text-gray-500">
          Portal password never asked for, never stored
        </p>
      </div>
    </BrowserFrame>
  )
}

function AnalysisMock() {
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">DRC-01 · Sharma Textiles</p>
          <p className="text-xs text-gray-500">Analyzed automatically after sync</p>
        </div>
        <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
          Risk: High · 72/100
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Summary</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">
          Department claims ₹2,45,000 excess input credit for FY 2024-25.
          Defendable with matching purchase invoices.
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {['Collect invoices from 3 flagged suppliers', 'Verify GSTR-2B entries for March', 'File reply before 24 August'].map(
          (item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </span>
              {item}
            </div>
          )
        )}
      </div>
    </BrowserFrame>
  )
}

function ChatMock() {
  return (
    <BrowserFrame>
      <div className="space-y-3">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary-600 px-4 py-2.5 text-sm text-white">
          Can I contest this demand? What proof do I need?
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
          Yes — this notice is contestable. Based on <b>your</b> DRC-01, you need:
          <br />1. Purchase invoices from the 3 flagged suppliers
          <br />2. Payment proof (bank statement entries)
          <br />3. Their GSTR-1 filings showing the sales
          <br />
          <span className="text-gray-500">Want me to draft the reply with these grounds?</span>
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary-600 px-4 py-2.5 text-sm text-white">
          Haan, draft kar do 👍
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-gray-500">
        Answers grounded in your actual notice — English or Hindi
      </p>
    </BrowserFrame>
  )
}

function DraftMock() {
  return (
    <BrowserFrame>
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 font-serif text-[13px] leading-relaxed text-gray-700">
        <p className="font-semibold">To: The Proper Officer, Ward 47</p>
        <p className="mt-2">
          Subject: Reply to DRC-01 dated 09.08.2026 — ITC discrepancy of ₹2,45,000
        </p>
        <p className="mt-2">
          Respected Sir/Madam, with reference to the above notice, the taxpayer
          respectfully submits that the input tax credit in question was availed
          against valid tax invoices, duly paid through banking channels&hellip;
        </p>
        <p className="mt-2 text-gray-400">— continues with grounds, annexure list &amp; prayer —</p>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white">
          Edit draft
        </span>
        <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
          Share with CA
        </span>
        <span className="ml-auto rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          Ready for CA review
        </span>
      </div>
    </BrowserFrame>
  )
}

function WhatsAppMock() {
  return (
    <PhoneFrame
      header={
        <div className="flex items-center gap-2 bg-[#075E54] px-4 py-3 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            EI
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">EffortlessInsight</p>
            <p className="text-[10px] text-white/70">GST Assistant</p>
          </div>
        </div>
      }
    >
      <div className="space-y-2 rounded-xl bg-[#ECE5DD] p-3">
        <div className="max-w-[90%] rounded-lg bg-white p-2.5 text-[12px] leading-snug text-gray-800 shadow-sm">
          ⚠️ <b>Deadline reminder</b>
          <br />
          DRC-01 reply for Sharma Textiles due in <b>3 days</b> (24 Aug).
          <br />
          <span className="text-primary-700">Open notice →</span>
        </div>
        <div className="max-w-[90%] rounded-lg bg-white p-2.5 text-[12px] leading-snug text-gray-800 shadow-sm">
          📋 <b>Your Monday digest</b>
          <br />
          2 new notices · 4 due this week · 1 reply filed ✅
        </div>
        <div className="ml-auto max-w-[75%] rounded-lg bg-[#DCF8C6] p-2.5 text-[12px] text-gray-800 shadow-sm">
          status DRC-01
        </div>
        <div className="max-w-[90%] rounded-lg bg-white p-2.5 text-[12px] leading-snug text-gray-800 shadow-sm">
          DRC-01: Draft reply ready, awaiting your CA&apos;s review. 3 days to deadline.
        </div>
      </div>
    </PhoneFrame>
  )
}

function AnalyticsMock() {
  const bars = [42, 65, 38, 80, 55, 70]
  return (
    <BrowserFrame>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Notices by month
          </p>
          <div className="mt-3 flex h-24 items-end gap-2">
            {bars.map((h, i) => (
              <div
                key={i}
                className={cn('flex-1 rounded-t', i === 3 ? 'bg-primary-500' : 'bg-primary-200')}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Avg. response time
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              4.2 days <span className="text-sm font-medium text-green-600">↓ 61%</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Exposure closed this quarter
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">₹14.8L</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-right text-[11px] text-gray-400">Export: CSV · Excel · PDF</p>
    </BrowserFrame>
  )
}

function TeamMock() {
  const rows = [
    { id: 'DRC-01', who: 'Rahul M.', due: '5 days', tone: 'bg-red-50 text-red-700', stage: 'Drafting reply' },
    { id: 'ASMT-10', who: 'Priya S.', due: '12 days', tone: 'bg-orange-50 text-orange-700', stage: 'Collecting documents' },
    { id: 'REG-03', who: 'Amit K.', due: '8 days', tone: 'bg-yellow-50 text-yellow-700', stage: 'Awaiting approval' },
  ]
  return (
    <BrowserFrame>
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <p className="font-semibold text-gray-900">Team assignments</p>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
          Compliance score 94%
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-100 p-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary-50 px-2 py-1 text-[11px] font-bold text-primary-700">
                {r.id}
              </span>
              <span className="text-sm font-medium text-gray-800">{r.who}</span>
              <span className={cn('ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold', r.tone)}>
                {r.due}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">{r.stage}</p>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-600">
          <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" aria-hidden />
          @Priya requested 2 documents from client · approval chain: preparer → reviewer → partner
        </div>
      </div>
    </BrowserFrame>
  )
}

function MobileMock() {
  return (
    <PhoneFrame
      header={
        <div className="bg-primary-600 px-4 py-3 text-white">
          <p className="text-sm font-semibold">Notices</p>
        </div>
      }
    >
      <div className="space-y-2">
        {[
          { id: 'DRC-01', client: 'Sharma Textiles', badge: '3 days', tone: 'bg-red-50 text-red-700' },
          { id: 'ASMT-10', client: 'GreenLeaf Foods', badge: '12 days', tone: 'bg-orange-50 text-orange-700' },
          { id: 'REG-17', client: 'Apex Traders', badge: 'Replied ✓', tone: 'bg-green-50 text-green-700' },
        ].map((n) => (
          <div key={n.id} className="rounded-xl border border-gray-100 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-700">{n.id}</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', n.tone)}>
                {n.badge}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-800">{n.client}</p>
          </div>
        ))}
        <div className="rounded-xl bg-primary-50 p-3 text-center text-xs font-medium text-primary-700">
          Approve draft replies on the go
        </div>
      </div>
    </PhoneFrame>
  )
}

// ---------------------------------------------------------------------------
// Tour definition — outcome first, concrete facts beside the visual
// ---------------------------------------------------------------------------

const tabs = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    outcome: 'Your whole GST world on one screen',
    body: 'Every GSTIN, every notice, every deadline — ranked by urgency, with amounts at stake. The morning question "what needs attention?" takes one glance.',
    facts: [
      'Active, overdue and due-this-week notices with a live compliance score',
      'Entity-wise and GSTIN-wise views for multi-registration businesses',
      'Team activity feed — see who did what, when, on every notice',
    ],
    mock: DashboardMock,
  },
  {
    id: 'sync',
    icon: RefreshCw,
    label: 'Portal Sync',
    outcome: 'Notices arrive before the panic does',
    body: 'Authorize once with the OTP the portal sends you. From then on, new notices are fetched and analyzed automatically — nothing discovered weeks late.',
    facts: [
      'One-time OTP setup per GSTIN, done in about 2 minutes — no password ever stored',
      'Auto-sync every 6 hours, configurable from 1 to 24 hours, manual sync anytime',
      'Every synced notice goes straight into AI analysis and deadline tracking',
    ],
    mock: SyncMock,
  },
  {
    id: 'analysis',
    icon: Sparkles,
    label: 'AI Analysis',
    outcome: 'Understand any notice in minutes',
    body: 'Risk level, plain-English summary and a step-by-step action checklist — generated the moment a notice arrives, in English and Hindi.',
    facts: [
      '150+ notice types across 11 GST categories, classified automatically',
      'Risk score 0–100 from six weighted factors, with the reasoning shown',
      'Action items, required-document checklist and cited legal references',
    ],
    mock: AnalysisMock,
  },
  {
    id: 'chat',
    icon: MessageSquareText,
    label: 'AI Chat',
    outcome: 'Ask anything, in plain language',
    body: 'Every answer is grounded in your actual notice — not generic tax advice. Ask in English, Hindi, or the mix you actually speak.',
    facts: [
      '“Is this contestable?” “What proof do I need?” “When is it really due?” — answered from your notice',
      'Clarifies deadline rules like issue date vs receipt date',
      'Available 24/7, right inside the notice workspace',
    ],
    mock: ChatMock,
  },
  {
    id: 'draft',
    icon: FileEdit,
    label: 'Draft Replies',
    outcome: 'Never start from a blank page',
    body: 'A professional, properly-structured reply drafted from your notice in minutes. You or your CA polish and file — the first 80% is done.',
    facts: [
      'Choose tone and language — English or Hindi — before generating',
      'Relevant CGST Act sections and precedents cited inline',
      'Edit in place, then share with your CA for review in one click',
    ],
    mock: DraftMock,
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    label: 'WhatsApp',
    outcome: 'Reminders where you actually look',
    body: 'Deadline nudges, weekly digests and status checks — on WhatsApp. Ask "status DRC-01" and get an answer in seconds.',
    facts: [
      'Commands: status, notices, deadlines, tasks — instant answers, no app switch',
      'Proactive alerts for approaching deadlines and high-risk notices',
      'Secure OTP-verified linking; available on the Professional plan and above',
    ],
    mock: WhatsAppMock,
  },
  {
    id: 'team',
    icon: Users,
    label: 'Team & Workflow',
    outcome: 'Everyone knows whose move it is',
    body: 'Assign notices, request documents, approve replies — with roles, deadlines and escalations built in. No more "I thought you were handling it."',
    facts: [
      'Six roles from owner to view-only, including a dedicated CA role',
      'Auto-assignment rules, approval chains and SLA-based escalation',
      'Threaded comments, @mentions and client document requests per notice',
    ],
    mock: TeamMock,
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    outcome: 'Prove compliance is under control',
    body: 'Trends, exposure and response times per GSTIN and per entity — exportable for your CFO, your board or your auditors.',
    facts: [
      '30+ metrics: by status, priority, notice type, team member and GSTIN',
      'Export to CSV, Excel or PDF — or schedule recurring reports',
      'Complete compliance history, searchable years later',
    ],
    mock: AnalyticsMock,
  },
  {
    id: 'mobile',
    icon: Smartphone,
    label: 'Mobile',
    outcome: 'The whole platform in your pocket',
    body: 'Review notices, chase deadlines and approve draft replies from anywhere — the factory floor included. Launching soon on iOS & Android.',
    facts: [
      'Scan paper notices with your camera — straight into AI analysis',
      'Push notifications for deadlines, assignments and high-risk alerts',
      'Secure sign-in with two-factor and biometric unlock',
    ],
    mock: MobileMock,
  },
]

export function ProductTour() {
  const [active, setActive] = useState(tabs[0])

  return (
    <section id="tour" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            Product tour
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            See the operating system at work
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            One platform for the entire life of a notice — from the moment it
            appears on the portal to the day the reply is filed.
          </p>
        </div>

        {/* Tab bar — plain toggle buttons; a full ARIA tab pattern (panels,
            roving focus) is overkill here and half-doing it hurts SRs */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2" aria-label="Product capabilities">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              aria-pressed={active.id === tab.id}
              onClick={() => setActive(tab)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active.id === tab.id
                  ? 'border-transparent bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-300/60'
                  : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 hover:shadow-md'
              )}
            >
              <tab.icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active panel — keyed so each tab switch replays the entrance */}
        <div key={active.id} className="animate-fade-in mx-auto mt-10 grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-gray-950 md:text-3xl">
              {active.outcome}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{active.body}</p>
            <ul className="mt-6 space-y-3">
              {active.facts.map((fact) => (
                <li key={fact} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" aria-hidden />
                  </span>
                  {fact}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
            >
              Try it free for 14 days
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-primary-100 via-sky-50 to-indigo-100 p-4 shadow-inner md:p-7">
            <active.mock />
          </div>
        </div>
      </div>
    </section>
  )
}
