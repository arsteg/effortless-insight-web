'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { PushNotificationPrompt } from '@/components/push-notification-prompt'
import { registerServiceWorker, isFirebaseConfigured } from '@/lib/firebase'

/**
 * Push notification initializer component
 * Handles service worker registration and shows the notification prompt
 */
function PushNotificationInitializer() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Register service worker on mount
    if (typeof window !== 'undefined' && isFirebaseConfigured()) {
      registerServiceWorker().catch((err) => {
        console.warn('Failed to register service worker:', err)
      })
    }
  }, [])

  // Only render on client side after auth check
  if (!isClient) {
    return null
  }

  return <PushNotificationPrompt delay={10000} variant="banner" />
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors
              if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                typeof (error as { code: string }).code === 'string'
              ) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster />
          <PushNotificationInitializer />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
