import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, Linkedin, Twitter, Instagram, Facebook, Youtube } from 'lucide-react'
import { COMPANY } from '@/lib/company'

// Social accounts (real, created 2026-09-08). Entries with an empty URL in
// COMPANY.socials (e.g. YouTube until the channel exists) are skipped.
const socialLinks = [
  { label: 'LinkedIn', href: COMPANY.socials.linkedin, icon: Linkedin },
  { label: 'X (Twitter)', href: COMPANY.socials.twitter, icon: Twitter },
  { label: 'Instagram', href: COMPANY.socials.instagram, icon: Instagram },
  { label: 'Facebook', href: COMPANY.socials.facebook, icon: Facebook },
  { label: 'YouTube', href: COMPANY.socials.youtube, icon: Youtube },
].filter((s) => s.href)

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Product tour', href: '/#tour' },
      { label: 'Platform', href: '/#platform' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Security', href: '/#security' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  audiences: {
    title: 'Solutions',
    links: [
      { label: 'For business owners', href: '/business' },
      { label: 'For Chartered Accountants', href: '/chartered-accountants' },
      { label: 'For finance teams', href: '/finance-teams' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      // TODO(marketing): add an About page (real founder/company story) and
      // link it here — a fabricated one is worse than none.
      { label: 'Contact', href: '/contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Refund policy', href: '/refund' },
    ],
  },
}

export function LandingFooter() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Logo & one-liner */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="mb-5 inline-block">
              <Image
                src="/logo.svg"
                alt="EffortlessInsight"
                width={200}
                height={40}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mb-6 max-w-sm text-gray-400">
              India&apos;s AI-powered GST Notice Operating System. Notices —
              found, explained, and answered on time.
            </p>
            <div className="space-y-2.5">
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden />
                {COMPANY.email}
              </a>
              <a
                href={`tel:${COMPANY.phoneHref}`}
                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {COMPANY.phone}
              </a>
              <p className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{COMPANY.addressInline}</span>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`EffortlessInsight on ${social.label}`}
                  className="rounded-lg border border-gray-800 p-2 text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
                >
                  <social.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="mb-4 font-semibold text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights
                reserved.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                CIN {COMPANY.cin} · GSTIN {COMPANY.gstin}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Made in India · OTP-verified access · No password storage · Data hosted in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
