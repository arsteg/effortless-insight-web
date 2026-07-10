'use client'

import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const journeySteps = [
  {
    before: {
      icon: AlertTriangle,
      title: 'The Panic',
      description: 'A GST notice arrives. Legal jargon fills the page. You have no idea what it means or how serious it is.',
      emotion: 'Fear & Uncertainty',
      color: 'red',
    },
    after: {
      icon: Sparkles,
      title: 'Instant Clarity',
      description: 'Within 60 seconds, AI translates the notice into plain English/Hindi with a clear summary of what it means for your business.',
      emotion: 'Understanding',
      color: 'green',
    },
  },
  {
    before: {
      icon: HelpCircle,
      title: 'The Confusion',
      description: 'What documents do I need? What is the deadline? How much could this cost me? Questions without answers.',
      emotion: 'Overwhelm',
      color: 'orange',
    },
    after: {
      icon: Target,
      title: 'Guided Actions',
      description: 'AI generates a prioritized action checklist with required documents, suggested timeline, and clear next steps.',
      emotion: 'Direction',
      color: 'green',
    },
  },
  {
    before: {
      icon: Clock,
      title: 'The Deadline Anxiety',
      description: 'Was it 15 days or 30 days? Is the deadline from issue date or receipt date? One missed deadline and penalties multiply.',
      emotion: 'Stress',
      color: 'red',
    },
    after: {
      icon: Shield,
      title: 'Never Miss Again',
      description: 'Automatic deadline detection with WhatsApp reminders, email alerts, and countdown tracking. 98% deadline accuracy.',
      emotion: 'Peace of Mind',
      color: 'green',
    },
  },
]

const outcomes = [
  {
    icon: Eye,
    title: 'Complete Visibility',
    description: 'See every GST notice across all your GSTINs in one centralized dashboard. No notice falls through the cracks.',
    benefit: 'Centralized Control',
  },
  {
    icon: TrendingDown,
    title: 'Reduced Compliance Risk',
    description: 'AI-powered risk scoring helps you prioritize responses and minimize penalties. Understand exposure before it becomes a crisis.',
    benefit: 'Proactive Protection',
  },
  {
    icon: Brain,
    title: 'Make Better Decisions',
    description: 'With clear summaries, risk assessments, and historical context, you can make informed decisions instead of reacting blindly.',
    benefit: 'Data-Driven Choices',
  },
  {
    icon: Heart,
    title: 'Focus on Your Business',
    description: 'Stop spending days deciphering notices. Invest your time in growing your business while we handle the compliance complexity.',
    benefit: 'Time Freedom',
  },
]

export function BusinessOwnerSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-orange-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            FOR BUSINESS OWNERS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            From GST Notice Panic to{' '}
            <span className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Complete Control
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We understand the stress of receiving a GST notice. The uncertainty, the fear of penalties,
            the confusion about next steps. EffortlessInsight transforms that experience into confidence and clarity.
          </p>
        </div>

        {/* Journey Transformation - Visual Timeline */}
        <div className="relative mb-20">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 transform -translate-y-1/2 rounded-full" />

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {journeySteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="hidden lg:flex absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border-2 border-gray-200 items-center justify-center text-sm font-bold text-gray-600 z-10">
                  {index + 1}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  {/* Before State */}
                  <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${
                    step.before.color === 'red' ? 'from-red-50 to-orange-50' : 'from-orange-50 to-yellow-50'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        step.before.color === 'red' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        <step.before.icon className={`h-6 w-6 ${
                          step.before.color === 'red' ? 'text-red-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                          step.before.color === 'red' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {step.before.emotion}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{step.before.title}</h4>
                        <p className="text-sm text-gray-600">{step.before.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Separator */}
                  <div className="flex justify-center -my-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-white transform rotate-90" />
                    </div>
                  </div>

                  {/* After State */}
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <step.after.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">
                          {step.after.emotion}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{step.after.title}</h4>
                        <p className="text-sm text-gray-600">{step.after.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcomes Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
            What This Means for Your Business
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomes.map((outcome, index) => {
              const Icon = outcome.icon
              return (
                <div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-5 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
                    {outcome.benefit}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{outcome.title}</h4>
                  <p className="text-sm text-gray-600">{outcome.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Emotional CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 md:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Stop Losing Sleep Over GST Notices
            </h3>
            <p className="text-orange-100 text-lg mb-8">
              Join thousands of business owners who have transformed their relationship with GST compliance.
              From confusion to clarity. From stress to confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 shadow-xl"
              >
                <Link href="/register">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Your Free Trial
                </Link>
              </Button>
              <div className="text-orange-100 text-sm">
                14 days free • No credit card required
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
