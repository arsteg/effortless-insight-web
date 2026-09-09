import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gray-950 px-8 py-16 text-center shadow-premium ring-1 ring-gray-900/10 md:px-16 md:py-20">
          {/* Single restrained glow + hairline grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
          />
          <p className="eyebrow relative justify-center text-primary-300">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" aria-hidden />
            Get started
          </p>
          <h2 className="relative mt-4 font-display text-3xl font-bold tracking-tightest text-white md:text-[2.75rem] md:leading-[1.1]">
            The next notice doesn&apos;t have to be scary.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-400">
            Connect a GSTIN in two minutes. If a notice is already waiting on
            the portal, you&apos;ll understand it before your trial is an hour old.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="group h-12 bg-white px-8 text-base font-semibold text-gray-950 shadow-lg transition-all hover:bg-gray-100 hover:shadow-xl"
            >
              <Link href="/register">
                Start free 14-day trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-12 px-6 text-base text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
          <p className="relative mt-6 text-sm text-gray-500">
            No credit card · OTP-verified access · No password storage · Data hosted in India
          </p>
        </div>
      </div>
    </section>
  )
}
