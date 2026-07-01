'use client'

import { Link2, Shield, Clock, RefreshCw, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const benefits = [
  {
    icon: Link2,
    title: 'One-Time Setup',
    description: 'Connect with a simple OTP verification. No passwords stored, just secure token-based access.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Sync Every 6 Hours',
    description: 'Notices are fetched automatically. Configure your preferred sync schedule.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Licensed GSP integration. Your credentials are never stored - only secure session tokens.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'New notices are automatically analyzed by our AI the moment they arrive.',
  },
]

const steps = [
  { step: 1, text: 'Click "Connect to GST Portal"' },
  { step: 2, text: 'Enter OTP sent to registered mobile' },
  { step: 3, text: 'Done! Notices sync automatically' },
]

export function GstnIntegration() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-green-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            NEW FEATURE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Direct GST Portal Integration
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Never miss a notice again. Connect your GSTINs to the GST Portal and let us
            automatically fetch and analyze notices for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">GST Portal Connection</h3>
                  <p className="text-sm text-gray-500">Setup in under 2 minutes</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-8">
                {steps.map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                      {item.step}
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Connected Status Preview */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-green-800">Connected Successfully</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">GSTIN</span>
                    <span className="font-mono font-semibold text-gray-900">29AAACR5055K1ZN</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Auto-sync</span>
                    <span className="font-semibold text-green-600">Every 6 hours</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Last synced</span>
                    <span className="font-semibold text-gray-900">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Notices fetched</span>
                    <span className="font-semibold text-gray-900">12 total</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/register">
                    Start Free Trial - Connect Your GSTINs
                  </Link>
                </Button>
              </div>
            </div>

            {/* Floating notification */}
            <div
              className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 animate-bounce"
              style={{ animationDuration: '2s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Auto-synced</div>
                  <div className="text-xs text-gray-500">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-sm text-gray-600">Notice Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">6h</div>
            <div className="text-sm text-gray-600">Auto-sync Interval</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">2 min</div>
            <div className="text-sm text-gray-600">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Missed Notices</div>
          </div>
        </div>
      </div>
    </section>
  )
}
