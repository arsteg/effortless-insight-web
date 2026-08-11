import Link from 'next/link'
import { ArrowRight, ChevronDown, FileText, Gauge, ListChecks, FolderOpen, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    number: '01',
    title: 'Connect once',
    body: 'Verify your GSTIN with an OTP — the same one the portal sends you. We never see or store your portal password.',
    time: '2 minutes',
  },
  {
    number: '02',
    title: 'We watch the portal',
    body: 'New notices are fetched, read, and explained automatically. Deadlines go on your calendar and your WhatsApp.',
    time: 'Runs by itself',
  },
  {
    number: '03',
    title: 'You respond with confidence',
    body: 'Open the plain-English summary, review the drafted reply, loop in your CA if you want a second pair of eyes. Done.',
    time: '~15 minutes per notice',
  },
]

// The AI pipeline, in plain words — depth for the visitor who wants to know
// what actually happens between sync and report. Deliberately no per-stage
// timings: we don't publish speed numbers we haven't measured.
const pipeline = [
  { stage: 'Document read', desc: 'The notice PDF or scan is read, including tables and stamps' },
  { stage: 'Key details extracted', desc: 'GSTIN, amounts, dates, notice number and cited sections identified' },
  { stage: 'Notice classified', desc: 'Matched against 150+ notice types across 11 GST categories' },
  { stage: 'Legal context matched', desc: 'Relevant GST rules, circulars and precedents pulled in' },
  { stage: 'Analysis written', desc: 'Summary, risk assessment and action plan drafted in English and Hindi' },
  { stage: 'Facts double-checked', desc: 'A verification pass checks every claim against the notice itself' },
  { stage: 'Report ready', desc: 'Your plain-English report lands in the dashboard' },
]

const outputs = [
  { icon: FileText, label: 'Executive summary', sub: 'English & Hindi' },
  { icon: Gauge, label: 'Risk assessment', sub: 'Score 0–100, Low → Critical' },
  { icon: ListChecks, label: 'Action items', sub: 'Prioritized, with due dates' },
  { icon: FolderOpen, label: 'Required documents', sub: 'What to collect, per notice' },
  { icon: Scale, label: 'Legal references', sub: 'Sections, rules & circulars' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-header bg-white py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Set it up before your chai gets cold
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/60"
            >
              <span
                aria-hidden
                className="absolute -right-4 -top-6 text-[5.5rem] font-extrabold leading-none text-primary-50"
              >
                {step.number}
              </span>
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white shadow-md shadow-primary-200/70">
                {step.number}
              </span>
              <h3 className="relative mt-4 text-lg font-semibold text-gray-950">{step.title}</h3>
              <p className="relative mt-2 leading-relaxed text-gray-600">{step.body}</p>
              <p className="relative mt-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                {step.time}
              </p>
            </div>
          ))}
        </div>

        {/* What you get from every analysis */}
        <div className="mx-auto mt-10 max-w-5xl">
          <p className="text-center text-sm font-semibold text-gray-900">
            Every analyzed notice comes back with
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {outputs.map((o) => (
              <div key={o.label} className="rounded-2xl border border-gray-200 bg-white p-5 text-center">
                <o.icon className="mx-auto h-5 w-5 text-primary-600" aria-hidden />
                <p className="mt-2.5 text-sm font-semibold text-gray-900">{o.label}</p>
                <p className="mt-1 text-xs text-gray-500">{o.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Level 2: the sixty-second pipeline */}
        <details className="group mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-white [&_svg.chevron]:open:rotate-180">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
            What actually happens during the analysis?
            <ChevronDown className="chevron h-5 w-5 flex-shrink-0 text-gray-400 transition-transform" aria-hidden />
          </summary>
          <div className="border-t border-gray-100 px-6 py-5">
            <ol className="space-y-3">
              {pipeline.map((p, i) => (
                <li key={p.stage} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{p.stage}</p>
                    <p className="text-sm text-gray-600">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium text-gray-700">
              All of it automatic, from portal to plain English — with a
              verification pass so the analysis sticks to what the notice
              actually says.
            </p>
          </div>
        </details>

        <div className="mt-12 text-center">
          <Button size="lg" asChild className="px-8 py-6 text-base">
            <Link href="/register">
              Connect your first GSTIN free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
