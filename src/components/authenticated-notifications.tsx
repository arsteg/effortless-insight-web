'use client'

import { useEffect } from 'react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useNotificationConnection } from '@/hooks/use-notifications'
import { PushNotificationPrompt } from '@/components/push-notification-prompt'
import { registerServiceWorker, isFirebaseConfigured } from '@/lib/firebase'
import { useAppStore } from '@/stores/app-store'

/**
 * Notification bootstrap for the authenticated area. Mounted inside the
 * dashboard layout so none of this runs for anonymous visitors (audit WB-05).
 *
 * - Opens the SignalR connection so real-time notification/badge events arrive
 *   instead of relying on 30s polling (audit WB-02).
 * - Registers the messaging service worker and shows the opt-in prompt.
 * - Re-registers the FCM token on each authenticated session start so a rotated
 *   token is picked up (audit WB-04). This is idempotent — it only re-POSTs when
 *   the token actually changed — and only runs when permission is already
 *   granted, so it never triggers a permission prompt on load.
 */
export function AuthenticatedNotifications() {
  // Real-time connection (auto-connects/disconnects with this component).
  useNotificationConnection()

  const { registerToken } = usePushNotifications()
  const notificationCount = useAppStore((state) => state.notificationCount)

  // Reflect the unread count on the installed-PWA app icon badge where the
  // browser supports it (Chromium desktop/Android installed apps). No-op
  // elsewhere. Clears the badge at zero.
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>
      clearAppBadge?: () => Promise<void>
    }
    if (notificationCount > 0) {
      nav.setAppBadge?.(notificationCount).catch(() => {})
    } else {
      nav.clearAppBadge?.().catch(() => {})
    }
  }, [notificationCount])

  useEffect(() => {
    if (typeof window === 'undefined' || !isFirebaseConfigured()) return

    registerServiceWorker().catch((err) => {
      console.warn('Failed to register service worker:', err)
    })

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      registerToken().catch(() => {
        // Non-fatal: token refresh will retry next session.
      })
    }
    // Run once on mount; registerToken is stable and intentionally not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <PushNotificationPrompt delay={10000} variant="banner" />
}
