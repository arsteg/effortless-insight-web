'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'How does EffortlessInsight access GST notices?',
    answer:
      'We connect to the official GST Portal through licensed GST Suvidha Provider (GSP) infrastructure — the same authorized pathway used by major enterprise tax platforms. After you authorize access via OTP verification, we securely retrieve notices on your behalf using encrypted session tokens. We never scrape or use unauthorized access methods.',
  },
  {
    question: 'Do you store my GST Portal password?',
    answer:
      'No, never. We use OTP-based authentication only. When you connect your GSTIN, an OTP is sent to your GST-registered mobile number. After verification, we store only encrypted session tokens — your password is never transmitted to or stored in our systems.',
  },
  {
    question: 'Is this an official GST integration?',
    answer:
      'We integrate through officially licensed GST Suvidha Providers (GSPs) — the government-authorized intermediaries for GST API access. This is the same infrastructure used by major accounting software and enterprise tax platforms across India. We do not claim to be affiliated with or endorsed by the GST Council or GSTN.',
  },
  {
    question: 'How often are notices synchronized?',
    answer:
      'By default, notices are automatically synchronized every 6 hours. You can configure this interval (from 1 to 24 hours) based on your needs, or trigger manual syncs anytime. New notices are processed by our AI immediately upon retrieval.',
  },
  {
    question: 'Can I connect multiple GSTINs?',
    answer:
      'Yes. You can connect multiple GSTINs under a single organization account. Each GSTIN requires separate OTP authorization. This is ideal for businesses with multiple registrations or CA firms managing clients.',
  },
  {
    question: 'What happens if the GST Portal is unavailable?',
    answer:
      'If the GST Portal is temporarily unavailable during a scheduled sync, we automatically retry with exponential backoff. After 5 consecutive failures, the connection is temporarily paused and automatically resumes after 24 hours. You receive notifications about sync status.',
  },
  {
    question: 'Can my CA or tax consultant access the notices?',
    answer:
      'Yes. EffortlessInsight supports role-based access control. You can invite CAs, tax consultants, or team members with specific permissions. External collaborators can view and respond to notices without accessing other organizational data.',
  },
  {
    question: 'Is my data encrypted?',
    answer:
      'Yes. All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.2+. Sensitive fields like session tokens are additionally encrypted at the field level. Your data is stored exclusively in India (AWS ap-south-1) and never leaves Indian jurisdiction.',
  },
  {
    question: 'How do you handle compliance and audits?',
    answer:
      'Every synchronization, notice retrieval, user action, and access event is logged with timestamps and user identification. These audit logs are retained for compliance purposes and can be exported for internal or external audits. We maintain 8-year data retention as per GST regulations.',
  },
  {
    question: 'What if I want to disconnect my GSTIN?',
    answer:
      'You can disconnect any GSTIN at any time from your dashboard. Upon disconnection, the encrypted session tokens are immediately revoked. Your historical notice data remains accessible unless you explicitly request deletion.',
  },
]

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
        )}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export function TrustFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            <HelpCircle className="h-4 w-4" />
            Common Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Security & Integration FAQ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answers to common questions from CFOs, tax professionals, and compliance teams
            about how we securely integrate with the GST Portal.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-6 py-3 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-600" />
            <span>
              Have more questions?{' '}
              <a href="mailto:security@effortlessinsight.in" className="text-primary-600 font-medium hover:underline">
                Contact our security team
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
