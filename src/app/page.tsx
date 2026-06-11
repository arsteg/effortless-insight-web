import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  BarChart3,
  Clock,
  Users,
  FileEdit,
  BookOpen,
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="EffortlessInsight"
              width={280}
              height={56}
              className="h-12 w-auto md:h-14"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/login"
              className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight leading-tight">
          AI-Powered GST Notice
          <span className="text-primary-600"> Operating System</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform how your business handles tax compliance notices.
          Understand notices instantly, assess risk, and respond confidently.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-primary text-white text-base md:text-lg px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto bg-gray-100 text-gray-700 text-base md:text-lg px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 tracking-tight">
          Everything You Need to Handle GST Notices
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            title="Instant Understanding"
            description="Upload any GST notice and get a plain English explanation in under 30 seconds. No more legal jargon confusion."
            icon={Zap}
          />
          <FeatureCard
            title="Risk Assessment"
            description="AI-powered risk scoring helps you prioritize notices. Know exactly what's at stake - tax, penalties, and deadlines."
            icon={BarChart3}
          />
          <FeatureCard
            title="Never Miss Deadlines"
            description="Automatic deadline tracking with smart reminders via email, SMS, and WhatsApp. Stay compliant effortlessly."
            icon={Clock}
          />
          <FeatureCard
            title="CA Collaboration"
            description="Invite your CA to collaborate on notices. Share documents, discuss responses, and track progress together."
            icon={Users}
          />
          <FeatureCard
            title="Response Drafting"
            description="AI-assisted response generation with relevant document checklists. Respond professionally every time."
            icon={FileEdit}
          />
          <FeatureCard
            title="Compliance History"
            description="Build your organization's compliance knowledge base. Learn from past notices to prevent future ones."
            icon={BookOpen}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 tracking-tight">
            Ready to Transform Your Compliance?
          </h2>
          <p className="text-primary-100 mb-6 md:mb-8 text-base md:text-lg">
            Join thousands of businesses managing GST notices effortlessly.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700">
                Contact Us
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} EffortlessInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}
