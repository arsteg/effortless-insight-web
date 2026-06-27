'use client'

import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  Clock,
} from 'lucide-react'

export function AnalyticsDashboards() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Analytics & Reporting
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Data-Driven Compliance Insights
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get complete visibility into your compliance status with comprehensive
              dashboards and customizable reports.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: BarChart3,
                  title: '30+ Dashboard Metrics',
                  description:
                    'Track active notices, upcoming deadlines, team performance, and compliance trends at a glance.',
                },
                {
                  icon: PieChart,
                  title: 'Visual Analytics',
                  description:
                    'Interactive charts showing notice distribution by status, priority, type, and GSTIN.',
                },
                {
                  icon: TrendingUp,
                  title: 'Trend Analysis',
                  description:
                    'Monthly trends, compliance patterns, and predictive insights for proactive management.',
                },
                {
                  icon: Calendar,
                  title: 'Scheduled Reports',
                  description:
                    'Automated daily, weekly, or monthly reports delivered to your inbox.',
                },
                {
                  icon: Download,
                  title: 'Export Options',
                  description:
                    'Export reports in CSV, Excel, or PDF format for offline analysis and sharing.',
                },
              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-8">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900">Compliance Dashboard</h4>
                  <p className="text-sm text-gray-500">Last updated: 2 min ago</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg font-medium">
                    This Month
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Active Notices', value: '24', trend: '+3', color: 'primary' },
                  { label: 'Due This Week', value: '5', trend: '-2', color: 'orange' },
                  { label: 'Completed', value: '156', trend: '+12', color: 'green' },
                  { label: 'Compliance Score', value: '94%', trend: '+2%', color: 'purple' },
                ].map((metric, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <div className={`text-2xl font-bold text-${metric.color}-600 mb-1`}>
                      {metric.value}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{metric.label}</span>
                      <span className="text-xs text-green-600">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">By Status</h5>
                  <div className="space-y-2">
                    {[
                      { status: 'Analyzed', value: 45, color: 'bg-blue-500' },
                      { status: 'In Progress', value: 30, color: 'bg-orange-500' },
                      { status: 'Responded', value: 25, color: 'bg-green-500' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-xs text-gray-600 flex-1">{item.status}</span>
                        <span className="text-xs font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">By Priority</h5>
                  <div className="space-y-2">
                    {[
                      { priority: 'Critical', value: 10, color: 'bg-red-500' },
                      { priority: 'High', value: 25, color: 'bg-orange-500' },
                      { priority: 'Medium', value: 40, color: 'bg-yellow-500' },
                      { priority: 'Low', value: 25, color: 'bg-green-500' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-xs text-gray-600 flex-1">{item.priority}</span>
                        <span className="text-xs font-medium text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="mt-4 bg-white rounded-xl border border-gray-100 p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming Deadlines
                </h5>
                <div className="space-y-2">
                  {[
                    { notice: 'DRC-01 #2024-1234', days: 3, amount: '2.45L' },
                    { notice: 'ASMT-10 #2024-5678', days: 7, amount: '1.20L' },
                    { notice: 'REG-17 #2024-9012', days: 12, amount: '-' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{item.notice}</span>
                      <span className="text-gray-500">{item.amount}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          item.days <= 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.days} days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Element */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Export Ready</div>
                  <div className="text-xs text-gray-500">CSV, Excel, PDF</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
