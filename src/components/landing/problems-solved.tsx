'use client'

import { X, Check, AlertTriangle, Clock, FileQuestion, Users } from 'lucide-react'

const problems = [
  {
    icon: FileQuestion,
    problem: 'Complex legal jargon in notices',
    oldWay: 'Spend hours trying to understand what the notice means',
    newWay: 'Get plain English and Hindi summaries in 30 seconds',
  },
  {
    icon: Clock,
    problem: 'Missing critical deadlines',
    oldWay: '25-30% deadline miss rate with manual tracking',
    newWay: 'Automatic deadline extraction with multi-channel reminders',
  },
  {
    icon: AlertTriangle,
    problem: 'Unclear risk assessment',
    oldWay: 'No visibility into potential penalties and tax at stake',
    newWay: 'AI-powered risk scoring with amount and deadline analysis',
  },
  {
    icon: Users,
    problem: 'Disconnected collaboration',
    oldWay: 'Email chains, scattered documents, lost context',
    newWay: 'Unified workspace with tasks, comments, and document tracking',
  },
]

export function ProblemsSolved() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            The Problem We Solve
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            GST Notices Shouldn&apos;t Be This Hard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Businesses typically take 5-10 days to take meaningful action on notices.
            We reduce that to minutes.
          </p>
        </div>

        {/* Problems Comparison */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {problems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {/* Problem Header */}
                <div className="bg-gray-50 px-6 py-4 flex items-center gap-4 border-b">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.problem}</h3>
                </div>

                {/* Before/After Comparison */}
                <div className="grid md:grid-cols-2">
                  {/* Old Way */}
                  <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="font-semibold text-red-700">Without EffortlessInsight</span>
                    </div>
                    <p className="text-gray-600 pl-10">{item.oldWay}</p>
                  </div>

                  {/* New Way */}
                  <div className="p-6 bg-green-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-green-700">With EffortlessInsight</span>
                    </div>
                    <p className="text-gray-600 pl-10">{item.newWay}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Impact Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-primary-600 mb-1">95%</div>
            <div className="text-sm text-gray-600">Faster Understanding</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
            <div className="text-sm text-gray-600">Deadline Compliance</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-1">10x</div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-1">Zero</div>
            <div className="text-sm text-gray-600">Missed Deadlines</div>
          </div>
        </div>
      </div>
    </section>
  )
}
