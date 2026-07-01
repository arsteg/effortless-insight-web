'use client'

import { Upload, Cpu, FileCheck, Send, Link2 } from 'lucide-react'
import { WorkflowDiagram } from './workflow-diagram'

const steps = [
  {
    icon: Link2,
    title: 'Auto-Fetch or Upload',
    description:
      'Connect to GST Portal for automatic notice fetching, or upload manually via PDF, image, or mobile scan.',
    duration: 'Automatic',
  },
  {
    icon: Cpu,
    title: 'AI Analysis',
    description:
      'Our AI engine processes the notice with OCR, extracts key data, classifies the notice type, and calculates risk.',
    duration: '~30 seconds',
  },
  {
    icon: FileCheck,
    title: 'Review & Collaborate',
    description:
      'Review the AI-generated report, assign tasks to team members, request documents, and plan your response.',
    duration: 'Your pace',
  },
  {
    icon: Send,
    title: 'Respond & Track',
    description:
      'Submit your response with AI-drafted content, track status, and maintain compliance history.',
    duration: 'Before deadline',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-b from-white to-primary-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            From Notice to Resolution in Four Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our streamlined workflow transforms complex GST compliance into a simple,
            manageable process that anyone can follow.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="mb-16">
          <WorkflowDiagram steps={steps} />
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2">
            {/* Left: Processing Pipeline */}
            <div className="p-8 md:p-10 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <h3 className="text-2xl font-bold mb-6">
                AI Processing Pipeline
              </h3>
              <p className="text-primary-100 mb-8">
                Behind the scenes, our 8-stage AI pipeline processes your notice
                with enterprise-grade accuracy.
              </p>

              <div className="space-y-4">
                {[
                  { stage: 'Preprocessing', time: '~5s', desc: 'Format detection, quality check' },
                  { stage: 'OCR Processing', time: '~15s', desc: 'Text and table extraction' },
                  { stage: 'Entity Extraction', time: '~5s', desc: 'GSTIN, dates, amounts, sections' },
                  { stage: 'Classification', time: '~3s', desc: 'Notice type and category' },
                  { stage: 'RAG Retrieval', time: '~5s', desc: 'Legal context and precedents' },
                  { stage: 'LLM Analysis', time: '~20s', desc: 'Summary and recommendations' },
                  { stage: 'Verification', time: '~5s', desc: 'Fact-checking and validation' },
                  { stage: 'Report Generation', time: '~2s', desc: 'Final report assembly' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.stage}</span>
                        <span className="text-primary-200 text-sm">{item.time}</span>
                      </div>
                      <span className="text-primary-200 text-sm">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Processing Time</span>
                  <span className="text-2xl font-bold">&lt;60 seconds</span>
                </div>
              </div>
            </div>

            {/* Right: Output Preview */}
            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                What You Get
              </h3>

              <div className="space-y-6">
                {[
                  {
                    title: 'Executive Summary',
                    desc: 'Plain English explanation of what the notice is about and what it means for you.',
                    tag: 'English & Hindi',
                  },
                  {
                    title: 'Risk Assessment',
                    desc: 'Clear risk score (0-100) with breakdown of tax amount, penalties, and deadline urgency.',
                    tag: 'AI-Powered',
                  },
                  {
                    title: 'Action Items',
                    desc: 'Prioritized checklist of what you need to do, with suggested due dates and assignees.',
                    tag: 'Ready to Act',
                  },
                  {
                    title: 'Required Documents',
                    desc: 'List of documents you need to gather for your response.',
                    tag: 'Checklist',
                  },
                  {
                    title: 'Legal References',
                    desc: 'Relevant GST sections, rules, and circulars cited in the notice.',
                    tag: 'Context',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
