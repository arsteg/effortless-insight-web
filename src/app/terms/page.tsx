import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service | EffortlessInsight',
  description:
    'The terms that govern your use of EffortlessInsight, the GST notice management platform.',
}

// NOTE(legal): Drafted to reflect actual product behavior; have counsel
// review before relying on these terms in a dispute.
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="11 August 2026"
      intro="These terms govern your use of EffortlessInsight. By creating an account you agree to them. They are written to be read — if anything is unclear, ask us before you agree."
      sections={[
        {
          heading: 'What EffortlessInsight is',
          paragraphs: [
            'EffortlessInsight is a software platform that helps you manage GST notices: it fetches notices from the GST portal with your authorization, analyzes and explains them, tracks deadlines, prepares draft replies, and lets your team and advisors collaborate on the response.',
          ],
        },
        {
          heading: 'What EffortlessInsight is not',
          paragraphs: [
            'EffortlessInsight is not a Chartered Accountant, law firm or tax advisor, and its output — including AI-generated summaries, risk assessments and draft replies — is assistance, not professional advice. You remain responsible for the accuracy of anything you file. Nothing is filed, changed or submitted to any authority by the platform without you.',
          ],
        },
        {
          heading: 'Your account',
          paragraphs: [
            'You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account and for ensuring your team members use the service within these terms. You must be authorized to connect any GSTIN you connect.',
          ],
        },
        {
          heading: 'GST portal access',
          paragraphs: [
            'Portal access is authorized by you via OTP. We never ask for or store your GST portal password; only an encrypted session token is retained. You can revoke access at any time, which stops synchronization immediately.',
          ],
        },
        {
          heading: 'Subscriptions and billing',
          paragraphs: [
            'Paid plans are billed in advance, monthly or annually, through our payment provider. The free trial requires no payment method and converts only if you choose a paid plan. Plan limits (notices per month, users, features) are stated on the pricing page. You can cancel anytime; see the Refund Policy for what happens next.',
          ],
        },
        {
          heading: 'Acceptable use',
          paragraphs: ['You agree not to:'],
          bullets: [
            'Access another person’s GST data without authorization.',
            'Attempt to probe, disrupt or overload the service or its security measures.',
            'Resell or white-label the service without a written agreement with us.',
            'Use the service for any unlawful purpose.',
          ],
        },
        {
          heading: 'Your data',
          paragraphs: [
            'Your data remains yours. We process it only to provide the service, as described in the Privacy Policy, and you can export it. Compliance records are retained for 8 years in line with GST record-keeping requirements.',
          ],
        },
        {
          heading: 'Availability',
          paragraphs: [
            'We work to keep the service available and reliable, but it depends in part on systems we do not control — including the GST portal itself. When the portal is unavailable, synchronization retries automatically and resumes when it recovers. We do not currently publish a contractual uptime SLA; enterprise customers can discuss one with us.',
          ],
        },
        {
          heading: 'Limitation of liability',
          paragraphs: [
            'To the maximum extent permitted by law, EffortlessInsight is not liable for indirect or consequential losses, or for outcomes of proceedings with tax authorities. Our total liability for any claim is limited to the amount you paid us in the twelve months before the claim arose. Nothing in these terms limits liability that cannot be limited under law.',
          ],
        },
        {
          heading: 'Termination',
          paragraphs: [
            'You can close your account at any time. We may suspend or terminate accounts that materially breach these terms, with notice where practicable. On closure, you may export your data; retention and deletion then follow the Privacy Policy.',
          ],
        },
        {
          heading: 'Governing law',
          paragraphs: [
            'These terms are governed by the laws of India, and courts in Gurugram, Haryana have jurisdiction over disputes.',
          ],
        },
      ]}
    />
  )
}
