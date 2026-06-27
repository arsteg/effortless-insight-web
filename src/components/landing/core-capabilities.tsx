'use client'

import {
  Upload,
  Brain,
  FileSearch,
  Shield,
  ClipboardCheck,
  GitBranch,
  MessageSquare,
  FileText,
  Bell,
  BarChart3,
  History,
  Globe,
} from 'lucide-react'
import { FeatureCard } from './feature-card'

const capabilities = [
  {
    icon: Upload,
    title: 'Multi-Channel Upload',
    description:
      'Upload notices via PDF, image capture, email forwarding, or mobile camera scanning.',
    benefits: ['Supports 25MB files', 'Auto-format detection', 'Bulk upload support'],
  },
  {
    icon: FileSearch,
    title: 'OCR & Text Extraction',
    description:
      'Advanced OCR extracts text from scanned documents and images with 95%+ accuracy.',
    benefits: ['Google Document AI', 'Multi-page support', 'Table extraction'],
  },
  {
    icon: Brain,
    title: 'AI Classification',
    description:
      'Automatically classifies notices into 50+ types across 8 GST categories.',
    benefits: ['90%+ accuracy', 'DRC, ASMT, REG coverage', 'Hybrid ML approach'],
  },
  {
    icon: Shield,
    title: 'Risk Assessment',
    description:
      'Multi-factor risk scoring considers amount, deadline, notice type, and history.',
    benefits: ['0-100 risk score', 'Low to Critical levels', 'Priority indicators'],
  },
  {
    icon: ClipboardCheck,
    title: 'Action Items',
    description:
      'AI generates prioritized action items with required documents checklist.',
    benefits: ['Priority ranking', 'Due date suggestions', 'Document list'],
  },
  {
    icon: GitBranch,
    title: 'Workflow Engine',
    description:
      'Configurable workflows with auto-assignment, SLA tracking, and escalations.',
    benefits: ['Linear & parallel flows', 'Auto-assignment rules', 'Approval chains'],
  },
  {
    icon: MessageSquare,
    title: 'Collaboration Hub',
    description:
      'Comments, @mentions, document requests, and real-time activity feeds.',
    benefits: ['Threaded comments', 'Document requests', 'Activity timeline'],
  },
  {
    icon: FileText,
    title: 'Response Drafting',
    description:
      'AI-assisted draft generation with relevant GST sections and legal references.',
    benefits: ['Professional tone', 'Legal citations', 'Document checklist'],
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Multi-channel alerts via email, SMS, WhatsApp, and push notifications.',
    benefits: ['Deadline reminders', 'SLA alerts', 'Task updates'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Dashboards with 30+ metrics, custom reports, and compliance tracking.',
    benefits: ['CSV/PDF export', 'Scheduled reports', 'Trend analysis'],
  },
  {
    icon: History,
    title: 'Compliance History',
    description:
      'Build organizational knowledge base from past notices for prevention.',
    benefits: ['Searchable archive', 'Similar notice detection', 'Learning patterns'],
  },
  {
    icon: Globe,
    title: 'Bilingual Support',
    description:
      'Summaries and interface available in both English and Hindi.',
    benefits: ['Auto Hindi translation', 'Regional accessibility', 'Tax terminology'],
  },
]

export function CoreCapabilities() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Powerful Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for GST Compliance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A comprehensive suite of tools designed specifically for Indian businesses
            managing GST notices and tax compliance.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => (
            <FeatureCard
              key={index}
              icon={capability.icon}
              title={capability.title}
              description={capability.description}
              benefits={capability.benefits}
              variant={index % 3 === 0 ? 'gradient' : 'default'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
