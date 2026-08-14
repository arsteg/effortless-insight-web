import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy | EffortlessInsight',
  description:
    'How EffortlessInsight and the GST Notice Guard browser extension collect, use, protect and retain your data — including GST portal data, stored in India and never sold.',
}

// NOTE(legal): This policy was drafted to accurately reflect the product's
// actual behavior (OTP-based portal access, no password storage, AES-256 +
// TLS, Indian data residency, 8-year retention) and the GST Notice Guard
// Chrome extension (local storage, host permissions, notifications).
// Have counsel review before any claim here changes.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="14 August 2026"
      intro="EffortlessInsight helps Indian businesses, Chartered Accountants and finance teams manage GST notices through our web application and GST Notice Guard browser extension. Doing that requires access to sensitive tax data, so we hold ourselves to a simple standard: collect only what the service needs, protect it seriously, keep it in India, and never sell it. This policy explains exactly what we collect and why."
      sections={[
        {
          heading: 'What we collect',
          paragraphs: ['We collect three kinds of information:'],
          bullets: [
            'Account information — your name, email address, phone number, organization details and the GSTINs you register.',
            'GST portal data — notices, orders and related documents fetched from the GST portal after you authorize access with an OTP, plus documents you upload yourself.',
            'Usage information — actions taken in the product (views, assignments, replies drafted), which also powers the audit trail the product provides.',
          ],
        },
        {
          heading: 'What we never collect',
          paragraphs: [
            'We never ask for, see or store your GST portal password. Portal access works through an OTP sent to your registered GST mobile number; only an encrypted session token is retained, and you can revoke it at any time from settings.',
          ],
        },
        {
          heading: 'How we use your data',
          paragraphs: ['Your data is used only to provide the service:'],
          bullets: [
            'Fetching, analyzing and explaining your GST notices, and drafting replies for your review.',
            'Deadline tracking and the reminders you configure (email, push, in-app, WhatsApp).',
            'Team collaboration features, subject to the roles and permissions your organization sets.',
            'Billing, support and service communications.',
          ],
        },
        {
          heading: 'AI processing',
          paragraphs: [
            'Notice text is processed by AI models to produce summaries, risk assessments and draft replies. Where third-party AI model providers are used, data is sent under agreements that prohibit using your data to train their models. AI output is assistance, not professional tax advice, and is always presented alongside the original notice.',
          ],
        },
        {
          heading: 'Browser extension (GST Notice Guard)',
          paragraphs: [
            'We offer a Chrome browser extension called "GST Notice Guard" that automates GST notice capture from the GST portal. This section describes data practices specific to the extension.',
          ],
          bullets: [
            'Domains accessed — The extension operates only on services.gst.gov.in and www.gst.gov.in (to detect login and capture notice data), api.effortlessinsight.in (to sync notices), and effortlessinsight.in (for session sharing). No other websites are accessed.',
            'Data stored locally — Authentication tokens, your user profile and organization name, notification preferences, offline sync queue, due date reminder timestamps, extension configuration cache, last sync timestamp, and API environment selection are stored locally in your browser using Chrome\'s storage API. This data is cleared when you sign out or uninstall the extension.',
            'Technical information — When syncing, the extension sends browser type and version, operating system, browser language, extension version, and sync timestamps to help diagnose issues and ensure compatibility.',
            'Desktop notifications — The extension displays notifications for sync status, due date reminders, and overdue alerts. You can configure these in the extension settings.',
            'No passwords — The extension never accesses, stores or transmits your GST portal password. It uses your existing browser session cookies for portal access.',
            'Data transmission — All data captured by the extension is transmitted over encrypted HTTPS connections and is subject to the same storage, retention and access controls described in this policy.',
          ],
        },
        {
          heading: 'Where your data lives',
          paragraphs: [
            'All storage and backups are in Indian data centres (Mumbai region). Traffic is encrypted in transit with TLS, and sensitive fields — session tokens, GSTINs, personal data — are protected with AES-256 encryption at rest. During AI analysis, notice text may be processed transiently by the AI model providers described above, under agreements restricting its use.',
          ],
        },
        {
          heading: 'Who can see your data',
          paragraphs: [
            'Access inside your organization is role-based: owner, admin, manager, member, CA and view-only roles each see only what they should, and every access is logged.',
            'We share data with service providers only as needed to run the service — cloud hosting, payment processing (Razorpay), messaging delivery — each bound to use it solely for that purpose. We do not sell your data or share it with advertisers. We disclose data to authorities only when legally required.',
          ],
        },
        {
          heading: 'How long we keep it',
          paragraphs: [
            'Compliance records are retained for 8 years, in line with GST record-keeping requirements. If you close your account, you can export your data first; on request we delete personal data that we are not legally required to retain.',
          ],
        },
        {
          heading: 'Your rights',
          paragraphs: [
            'In line with the Digital Personal Data Protection Act, 2023, you can request access to, correction of, or deletion of your personal data, and raise grievances about how it is handled. Write to info@arsteg.com and we will respond.',
          ],
        },
        {
          heading: 'Changes to this policy',
          paragraphs: [
            'If this policy changes materially, we will notify account holders by email before the change takes effect. The "Last updated" date above always reflects the current version.',
          ],
        },
      ]}
    />
  )
}
