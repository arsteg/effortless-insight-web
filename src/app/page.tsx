import {
  LandingHeader,
  Hero,
  ProductOverview,
  ProblemsSolved,
  AIAssistantFeatures,
  GstnIntegration,
  GstPortalTrust,
  WhatsAppBot,
  BusinessOwnerSection,
  TaxProfessionalSection,
  FinanceTeamSection,
  CoreCapabilities,
  HowItWorks,
  AICapabilities,
  AnalyticsDashboards,
  MobileApp,
  SecurityScalability,
  TrustFAQ,
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

      {/* AI Assistant Features - NEW: Chat & Auto-Draft */}
      <div id="ai-assistant" className="scroll-mt-header">
        <AIAssistantFeatures />
      </div>

      {/* GST Portal Integration - Featured Section */}
      <div id="gstn-integration" className="scroll-mt-header">
        <GstnIntegration />
      </div>

      {/* Official GST Portal Trust Section - How we securely connect */}
      <div id="gst-trust" className="scroll-mt-header">
        <GstPortalTrust />
      </div>

      {/* WhatsApp Bot - NEW Featured Section */}
      <div id="whatsapp-bot" className="scroll-mt-header">
        <WhatsAppBot />
      </div>

      {/* Audience-Specific Sections */}
      <div id="for-business-owners" className="scroll-mt-header">
        <BusinessOwnerSection />
      </div>

      <div id="for-tax-professionals" className="scroll-mt-header">
        <TaxProfessionalSection />
      </div>

      <div id="for-finance-teams" className="scroll-mt-header">
        <FinanceTeamSection />
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

      {/* Trust FAQ - Security and integration questions */}
      <div id="faq" className="scroll-mt-header">
        <TrustFAQ />
      </div>

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
