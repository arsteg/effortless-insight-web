'use client'

import { MessageCircle, Shield, Bell, Clock, CheckCircle2, Smartphone, Zap, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const benefits = [
  {
    icon: MessageCircle,
    title: 'Conversational Interface',
    description: 'Check notice status, view deadlines, and get updates through simple WhatsApp commands.',
  },
  {
    icon: Bell,
    title: 'Proactive Alerts',
    description: 'Receive deadline reminders, high-risk notice alerts, and task assignments instantly.',
  },
  {
    icon: Shield,
    title: 'Secure Account Linking',
    description: 'Link your WhatsApp with OTP verification. Your data stays protected with end-to-end security.',
  },
  {
    icon: Zap,
    title: '24/7 Availability',
    description: 'Get instant updates anytime. No need to open the app - your compliance assistant is always ready.',
  },
]

const commands = [
  { command: 'status', description: 'Get your compliance dashboard summary' },
  { command: 'notices', description: 'View recent pending notices' },
  { command: 'deadlines', description: 'See upcoming deadlines grouped by urgency' },
  { command: 'tasks', description: 'View your assigned tasks' },
  { command: 'help', description: 'See all available commands' },
]

const notifications = [
  { type: 'Deadline Reminder', message: 'DRC-01 notice due in 3 days', time: '9:00 AM' },
  { type: 'High Risk Alert', message: 'New high-priority notice detected', time: '2:30 PM' },
  { type: 'Task Assigned', message: 'Review ITC mismatch documents', time: '4:15 PM' },
]

export function WhatsAppBot() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            NEW FEATURE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            WhatsApp Bot for Instant Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay on top of your GST compliance without opening the app. Get deadline reminders,
            check notice status, and receive alerts - all through WhatsApp.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative">
            <div className="bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-gray-900 max-w-sm mx-auto">
              {/* Phone Header */}
              <div className="bg-emerald-600 rounded-t-[2rem] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">EffortlessInsight</div>
                  <div className="text-emerald-100 text-xs">Business Account</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full" />
                  <div className="text-emerald-100 text-xs">Online</div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="bg-[#e5ddd5] p-4 min-h-[400px] space-y-3 rounded-b-[2rem]">
                {/* Incoming message - Welcome */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-sm text-gray-800">
                      Welcome to EffortlessInsight! Reply <span className="font-semibold">help</span> to see available commands.
                    </p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">9:00 AM</p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-emerald-100 rounded-lg rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-sm text-gray-800">status</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">9:01 AM</p>
                  </div>
                </div>

                {/* Bot response - Status */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Your Compliance Summary</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p>Pending Notices: <span className="font-semibold">5</span></p>
                      <p>Due This Week: <span className="font-semibold text-orange-600">2</span></p>
                      <p>High Risk: <span className="font-semibold text-red-600">1</span></p>
                    </div>
                    <p className="text-[10px] text-gray-500 text-right mt-2">9:01 AM</p>
                  </div>
                </div>

                {/* Alert notification */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm border-l-4 border-orange-500">
                    <p className="text-xs font-semibold text-orange-600 mb-1">Deadline Reminder</p>
                    <p className="text-sm text-gray-800">
                      DRC-01 notice response due in <span className="font-semibold">3 days</span>
                    </p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">9:15 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            <div
              className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 animate-bounce hidden lg:block"
              style={{ animationDuration: '2s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">High Risk Alert</div>
                  <div className="text-xs text-gray-500">New notice detected</div>
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-100 animate-bounce hidden lg:block"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">Task Completed</div>
                  <div className="text-xs text-gray-500">Response submitted</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commands Section */}
        <div className="mt-20">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-8">
            Simple Commands, Powerful Insights
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {commands.map((cmd, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <code className="text-emerald-600 font-mono font-bold text-lg">{cmd.command}</code>
                <p className="text-xs text-gray-600 mt-2">{cmd.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">100%</div>
            <div className="text-sm text-gray-600">Free to Use</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Always Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">&lt;1 min</div>
            <div className="text-sm text-gray-600">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Missed Deadlines</div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
            <Link href="/register">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Free Trial - Connect WhatsApp
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Works with any WhatsApp account. No additional apps required.
          </p>
        </div>
      </div>
    </section>
  )
}
