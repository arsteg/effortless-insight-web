'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
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

  return (
    <ThemeProvider>
      <OrganizationQueryProvider key={`${userId ?? 'anonymous'}:${organizationId ?? 'none'}`}>
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster />
        </TooltipProvider>
      </OrganizationQueryProvider>
    </ThemeProvider>
  )
}

// Query keys throughout the application are relative to the current tenant.
// A fresh boundary also resets page-local filters and selections on a switch.
export function OrganizationQueryProvider({ children }: { children: React.ReactNode }) {
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

  useEffect(() => () => {
    void queryClient.cancelQueries()
    queryClient.clear()
  }, [queryClient])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
