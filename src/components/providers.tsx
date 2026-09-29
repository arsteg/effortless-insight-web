'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, useRef } from 'react'
import { useOrganizationStore } from '@/stores/organization-store'
import { useAuthStore } from '@/stores/auth-store'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

// Push notification bootstrap now lives in AuthenticatedNotifications, mounted
// inside the dashboard layout, so it never runs for anonymous visitors on
// public pages (audit WB-05).

export function Providers({ children }: { children: React.ReactNode }) {
  const organizationId = useOrganizationStore((state) => state.currentOrganization?.id)
  const userId = useAuthStore((state) => state.user?.id)

  // Single QueryClient instance for the entire session - no key-based remounting
  // to prevent memory leaks from orphaned refetchInterval timers
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes - explicit garbage collection time
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

  // Track if this is the initial mount to skip clearing cache on first render
  const isInitialMount = useRef(true)

  // Clear cache on org/user change instead of remounting QueryClientProvider
  // This properly cancels all refetchInterval timers on the active QueryClient
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    // Cancel all queries (stops refetch intervals) and clear the cache
    queryClient.cancelQueries()
    queryClient.clear()
  }, [organizationId, userId, queryClient])

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
