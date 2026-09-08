'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Renders nothing; reports every route change to the activity tracker.
 * Mounted once in the root layout so page views are captured everywhere
 * without touching individual pages.
 */
export function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname])

  return null
}
