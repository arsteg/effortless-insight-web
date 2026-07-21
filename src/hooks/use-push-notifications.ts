'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { notificationsApi } from '@/lib/api/notifications'
import {
  isFirebaseConfigured,
  isMessagingSupported,
  getFCMToken,
  onForegroundMessage,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  registerServiceWorker,
} from '@/lib/firebase'
import type { MessagePayload } from 'firebase/messaging'

export type PushNotificationStatus =
  | 'unsupported'
  | 'not-configured'
  | 'permission-denied'
  | 'permission-default'
  | 'permission-granted'
  | 'registered'
  | 'error'

interface UsePushNotificationsOptions {
  onNotification?: (payload: MessagePayload) => void
  autoRegister?: boolean
}

interface UsePushNotificationsReturn {
  status: PushNotificationStatus
  isSupported: boolean
  isRegistered: boolean
  isLoading: boolean
  error: string | null
  requestPermission: () => Promise<boolean>
  registerToken: () => Promise<boolean>
  unregisterToken: () => Promise<void>
}

// Storage key for tracking token registration
const PUSH_TOKEN_KEY = 'ei_push_token'
const PUSH_TOKEN_REGISTERED_KEY = 'ei_push_registered'

/**
 * Hook for managing web push notifications
 */
export function usePushNotifications(
  options: UsePushNotificationsOptions = {}
): UsePushNotificationsReturn {
  const { onNotification, autoRegister = false } = options
  const { toast } = useToast()

  const [status, setStatus] = useState<PushNotificationStatus>('permission-default')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Check browser support and Firebase configuration
  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window

  const isRegistered = status === 'registered'

  /**
   * Initialize and check current status
   */
  const checkStatus = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported')
      return
    }

    if (!isFirebaseConfigured()) {
      setStatus('not-configured')
      return
    }

    const permission = getNotificationPermissionStatus()
    if (permission === 'unsupported') {
      setStatus('unsupported')
    } else if (permission === 'denied') {
      setStatus('permission-denied')
    } else if (permission === 'granted') {
      // Check if we've already registered
      const isTokenRegistered = localStorage.getItem(PUSH_TOKEN_REGISTERED_KEY) === 'true'
      setStatus(isTokenRegistered ? 'registered' : 'permission-granted')
    } else {
      setStatus('permission-default')
    }
  }, [isSupported])

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser')
      return false
    }

    if (!isFirebaseConfigured()) {
      setError('Push notifications are not configured')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const permission = await requestNotificationPermission()

      if (permission === 'granted') {
        setStatus('permission-granted')
        return true
      } else if (permission === 'denied') {
        setStatus('permission-denied')
        setError('Notification permission was denied')
        return false
      } else {
        setStatus('permission-default')
        return false
      }
    } catch (err) {
      console.error('Error requesting permission:', err)
      setError('Failed to request notification permission')
      setStatus('error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  /**
   * Register push token with backend
   */
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported')
      return false
    }

    if (!isFirebaseConfigured()) {
      setError('Push notifications are not configured')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // First request permission if needed
      const permission = getNotificationPermissionStatus()
      if (permission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          return false
        }
      }

      // Get FCM token
      const token = await getFCMToken()
      if (!token) {
        setError('Failed to get push notification token')
        setStatus('error')
        return false
      }

      // Check if this is the same token we already registered
      const existingToken = localStorage.getItem(PUSH_TOKEN_KEY)
      if (existingToken === token) {
        setStatus('registered')
        return true
      }

      // Register with backend
      await notificationsApi.registerPushToken({
        token,
        platform: 'web',
        deviceId: getDeviceId(),
        deviceModel: getBrowserInfo(),
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      })

      // Store token locally
      localStorage.setItem(PUSH_TOKEN_KEY, token)
      localStorage.setItem(PUSH_TOKEN_REGISTERED_KEY, 'true')

      setStatus('registered')
      return true
    } catch (err) {
      console.error('Error registering push token:', err)
      setError('Failed to register for push notifications')
      setStatus('error')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, requestPermission])

  /**
   * Unregister push token
   */
  const unregisterToken = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem(PUSH_TOKEN_KEY)
    if (!token) {
      return
    }

    try {
      await notificationsApi.deactivatePushToken(token)
    } catch (err) {
      console.error('Error deactivating push token:', err)
    } finally {
      localStorage.removeItem(PUSH_TOKEN_KEY)
      localStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY)
      setStatus('permission-granted')
    }
  }, [])

  /**
   * Handle foreground messages
   */
  const handleForegroundMessage = useCallback(
    (payload: MessagePayload) => {
      // Call custom handler if provided
      if (onNotification) {
        onNotification(payload)
      }

      // Show toast notification for foreground messages
      const title = payload.notification?.title || 'New Notification'
      const body = payload.notification?.body || ''

      toast({
        title,
        description: body,
        variant: 'default',
      })
    },
    [onNotification, toast]
  )

  // Initialize on mount
  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Confirm actual FCM support asynchronously (covers iOS Safari outside an
  // installed PWA, private-mode IndexedDB, etc.). If unsupported, force the
  // 'unsupported' state so the opt-in prompt is never shown (audit WB-06).
  useEffect(() => {
    let cancelled = false
    isMessagingSupported().then((supported) => {
      if (!cancelled && !supported) {
        setStatus('unsupported')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-register if enabled and permission is granted
  useEffect(() => {
    if (autoRegister && status === 'permission-granted') {
      registerToken()
    }
  }, [autoRegister, status, registerToken])

  // Set up foreground message listener
  useEffect(() => {
    if (status !== 'registered') {
      return
    }

    // Register service worker and set up listener
    const setupListener = async () => {
      await registerServiceWorker()
      unsubscribeRef.current = onForegroundMessage(handleForegroundMessage)
    }

    setupListener()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [status, handleForegroundMessage])

  return {
    status,
    isSupported,
    isRegistered,
    isLoading,
    error,
    requestPermission,
    registerToken,
    unregisterToken,
  }
}

/**
 * Get a unique device identifier
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'unknown'
  }

  // Try to get existing device ID
  let deviceId = localStorage.getItem('ei_device_id')
  if (deviceId) {
    return deviceId
  }

  // Generate new device ID
  deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  localStorage.setItem('ei_device_id', deviceId)
  return deviceId
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return 'Unknown Browser'
  }

  const ua = navigator.userAgent
  let browser = 'Unknown'

  if (ua.includes('Firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('Chrome')) {
    browser = 'Chrome'
  } else if (ua.includes('Safari')) {
    browser = 'Safari'
  } else if (ua.includes('Edge')) {
    browser = 'Edge'
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera'
  }

  const platform = navigator.platform || 'Unknown'
  return `${browser} on ${platform}`
}

export default usePushNotifications
