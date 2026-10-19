'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { useAuthStore } from '@/stores'
import { Toaster } from '@/components/ui/toaster'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isInitialized, initialize, logout } = useAuthStore()
  const isLoggingOutRef = useRef(false)

  // Sign in / Sign up mean "start fresh": drop a half-finished Google/Microsoft
  // signup instead of forcing the user back onto /complete-signup
  const isEntryPage = pathname === '/login' || pathname === '/register'

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

      // Mobile OTP comes before everything else (onboarding, invitations, dashboard)
      if (user.mobileVerificationRequired) {
        if (isEntryPage) {
          if (!isLoggingOutRef.current) {
            isLoggingOutRef.current = true
            logout().finally(() => {
              isLoggingOutRef.current = false
            })
          }
        } else if (pathname !== '/complete-signup') {
          router.push('/complete-signup')
        }
        return
      }

      // If on onboarding page and has organization, redirect to dashboard
      if (pathname === '/onboarding' && hasOrganization) {
        router.push('/dashboard')
        return
      }

      // Allow invitation pages for authenticated users (they need to accept/decline)
      if (pathname.startsWith('/invitations/') || pathname.startsWith('/ca-invitations/')) {
        return
      }

      // If on other auth pages (login, register, etc.) and authenticated
      if (pathname !== '/onboarding') {
        // Check if there's a pending invitation - either in URL or localStorage
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect')
        // Use localStorage since email verification link opens in a new tab
        const pendingInvitation = typeof window !== 'undefined'
          ? localStorage.getItem('pendingInvitationUrl')
          : null

        // If on login/register page with redirect param, let those pages handle it
        // This prevents race conditions between those pages and auth-layout redirects
        if ((pathname === '/login' || pathname === '/register') && redirectTo) {
          return
        }

        // If there's an invitation redirect, go there immediately
        if (redirectTo?.startsWith('/invitations/') || redirectTo?.startsWith('/ca-invitations/')) {
          router.push(redirectTo)
          return
        }

        if (pendingInvitation?.startsWith('/invitations/') || pendingInvitation?.startsWith('/ca-invitations/')) {
          router.push(pendingInvitation)
          return
        }

        // No pending invitation - redirect based on organization status
        if (!hasOrganization) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      }
    }
  }, [isInitialized, isAuthenticated, user, pathname, router, isEntryPage, logout])

  // Don't render auth pages (except onboarding and invitations) if authenticated with organization
  if (isInitialized && isAuthenticated && user) {
    const hasOrganization = user.organization || (user.organizations && user.organizations.length > 0)
    if (user.mobileVerificationRequired) {
      // Only the complete-signup page renders until the mobile is verified
      // (login/register render once the pending session is cleared above)
      if (pathname !== '/complete-signup') {
        return null
      }
    } else if (pathname.startsWith('/invitations/') || pathname.startsWith('/ca-invitations/')) {
      // Allow invitation pages for authenticated users
      // Continue rendering - user needs to accept/decline invitation
    } else if (pathname !== '/onboarding' && hasOrganization) {
      return null
    }
    // Allow onboarding page for authenticated users without organization
    if (pathname === '/onboarding' && !hasOrganization) {
      // Continue rendering
    }
  }

  return (
    <div className="product-ui product-auth min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center px-4 md:px-6 border-b bg-card">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <Image
            src="/logo.svg"
            alt="EffortlessInsight logo - Return to homepage"
            width={140}
            height={32}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
      </header>

      {/* Main content — calm, warm backdrop with soft pastel depth */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        <div className="relative w-full max-w-md">
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
