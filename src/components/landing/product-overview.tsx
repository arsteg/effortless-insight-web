'use client'

import { FileText, Brain, Users, Bell, BarChart3, Smartphone } from 'lucide-react'

const capabilities = [
  {
    icon: FileText,
    title: 'Notice Management',
    description: 'Upload GST notices via PDF, image, or mobile scan. Track every notice through its lifecycle.',
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'Instant risk scoring, entity extraction, deadline detection, and plain-language summaries.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Assign tasks, request documents, collaborate with CAs and team members in real-time.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss deadlines with multi-channel alerts via email, SMS, WhatsApp, and push notifications.',
  },
  {
    icon: BarChart3,
    title: 'Compliance Analytics',
    description: 'Dashboards and reports showing compliance health, trends, and team performance.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Scan notices, manage tasks, and stay updated on-the-go with our iOS and Android app.',
  },
]

export function ProductOverview() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Platform Overview
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            One Platform for Complete GST Compliance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From the moment you receive a GST notice to final resolution,
            EffortlessInsight automates and streamlines every step of the process.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {capability.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {capability.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trusted by Businesses Across India
          </h3>
          <p className="text-primary-100 text-lg mb-6 max-w-2xl mx-auto">
            From street vendors to enterprises, businesses of all sizes use EffortlessInsight
            to eliminate the fear and complexity of GST compliance.
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">50+</div>
              <div className="text-primary-200 text-sm">Notice Types Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">8</div>
              <div className="text-primary-200 text-sm">GST Categories Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">2</div>
              <div className="text-primary-200 text-sm">Languages Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
