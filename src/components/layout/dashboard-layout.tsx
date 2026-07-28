'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore, useOrganizationStore, useSubscriptionStore } from '@/stores'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Skeleton } from '@/components/ui/skeleton'
import { SubscriptionGuard } from '@/components/features/subscription'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, initialize, user } = useAuthStore()
  const { fetchOrganizations, organizations } = useOrganizationStore()
  const { initialize: initializeSubscription } = useSubscriptionStore()

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Fetch organizations when authenticated
  useEffect(() => {
    if (isAuthenticated && organizations.length === 0) {
      fetchOrganizations().catch(console.error)
    }
  }, [isAuthenticated, organizations.length, fetchOrganizations])

  // Initialize subscription store when authenticated AND has organization
  const hasOrganization = user?.organization || (user?.organizations && user.organizations.length > 0)
  useEffect(() => {
    if (isAuthenticated && hasOrganization) {
      initializeSubscription().catch(() => {
        // Silently handle subscription initialization errors
        // The SubscriptionGuard will handle the redirect
      })
    }
  }, [isAuthenticated, hasOrganization, initializeSubscription])

  // Redirect to login if not authenticated, or to onboarding if no organization
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user && !hasOrganization) {
        router.push('/onboarding')
      }
    }
  }, [isInitialized, isAuthenticated, user, hasOrganization, router])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Don't render dashboard if no organization (redirect to onboarding)
  if (!hasOrganization) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          <SubscriptionGuard>{children}</SubscriptionGuard>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
