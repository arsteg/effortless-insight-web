'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/#tour', label: 'Product tour' },
  { href: '/#platform', label: 'Platform' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#solutions', label: 'Solutions' },
  { href: '/#security', label: 'Security' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
]

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'border-b border-gray-200/70 bg-white/80 py-2.5 shadow-soft backdrop-blur-xl supports-[backdrop-filter]:bg-white/70'
          : 'border-b border-transparent bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between" aria-label="Main">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 rounded-lg focus-ring">
            <Image
              src="/logo.svg"
              alt="EffortlessInsight"
              width={280}
              height={56}
              className="h-9 w-auto md:h-10"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-950 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-primary-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA — visible on every screen size */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              asChild
              className="hidden text-gray-700 hover:text-gray-950 md:inline-flex"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="group shadow-soft transition-all hover:shadow-card md:h-10 md:px-5"
            >
              <Link href="/register">
                <span className="md:hidden">Start free</span>
                <span className="hidden md:inline">Start free trial</span>
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <button
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden focus-ring"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu — floating card panel */}
        {isMobileMenuOpen && (
          <div className="animate-fade-in-down lg:hidden">
            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-elevated backdrop-blur-xl">
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 p-2">
                <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/register">Start free</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
