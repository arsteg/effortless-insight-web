'use client'

import { useState } from 'react'
import {
  MessageSquareText,
  Sparkles,
  FileEdit,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Bot,
  Languages,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const chatMessages = [
  { role: 'user', text: 'What is the deadline for this notice?' },
  { role: 'ai', text: 'The response deadline is 15th January 2025. You have 12 days remaining to submit your reply.' },
  { role: 'user', text: 'What documents do I need to submit?' },
  { role: 'ai', text: 'Based on DRC-01 requirements, you need:\n1. GSTR-3B returns for the disputed period\n2. Purchase invoices with ITC claimed\n3. E-way bills for interstate transactions\n4. Bank statements showing payments' },
]

const draftFeatures = [
  { icon: Zap, text: 'Generate drafts in under 30 seconds' },
  { icon: Languages, text: 'Available in English and Hindi' },
  { icon: Shield, text: 'Includes relevant GST sections & case law' },
  { icon: CheckCircle2, text: 'Professional tone with legal accuracy' },
]

export function AIAssistantFeatures() {
  const [activeTab, setActiveTab] = useState<'chat' | 'draft'>('chat')

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary-50 via-white to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            NEW AI-Powered Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Your AI Assistant for GST Notices
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Save hours of work with our intelligent AI assistant. Ask questions about any notice
            or generate professional response drafts instantly.
          </p>
        </div>

        {/* Feature Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquareText className="h-5 w-5" />
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'draft'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileEdit className="h-5 w-5" />
              Auto-Draft Response
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Feature Description */}
          <div className={activeTab === 'chat' ? 'block' : 'hidden lg:block'}>
            {activeTab === 'chat' ? (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-primary-600 font-semibold">
                  <MessageSquareText className="h-6 w-6" />
                  AI Chat Assistant
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Have a Conversation with Your Notice
                </h3>
                <p className="text-lg text-gray-600">
                  No more reading through complex legal jargon. Simply ask questions in plain
                  language and get instant, accurate answers about any GST notice.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Understand Complex Notices</div>
                      <div className="text-gray-600">Ask &quot;What does this notice mean?&quot; and get a simple explanation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Get Deadline Clarity</div>
                      <div className="text-gray-600">Know exactly when to respond and what happens if you miss it</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Document Checklist</div>
                      <div className="text-gray-600">Get a tailored list of documents you need to gather</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button asChild size="lg" className="group">
                    <Link href="/register">
                      Try AI Chat Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-purple-600 font-semibold">
                  <FileEdit className="h-6 w-6" />
                  Auto-Draft Response
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Generate Professional Responses in Seconds
                </h3>
                <p className="text-lg text-gray-600">
                  Stop spending hours drafting responses. Our AI analyzes the notice, understands
                  the requirements, and generates a professional response draft you can edit and submit.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {draftFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Icon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                    <Clock className="h-5 w-5" />
                    Save 4+ Hours Per Notice
                  </div>
                  <p className="text-purple-600 text-sm">
                    Average time saved compared to manual drafting. Review, customize, and submit faster.
                  </p>
                </div>

                <div className="pt-4">
                  <Button asChild size="lg" variant="default" className="group bg-purple-600 hover:bg-purple-700">
                    <Link href="/register">
                      Try Auto-Draft Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Interactive Demo */}
          <div className="relative">
            {activeTab === 'chat' ? (
              /* Chat Demo */
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">AI Notice Assistant</div>
                      <div className="text-primary-200 text-sm">Ask anything about your notice</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 h-[360px] overflow-y-auto bg-gray-50">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about this notice..."
                      className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-primary-500"
                      disabled
                    />
                    <button className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Draft Demo */
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Draft Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Auto-Draft Generator</div>
                        <div className="text-purple-200 text-sm">DRC-01 Response Draft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white text-xs font-medium">Generated</span>
                    </div>
                  </div>
                </div>

                {/* Draft Content */}
                <div className="p-6 h-[360px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <p className="font-semibold text-gray-900">To,</p>
                    <p>The Assistant Commissioner of GST<br />
                    Division III, Mumbai</p>

                    <p className="font-semibold text-gray-900 mt-4">Subject: Reply to Show Cause Notice DRC-01 dated 03/01/2025</p>

                    <p className="mt-4">Respected Sir/Madam,</p>

                    <p>With reference to the above-mentioned notice, we hereby submit our reply as under:</p>

                    <p><strong>1. Background:</strong> We are a registered taxpayer under GST bearing GSTIN 27XXXXX1234X1Z5 engaged in the business of...</p>

                    <p><strong>2. Our Submission:</strong> The Input Tax Credit (ITC) claimed in the return period July 2024 to September 2024 is legitimate and supported by valid tax invoices as per Section 16 of CGST Act, 2017...</p>

                    <p><strong>3. Supporting Documents:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>GSTR-2A reconciliation statement</li>
                      <li>Purchase invoices with supplier GSTIN verification</li>
                      <li>Bank payment proofs for the transactions</li>
                    </ul>
                  </div>
                </div>

                {/* Draft Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">478 words</span> &bull; Generated in 28s
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Edit Draft</Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Use This Draft</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              Powered by GPT-4
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-primary-600">10,000+</div>
            <div className="text-gray-600 text-sm mt-1">Questions Answered</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">5,000+</div>
            <div className="text-gray-600 text-sm mt-1">Drafts Generated</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600">4 hrs</div>
            <div className="text-gray-600 text-sm mt-1">Avg. Time Saved</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-orange-600">98%</div>
            <div className="text-gray-600 text-sm mt-1">User Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}
