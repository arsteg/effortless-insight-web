'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BillingToggle, PlanComparison } from '@/components/features/billing'
import { usePlans } from '@/hooks/use-billing'
import { formatAmount } from '@/lib/api/billing'
import type { BillingCycle, Plan } from '@/types/billing'

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually')
  const { data: plans, isLoading } = usePlans()

  const handleSelectPlan = (planCode: string) => {
    // Store plan selection in localStorage so it persists through registration/email verification
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_plan', JSON.stringify({
        planCode,
        billingCycle,
        timestamp: Date.now()
      }))
    }

    // Redirect to register with plan selection in URL
    router.push(`/register?plan=${planCode}&billing=${billingCycle}`)
  }

  // Calculate average annual discount from plans with both monthly and annual pricing
  const averageAnnualDiscount = plans && plans.length > 0
    ? Math.round(
        plans
          .filter(p => p.pricing.monthly && p.pricing.annually && p.pricing.annualDiscount)
          .reduce((sum, p) => sum + (p.pricing.annualDiscount || 0), 0) /
        plans.filter(p => p.pricing.monthly && p.pricing.annually).length
      )
    : undefined

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="EffortlessInsight"
              width={280}
              height={56}
              className="h-12 w-auto md:h-14"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/login"
              className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Choose the plan that fits your business. Start with a free trial,
          upgrade when you&apos;re ready.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <BillingToggle
            value={billingCycle}
            onChange={setBillingCycle}
            annualDiscount={averageAnnualDiscount}
          />
        </div>

        {/* Plans */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded w-20 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <PricingCard
                key={plan.code}
                plan={plan}
                billingCycle={billingCycle}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        ) : (
          <EmptyPlansState />
        )}
      </section>

      {/* Features Comparison */}
      {plans && plans.length > 0 && (
        <section className="container mx-auto px-4 py-12 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Compare Plans
          </h2>
          <div className="max-w-6xl mx-auto bg-white rounded-xl border shadow-sm overflow-hidden">
            <PlanComparison plans={plans} />
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <FAQItem
            question="Can I try before I buy?"
            answer="Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial."
          />
          <FAQItem
            question="Can I change plans later?"
            answer="Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, debit cards, UPI, and netbanking through our payment partner Razorpay. All payments are processed securely in INR."
          />
          <FAQItem
            question="Is there a discount for annual billing?"
            answer="Yes! When you choose annual billing, you save 20% compared to monthly billing. That's like getting 2+ months free!"
          />
          <FAQItem
            question="What happens when I exceed my plan limits?"
            answer="We'll notify you when you're approaching your limits. You can upgrade your plan anytime to get more capacity. We never cut off access abruptly."
          />
          <FAQItem
            question="Do you offer refunds?"
            answer="We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 7 days of your first payment for a full refund."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Start Your Free Trial Today
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            No credit card required. Get full access for 14 days.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
                Contact Us
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} EffortlessInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function PricingCard({
  plan,
  billingCycle,
  onSelect,
}: {
  plan: Plan
  billingCycle: BillingCycle
  onSelect: (planCode: string) => void
}) {
  const price = billingCycle === 'annually' ? plan.pricing.annually : plan.pricing.monthly
  const isFreePlan = price === 0

  const features = getTopFeatures(plan)

  // Determine button text based on plan type
  const getButtonText = () => {
    // Contact Sales plans
    if (plan.contactSales) {
      return 'Contact Sales'
    }

    // Free plan
    if (isFreePlan) {
      return 'Start Free'
    }

    // Paid plans with trial
    if (plan.trialDays > 0) {
      return 'Start Free Trial'
    }

    // Paid plans without trial
    return 'Get Started'
  }

  return (
    <Card
      className={`relative flex flex-col ${
        plan.isPopular ? 'border-primary shadow-lg scale-105' : ''
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="pt-8">
        <CardTitle>{plan.displayName}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          {plan.contactSales ? (
            <div>
              <span className="text-3xl font-bold">Custom</span>
              <p className="text-sm text-muted-foreground">Contact us for pricing</p>
            </div>
          ) : (
            <div>
              <span className="text-4xl font-bold">
                {isFreePlan ? 'Free' : formatAmount(price || 0)}
              </span>
              {!isFreePlan && (
                <span className="text-muted-foreground">
                  /{billingCycle === 'annually' ? 'year' : 'month'}
                </span>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {plan.contactSales ? (
          <Button className="w-full" variant="outline" asChild>
            <a href="mailto:sales@effortlessinsight.com">Contact Sales</a>
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={plan.isPopular ? 'default' : 'outline'}
            onClick={() => onSelect(plan.code)}
          >
            {getButtonText()}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}

function EmptyPlansState() {
  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center py-12">
        <CardContent>
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Plans Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            We&apos;re setting up our pricing plans. Please check back shortly or contact us for more information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
            <Button asChild>
              <a href="mailto:support@effortlessinsight.com">Contact Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getTopFeatures(plan: Plan): string[] {
  const features: string[] = []

  // Add limits
  if (plan.limits.noticesPerMonth === -1) {
    features.push('Unlimited notices')
  } else {
    features.push(`${plan.limits.noticesPerMonth} notices/month`)
  }

  if (plan.limits.users === -1) {
    features.push('Unlimited team members')
  } else {
    features.push(`${plan.limits.users} team member${plan.limits.users > 1 ? 's' : ''}`)
  }

  features.push(`${plan.limits.storageGb === -1 ? 'Unlimited' : plan.limits.storageGb + 'GB'} storage`)

  // Add key features
  if (plan.features.includes('full_ai_analysis')) {
    features.push('Full AI analysis')
  } else {
    features.push('Basic AI analysis')
  }

  if (plan.features.includes('priority_support')) {
    features.push('Priority support')
  }

  if (plan.features.includes('api_access')) {
    features.push('API access')
  }

  if (plan.trialDays > 0) {
    features.push(`${plan.trialDays}-day free trial`)
  }

  return features.slice(0, 6)
}
