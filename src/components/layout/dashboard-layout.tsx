'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore, useOrganizationStore } from '@/stores'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, initialize, user } = useAuthStore()
  const { fetchOrganizations, organizations } = useOrganizationStore()

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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router])

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
