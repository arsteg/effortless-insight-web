import Link from 'next/link'
import { ArrowRight, ShieldCheck, Fingerprint, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Hero: answers "what is this, who is it for, why should I care" in one glance.
 * The visual shows the product's core transformation — a scary notice turned
 * into a plain-English answer. A slim capability strip underneath carries the
 * platform's defensible numbers.
 */

const capabilities = [
  { value: 'Minutes', label: 'From notice to full analysis' },
  { value: '150+', label: 'Notice types covered' },
  { value: '11', label: 'GST categories' },
  { value: 'EN + HI', label: 'English & Hindi' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Restrained color field: one soft top wash + a single subtle accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[620px] bg-gradient-to-b from-primary-50/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-sky-100/50 blur-3xl"
      />
      {/* Hairline grid texture for depth, masked to fade out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]"
      />

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* Copy */}
          <div className="max-w-xl">
            <p className="eyebrow mb-6 rounded-full border border-primary-200/70 bg-white/70 px-3.5 py-1.5 text-primary-700 shadow-soft backdrop-blur">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              GST Notice Operating System
            </p>

            <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tightest text-gray-950 md:text-6xl lg:text-[4.25rem]">
              A GST notice shouldn&apos;t
              <span className="text-gradient block">ruin your week.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">
              EffortlessInsight finds every notice on the GST portal, explains it
              in plain English, reminds you before every deadline, and drafts
              your reply — so a scary envelope becomes a fifteen-minute task.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="group h-12 bg-primary-600 px-8 text-base shadow-card transition-all hover:bg-primary-700 hover:shadow-elevated"
              >
                <Link href="/register">
                  Start free 14-day trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 border-gray-300 bg-white/70 px-6 text-base text-gray-800 backdrop-blur transition-colors hover:border-gray-400 hover:bg-white"
              >
                <Link href="#tour">Take the product tour</Link>
              </Button>
            </div>
            <p className="mt-3.5 text-sm text-gray-500">
              No credit card. No sales call. Cancel anytime.
            </p>

            {/* Trust strip — one line, three facts */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-gray-100 pt-6 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Authorized portal access
              </span>
              <span className="flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-primary-600" /> OTP-verified, no passwords stored
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" /> Data stored in India
              </span>
            </div>
          </div>

          {/* Visual: the product's core moment — notice understood */}
          <div className="relative mx-auto w-full max-w-lg">
            {/* Tilted backdrop card for depth */}
            <div
              aria-hidden
              className="absolute inset-0 -rotate-[2.5deg] rounded-[1.75rem] bg-gradient-to-br from-primary-100/80 to-sky-100/60"
            />
            <div className="relative rounded-3xl border border-gray-200/70 bg-white/95 p-6 shadow-premium ring-1 ring-gray-900/5 backdrop-blur">
              {/* Notice header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600 ring-1 ring-red-100">
                  DRC
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">DRC-01 · Tax Demand Notice</p>
                  <p className="text-sm text-gray-500">Received today, 9:14 AM</p>
                </div>
                <span className="ml-auto rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200/60">
                  High priority
                </span>
              </div>

              {/* Plain-English explanation */}
              <div className="space-y-4 pt-4">
                <div>
                  <p className="eyebrow text-gray-400">What this means</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                    The department believes ₹2,45,000 of input tax credit was
                    claimed incorrectly in FY 2024-25. You can contest this
                    with purchase invoices.
                  </p>
                </div>
                <div>
                  <p className="eyebrow text-gray-400">What to do</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                    Reply with supporting invoices before the deadline. A draft
                    response is ready for your CA to review.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
                  <span className="text-sm font-medium text-orange-900">Respond by 24 August</span>
                  <span className="nums text-sm font-semibold text-orange-700">15 days left</span>
                </div>
              </div>
            </div>

            {/* WhatsApp reminder float */}
            <div className="animate-float absolute -bottom-16 -left-4 hidden rounded-2xl border border-gray-200/70 bg-white p-3.5 shadow-elevated ring-1 ring-gray-900/5 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.4A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.3 0 .5l-.3.5-.5.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3 0 .1 0 .7-.2 1.4Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp reminder</p>
                  <p className="text-xs text-gray-500">&ldquo;ASMT-10 reply due in 3 days&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capability strip */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200/70 bg-gray-200/70 shadow-card sm:mt-24 md:grid-cols-4">
          {capabilities.map((c) => (
            <div key={c.label} className="group bg-white px-6 py-7 text-center transition-colors hover:bg-gray-50/80">
              <p className="nums text-3xl font-extrabold tracking-tight text-gray-950">{c.value}</p>
              <p className="mt-1.5 text-sm font-medium text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
