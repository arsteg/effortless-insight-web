'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  { href: '/#comparison', label: 'Why us vs others' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
]

/** Hash sections we can scroll-spy for an "active" nav pill (homepage only). */
const spyIds = navLinks
  .map((link) => (link.href.startsWith('/#') ? link.href.slice(2) : null))
  .filter((id): id is string => Boolean(id))

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [progress, setProgress] = useState(0)

  // A single "glass" pill that slides between nav items — to the active section
  // by default, and to whatever link is hovered. Positions are measured from
  // the rendered links so it works regardless of label widths / font loading.
  const navItemsRef = useRef<Array<HTMLAnchorElement | null>>([])
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    top: 0,
    height: 0,
    visible: false,
  })
  const activeIndex = navLinks.findIndex(
    (link) => link.href.startsWith('/#') && link.href.slice(2) === activeId
  )

  const moveIndicatorTo = useCallback((index: number) => {
    const el = navItemsRef.current[index]
    if (!el) {
      setIndicator((s) => ({ ...s, visible: false }))
      return
    }
    setIndicator({
      left: el.offsetLeft,
      width: el.offsetWidth,
      top: el.offsetTop,
      height: el.offsetHeight,
      visible: true,
    })
  }, [])

  const resetIndicator = useCallback(() => {
    if (activeIndex >= 0) moveIndicatorTo(activeIndex)
    else setIndicator((s) => ({ ...s, visible: false }))
  }, [activeIndex, moveIndicatorTo])

  // Re-seat the pill on the active section, and whenever the layout changes.
  // The initial placement is deferred to the next frame so it measures after
  // layout (and avoids a synchronous setState in the effect body).
  useEffect(() => {
    const raf = requestAnimationFrame(resetIndicator)
    const onResize = () => resetIndicator()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [resetIndicator])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16)
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll-spy: highlight the nav pill for whichever section sits in the band
  // just below the header. Degrades gracefully — if a page has none of these
  // sections (e.g. /pricing), nothing is highlighted.
  useEffect(() => {
    const sections = spyIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActiveId(visible[0].target.id)
      },
      // Collapse the viewport to a thin band near the top so one section is
      // "current" at a time, offset for the fixed header.
      { rootMargin: '-25% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
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
      {/* Reading-progress hairline on the header's bottom edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-azure-500 via-azure-400 to-lavender-500 transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
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

          {/* Desktop Navigation — a cohesive segmented pill with a single glass
              indicator that glides to the active section / hovered link. Shown at
              xl where all items fit comfortably. */}
          <div
            className="relative hidden items-center gap-0.5 rounded-full border border-gray-200/70 bg-white/60 p-1 shadow-sm backdrop-blur-md xl:flex"
            onMouseLeave={resetIndicator}
          >
            {/* Sliding glass pill (behind the labels) */}
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-full bg-gradient-to-br from-azure-50 to-lavender-50 shadow-sm ring-1 ring-azure-100 transition-[left,width,top,height,opacity] duration-300 ease-out motion-reduce:transition-none"
              style={{
                left: indicator.left,
                width: indicator.width,
                top: indicator.top,
                height: indicator.height,
                opacity: indicator.visible ? 1 : 0,
              }}
            />
            {navLinks.map((link, index) => {
              const isActive =
                link.href.startsWith('/#') && link.href.slice(2) === activeId
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => {
                    navItemsRef.current[index] = el
                  }}
                  onMouseEnter={() => moveIndicatorTo(index)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative z-10 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-ring',
                    isActive
                      ? 'text-primary-700'
                      : 'text-gray-600 hover:text-primary-700'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
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
              className="group shadow-soft transition-all hover:-translate-y-px hover:shadow-elevated md:h-10 md:px-5"
            >
              <Link href="/register">
                <span className="md:hidden">Start free</span>
                <span className="hidden md:inline">Start free trial</span>
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <button
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 xl:hidden focus-ring"
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
          <div className="animate-fade-in-down xl:hidden">
            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 p-2 shadow-elevated backdrop-blur-xl">
              <div className="flex flex-col">
                {navLinks.map((link) => {
                  const isActive =
                    link.href.startsWith('/#') && link.href.slice(2) === activeId
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                })}
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
