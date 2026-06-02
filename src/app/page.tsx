import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            EffortlessInsight
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered GST Notice
          <span className="text-primary-600"> Operating System</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform how your business handles tax compliance notices.
          Understand notices instantly, assess risk, and respond confidently.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Start Free Trial
          </Link>
          <Link href="#features" className="btn-secondary text-lg px-8 py-3">
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Handle GST Notices
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Instant Understanding"
            description="Upload any GST notice and get a plain English explanation in under 30 seconds. No more legal jargon confusion."
            icon="⚡"
          />
          <FeatureCard
            title="Risk Assessment"
            description="AI-powered risk scoring helps you prioritize notices. Know exactly what's at stake - tax, penalties, and deadlines."
            icon="📊"
          />
          <FeatureCard
            title="Never Miss Deadlines"
            description="Automatic deadline tracking with smart reminders via email, SMS, and WhatsApp. Stay compliant effortlessly."
            icon="⏰"
          />
          <FeatureCard
            title="CA Collaboration"
            description="Invite your CA to collaborate on notices. Share documents, discuss responses, and track progress together."
            icon="🤝"
          />
          <FeatureCard
            title="Response Drafting"
            description="AI-assisted response generation with relevant document checklists. Respond professionally every time."
            icon="✍️"
          />
          <FeatureCard
            title="Compliance History"
            description="Build your organization's compliance knowledge base. Learn from past notices to prevent future ones."
            icon="📚"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Compliance?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of businesses managing GST notices effortlessly.
          </p>
          <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12">
        <div className="text-center text-gray-500">
          <p>&copy; 2026 EffortlessInsight. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="card p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
