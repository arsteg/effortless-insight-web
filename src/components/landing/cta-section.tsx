'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, Lock, Fingerprint, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Start Your Free Trial Today
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Transform Your
            <br />
            GST Compliance?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Securely sync notices from the GST Portal via licensed GSP infrastructure.
            Get WhatsApp alerts for deadlines.
            Join enterprises across India who trust EffortlessInsight for GST notice management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-primary-600 hover:bg-primary-50 shadow-xl"
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
              className="w-full sm:w-auto text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>

          {/* Trust Points - Improved */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-primary-200">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>GSP Licensed Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>No Password Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              <span>OTP Verified Access</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>India Data Residency</span>
            </div>
          </div>

          {/* Additional micro-trust signal */}
          <div className="mt-8 text-xs text-primary-300">
            No credit card required • Cancel anytime • Enterprise-grade security
          </div>
        </div>
      </div>
    </section>
  )
}
