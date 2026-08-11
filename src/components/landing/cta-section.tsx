import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gray-950 px-8 py-16 text-center shadow-2xl shadow-gray-300 md:px-16">
          {/* Glow accents inside the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
          />
          <h2 className="relative text-3xl font-bold tracking-tight text-white md:text-4xl">
            The next notice doesn&apos;t have to be scary.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Connect a GSTIN in two minutes. If a notice is already waiting on
            the portal, you&apos;ll understand it before your trial is an hour old.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-white px-8 py-6 text-base font-semibold text-gray-950 hover:bg-gray-100"
            >
              <Link href="/register">
                Start free 14-day trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="px-6 py-6 text-base text-gray-300 hover:bg-gray-900 hover:text-white"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
          <p className="relative mt-5 text-sm text-gray-400">
            No credit card · OTP-verified access · No password storage · Data hosted in India
          </p>
        </div>
      </div>
    </section>
  )
}
