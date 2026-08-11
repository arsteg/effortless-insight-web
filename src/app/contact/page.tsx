import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, Building2, LifeBuoy, MessageSquareText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader, LandingFooter } from '@/components/landing'

export const metadata: Metadata = {
  title: 'Contact | EffortlessInsight',
  description:
    'Talk to the EffortlessInsight team about GST notice management — sales questions, enterprise plans, support or security.',
}

// TODO(marketing): switch to dedicated sales@/support@ mailboxes on the
// product domain once provisioned — single shared inbox for now.
const CONTACT_EMAIL = 'info@arsteg.com'

const topics = [
  {
    icon: Building2,
    title: 'Sales & enterprise',
    body: 'Custom plans, many GSTINs, procurement questions, or a walkthrough for your team or practice.',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    body: 'Already using EffortlessInsight and stuck on something? We read every message.',
  },
  {
    icon: MessageSquareText,
    title: 'Everything else',
    body: 'Security questions, partnerships, press, or feedback on the product.',
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />

      <section className="relative overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary-50/70 to-transparent"
        />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-gray-950 md:text-5xl">
              Talk to a human.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              No call-booking maze. One address reaches the whole team, and a
              real person replies — usually within one business day.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-7 inline-flex items-center gap-2.5 rounded-2xl border border-primary-200 bg-white px-6 py-4 text-lg font-semibold text-primary-700 shadow-lg shadow-primary-100/60 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Mail className="h-5 w-5" aria-hidden />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.title}
                className="rounded-2xl border border-gray-200 bg-white p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/60">
                  <topic.icon className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="mt-4 font-semibold text-gray-950">{topic.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{topic.body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-950">
              Just want to see the product?
            </h2>
            <p className="mt-2 text-gray-600">
              You don&apos;t need to talk to us first. The trial is free, needs
              no card, and connecting a GSTIN takes about two minutes.
            </p>
            <Button size="lg" asChild className="mt-5 px-8 py-6 text-base">
              <Link href="/register">
                Start free 14-day trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            EffortlessInsight · Gurugram, Haryana, India
          </p>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
