import { Inbox, Sparkles, BellRing, FileCheck2 } from 'lucide-react'
import { ChevronDown } from 'lucide-react'

const promises = [
  {
    icon: Inbox,
    title: 'Every notice, found for you',
    body: 'We watch the GST portal so you don’t have to. New notices appear in your dashboard automatically — no more discovering them weeks late.',
    proof: 'Works across all your GSTINs',
    details: [
      'One-time OTP authorization per GSTIN — your portal password is never asked for or stored',
      'Automatic sync every 6 hours, configurable from 1 to 24 hours, plus manual sync anytime',
      'Connect any number of GSTINs — branches, states and clients under one account',
    ],
  },
  {
    icon: Sparkles,
    title: 'Explained in plain English',
    body: 'Within minutes you know what the notice says, how serious it is, and exactly what to do next. Ask follow-up questions in normal language.',
    proof: 'No tax dictionary required',
    details: [
      'Covers 150+ notice types across 11 GST categories — DRC, ASMT, REG, audit, refund, appeals and more',
      'Risk score from 0–100 built on six weighted factors: amount, deadline urgency, notice type, penalty exposure, history and complexity',
      'Summaries in English and Hindi, with the relevant GST sections, rules and circulars cited',
    ],
  },
  {
    icon: BellRing,
    title: 'Deadlines, tracked and chased',
    body: 'WhatsApp and email reminders before every due date — for you and your team. Due dates stop depending on someone remembering.',
    proof: 'Reminders at 7, 3 and 1 day before',
    details: [
      'Response deadlines extracted automatically from every notice and placed on your compliance calendar',
      'Alerts via email, push notification, in-app and WhatsApp — each user picks their channels',
      'Escalation rules notify managers when an assigned notice is at risk of slipping',
    ],
  },
  {
    icon: FileCheck2,
    title: 'Replies drafted for you',
    body: 'A professional draft response, built from your notice, ready in minutes. Review it, share it with your CA, and file with confidence.',
    proof: 'Your CA polishes, not starts from zero',
    details: [
      'Drafts follow proper reply structure — reference, grounds, annexure list and prayer',
      'Choose the tone and language, including Hindi, before generating',
      'Relevant CGST Act sections and precedents cited inline, ready for your CA’s review',
    ],
  },
]

/**
 * The four things a visitor should remember — each expandable into the
 * concrete capability facts behind the promise (scan first, depth on demand).
 */
export function FourPromises() {
  return (
    <section id="product" className="scroll-mt-header bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Four promises. Kept automatically.
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
          {promises.map((promise) => (
            <div
              key={promise.title}
              className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-200/70">
                <promise.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-950">{promise.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{promise.body}</p>
              <p className="mt-4 text-sm font-medium text-primary-700">{promise.proof}</p>

              <details className="mt-4 border-t border-gray-100 pt-3 [&_svg.chevron]:open:rotate-180">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary-700 [&::-webkit-details-marker]:hidden">
                  How, exactly?
                  <ChevronDown className="chevron h-4 w-4 transition-transform" aria-hidden />
                </summary>
                <ul className="mt-3 space-y-2">
                  {promise.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-sm leading-relaxed text-gray-600">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400" aria-hidden />
                      {detail}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
