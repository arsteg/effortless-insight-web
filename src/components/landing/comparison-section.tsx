import { Check, Minus, CircleDot, ShieldCheck, Sparkles } from 'lucide-react'
import { COMPANY } from '@/lib/company'

/**
 * "How EffortlessInsight compares" — a notice-management-first comparison against
 * the GST platforms buyers actually evaluate. Research, sources and the decision
 * behind every cell live in `docs/competitor-comparison-research.md`.
 *
 * Deliberate guardrails (keep claims legally safe):
 *  - EI column: every ✓ is traceable to shipped features in the landing code.
 *  - Competitors: "available" only where confirmed from public info; everything
 *    unconfirmed is "Not clearly listed" (—), NOT a hard "No".
 *  - Framing is factual and non-disparaging — no "better than all competitors".
 *  - Portal access is described as OTP-authorized sync (the site intentionally
 *    does not name the Chrome extension or claim a licensed-GSP connection).
 */

type Support = 'yes' | 'limited' | 'unknown'

const COLUMNS: { key: string; label: string; highlight?: boolean }[] = [
  { key: 'ei', label: COMPANY.brand, highlight: true },
  { key: 'cleartax', label: 'ClearTax' },
  { key: 'zoho', label: 'Zoho Books' },
  { key: 'tally', label: 'TallyPrime' },
  { key: 'gsthero', label: 'GSTHero' },
  { key: 'ledgers', label: 'LEDGERS' },
]

/** Values are in COLUMNS order: [EI, ClearTax, Zoho, Tally, GSTHero, LEDGERS]. */
const ROWS: { capability: string; values: Support[] }[] = [
  {
    capability: 'Purpose-built for GST notice management',
    values: ['yes', 'limited', 'unknown', 'unknown', 'limited', 'unknown'],
  },
  {
    capability: 'Automatic GST portal notice sync',
    values: ['yes', 'yes', 'unknown', 'unknown', 'yes', 'unknown'],
  },
  {
    capability: 'Plain-English AI notice explanation (English + Hindi)',
    values: ['yes', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
  },
  {
    capability: 'Notice risk score (0–100)',
    values: ['yes', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
  },
  {
    capability: 'Deadline reminders via WhatsApp / email / push',
    values: ['yes', 'limited', 'unknown', 'unknown', 'limited', 'unknown'],
  },
  {
    capability: 'AI-drafted reply with cited sections',
    values: ['yes', 'limited', 'unknown', 'unknown', 'limited', 'unknown'],
  },
  {
    capability: 'Grounded AI chat on your own notice',
    values: ['yes', 'unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
  },
  {
    capability: 'CA ↔ client collaboration (roles, approvals)',
    values: ['yes', 'limited', 'limited', 'unknown', 'unknown', 'unknown'],
  },
  {
    capability: 'Exportable audit trail',
    values: ['yes', 'yes', 'yes', 'limited', 'limited', 'unknown'],
  },
  {
    capability: 'Mobile + web access',
    values: ['yes', 'yes', 'yes', 'limited', 'limited', 'limited'],
  },
]

/** A few plain-English reasons, above the matrix, for scanners who skip tables. */
const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'Built for notices, not just filing',
    body: 'Most tools here are accounting or return-filing platforms. EffortlessInsight exists to catch, explain and answer GST notices before the deadline.',
  },
  {
    icon: CircleDot,
    title: 'Understand the risk instantly',
    body: 'A 0–100 risk score and a plain-English explanation in English and Hindi — with the reasoning shown — so you know how serious a notice is in minutes.',
  },
  {
    icon: ShieldCheck,
    title: 'Draft, collaborate, stay in control',
    body: 'An AI-drafted reply with cited sections, a dedicated CA role and approvals, and a full audit trail. Nothing is ever filed without you.',
  },
]

function SupportCell({ value, highlight }: { value: Support; highlight: boolean }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center justify-center">
        <span
          className={
            highlight
              ? 'flex h-6 w-6 items-center justify-center rounded-full bg-azure-100'
              : 'flex h-6 w-6 items-center justify-center rounded-full bg-mint-100'
          }
        >
          <Check
            className={highlight ? 'h-3.5 w-3.5 text-azure-600' : 'h-3.5 w-3.5 text-mint-600'}
            aria-hidden
          />
        </span>
        <span className="sr-only">Available</span>
      </span>
    )
  }
  if (value === 'limited') {
    return (
      <span className="inline-flex items-center justify-center">
        <CircleDot className="h-4 w-4 text-amber-500" aria-hidden />
        <span className="sr-only">Limited or part of a broader suite</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center">
      <Minus className="h-4 w-4 text-gray-300" aria-hidden />
      <span className="sr-only">Not clearly listed</span>
    </span>
  )
}

export function ComparisonSection() {
  return (
    <section id="comparison" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            How we compare
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Most GST tools file your returns. We answer your notices.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Great accounting and filing software already exists. EffortlessInsight is
            built for the job those tools leave to you — catching every GST notice,
            explaining it, and getting a reply out before the deadline.
          </p>
        </div>

        {/* Plain-English highlights for people who skip tables */}
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/60">
                <item.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-gray-950">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Comparison matrix — horizontally scrollable on small screens, with a
            sticky first column so the capability label stays visible. */}
        <div className="mx-auto mt-10 max-w-6xl">
          <p className="mb-2 text-center text-xs text-gray-500 lg:hidden" aria-hidden>
            Scroll the table sideways to compare →
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">
                Comparison of {COMPANY.brand} and other GST tools across GST
                notice-management capabilities
              </caption>
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-white px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Capability
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={
                        col.highlight
                          ? 'bg-azure-50 px-3 py-4 text-center align-bottom'
                          : 'px-3 py-4 text-center align-bottom'
                      }
                    >
                      <span
                        className={
                          col.highlight
                            ? 'text-sm font-bold text-azure-700'
                            : 'text-sm font-semibold text-gray-700'
                        }
                      >
                        {col.label}
                      </span>
                      {col.highlight && (
                        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-azure-500">
                          Notice-first
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, rowIndex) => (
                  <tr
                    key={row.capability}
                    className={rowIndex % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}
                  >
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 px-4 py-3 text-left font-medium text-gray-800 ${
                        rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      {row.capability}
                    </th>
                    {row.values.map((value, colIndex) => {
                      const col = COLUMNS[colIndex]
                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-3 text-center ${col.highlight ? 'bg-azure-50/60' : ''}`}
                        >
                          <SupportCell value={value} highlight={col.highlight ?? false} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100">
                <Check className="h-3 w-3 text-mint-600" aria-hidden />
              </span>
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="h-4 w-4 text-amber-500" aria-hidden />
              Limited / part of a broader suite
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-gray-300" aria-hidden />
              Not clearly listed
            </span>
          </div>

          {/* Honest, legally-safe disclaimer — kept to the minimum that covers us:
              dated + "—" means undocumented (not absent) + trademark note + verify. */}
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-gray-400">
            Based on public information, Oct 2026; &ldquo;—&rdquo; means not clearly listed,
            not absent. Trademarks belong to their owners — verify current features with each
            vendor.
          </p>
        </div>
      </div>
    </section>
  )
}
