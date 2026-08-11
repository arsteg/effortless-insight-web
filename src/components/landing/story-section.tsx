import { ArrowDown, ArrowRight } from 'lucide-react'

/**
 * The emotional core of the page: the moment a notice arrives, told as a
 * before/after. Left — what the department sends. Right — what you read.
 * Closes with the full notice-to-resolution journey in one strip.
 */

const journey = [
  'Notice arrives on the portal',
  'Fetched & analyzed automatically',
  'Explained in plain English',
  'Deadline tracked & reminded',
  'Reply drafted for review',
  'CA collaborates & files',
  'Business stays compliant',
]

export function StorySection() {
  return (
    <section id="story" className="scroll-mt-header bg-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
            The moment it arrives
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            You didn&apos;t study tax law.
            <br />
            The notice assumes you did.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Every notice is pages of sections, sub-sections and legal Hindi-English.
            Meanwhile the deadline clock is already running. Here&apos;s the same
            notice, before and after EffortlessInsight.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Before: the raw notice */}
          <div className="flex flex-col rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/60 to-white p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-red-500">
              What the portal sends you
            </p>
            <div className="flex-1 space-y-3 font-serif text-[13px] leading-relaxed text-gray-500">
              <p>
                &ldquo;Whereas on scrutiny of returns furnished by the registered
                person under sub-section (1) of section 39 for the tax period
                April 2024 – March 2025, discrepancies were noticed with regard
                to excess availment of input tax credit under section 16
                read with rule 36(4)&hellip;
              </p>
              <p>
                &hellip;you are hereby directed to show cause as to why the said
                amount of ₹2,45,000/- along with interest under section 50 and
                penalty under section 122 should not be recovered under the
                provisions of section 73(1)&hellip;&rdquo;
              </p>
            </div>
            <p className="mt-5 border-t border-gray-100 pt-4 text-sm italic text-gray-500">
              3 pages. 14 legal references. One anxious evening.
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200">
              <ArrowRight className="hidden h-6 w-6 lg:block" aria-hidden />
              <ArrowDown className="h-6 w-6 lg:hidden" aria-hidden />
            </span>
          </div>

          {/* After: the explanation */}
          <div className="flex flex-col rounded-2xl border border-primary-200 bg-white p-6 shadow-xl shadow-primary-100/70 ring-1 ring-primary-100">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary-600">
              What EffortlessInsight tells you
            </p>
            <div className="flex-1 space-y-4 text-sm leading-relaxed text-gray-800">
              <div>
                <p className="font-semibold text-gray-950">In one sentence</p>
                <p className="mt-1">
                  The department says you claimed ₹2,45,000 more input credit
                  than your suppliers reported — and wants you to explain why.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-950">How serious is it?</p>
                <p className="mt-1">
                  High priority, but defendable. Most cases like this are
                  resolved by submitting matching purchase invoices.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-950">Your next step</p>
                <p className="mt-1">
                  Collect invoices from these 3 suppliers. A draft reply is
                  ready — share it with your CA in one click.
                </p>
              </div>
            </div>
            <p className="mt-5 border-t border-primary-100 pt-4 text-sm font-medium text-primary-700">
              Understood in minutes, not evenings. Deadline tracked automatically.
            </p>
          </div>
        </div>

        {/* The full lifecycle in one glance */}
        <div className="mx-auto mt-12 max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
            The entire lifecycle, handled on one platform
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-y-3">
            {journey.map((step, i) => (
              <span key={step} className="flex items-center">
                <span
                  className={
                    i === 0
                      ? 'rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-medium text-red-700 md:text-sm'
                      : i === journey.length - 1
                        ? 'rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-xs font-semibold text-green-700 md:text-sm'
                        : 'rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm md:text-sm'
                  }
                >
                  {step}
                </span>
                {i < journey.length - 1 && (
                  <ArrowRight className="mx-1.5 h-3.5 w-3.5 flex-shrink-0 text-primary-300" aria-hidden />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
