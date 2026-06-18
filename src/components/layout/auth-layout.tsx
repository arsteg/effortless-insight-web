'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { useAuthStore } from '@/stores'
import { Toaster } from '@/components/ui/toaster'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore()

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  // Redirect authenticated users appropriately
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const hasOrganization = user.organization || (user.organizations && user.organizations.length > 0)

      // If on onboarding page and has organization, redirect to dashboard
      if (pathname === '/onboarding' && hasOrganization) {
        router.push('/dashboard')
        return
      }

      // If on other auth pages (login, register, etc.) and authenticated
      if (pathname !== '/onboarding') {
        // Redirect to onboarding if no organization, otherwise to dashboard
        if (!hasOrganization) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [isInitialized, isAuthenticated, user, pathname, router])

  // Don't render auth pages (except onboarding) if authenticated with organization
  if (isInitialized && isAuthenticated && user) {
    const hasOrganization = user.organization || (user.organizations && user.organizations.length > 0)
    if (pathname !== '/onboarding' && hasOrganization) {
      return null
    }
    // Allow onboarding page for authenticated users without organization
    if (pathname === '/onboarding' && !hasOrganization) {
      // Continue rendering
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center px-4 md:px-6 border-b">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Image
            src="/logo.svg"
            alt="EffortlessInsight"
            width={140}
            height={32}
            style={{ width: 'auto', height: '32px' }}
            priority
          />
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 bg-muted/30">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex h-14 items-center justify-center px-4 md:px-6 border-t text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} EffortlessInsight. All rights reserved.
        </p>
      </footer>

      <Toaster />
    </div>
  )
}
