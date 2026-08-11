'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlans } from '@/hooks/use-billing'
import { formatAmount } from '@/lib/api/billing'
import type { Plan } from '@/types/billing'

/**
 * Pricing preview, driven by the live plan catalog (same API the /pricing
 * page and the Admin app use). Nothing here is hardcoded — plans created or
 * edited in the Admin web application appear automatically.
 */

function getTopFeatures(plan: Plan): string[] {
  const features: string[] = []

  if (plan.limits.noticesPerMonth === -1) {
    features.push('Unlimited notices')
  } else {
    features.push(`${plan.limits.noticesPerMonth} notices/month`)
  }

  if (plan.limits.users === -1) {
    features.push('Unlimited team members')
  } else {
    const userText = `${plan.limits.users} team member${plan.limits.users > 1 ? 's' : ''}`
    features.push(plan.limits.additionalUsersAllowed ? `${userText} (add more seats)` : userText)
  }

  if (plan.features.includes('full_ai_analysis')) {
    features.push('Full AI analysis & draft replies')
  } else {
    features.push('AI analysis & summaries')
  }

  if (plan.features.includes('whatsapp_notifications')) {
    features.push('WhatsApp notifications & assistant')
  }
  if (plan.features.includes('advanced_analytics')) {
    features.push('Advanced analytics')
  }
  if (plan.features.includes('api_access')) {
    features.push('API access')
  }
  if (plan.features.includes('priority_support')) {
    features.push('Priority support')
  }

  if (plan.trialDays > 0) {
    features.push(`${plan.trialDays}-day free trial`)
  }

  return features.slice(0, 6)
}

function PlanCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-7 shadow-lg">
      <div className="mx-auto mb-3 h-6 w-24 rounded bg-gray-200" />
      <div className="mx-auto mb-6 h-4 w-36 rounded bg-gray-100" />
      <div className="mx-auto mb-8 h-9 w-28 rounded bg-gray-200" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 rounded bg-gray-100" />
        ))}
      </div>
      <div className="mt-8 h-10 rounded-lg bg-gray-200" />
    </div>
  )
}

export function PricingPreview() {
  const router = useRouter()
  const { data: plans, isLoading } = usePlans()

  const handleSelectPlan = (planCode: string) => {
    // Same behavior as /pricing: persist the choice through registration
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'selected_plan',
        JSON.stringify({ planCode, billingCycle: 'monthly', timestamp: Date.now() })
      )
    }
    router.push(`/register?plan=${planCode}&billing=monthly`)
  }

  // Average annual discount, derived from the catalog itself
  const discounted = plans?.filter(
    (p) => p.pricing.monthly && p.pricing.annually && p.pricing.annualDiscount
  )
  const averageAnnualDiscount =
    discounted && discounted.length > 0
      ? Math.round(
          discounted.reduce((sum, p) => sum + (p.pricing.annualDiscount || 0), 0) /
            discounted.length
        )
      : undefined

  return (
    <section id="pricing" className="scroll-mt-header bg-gradient-to-b from-white to-gray-50 py-14 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
            Pricing
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-950 md:text-4xl">
            Costs less than one missed deadline
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            A single late reply can mean interest, penalties and weeks of
            follow-up. Start free, upgrade when the volume does
            {averageAnnualDiscount
              ? ` — pay yearly and save ~${averageAnnualDiscount}%.`
              : '.'}
          </p>
        </div>

        {isLoading ? (
          <div className="mx-auto mb-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="mx-auto mb-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const monthly = plan.pricing.monthly || 0
              const isFree = monthly === 0 && !plan.contactSales
              return (
                <div
                  key={plan.code}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 transition-all duration-300 ${
                    plan.isPopular
                      ? 'border-transparent shadow-2xl shadow-primary-200/60 ring-2 ring-primary-500 lg:scale-105'
                      : 'border-gray-100 shadow-lg hover:-translate-y-1 hover:shadow-xl'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{plan.displayName}</h3>
                    <p className="mb-4 min-h-10 text-sm text-gray-500">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.contactSales ? (
                        <span className="text-3xl font-bold text-gray-900">Custom</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-gray-900">
                            {isFree ? 'Free' : formatAmount(monthly)}
                          </span>
                          {!isFree && <span className="text-gray-500">/month</span>}
                        </>
                      )}
                    </div>
                    {plan.limits.additionalUsersAllowed && plan.pricing.perSeat?.monthly ? (
                      <p className="mt-1 text-xs text-gray-500">
                        +{formatAmount(plan.pricing.perSeat.monthly)}/user/month
                      </p>
                    ) : null}
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {getTopFeatures(plan).map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.contactSales ? (
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/contact">Contact Sales</Link>
                    </Button>
                  ) : (
                    <Button
                      className={
                        plan.isPopular
                          ? 'w-full bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg shadow-primary-300/60 hover:from-primary-600 hover:to-primary-600'
                          : 'w-full'
                      }
                      variant={plan.isPopular ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.code)}
                    >
                      {isFree ? 'Start Free' : plan.trialDays > 0 ? 'Start Free Trial' : 'Get Started'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mx-auto mb-12 max-w-xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Plans are being set up</h3>
            <p className="mt-2 text-gray-600">
              Our pricing catalog isn&apos;t available right now. See the full
              pricing page, or start a free trial and pick a plan later.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Start free trial</Link>
              </Button>
            </div>
          </div>
        )}

        {/* See All Plans Link */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            See full plan comparison
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-sm text-gray-500">
            Pay by UPI, card or netbanking · GST-compliant invoices · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
