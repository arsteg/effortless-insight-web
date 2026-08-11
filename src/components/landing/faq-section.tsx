import { ChevronDown } from 'lucide-react'

/**
 * Two-track FAQ: the questions that block signups, then the operational and
 * security specifics a cautious buyer (or their CA) will check before
 * connecting a GSTIN. Native <details> — accessible, zero JavaScript.
 */

const gettingStarted = [
  {
    q: 'Do you need my GST portal password?',
    a: 'No — and we will never ask for it. You authorize access with an OTP sent to your registered GST mobile number, and only an encrypted session token is retained. You can revoke access anytime.',
  },
  {
    q: 'Can EffortlessInsight file a reply on the portal without me?',
    a: 'No — and that is by design. The platform reads and analyzes notices and prepares draft replies, but nothing is filed, changed or submitted to any authority without you. You and your CA review, decide and file.',
  },
  {
    q: 'Is the AI explanation reliable enough to act on?',
    a: 'The explanation tells you what the notice says, how serious it is, and what a sensible next step looks like — alongside the original notice, never instead of it. Every analysis runs a verification pass against the notice text, and for filings it takes one click to bring in your CA: the drafted reply is theirs to review and polish.',
  },
  {
    q: 'I have multiple GSTINs / multiple businesses. Does this work?',
    a: 'Yes. Connect any number of GSTINs under one account — each authorized with its own OTP — and see everything in one dashboard, separated per GSTIN. CAs manage all their clients the same way, with bulk onboarding.',
  },
  {
    q: 'My CA already handles notices. Why do I need this?',
    a: 'Your CA still handles them — faster. You both see the same notice, the same deadline, and a drafted reply on day one, instead of forwarding PDFs over WhatsApp and hoping nothing slips. There is a dedicated CA role with the right access levels.',
  },
  {
    q: 'How often are notices synchronized?',
    a: 'Every 6 hours by default, configurable from 1 to 24 hours, with manual sync anytime. If the GST portal is temporarily down, we retry automatically and resume as soon as it recovers.',
  },
  {
    q: 'What happens after the 14-day trial?',
    a: 'You choose a paid plan, or simply drop to the Free tier (10 notices a month) — no card is taken up front, so nothing is charged automatically. Your data remains exportable either way.',
  },
]

const securityOps = [
  {
    q: 'Is my data encrypted, and where is it stored?',
    a: 'All traffic is encrypted in transit with TLS, and sensitive fields — session tokens, GSTINs, personal data — are protected with AES-256 encryption. All storage and backups are in Indian data centres (Mumbai region).',
  },
  {
    q: 'Who on my team can see what?',
    a: 'Access is role-based: owner, admin, manager, member, CA and view-only roles each see exactly what they should. Two-factor authentication is available for every account, and external collaborators can be limited to specific notices.',
  },
  {
    q: 'How do you support audits and record-keeping?',
    a: 'Every sync, view and action is logged with timestamps in a complete audit trail you can export. Records are retained for 8 years, in line with GST record-keeping requirements.',
  },
  {
    q: 'What if I want to disconnect my GSTIN?',
    a: 'Disconnect anytime from settings. Session tokens are revoked immediately, syncing stops, and your historical data stays available to you — or is deleted entirely on request.',
  },
]

function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((faq) => (
        <details
          key={faq.q}
          className="group rounded-xl border border-gray-200 bg-white px-6 py-1 open:pb-5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            {faq.q}
            <ChevronDown
              className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="leading-relaxed text-gray-600">{faq.a}</p>
        </details>
      ))}
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Questions worth asking before you connect a GSTIN
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Getting started
            </h3>
            <FaqList items={gettingStarted} />
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Security &amp; operations
            </h3>
            <FaqList items={securityOps} />
            <p className="mt-6 text-sm text-gray-500">
              Something we haven&apos;t covered? Write to{' '}
              {/* TODO(marketing): confirm the canonical support/security contact address */}
              <a
                href="mailto:info@arsteg.com"
                className="font-medium text-primary-600 underline-offset-2 hover:underline"
              >
                info@arsteg.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
