'use client'

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  GitBranch,
  MessageSquare,
  PenTool,
  Scale,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const productivityFeatures = [
  {
    icon: Zap,
    title: 'AI-Powered Analysis',
    description: 'Get complete notice analysis in under 60 seconds. Classification, risk scoring, deadline extraction, and legal references - all automated.',
    metric: '95%',
    metricLabel: 'faster than manual review',
  },
  {
    icon: PenTool,
    title: 'Auto-Draft Responses',
    description: 'Generate professional response drafts with relevant GST sections and legal citations. Review and customize before sending.',
    metric: '4+ hrs',
    metricLabel: 'saved per notice',
  },
  {
    icon: BookOpen,
    title: 'Instant Legal Context',
    description: 'Our RAG system retrieves relevant circulars, case precedents, and GST rules automatically. No manual research required.',
    metric: '50+',
    metricLabel: 'notice types covered',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Ask natural language questions about any notice. Get instant answers about deadlines, requirements, and recommended actions.',
    metric: '24/7',
    metricLabel: 'available assistance',
  },
]

const workflowSteps = [
  {
    step: 1,
    title: 'Centralized Intake',
    description: 'All client notices flow into one organized dashboard. Auto-sync from GST Portal or manual uploads.',
    icon: FolderOpen,
  },
  {
    step: 2,
    title: 'Instant Analysis',
    description: 'AI analyzes each notice: classification, risk score, deadline, required documents, and action items.',
    icon: Zap,
  },
  {
    step: 3,
    title: 'Assign & Track',
    description: 'Route notices to team members with workflows, SLAs, and approval chains. Never lose track of any case.',
    icon: GitBranch,
  },
  {
    step: 4,
    title: 'Draft & Respond',
    description: 'AI-assisted response drafting with legal citations. Collaborate with clients on document collection.',
    icon: PenTool,
  },
  {
    step: 5,
    title: 'Archive & Learn',
    description: 'Build organizational knowledge base. Similar notice detection and compliance pattern analysis.',
    icon: BookOpen,
  },
]

const practiceImprovements = [
  {
    icon: Clock,
    title: 'Reclaim Your Time',
    description: 'Spend less time on administrative tasks and more time providing high-value advisory services to clients.',
  },
  {
    icon: Users,
    title: 'Scale Your Practice',
    description: 'Handle 3x more notices with the same team. AI handles the heavy lifting while you focus on strategy.',
  },
  {
    icon: Building2,
    title: 'Better Client Service',
    description: 'Respond faster, communicate clearer, and deliver more value. Build stronger client relationships.',
  },
  {
    icon: BarChart3,
    title: 'Practice Analytics',
    description: 'Track team performance, case resolution times, and compliance metrics across all clients.',
  },
]

const clientCollaborationFeatures = [
  { feature: 'Shared workspace for each client', included: true },
  { feature: 'Real-time document requests', included: true },
  { feature: 'Threaded comments & @mentions', included: true },
  { feature: 'Client activity timeline', included: true },
  { feature: 'Role-based access control', included: true },
  { feature: 'Multi-GSTIN management', included: true },
]

export function TaxProfessionalSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-purple-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Scale className="h-4 w-4" />
            FOR CHARTERED ACCOUNTANTS & TAX PROFESSIONALS
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Transform Your Practice with{' '}
            <span className="bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Efficiency
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Handle more notices, serve clients better, and grow your practice.
            EffortlessInsight automates the tedious work so you can focus on what matters most—expert advisory.
          </p>
        </div>

        {/* Productivity Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {productivityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 bg-purple-50 border-t border-purple-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-purple-600">{feature.metric}</span>
                    <span className="text-sm text-purple-700">{feature.metricLabel}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Workflow Visualization */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-8 md:p-12 mb-20">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            End-to-End Case Management Workflow
          </h3>
          <p className="text-purple-100 text-center max-w-2xl mx-auto mb-12">
            From notice intake to resolution, manage every case with complete visibility and control.
          </p>

          {/* Workflow Steps */}
          <div className="relative">
            {/* Connecting Line - Desktop */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-1 bg-white/20 rounded-full" />

            <div className="grid lg:grid-cols-5 gap-6">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="relative">
                    {/* Step Indicator */}
                    <div className="flex lg:flex-col items-center gap-4 lg:gap-2 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 lg:mx-auto">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="lg:hidden text-white/60 text-sm">Step {step.step}</div>
                    </div>

                    {/* Content */}
                    <div className="lg:text-center">
                      <div className="hidden lg:block text-white/60 text-xs mb-1">Step {step.step}</div>
                      <h4 className="font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-sm text-purple-100">{step.description}</p>
                    </div>

                    {/* Arrow - Mobile */}
                    {index < workflowSteps.length - 1 && (
                      <div className="lg:hidden flex justify-center my-4">
                        <ArrowRight className="h-5 w-5 text-white/40 transform rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Two Column Layout: Practice Improvements + Client Collaboration */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Practice Improvements */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Elevate Your Practice
            </h3>
            <div className="space-y-6">
              {practiceImprovements.map((improvement, index) => {
                const Icon = improvement.icon
                return (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{improvement.title}</h4>
                      <p className="text-sm text-gray-600">{improvement.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Client Collaboration Features */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Seamless Client Collaboration
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Collaboration Hub</div>
                    <div className="text-sm text-gray-500">Work together, stay aligned</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {clientCollaborationFeatures.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item.feature}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 inline mr-2 text-purple-600" />
                  Designed for multi-client practices of all sizes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl p-8 md:p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to 3x Your Practice Efficiency?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Join tax professionals across India who are using EffortlessInsight to deliver better results for their clients.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
              >
                <Link href="/register">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free 14-Day Trial
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Link href="#how-it-works">
                  See How It Works
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
