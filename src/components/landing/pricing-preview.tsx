'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    description: 'For small businesses just getting started',
    price: '2,999',
    period: '/month',
    features: [
      '50 notices/month',
      '3 team members',
      'Basic AI analysis',
      'Email support',
      '14-day free trial',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with more compliance needs',
    price: '9,999',
    period: '/month',
    features: [
      'Unlimited notices',
      '10 team members',
      'Full AI analysis',
      'Priority support',
      'Advanced workflows',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited everything',
      'Unlimited team',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'SSO/SAML',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function PricingPreview() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Pricing Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. Start with a 14-day free trial,
            no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-white shadow-2xl border-primary-200 scale-105'
                  : 'bg-white shadow-lg border-gray-100 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  ) : (
                    <>
                      <span className="text-lg text-gray-500">Rs.</span>
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular ? '' : 'bg-gray-900 hover:bg-gray-800'
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                asChild
              >
                <Link href={plan.price === 'Custom' ? '/contact' : '/register'}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* See All Plans Link */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            See full plan comparison
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-100 rounded-full px-6 py-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-green-800">
              <strong>7-day money-back guarantee</strong> on all paid plans
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
