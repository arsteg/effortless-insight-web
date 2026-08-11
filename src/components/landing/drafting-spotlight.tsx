import Link from 'next/link'
import { ArrowRight, FileText, Scale, FolderOpen, PenLine, UserCheck, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * The single strongest reason to buy — the reply itself — given its own
 * visual treatment: the five stages between "notice arrived" and "reply
 * filed", next to the draft they produce. Positioning is deliberate:
 * the AI writes the first 80%, the human files. Never "replaces your CA".
 */

const stages = [
  {
    icon: FileText,
    title: 'The notice',
    sub: 'DRC-01 · ₹2,45,000 ITC demand',
  },
  {
    icon: Scale,
    title: 'Case understood',
    sub: 'Section 73(1) demand — contestable with invoice proof',
  },
  {
    icon: FolderOpen,
    title: 'Evidence listed',
    sub: 'Invoices, bank entries, supplier GSTR-1 filings',
  },
  {
    icon: PenLine,
    title: 'Reply drafted',
    sub: 'Grounds, annexures and prayer — proper structure',
  },
  {
    icon: UserCheck,
    title: 'CA reviews & files',
    sub: 'One click to share. Nothing filed without you.',
  },
]

export function DraftingSpotlight() {
  return (
    <section id="drafting" className="scroll-mt-header bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
            The reply
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            The blank page is where deadlines die.
            <br />
            So we removed it.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Every notice comes with a professional draft reply built from its
            own facts — your CA polishes and files, instead of starting from
            zero at 11 PM.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl items-center gap-10 lg:grid-cols-[2fr_3fr]">
          {/* The five stages */}
          <ol className="relative space-y-0">
            {stages.map((stage, i) => (
              <li key={stage.title} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Connector line */}
                {i < stages.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-5 top-10 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-primary-200 to-primary-100"
                  />
                )}
                <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/70">
                  <stage.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="pt-0.5">
                  <p className="font-semibold text-gray-950">{stage.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{stage.sub}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* The draft it produces */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 rotate-1 rounded-3xl bg-gradient-to-br from-primary-100 to-sky-100"
            />
            <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-primary-200/40 ring-1 ring-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <p className="font-semibold text-gray-900">Draft reply · DRC-01</p>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  Respond by 24 Aug · 15 days left
                </span>
              </div>
              <div className="mt-4 rounded-xl bg-gray-50/80 p-4 font-serif text-[13px] leading-relaxed text-gray-700">
                <p className="font-semibold">To: The Proper Officer, Ward 47</p>
                <p className="mt-2">
                  Subject: Reply to DRC-01 dated 09.08.2026 — ITC discrepancy of
                  ₹2,45,000
                </p>
                <p className="mt-2">
                  Respected Sir/Madam, with reference to the above notice, the
                  taxpayer respectfully submits that the input tax credit in
                  question was availed against valid tax invoices, duly paid
                  through banking channels, and reflected in the corresponding
                  GSTR-2B statements&hellip;
                </p>
                <p className="mt-2 text-gray-400">
                  — grounds citing section 16 &amp; rule 36(4), annexure list, prayer —
                </p>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  'Tone & language your choice — English or Hindi',
                  'CGST sections and precedents cited inline',
                  'Annexure checklist matched to the notice',
                  'Share with your CA in one click',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-600" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-gray-500">
            AI drafts. You and your CA decide. Nothing is ever filed without you.
          </p>
          <Button size="lg" asChild className="px-8 py-6 text-base shadow-lg shadow-primary-200/60">
            <Link href="/register">
              See your first draft free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
