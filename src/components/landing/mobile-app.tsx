'use client'

import {
  Camera,
  Bell,
  Fingerprint,
  WifiOff,
  CheckSquare,
  MessageSquare,
  Download,
  Smartphone,
} from 'lucide-react'

const mobileFeatures = [
  {
    icon: Camera,
    title: 'Document Scanning',
    description: 'Scan GST notices directly from your phone with smart edge detection and auto-enhancement.',
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Real-time alerts for deadlines, task assignments, and important updates.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric Login',
    description: 'Secure access with Face ID or fingerprint authentication.',
  },
  {
    icon: WifiOff,
    title: 'Offline Support',
    description: 'Work without internet - changes sync automatically when connected.',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'View, update, and complete tasks on the go.',
  },
  {
    icon: MessageSquare,
    title: 'Collaboration',
    description: 'Add comments, view activity, and stay connected with your team.',
  },
]

export function MobileApp() {
  return (
    <section id="mobile" className="py-20 md:py-28 bg-gradient-to-b from-primary-50/50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Phone Mockup */}
          <div className="relative order-2 lg:order-1">
            <div className="relative mx-auto w-64 md:w-80">
              {/* Phone Frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* Status Bar */}
                  <div className="bg-gray-900 px-6 py-2 flex items-center justify-between">
                    <span className="text-white text-xs">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white/80 rounded-sm" />
                      <div className="w-4 h-4 border-2 border-white/80 rounded-sm" />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Good Morning</div>
                        <div className="text-sm text-gray-500">3 notices need attention</div>
                      </div>
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold text-sm">JD</span>
                      </div>
                    </div>

                    {/* Alert Card */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-red-700">URGENT</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">2 notices due this week</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-primary-600">12</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-orange-600">3</div>
                        <div className="text-xs text-gray-500">Due Soon</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-600">47</div>
                        <div className="text-xs text-gray-500">Done</div>
                      </div>
                    </div>

                    {/* Recent Notices */}
                    <div className="space-y-2">
                      {[
                        { type: 'DRC-01', risk: 'High', days: 5 },
                        { type: 'ASMT-10', risk: 'Medium', days: 12 },
                        { type: 'REG-17', risk: 'Low', days: 20 },
                      ].map((notice, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                notice.risk === 'High'
                                  ? 'bg-red-500'
                                  : notice.risk === 'Medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                            />
                            <span className="text-sm font-medium text-gray-900">{notice.type}</span>
                          </div>
                          <span className="text-xs text-gray-500">{notice.days}d left</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around">
                    {['Home', 'Scan', 'Notices', 'Tasks'].map((item, index) => (
                      <div key={index} className="text-center">
                        <div
                          className={`w-6 h-6 mx-auto mb-1 rounded-md ${
                            index === 0 ? 'bg-primary-100' : 'bg-gray-100'
                          }`}
                        />
                        <span className={`text-xs ${index === 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Notification */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Deadline Alert</div>
                    <div className="text-xs text-gray-500">DRC-01 due in 3 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              <Smartphone className="h-4 w-4" />
              Mobile Application
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Compliance On The Go
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Stay on top of GST notices from anywhere with our powerful iOS and Android app.
              Scan documents, manage tasks, and never miss a deadline.
            </p>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {mobileFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-0.5">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
