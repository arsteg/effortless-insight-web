'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { useAuthStore, useCaStore } from '@/stores'
import { Header } from './header'
import { CaSidebar } from './ca-sidebar'
import { Toaster } from '@/components/ui/toaster'
import { Skeleton } from '@/components/ui/skeleton'

interface CaLayoutProps {
  children: React.ReactNode
}

export function CaLayout({ children }: CaLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isInitialized, initialize, user } = useAuthStore()
  const { loadProfile, profile, isLoadingProfile, refreshContext } = useCaStore()

  // Redirect /ca/register to /register-ca (CA registration is a public page)
  useEffect(() => {
    if (pathname === '/ca/register') {
      router.replace('/register-ca')
    }
  }, [pathname, router])

  // Initialize auth on mount (skip if redirecting to register-ca)
  useEffect(() => {
    if (!isInitialized && pathname !== '/ca/register') {
      initialize()
    }
  }, [isInitialized, initialize, pathname])

  // Load CA profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !profile && !isLoadingProfile) {
      loadProfile()
    }
  }, [isAuthenticated, profile, isLoadingProfile, loadProfile])

  // Refresh context when authenticated and profile is loaded
  useEffect(() => {
    if (isAuthenticated && profile) {
      refreshContext()
    }
  }, [isAuthenticated, profile, refreshContext])

  // Redirect to login if not authenticated (skip for /ca/register which redirects elsewhere)
  useEffect(() => {
    if (isInitialized && !isAuthenticated && pathname !== '/ca/register') {
      router.push('/login')
    }
  }, [isInitialized, isAuthenticated, router, pathname])

  // Redirect to regular dashboard if not a CA
  useEffect(() => {
    if (isInitialized && isAuthenticated && !isLoadingProfile && !profile) {
      // User is authenticated but not a CA, redirect to regular dashboard
      router.push('/dashboard')
    }
  }, [isInitialized, isAuthenticated, isLoadingProfile, profile, router])

  // Show loading state while initializing or redirecting
  if (!isInitialized || isLoadingProfile || pathname === '/ca/register') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Don't render if not a CA
  if (!profile) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <CaSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
