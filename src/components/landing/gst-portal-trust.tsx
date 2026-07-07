'use client'

import {
  Shield,
  Lock,
  KeyRound,
  FileCheck,
  Server,
  Users,
  CheckCircle2,
  ArrowDown,
  Building2,
  Fingerprint,
} from 'lucide-react'

const trustCards = [
  {
    icon: Building2,
    title: 'Official GST Ecosystem Integration',
    description:
      'We connect through licensed GST Suvidha Provider (GSP) infrastructure — the same authorized pathway used by major enterprise tax systems.',
    badge: 'GSP Licensed',
  },
  {
    icon: KeyRound,
    title: 'No GST Password Storage',
    description:
      'Your GST Portal password is never stored. We use secure OTP-based authentication, and only encrypted session tokens are retained after your authorization.',
    badge: 'Zero Password Retention',
  },
  {
    icon: Lock,
    title: 'Enterprise-grade Encryption',
    description:
      'All data is protected with AES-256 encryption at rest and TLS 1.2+ in transit. Your sensitive tax information is secured at every step.',
    badge: 'AES-256 + TLS 1.2+',
  },
  {
    icon: FileCheck,
    title: 'Complete Audit Trail',
    description:
      'Every synchronization, notice retrieval, and access event is logged with timestamps. Full traceability for compliance and internal audits.',
    badge: 'Audit Ready',
  },
  {
    icon: Server,
    title: 'India Data Residency',
    description:
      'All data is stored exclusively in India (AWS ap-south-1). Your tax data never leaves Indian jurisdiction, ensuring regulatory compliance.',
    badge: 'Hosted in India',
  },
  {
    icon: Users,
    title: 'Secure Access Controls',
    description:
      'Role-based permissions, organization isolation, and optional two-factor authentication ensure only authorized personnel access your notices.',
    badge: 'RBAC + 2FA',
  },
]

const connectionSteps = [
  {
    step: 1,
    title: 'You Authorize',
    description: 'Enter OTP sent to your registered GST mobile number',
    icon: Fingerprint,
  },
  {
    step: 2,
    title: 'Secure Session Established',
    description: 'Encrypted token created — your password is never stored',
    icon: Lock,
  },
  {
    step: 3,
    title: 'Automatic Synchronization',
    description: 'Notices fetched securely every 6 hours via licensed GSP',
    icon: Server,
  },
  {
    step: 4,
    title: 'AI Processing & Alerts',
    description: 'Instant analysis, risk assessment, and deadline notifications',
    icon: Shield,
  },
]

export function GstPortalTrust() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            <Shield className="h-4 w-4" />
            Secure & Official
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Official GST Portal Integration
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            EffortlessInsight securely connects to the official GST Portal through licensed
            GST Suvidha Provider (GSP) infrastructure — the authorized gateway for enterprise
            GST integrations in India.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-8">
              How Your Notices Are Securely Retrieved
            </h3>

            {/* Visual Flow */}
            <div className="flex flex-col items-center space-y-4">
              {/* Your Business */}
              <div className="flex items-center gap-4 bg-primary-50 rounded-xl px-6 py-4 w-full max-w-md">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Your Business</div>
                  <div className="text-sm text-gray-600">OTP Authorization</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
                    <Fingerprint className="h-3 w-3" />
                    OTP Verified
                  </span>
                </div>
              </div>

              <ArrowDown className="h-6 w-6 text-gray-400" />

              {/* EffortlessInsight */}
              <div className="flex items-center gap-4 bg-green-50 rounded-xl px-6 py-4 w-full max-w-md border-2 border-green-200">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">EffortlessInsight</div>
                  <div className="text-sm text-gray-600">Encrypted Session Tokens</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    AES-256
                  </span>
                </div>
              </div>

              <ArrowDown className="h-6 w-6 text-gray-400" />

              {/* Licensed GSP */}
              <div className="flex items-center gap-4 bg-orange-50 rounded-xl px-6 py-4 w-full max-w-md">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Licensed GST Suvidha Provider</div>
                  <div className="text-sm text-gray-600">Government-authorized API gateway</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    GSP Licensed
                  </span>
                </div>
              </div>

              <ArrowDown className="h-6 w-6 text-gray-400" />

              {/* Official GST Portal */}
              <div className="flex items-center gap-4 bg-gray-100 rounded-xl px-6 py-4 w-full max-w-md">
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Server className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Official GST Portal</div>
                  <div className="text-sm text-gray-600">gst.gov.in</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
                    <Shield className="h-3 w-3" />
                    GSTN
                  </span>
                </div>
              </div>
            </div>

            {/* Caption */}
            <p className="text-center text-sm text-gray-500 mt-8 max-w-xl mx-auto">
              EffortlessInsight retrieves your GST notices through licensed GST ecosystem integrations.
              We do not scrape or use unauthorized access methods.
            </p>
          </div>
        </div>

        {/* How It Works - Visual Flow */}
        <div className="max-w-5xl mx-auto mb-20">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-10">
            Secure Authorization Flow
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {connectionSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="relative">
                  {/* Connector line */}
                  {index < connectionSteps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-2rem)] h-0.5 bg-gray-200" />
                  )}

                  <div className="relative bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 relative z-10">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2">
                      Step {step.step}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trust Cards */}
        <div className="mb-12">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-4">
            Why Enterprise Teams Trust Us
          </h3>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Built for finance teams, tax professionals, and enterprises who require
            the highest standards of security and compliance.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{card.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        {card.badge}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Trust Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">
            Your GST Data. Your Control. Our Responsibility.
          </h3>
          <p className="text-primary-100 max-w-2xl mx-auto">
            We built EffortlessInsight with enterprise compliance in mind. Every feature
            is designed to give you visibility into your GST notices while maintaining
            the highest security standards.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-200" />
              <span>India Data Residency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-200" />
              <span>GSP Licensed Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-200" />
              <span>No Password Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary-200" />
              <span>Complete Audit Trail</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
