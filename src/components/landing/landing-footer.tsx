'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react'

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'AI Engine', href: '#ai' },
      { label: 'Mobile App', href: '#mobile' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  solutions: {
    title: 'Solutions',
    links: [
      { label: 'For Business Owners', href: '#for-business-owners' },
      { label: 'For CAs & Tax Pros', href: '#for-tax-professionals' },
      { label: 'For Finance Teams', href: '#for-finance-teams' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
    ],
  },
}

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.svg"
                alt="EffortlessInsight"
                width={200}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              India&apos;s first AI-powered GST Notice Operating System. Transform how your
              business handles tax compliance notices.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a
                href="mailto:hello@effortlessinsight.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@effortlessinsight.com
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </a>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {[
                { icon: Twitter, href: 'https://twitter.com/effortlessinsight' },
                { icon: Linkedin, href: 'https://linkedin.com/company/effortlessinsight' },
                { icon: Facebook, href: 'https://facebook.com/effortlessinsight' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
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

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} EffortlessInsight. All rights reserved.
            </p>

            {/* Certifications/Trust Badges */}
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500">Made with care in India</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-500">ISO 27001 Compliant</span>
              <span className="text-xs text-gray-600">|</span>
              <span className="text-xs text-gray-500">SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
