import {
  LandingHeader,
  Hero,
  ProductOverview,
  ProblemsSolved,
  GstnIntegration,
  CoreCapabilities,
  HowItWorks,
  AICapabilities,
  AnalyticsDashboards,
  MobileApp,
  SecurityScalability,
  WhyChooseUs,
  PricingPreview,
  CTASection,
  LandingFooter,
} from '@/components/landing'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Sticky Header */}
      <LandingHeader />

      {/* Hero Section - Compelling headline, value prop, CTAs */}
      <Hero />

      {/* Product Overview - What the platform does */}
      <ProductOverview />

      {/* Problems Solved - Pain points and solutions */}
      <ProblemsSolved />

      {/* GST Portal Integration - NEW Featured Section */}
      <div id="gstn-integration" className="scroll-mt-header">
        <GstnIntegration />
      </div>

      {/* How It Works - Step-by-step workflow */}
      <div id="how-it-works" className="scroll-mt-header">
        <HowItWorks />
      </div>

      {/* Core Capabilities - All features */}
      <div id="features" className="scroll-mt-header">
        <CoreCapabilities />
      </div>

      {/* AI Capabilities - Showcase AI engine */}
      <div id="ai" className="scroll-mt-header">
        <AICapabilities />
      </div>

      {/* Analytics & Dashboards - Reporting features */}
      <AnalyticsDashboards />

      {/* Mobile App - Mobile capabilities */}
      <div id="mobile" className="scroll-mt-header">
        <MobileApp />
      </div>

      {/* Security & Scalability - Technical strengths */}
      <SecurityScalability />

      {/* Why Choose Us - Competitive advantages */}
      <WhyChooseUs />

      {/* Pricing Preview - Plan overview */}
      <PricingPreview />

      {/* CTA Section - Final conversion push */}
      <CTASection />

      {/* Footer */}
      <LandingFooter />
    </main>
  )
}
