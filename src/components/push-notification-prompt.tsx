'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { cn } from '@/lib/utils'

interface PushNotificationPromptProps {
  className?: string
  showOnMount?: boolean
  delay?: number
  variant?: 'banner' | 'card' | 'inline'
  onDismiss?: () => void
  onEnabled?: () => void
}

const PROMPT_DISMISSED_KEY = 'ei_push_prompt_dismissed'
const PROMPT_DISMISSED_UNTIL_KEY = 'ei_push_prompt_dismissed_until'

/**
 * Push notification prompt component
 * Shows a UI to ask users to enable push notifications
 */
export function PushNotificationPrompt({
  className,
  showOnMount = true,
  delay = 5000,
  variant = 'banner',
  onDismiss,
  onEnabled,
}: PushNotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { status, isSupported, isLoading, registerToken } = usePushNotifications()

  // Check if we should show the prompt
  useEffect(() => {
    if (!showOnMount || !isSupported) {
      return
    }

    // Don't show if already registered or denied
    if (status === 'registered' || status === 'permission-denied') {
      return
    }

    // Check if user dismissed the prompt
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY)
    const dismissedUntil = localStorage.getItem(PROMPT_DISMISSED_UNTIL_KEY)

    if (dismissed === 'true') {
      // Check if we should show again after some time
      if (dismissedUntil) {
        const until = parseInt(dismissedUntil, 10)
        if (Date.now() < until) {
          return
        }
        // Clear expired dismissal
        localStorage.removeItem(PROMPT_DISMISSED_KEY)
        localStorage.removeItem(PROMPT_DISMISSED_UNTIL_KEY)
      } else {
        return
      }
    }

    // Show with delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [showOnMount, isSupported, status, delay])

  const handleEnable = async () => {
    const success = await registerToken()
    if (success) {
      setIsVisible(false)
      onEnabled?.()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true')
    // Ask again in 7 days
    localStorage.setItem(
      PROMPT_DISMISSED_UNTIL_KEY,
      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
    )
    onDismiss?.()
  }

  const handleRemindLater = () => {
    setIsVisible(false)
    // Ask again in 24 hours
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true')
    localStorage.setItem(
      PROMPT_DISMISSED_UNTIL_KEY,
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    )
    onDismiss?.()
  }

  if (!isVisible || status === 'registered' || !isSupported) {
    return null
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md',
          'bg-background border rounded-lg shadow-lg p-4',
          'animate-in slide-in-from-bottom-5 duration-300',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Enable Push Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get instant alerts for deadlines, task updates, and important notices.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable'
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleRemindLater}>
                Later
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'bg-background border rounded-lg p-6',
          className
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Enable push notifications to receive instant alerts for deadlines, task updates, and
            important notices even when you&apos;re not using the app.
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleEnable} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
          </div>
          <button
            onClick={handleRemindLater}
            className="text-sm text-muted-foreground hover:text-foreground mt-3"
          >
            Remind me later
          </button>
        </div>
      </div>
    )
  }

  // Inline variant
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm">Enable push notifications for instant alerts</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleEnable} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Push notification status indicator
 * Shows current notification status in settings
 */
export function PushNotificationStatus({ className }: { className?: string }) {
  const { status, isLoading, registerToken, unregisterToken } = usePushNotifications()

  const getStatusInfo = () => {
    switch (status) {
      case 'registered':
        return {
          icon: CheckCircle,
          iconClass: 'text-green-500',
          title: 'Push Notifications Enabled',
          description: 'You will receive push notifications on this device.',
        }
      case 'permission-granted':
        return {
          icon: Bell,
          iconClass: 'text-yellow-500',
          title: 'Ready to Enable',
          description: 'Click to enable push notifications on this device.',
        }
      case 'permission-denied':
        return {
          icon: BellOff,
          iconClass: 'text-red-500',
          title: 'Notifications Blocked',
          description: 'Enable notifications in your browser settings.',
        }
      case 'unsupported':
        return {
          icon: BellOff,
          iconClass: 'text-muted-foreground',
          title: 'Not Supported',
          description: 'Push notifications are not supported in this browser.',
        }
      case 'not-configured':
        return {
          icon: BellOff,
          iconClass: 'text-muted-foreground',
          title: 'Not Available',
          description: 'Push notifications are not configured.',
        }
      default:
        return {
          icon: Bell,
          iconClass: 'text-muted-foreground',
          title: 'Enable Notifications',
          description: 'Get notified about important updates.',
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const handleToggle = async () => {
    if (status === 'registered') {
      await unregisterToken()
    } else if (status !== 'permission-denied' && status !== 'unsupported') {
      await registerToken()
    }
  }

  return (
    <div className={cn('flex items-center justify-between p-4 border rounded-lg', className)}>
      <div className="flex items-center gap-3">
        <StatusIcon className={cn('w-5 h-5', statusInfo.iconClass)} />
        <div>
          <p className="font-medium text-sm">{statusInfo.title}</p>
          <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
        </div>
      </div>
      {status !== 'unsupported' && status !== 'not-configured' && status !== 'permission-denied' && (
        <Button
          variant={status === 'registered' ? 'outline' : 'default'}
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'registered' ? (
            'Disable'
          ) : (
            'Enable'
          )}
        </Button>
      )}
    </div>
  )
}

export default PushNotificationPrompt
