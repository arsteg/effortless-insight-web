'use client'

import { X, Check, TrendingDown, Clock, Wallet } from 'lucide-react'
import { usePlans } from '@/hooks/use-billing'
import { formatAmount } from '@/lib/api/billing'
import type { Plan } from '@/types/billing'

/**
 * Value justification: what the old way costs vs what the platform changes.
 * The savings model is deliberately labeled illustrative — it sells the
 * category math (penalties, CA fees, hours), not fake customer data.
 *
 * The product-cost side of the comparison comes from the live plan catalog
 * (same API as the pricing page and Admin app), so plans created or edited
 * in the admin panel are reflected here automatically — nothing hardcoded.
 */

const beforeAfter = [
  {
    problem: 'Hours decoding legal jargon — or waiting days for a callback',
    solution: 'Plain English and Hindi summaries, minutes after the notice lands',
  },
  {
    problem: 'Deadlines tracked in heads, diaries and spreadsheets',
    solution: 'Dates auto-extracted, on a calendar, with reminders at 7, 3 and 1 day',
  },
  {
    problem: 'No idea how serious a notice is until someone senior reads it',
    solution: 'Risk score 0–100 with the reasoning, the moment it arrives',
  },
  {
    problem: 'Notices, replies and proofs scattered across email and WhatsApp',
    solution: 'One workspace per notice — documents, comments, drafts, history',
  },
]

// The illustrative incident: a ₹2,45,000 ITC demand mishandled for a year —
// 10% penalty (₹24,500) + 18% p.a. interest (₹44,100) + mid-range CA fee.
// Kept in paise so it divides cleanly against catalog prices.
const INCIDENT_COST_PAISE = 9_300_000
const INCIDENT_COST_DISPLAY = '~₹93,000'

/**
 * The plan whose yearly cost anchors the comparison: the highlighted
 * ("popular") paid plan if the catalog marks one, otherwise the most
 * expensive self-serve paid plan — the conservative pick, since if even
 * that beats one incident, every cheaper plan does too.
 */
function pickComparisonPlan(plans: Plan[] | undefined): Plan | undefined {
  if (!plans?.length) return undefined
  const paid = plans.filter((p) => !p.contactSales && (p.pricing.monthly ?? 0) > 0)
  if (!paid.length) return undefined
  return paid.find((p) => p.isPopular) ?? paid.sort((a, b) => (b.pricing.monthly ?? 0) - (a.pricing.monthly ?? 0))[0]
}

function yearlyCostPaise(plan: Plan): number {
  return plan.pricing.annually ?? (plan.pricing.monthly ?? 0) * 12
}

interface Bar {
  label: string
  display: string
  pct: number
  accent: boolean
}

function BarFigure({ title, bars }: { title: string; bars: Bar[] }) {
  return (
    <figure className="rounded-2xl border border-gray-200 bg-white p-7">
      <figcaption className="font-semibold text-gray-950">{title}</figcaption>
      <div className="mt-5 space-y-5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm leading-snug text-gray-600">{bar.label}</p>
              <p className={`text-sm font-bold ${bar.accent ? 'text-primary-700' : 'text-gray-900'}`}>
                {bar.display}
              </p>
            </div>
            <div className="mt-1.5 h-3 w-full rounded-full bg-gray-100">
              <div
                className={`h-3 rounded-full ${
                  bar.accent
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                    : 'bg-[#94a3b8]'
                }`}
                style={{ width: `${Math.max(bar.pct, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </figure>
  )
}

const stakes = [
  {
    icon: TrendingDown,
    stat: '18% p.a.',
    label: 'Interest on delayed tax payments under section 50',
  },
  {
    icon: Wallet,
    stat: '10–100%',
    label: 'Penalty exposure on the disputed tax amount',
  },
  {
    icon: Clock,
    stat: '₹5,000–50,000',
    label: 'Typical CA fee for a single notice response',
  },
]

// Time comparison is behavioral, not catalog-driven — stays static.
const timeBars: Bar[] = [
  {
    label: 'Handling one notice manually — read, research, draft',
    display: '~4.5 hrs',
    pct: 100,
    accent: false,
  },
  {
    label: 'With EffortlessInsight — review & approve the draft',
    display: '~15 min',
    pct: 6,
    accent: true,
  },
]

export function RoiSection() {
  const { data: plans, isLoading } = usePlans()
  const plan = pickComparisonPlan(plans)

  const moneyBars: Bar[] | undefined = plan
    ? [
        {
          label: 'One mishandled notice — interest, penalty & CA fees',
          display: INCIDENT_COST_DISPLAY,
          pct: 100,
          accent: false,
        },
        {
          label: `${plan.displayName} plan — an entire year`,
          display: formatAmount(yearlyCostPaise(plan)),
          pct: Math.min(100, Math.round((yearlyCostPaise(plan) / INCIDENT_COST_PAISE) * 100)),
          accent: true,
        },
      ]
    : undefined

  return (
    <section id="why" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            The math
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Cheaper than the problem it prevents
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            A single mishandled notice can cost more than years of any plan.
            Here&apos;s what actually changes.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:grid-cols-[3fr_2fr]">
          {/* Before / after */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50/60 text-center text-xs font-semibold uppercase tracking-wide">
              <p className="px-4 py-3 text-gray-400">The old way</p>
              <p className="border-l border-gray-100 px-4 py-3 text-primary-600">
                With EffortlessInsight
              </p>
            </div>
            {beforeAfter.map((row) => (
              <div key={row.problem} className="grid grid-cols-2 border-b border-gray-100 last:border-b-0">
                <div className="flex gap-2.5 px-4 py-4">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" aria-hidden />
                  <p className="text-sm leading-relaxed text-gray-500">{row.problem}</p>
                </div>
                <div className="flex gap-2.5 border-l border-gray-100 px-4 py-4">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden />
                  <p className="text-sm leading-relaxed text-gray-700">{row.solution}</p>
                </div>
              </div>
            ))}
          </div>

          {/* What's at stake */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8">
            <h3 className="font-semibold text-gray-950">What a mishandled notice costs</h3>
            <div className="mt-5 flex-1 space-y-5">
              {stakes.map((s) => (
                <div key={s.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-950">{s.stat}</p>
                    <p className="text-sm leading-relaxed text-gray-600">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-primary-50 p-4">
              <p className="text-sm font-semibold text-primary-900">
                Illustrative: a CA practice or multi-GSTIN business seeing 50 notices a year
              </p>
              <p className="mt-1 text-sm leading-relaxed text-primary-800">
                Saving ~4 hours of work per notice plus avoiding one late-reply
                penalty typically outweighs a full year of
                {plan ? ` the ${plan.displayName} plan` : ' any plan'} — many
                times over.
              </p>
            </div>
          </div>
        </div>

        {/* The same math, drawn */}
        <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-2">
          {moneyBars ? (
            <BarFigure title="The money: one incident vs a year of cover" bars={moneyBars} />
          ) : isLoading ? (
            <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-7">
              <div className="h-5 w-56 rounded bg-gray-200" />
              <div className="mt-6 space-y-5">
                <div className="h-3 rounded-full bg-gray-100" />
                <div className="h-3 w-2/5 rounded-full bg-gray-100" />
              </div>
            </div>
          ) : null}
          <BarFigure title="The time: per notice, start to filed" bars={timeBars} />
        </div>
        <p className="mx-auto mt-4 max-w-5xl text-center text-xs text-gray-500">
          Illustrative figures — based on a ₹2,45,000 ITC demand (10% penalty +
          18% p.a. interest for a year, mid-range CA drafting fee) and typical
          manual handling time.
          {plan ? ' Plan price shown is the live yearly price from our catalog.' : ''}{' '}
          Your numbers will vary.
        </p>
      </div>
    </section>
  )
}
