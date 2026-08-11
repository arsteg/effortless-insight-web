import Link from 'next/link'
import { ArrowRight, Check, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from './landing-header'
import { LandingFooter } from './landing-footer'
import { CTASection } from './cta-section'

export interface AudiencePageContent {
  eyebrow: string
  headline: string
  headlineAccent: string
  subheadline: string
  painPoints: { title: string; body: string }[]
  benefits: { icon: LucideIcon; title: string; body: string }[]
  workflow: { title: string; body: string }[]
  closingLine: string
  /** Optional capability checklist rendered between benefits and workflow */
  checklist?: { title: string; items: string[] }
}

/**
 * Shared template for the three audience landing pages. Same visual system
 * as the homepage; only the story changes.
 */
export function AudiencePage({ content }: { content: AudiencePageContent }) {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary-50/70 to-transparent"
        />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              {content.eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-gray-950 md:text-5xl">
              {content.headline}
              <span className="text-primary-600"> {content.headlineAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
              {content.subheadline}
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="px-8 py-6 text-base shadow-lg shadow-primary-200/60">
                <Link href="/register">
                  Start free 14-day trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-sm text-gray-500">No credit card. No sales call.</p>
          </div>
        </div>
      </section>

      {/* Pain points — "we know your day" */}
      <section className="bg-gray-50 py-14 md:py-20" aria-labelledby="pain-points-heading">
        <div className="container mx-auto px-4">
          <h2 id="pain-points-heading" className="sr-only">
            The problems we solve
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {content.painPoints.map((pain) => (
              <div key={pain.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-950">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{pain.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
              What changes with EffortlessInsight
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
            {content.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-gray-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/70">
                  <benefit.icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-950">{benefit.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{benefit.body}</p>
              </div>
            ))}
          </div>

          {content.checklist && (
            <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-primary-100 bg-primary-50/50 p-8">
              <h3 className="font-semibold text-gray-950">{content.checklist.title}</h3>
              <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                {content.checklist.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Day-one workflow */}
      <section className="bg-gray-50 py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
              Your first day
            </h2>
          </div>
          <div className="mx-auto mt-12 max-w-2xl space-y-4">
            {content.workflow.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.body}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-center gap-2 pt-4 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" aria-hidden />
              {content.closingLine}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <LandingFooter />
    </main>
  )
}
