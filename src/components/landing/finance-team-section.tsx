'use client'

import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileSearch,
  FolderOpen,
  GitBranch,
  History,
  LayoutDashboard,
  Lock,
  Shield,
  Target,
  TrendingUp,
  Users,
  UserCheck,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const dashboardMetrics = [
  { label: 'Active Notices', value: '12', trend: 'stable', icon: FileSearch },
  { label: 'Due This Week', value: '3', trend: 'warning', icon: Clock },
  { label: 'High Risk', value: '2', trend: 'critical', icon: AlertCircle },
  { label: 'Compliance Score', value: '94%', trend: 'positive', icon: Target },
]

const operationalFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Unified Compliance Dashboard',
    description: 'Track all GST notices across multiple GSTINs, entities, and locations in one centralized view. Real-time status updates and risk visibility.',
    highlights: ['Multi-GSTIN support', 'Entity-wise breakdown', 'Real-time updates'],
  },
  {
    icon: GitBranch,
    title: 'Configurable Workflows',
    description: 'Design workflows that match your approval hierarchy. Linear or parallel execution, auto-assignment rules, and SLA-based escalations.',
    highlights: ['Custom stages', 'Auto-routing', 'SLA tracking'],
  },
  {
    icon: Users,
    title: 'Team Task Management',
    description: 'Assign notices to team members with clear ownership. Track progress, manage workloads, and ensure accountability at every stage.',
    highlights: ['Role-based assignments', 'Workload visibility', 'Progress tracking'],
  },
  {
    icon: Bell,
    title: 'Proactive Notifications',
    description: 'Multi-channel alerts ensure no deadline is missed. Email, SMS, WhatsApp, and push notifications with configurable timing.',
    highlights: ['Multi-channel alerts', 'Configurable timing', 'Escalation chains'],
  },
]

const governanceFeatures = [
  {
    icon: History,
    title: 'Complete Audit Trail',
    description: 'Every action is logged with timestamp and user details. Full history of who did what, when, and why.',
  },
  {
    icon: Lock,
    title: 'Role-Based Access Control',
    description: 'Fine-grained permissions ensure team members see only what they need. Secure multi-tenant architecture.',
  },
  {
    icon: FolderOpen,
    title: 'Document Management',
    description: 'Centralized storage for all notice-related documents. Version control, search, and organized filing.',
  },
  {
    icon: BarChart3,
    title: 'Compliance Reporting',
    description: 'Scheduled reports delivered to stakeholders. Custom dashboards with 30+ metrics for management review.',
  },
]

const teamVisibility = [
  { status: 'In Progress', assignee: 'Rahul M.', notice: 'DRC-01', dueIn: '5 days', priority: 'high' },
  { status: 'Review', assignee: 'Priya S.', notice: 'ASMT-10', dueIn: '12 days', priority: 'medium' },
  { status: 'Awaiting Docs', assignee: 'Amit K.', notice: 'REG-03', dueIn: '8 days', priority: 'low' },
]

export function FinanceTeamSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-sky-50/30 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            FOR FINANCE TEAMS & ENTERPRISES
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Enterprise-Grade{' '}
            <span className="bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Compliance Operations
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Bring structure, visibility, and accountability to your organization&apos;s GST compliance.
            EffortlessInsight gives finance leaders the tools to manage notices at scale.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-20">
          {/* Dashboard Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-sky-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold">Compliance Command Center</div>
                <div className="text-sky-100 text-sm">Organization-wide visibility</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sky-100 text-sm">
              <Activity className="h-4 w-4" />
              Live Dashboard
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="p-6 bg-gradient-to-b from-sky-50/50 to-white border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardMetrics.map((metric, index) => {
                const Icon = metric.icon
                const trendColors = {
                  stable: 'text-gray-600 bg-gray-100',
                  warning: 'text-orange-600 bg-orange-100',
                  critical: 'text-red-600 bg-red-100',
                  positive: 'text-green-600 bg-green-100',
                }
                return (
                  <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trendColors[metric.trend as keyof typeof trendColors]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-2xl font-bold ${
                        metric.trend === 'critical' ? 'text-red-600' :
                        metric.trend === 'warning' ? 'text-orange-600' :
                        metric.trend === 'positive' ? 'text-green-600' :
                        'text-gray-900'
                      }`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{metric.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team Activity Preview */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Active Assignments</h4>
              <span className="text-sm text-sky-600 hover:text-sky-700 cursor-pointer">View All</span>
            </div>
            <div className="space-y-3">
              {teamVisibility.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.priority === 'high' ? 'bg-red-500' :
                      item.priority === 'medium' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">{item.notice}</div>
                      <div className="text-sm text-gray-500">{item.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block">
                      <div className="text-sm text-gray-600">{item.assignee}</div>
                    </div>
                    <div className={`text-sm font-medium ${
                      item.priority === 'high' ? 'text-red-600' :
                      item.priority === 'medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      Due in {item.dueIn}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {operationalFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-200 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map((highlight, hIndex) => (
                        <span key={hIndex} className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Governance & Control */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-3xl p-8 md:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Built for Governance & Control
            </h3>
            <p className="text-sky-100 max-w-2xl mx-auto">
              Enterprise-grade compliance requires enterprise-grade governance. Every feature is designed with audit readiness and organizational control in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-sky-100">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Stats + CTA */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Stats */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h4 className="font-bold text-gray-900 mb-6">Why Finance Leaders Choose Us</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-1">30+</div>
                <div className="text-sm text-gray-600">Dashboard Metrics</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-1">AES-256</div>
                <div className="text-sm text-gray-600">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-sky-600 mb-1">India</div>
                <div className="text-sm text-gray-600">Data Residency</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center">
                <Shield className="h-7 w-7 text-sky-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Enterprise Ready</h4>
                <p className="text-sm text-gray-600">Security, compliance, and scale built-in</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Whether you manage 50 notices or 5,000, EffortlessInsight scales with your organization while maintaining
              the governance and control finance leaders require.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-200"
              >
                <Link href="/register">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                <Link href="#pricing">
                  View Enterprise Plans
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
