'use client'

import Link from 'next/link'
import { ArrowRight, Play, Shield, Zap, Clock, MessageCircle, Lock, Fingerprint } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedCounter } from './animated-counter'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/30" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary-100/50 to-transparent" />

      {/* Animated Background Shapes */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Secure GST Portal Sync
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                WhatsApp Alerts
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform GST Notice
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                {' '}
                Chaos into Clarity
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Securely sync notices from the GST Portal via licensed GSP infrastructure.
              Get instant WhatsApp alerts for deadlines.
              Our AI transforms complex notices into actionable insights in under 60 seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl shadow-primary-200 hover:shadow-2xl hover:shadow-primary-300 transition-all"
              >
                <Link href="/register">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto text-lg px-8 py-6 group"
              >
                <Link href="#how-it-works">
                  <Play className="mr-2 h-5 w-5 group-hover:text-primary-600 transition-colors" />
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>GSP Licensed</span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary-500" />
                <span>OTP Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-500" />
                <span>No Password Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                <span>WhatsApp Alerts</span>
              </div>
            </div>
          </div>

          {/* Right: Visual/Stats */}
          <div className="relative">
            {/* Main Visual Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-green-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                AI-Powered
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-primary-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                    <AnimatedCounter end={60} suffix="s" prefix="<" />
                  </div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                    <AnimatedCounter end={95} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-sm text-gray-600">Notice Types</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-1">
                    <AnimatedCounter end={98} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-600">Deadline Detection</div>
                </div>
              </div>

              {/* Sample Analysis Preview */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">DRC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">DRC-01 Notice Analyzed</div>
                    <div className="text-sm text-gray-500">Tax Demand Notice</div>
                  </div>
                  <div className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    High Risk
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax Amount</span>
                    <span className="font-semibold text-gray-900">₹2,45,000</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Response Deadline</span>
                    <span className="font-semibold text-orange-600">15 days remaining</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">AI Confidence</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                </div>
              </div>

              {/* Trust micro-signals */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> India Hosted
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Audit Trail
                </span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Secure Sync Complete</div>
                  <div className="text-xs text-gray-500">3 notices retrieved via GSP</div>
                </div>
              </div>
            </div>

            {/* WhatsApp Notification Float */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-bounce hidden lg:block" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">WhatsApp Alert</div>
                  <div className="text-xs text-gray-500">Deadline in 3 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
