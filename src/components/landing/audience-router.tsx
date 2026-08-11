import Link from 'next/link'
import { ArrowRight, Check, Building2, Calculator, Landmark } from 'lucide-react'

const audiences = [
  {
    icon: Building2,
    title: 'Business owners',
    body: 'Run your business. We’ll handle the notices, the deadlines and the panic.',
    wins: [
      'Plain-English (and Hindi) explanations',
      'WhatsApp reminders before every deadline',
      'All your GSTINs on one dashboard',
    ],
    href: '/business',
    cta: 'How it works for you',
  },
  {
    icon: Calculator,
    title: 'Chartered Accountants',
    body: 'Every client’s notices in one dashboard — with the deadlines that matter this week on top.',
    wins: [
      'Bulk-add client GSTINs in one go',
      'Drafts ready for your review, not blank pages',
      'Client workspaces with document requests',
    ],
    href: '/chartered-accountants',
    cta: 'Built for your practice',
  },
  {
    icon: Landmark,
    title: 'Finance teams',
    body: 'Assign notices, track responses, keep an audit trail. Compliance that survives audits and handovers.',
    wins: [
      'Workflows with approvals and SLA escalation',
      'Role-based access, every action logged',
      '30+ metrics, exportable for leadership',
    ],
    href: '/finance-teams',
    cta: 'See the team workflow',
  },
]

export function AudienceRouter() {
  return (
    <section id="solutions" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            One product. Three ways to breathe easier.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {audiences.map((audience) => (
            <Link
              key={audience.href}
              href={audience.href}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/70 transition-transform group-hover:scale-105">
                <audience.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-950">{audience.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{audience.body}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {audience.wins.map((win) => (
                  <li key={win} className="flex gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden />
                    {win}
                  </li>
                ))}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
                {audience.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
