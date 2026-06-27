'use client'

import {
  Rocket,
  Target,
  Clock,
  Coins,
  HeartHandshake,
  TrendingUp,
} from 'lucide-react'

const reasons = [
  {
    icon: Clock,
    title: '10x Time Savings',
    description:
      'Reduce notice processing time from days to minutes. Let AI handle the heavy lifting.',
    stat: '95% faster',
  },
  {
    icon: Target,
    title: 'Zero Missed Deadlines',
    description:
      'Automatic deadline detection and multi-channel reminders ensure you never miss a deadline.',
    stat: '98% compliance',
  },
  {
    icon: Coins,
    title: 'Reduce Penalties',
    description:
      'Proactive risk assessment and timely responses help minimize penalties and interest.',
    stat: 'Up to 50% savings',
  },
  {
    icon: HeartHandshake,
    title: 'Better CA Collaboration',
    description:
      'Unified workspace for seamless collaboration between your team and tax professionals.',
    stat: 'Real-time sync',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Decisions',
    description:
      'Comprehensive analytics and reporting for better compliance strategy.',
    stat: '30+ metrics',
  },
  {
    icon: Rocket,
    title: 'Start in Minutes',
    description:
      'No complex setup required. Upload your first notice and get insights immediately.',
    stat: '2-min setup',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Why EffortlessInsight
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Smarter Way to Handle GST Compliance
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join businesses across India who have transformed their compliance workflow
            and eliminated the stress of GST notices.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div
                key={index}
                className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute top-8 right-8 text-4xl font-bold text-gray-100 group-hover:text-primary-100 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-600 mb-4">{reason.description}</p>

                <div className="inline-flex items-center text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {reason.stat}
                </div>
              </div>
            )
          })}
        </div>

        {/* ROI Calculator Preview */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Calculate Your ROI
              </h3>
              <p className="text-primary-100 mb-6">
                See how much time and money you can save with EffortlessInsight.
                Most businesses see ROI within the first month.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Average time saved per notice', value: '4 hours' },
                  { label: 'Penalty reduction potential', value: 'Up to 50%' },
                  { label: 'Team productivity increase', value: '3x' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-white/20 pb-2">
                    <span className="text-primary-100">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-center mb-6">
                <div className="text-sm text-primary-200 mb-2">Estimated Annual Savings</div>
                <div className="text-5xl font-bold">Rs. 2.4L+</div>
                <div className="text-sm text-primary-200 mt-2">For a business with 50+ notices/year</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-primary-200">Time savings value</span>
                  <span>Rs. 1,60,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-200">Penalty avoidance</span>
                  <span>Rs. 60,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-200">Productivity gains</span>
                  <span>Rs. 20,000</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20 font-semibold">
                  <span>Total Annual Benefit</span>
                  <span>Rs. 2,40,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
