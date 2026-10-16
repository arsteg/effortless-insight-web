import type { DeviceInfo } from '@/types'

/**
 * Collects device metadata from the browser.
 * This data is sent during signup/login for analytics and session management.
 */
export function getDeviceMetadata(): DeviceInfo {
  return {
    platform: 'web',
    timezone: getTimezone(),
    screenWidth: typeof window !== 'undefined' ? window.screen.width : undefined,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : undefined,
    colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : undefined,
    isTouchDevice: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : undefined,
  }
}

/**
 * Gets the user's timezone in IANA format (e.g., "Asia/Kolkata").
 */
function getTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

/**
 * UTM parameter names to extract from URL.
 */
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/**
 * Extracts UTM parameters from the current URL or provided search params.
 */
export function getUtmParams(searchParams?: URLSearchParams): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
} {
  const params = searchParams || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null)

  if (!params) return {}

  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    utmContent: params.get('utm_content') || undefined,
  }
}

/**
 * Stores UTM parameters in sessionStorage so they persist across page navigations.
 * Call this on initial page load.
 */
export function storeUtmParams(searchParams?: URLSearchParams): void {
  if (typeof sessionStorage === 'undefined') return

  const params = searchParams || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null)
  if (!params) return

  for (const param of UTM_PARAMS) {
    const value = params.get(param)
    if (value) {
      sessionStorage.setItem(param, value)
    }
  }
}

/**
 * Retrieves stored UTM parameters from sessionStorage.
 * Falls back to URL params if not stored.
 */
export function getStoredUtmParams(): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
} {
  if (typeof sessionStorage === 'undefined') {
    return getUtmParams()
  }

  return {
    utmSource: sessionStorage.getItem('utm_source') || undefined,
    utmMedium: sessionStorage.getItem('utm_medium') || undefined,
    utmCampaign: sessionStorage.getItem('utm_campaign') || undefined,
    utmTerm: sessionStorage.getItem('utm_term') || undefined,
    utmContent: sessionStorage.getItem('utm_content') || undefined,
  }
}
