'use client'

import {
  Shield,
  Lock,
  Server,
  Database,
  Cloud,
  Key,
  Users,
  FileCheck,
  Zap,
  CheckCircle,
} from 'lucide-react'

const securityFeatures = [
  {
    icon: Shield,
    title: 'Defense in Depth',
    description: 'Multi-layered security: WAF, API Gateway, Service Auth, Database Auth',
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'AES-256 encryption at rest, TLS 1.2+ in transit',
  },
  {
    icon: Key,
    title: 'Multi-Factor Auth',
    description: 'TOTP-based 2FA with backup codes for all accounts',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular permissions with organization-level isolation',
  },
]

const complianceItems = [
  'India Data Residency (ap-south-1)',
  'GST Compliance for Invoicing',
  'DPDP Act 2023 Ready',
  'PCI-DSS for Payments',
  '8-Year Data Retention',
  'Complete Audit Trail',
]

const scalabilityFeatures = [
  {
    icon: Server,
    title: '99.9% Uptime SLA',
    description: 'Enterprise-grade reliability with multi-AZ deployment',
  },
  {
    icon: Zap,
    title: '10,000+ Concurrent Users',
    description: 'Horizontal auto-scaling with ECS Fargate',
  },
  {
    icon: Database,
    title: 'PostgreSQL + pgvector',
    description: 'Enterprise database with vector search capabilities',
  },
  {
    icon: Cloud,
    title: 'AWS Infrastructure',
    description: 'S3, Redis, CloudFront CDN for global performance',
  },
]

export function SecurityScalability() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Enterprise Ready
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Secure, Scalable, Reliable
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built on enterprise-grade infrastructure with security and compliance
            at its core.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Security */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Security First</h3>
            </div>

            <div className="space-y-4 mb-8">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Compliance Grid */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                Compliance & Standards
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {complianceItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scalability */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Server className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Built to Scale</h3>
            </div>

            <div className="space-y-4 mb-8">
              {scalabilityFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <h4 className="font-semibold mb-4">Performance Targets</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'API Response', value: '<500ms' },
                  { label: 'Notice Processing', value: '<60s' },
                  { label: 'Disaster Recovery', value: '<1hr RTO' },
                  { label: 'Backup Frequency', value: '<15min RPO' },
                ].map((metric, index) => (
                  <div key={index} className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="text-xl font-bold">{metric.value}</div>
                    <div className="text-sm text-primary-200">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Banner */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['ASP.NET Core 9', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS', 'OpenAI', 'Google AI'].map(
              (tech, index) => (
                <span key={index} className="text-sm font-medium text-gray-700">
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
