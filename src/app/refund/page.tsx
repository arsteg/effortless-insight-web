import type { Metadata } from 'next'
import { LegalPage } from '@/components/landing/legal-page'

export const metadata: Metadata = {
  title: 'Refund Policy | EffortlessInsight',
  description:
    'EffortlessInsight refund and cancellation policy: free trial with no card, cancel anytime, and how refunds are handled.',
}

// NOTE(legal): Conservative default policy — try-before-you-buy instead of
// money-back promises. Have the business owner + counsel confirm before
// offering anything more generous.
export default function RefundPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      updated="11 August 2026"
      intro="Our approach is simple: try everything free before paying anything, and cancel anytime after. Because the trial requires no payment method, you are never charged without explicitly choosing a paid plan."
      sections={[
        {
          heading: 'The free trial',
          paragraphs: [
            'Every account starts with a 14-day free trial with no credit card required. Nothing converts to a paid plan automatically — when the trial ends, you either choose a plan or continue on the Free tier. This is deliberately how we avoid most refund situations.',
          ],
        },
        {
          heading: 'Cancelling a paid plan',
          paragraphs: [
            'You can cancel from settings at any time, no questions, no calls. Your plan stays active until the end of the period you have already paid for, and simply does not renew. Your data remains exportable.',
          ],
        },
        {
          heading: 'Refunds',
          paragraphs: [
            'Because plans can be tried free first and cancelled anytime, payments already made are generally not refunded for the remainder of a billing period.',
            'We do refund, in full:',
          ],
          bullets: [
            'Duplicate charges or billing errors on our side.',
            'Amounts charged after you cancelled, if renewal ran due to an error.',
            'Anything required to be refunded under applicable law.',
          ],
        },
        {
          heading: 'How refunds are processed',
          paragraphs: [
            'Approved refunds go back to the original payment method through our payment provider. Timing then depends on your bank or card issuer — typically 5–7 business days.',
          ],
        },
        {
          heading: 'Requesting a refund',
          paragraphs: [
            'Email info@arsteg.com from your account email with the payment reference. We respond to every request.',
          ],
        },
      ]}
    />
  )
}
