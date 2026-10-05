import { CalendarClock, Layers, FolderOpen, History } from 'lucide-react'

/**
 * The supporting system, in one compact band. Deliberately only the four
 * capabilities the product tour does NOT already demonstrate — sync, AI
 * analysis, chat, drafting, WhatsApp, team, analytics and mobile all have
 * tour tabs, and repeating them as cards made the page longer, not clearer.
 */

const features = [
  {
    icon: CalendarClock,
    title: 'Deadline tracking',
    outcome:
      'Statutory dates auto-extracted onto one compliance calendar, chased at 7, 3 and 1 day before.',
  },
  {
    icon: Layers,
    title: 'Multi-GSTIN management',
    outcome:
      'Branches, states and clients under one account — per-GSTIN separation, bulk onboarding for CAs.',
  },
  {
    icon: FolderOpen,
    title: 'Document vault',
    outcome:
      'Notices, annexures and proofs filed against the right notice — uploads up to 25MB, searchable.',
  },
  {
    icon: History,
    title: 'Compliance history',
    outcome:
      'Every notice, action and reply logged with timestamps. Similar-notice detection reuses past work.',
  },
]

export function FeatureGrid() {
  return (
    <section id="platform" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            The supporting system
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            And everything a notice touches, kept in order
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Around the analysis and the reply sits the quiet machinery —
            calendars, documents, history — so nothing lives in email threads
            or someone&apos;s memory.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/60">
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 font-semibold text-gray-950">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{feature.outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
