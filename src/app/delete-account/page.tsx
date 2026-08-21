import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Account Deletion | EffortlessInsight',
  description:
    'How to delete your EffortlessInsight account and the data that is removed when you do.',
}

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="EffortlessInsight"
              width={280}
              height={56}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <article className="container mx-auto max-w-3xl px-4 py-12 text-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account &amp; Data Deletion</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: 12 August 2026</p>

        <p className="mb-4 leading-relaxed">
          This page explains how to delete your <strong>EffortlessInsight</strong> account and what
          happens to your data. It applies to accounts created in the EffortlessInsight mobile app
          (Android/iOS) and on the web.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">
          How to request deletion
        </h2>
        <p className="mb-4 leading-relaxed">
          Email{' '}
          <a
            className="text-primary-600 underline"
            href="mailto:hello@effortlessinsight.com?subject=Account%20deletion%20request"
          >
            hello@effortlessinsight.com
          </a>{' '}
          from the email address registered to your account with the subject{' '}
          &quot;Account deletion request&quot;. We will verify the request and confirm once
          deletion is complete, normally within 30 days.
        </p>
        <p className="mb-4 leading-relaxed">
          If you belong to an organization account, deletion of organization-owned records (such as
          shared notices and tasks) must be requested by an organization administrator.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">What is deleted</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Your profile (name, email, phone number) and login credentials</li>
          <li>Uploaded GST notices, documents, and images, and their AI analyses</li>
          <li>Tasks, notification history, and device push tokens</li>
          <li>GSTN integration credentials and sync history</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3">What may be retained</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>
            Billing and tax invoice records, which we must keep for the period required by Indian
            law
          </li>
          <li>Minimal records needed to resolve disputes or enforce our terms</li>
          <li>Encrypted backups, which are purged on a rolling schedule after deletion</li>
        </ul>

        <p className="mb-4 leading-relaxed">
          You can also delete individual notices, documents, tasks, and saved payment methods at
          any time from within the app, without deleting your account. For more detail on how we
          handle data, see our{' '}
          <Link className="text-primary-600 underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </article>

      <footer className="border-t border-gray-100">
        <div className="container mx-auto max-w-3xl px-4 py-8 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EffortlessInsight
        </div>
      </footer>
    </main>
  )
}
