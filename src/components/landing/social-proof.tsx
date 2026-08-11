import Link from 'next/link'
import { ArrowRight, FileSearch, IndianRupee, ShieldCheck, Ban } from 'lucide-react'

/**
 * Proof, the honest way. We have no customer logos or testimonials yet and
 * refuse to invent any — so this section offers proof a visitor can verify
 * in the next ten minutes, and says out loud that we don't fake numbers.
 *
 * TODO(marketing): when real customer quotes exist (with permission), add
 * them here — name, role, company. Until then, nothing invented.
 */

const proofs = [
  {
    icon: FileSearch,
    title: 'Test it on your own notice',
    body: 'Connect a GSTIN free and watch a real notice from your own portal get explained. No demo data, no scripted video — your case.',
  },
  {
    icon: IndianRupee,
    title: 'Pricing with nothing hidden',
    body: 'Every plan, every limit and every feature is public. No "book a call to see pricing", no surprise charges after the trial.',
  },
  {
    icon: ShieldCheck,
    title: 'Security you can interrogate',
    body: 'OTP-only access, no password storage, data in India, full audit trail — each claim is spelled out above and in the FAQ, in plain words.',
  },
  {
    icon: Ban,
    title: 'No invented numbers',
    body: 'You won’t find "trusted by 10,000 businesses" here, because we’re onboarding our first customers now. When real reviews exist, they’ll appear — unedited.',
  },
]

export function SocialProof() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
            Why trust us
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            We&apos;re new. Here&apos;s proof that doesn&apos;t need our word for it.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            The most convincing demo is your own GSTIN. Everything else you can
            check before signing up.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
          {proofs.map((proof) => (
            <div
              key={proof.title}
              className="rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/60">
                <proof.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-950">{proof.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{proof.body}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500">
          Being an early customer has one real perk: your feedback shapes the
          roadmap.{' '}
          <Link
            href="/register"
            className="inline-flex items-center gap-1 font-semibold text-primary-600 underline-offset-2 hover:underline"
          >
            Judge us on your own notice
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  )
}
