'use client'

import {
  Scan,
  Brain,
  Target,
  Shield,
  Languages,
  CheckCircle,
  Sparkles,
  Database,
} from 'lucide-react'

const aiFeatures = [
  {
    icon: Scan,
    title: 'Advanced OCR',
    description: 'Google Document AI with Azure fallback for 95%+ text extraction accuracy.',
    stats: '95%+ accuracy',
  },
  {
    icon: Target,
    title: 'Entity Extraction',
    description: 'Automatically extracts GSTIN, PAN, dates, amounts, and section references.',
    stats: '92%+ accuracy',
  },
  {
    icon: Brain,
    title: 'Notice Classification',
    description: 'Classifies notices into 50+ types across 8 GST categories using hybrid ML.',
    stats: '90%+ accuracy',
  },
  {
    icon: Shield,
    title: 'Risk Scoring',
    description: 'Multi-factor risk assessment considering amount, deadline, type, and history.',
    stats: '6 weighted factors',
  },
  {
    icon: Database,
    title: 'RAG Retrieval',
    description: 'Vector search retrieves relevant GST rules, circulars, and precedents.',
    stats: '3072-dim embeddings',
  },
  {
    icon: Sparkles,
    title: 'LLM Analysis',
    description: 'GPT-4 powered analysis generates summaries, action items, and recommendations.',
    stats: '<2% hallucination',
  },
  {
    icon: Languages,
    title: 'Hindi Translation',
    description: 'Automatic translation of summaries and key findings to Hindi.',
    stats: 'Real-time',
  },
  {
    icon: CheckCircle,
    title: 'Fact Verification',
    description: 'Built-in hallucination detection and fact-checking for reliable outputs.',
    stats: '5-point verification',
  },
]

export function AICapabilities() {
  return (
    <section id="ai" className="py-20 md:py-28 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">
            <Sparkles className="h-4 w-4" />
            AI-Powered Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enterprise-Grade AI Engine
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our AI pipeline combines multiple state-of-the-art models to deliver
            accurate, reliable analysis you can trust.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 hover:bg-gray-800 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{feature.description}</p>
                <div className="inline-flex items-center text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-1 rounded">
                  {feature.stats}
                </div>
              </div>
            )
          })}
        </div>

        {/* AI Architecture Diagram */}
        <div className="bg-gray-800/50 rounded-3xl border border-gray-700 p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            AI Processing Architecture
          </h3>

          <div className="relative">
            {/* Pipeline Flow */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500/20 via-primary-500 to-primary-500/20 -translate-y-1/2" />

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { name: 'Input', icon: '📄', desc: 'PDF/Image' },
                { name: 'OCR', icon: '🔍', desc: 'Text Extract' },
                { name: 'Entity', icon: '📋', desc: 'Data Parse' },
                { name: 'Classify', icon: '🏷️', desc: 'Categorize' },
                { name: 'RAG', icon: '📚', desc: 'Context' },
                { name: 'LLM', icon: '🤖', desc: 'Analysis' },
                { name: 'Verify', icon: '✓', desc: 'Validate' },
                { name: 'Report', icon: '📊', desc: 'Output' },
              ].map((stage, index) => (
                <div key={index} className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-center text-2xl relative z-10">
                    {stage.icon}
                  </div>
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs text-gray-500">{stage.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <div className="text-2xl font-bold text-primary-400">&lt;60s</div>
              <div className="text-sm text-gray-400">End-to-End Time</div>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <div className="text-2xl font-bold text-green-400">95%+</div>
              <div className="text-sm text-gray-400">OCR Accuracy</div>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <div className="text-2xl font-bold text-orange-400">&lt;2%</div>
              <div className="text-sm text-gray-400">Hallucination Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-xl">
              <div className="text-2xl font-bold text-purple-400">98%</div>
              <div className="text-sm text-gray-400">Deadline Detection</div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Powered by Google Document AI, OpenAI GPT-4, and pgvector for enterprise reliability
          </p>
        </div>
      </div>
    </section>
  )
}
