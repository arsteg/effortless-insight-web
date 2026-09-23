'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, AlertTriangle, CreditCard, Clock, RefreshCw } from 'lucide-react'

import { useAuthStore, useSubscriptionStore } from '@/stores'
import { useCaAccessStatus, useCurrentSubscription, useResumeSubscription } from '@/hooks/use-billing'

// DEBUG: Persistent logging utility that survives page redirects
const DEBUG_LOG_KEY = 'subscription_guard_debug_logs'
const debugLog = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().split('T')[1] // Just time portion
  const logEntry = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data) : ''}`

  // Log to console
  console.log(logEntry)

  // Store in sessionStorage for persistence across redirects
  try {
    const existingLogs = sessionStorage.getItem(DEBUG_LOG_KEY) || ''
    const newLogs = existingLogs + logEntry + '\n'
    sessionStorage.setItem(DEBUG_LOG_KEY, newLogs)
  } catch {
    // Ignore storage errors
  }
}

// Call this from browser console: getLogs() or clearLogs()
if (typeof window !== 'undefined') {
  (window as unknown as { getLogs: () => void }).getLogs = () => {
    const logs = sessionStorage.getItem(DEBUG_LOG_KEY) || 'No logs found'
    console.log('=== SUBSCRIPTION GUARD DEBUG LOGS ===\n' + logs)
    return logs
  };
  (window as unknown as { clearLogs: () => void }).clearLogs = () => {
    sessionStorage.removeItem(DEBUG_LOG_KEY)
    console.log('Logs cleared')
  }
}
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrialBanner } from '@/components/features/billing'
import type { SubscriptionStatus } from '@/types/billing'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

// Routes that don't require subscription check (within dashboard)
const SUBSCRIPTION_EXEMPT_ROUTES = [
  '/select-plan',
  '/checkout',
  '/settings/billing',
]

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

  const { user } = useAuthStore()
  const isCA = user?.isCA ?? false

  // Zustand store for cached state
  const {
    subscription: cachedSubscription,
    isInitialized: isStoreInitialized,
    setSubscription,
    clearSubscription,
  } = useSubscriptionStore()

  // React Query for fresh data
  const {
    data: freshSubscription,
    isLoading,
    isError,
    error,
    refetch,
  } = useCurrentSubscription()

  // Self-registered CAs never have a BillingSubscription for their own firm
  // org (see select-plan/page.tsx) - their access comes from an admin-granted
  // Free CA Access grant instead, so check that separately.
  const { data: caAccessStatus, isLoading: isLoadingCaAccess } = useCaAccessStatus(isCA)

  // Resume subscription mutation
  const resumeSubscription = useResumeSubscription()

  const [showBlockingUI, setShowBlockingUI] = useState(false)

  // DEBUG: Log render state
  debugLog('[SubscriptionGuard] RENDER', {
    pathname,
    userId: user?.id,
    userEmail: user?.email,
    isCA,
    isLoadingCaAccess,
    caAccessStatus,
    isLoading,
    isStoreInitialized,
    hasCachedSubscription: !!cachedSubscription,
    hasFreshSubscription: !!freshSubscription,
    isError,
    showBlockingUI,
  })

  // Check if current route is exempt from subscription check
  const isExemptRoute = SUBSCRIPTION_EXEMPT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Sync React Query data with Zustand store
  useEffect(() => {
    if (freshSubscription) {
      setSubscription(freshSubscription)
    }
  }, [freshSubscription, setSubscription])

  // Handle subscription status changes
  useEffect(() => {
    debugLog('[SubscriptionGuard] EFFECT START', {
      pathname,
      isExemptRoute,
      user: user ? { id: user.id, email: user.email, isCA: user.isCA } : null,
      isCA,
      isLoadingCaAccess,
      caAccessStatus,
      isLoading,
      isStoreInitialized,
      hasCachedSubscription: !!cachedSubscription,
      hasFreshSubscription: !!freshSubscription,
    })

    // Don't check on exempt routes
    if (isExemptRoute) {
      debugLog('[SubscriptionGuard] EXEMPT ROUTE - skipping checks')
      setShowBlockingUI(false)
      return
    }

    // Wait for user to be loaded before making any redirect decisions
    // This prevents race conditions where isCA is false during initial hydration
    if (!user) {
      debugLog('[SubscriptionGuard] USER NOT LOADED - waiting for hydration')
      return
    }

    // Self-registered CAs never have a BillingSubscription for their own firm
    // org - GET /subscriptions/current always 404s for them, so checking
    // `subscription` below would send every CA (granted or not) back to
    // /select-plan forever. Check their Free CA Access grant instead.
    if (isCA) {
      debugLog('[SubscriptionGuard] CA USER detected', { isLoadingCaAccess, caAccessStatus })
      // Wait for CA access check to complete - subscription query is irrelevant for CAs
      if (isLoadingCaAccess) {
        debugLog('[SubscriptionGuard] CA ACCESS LOADING - waiting')
        return
      }
      if (caAccessStatus?.hasActiveAccess) {
        debugLog('[SubscriptionGuard] CA HAS ACCESS - allowing')
        setShowBlockingUI(false)
      } else {
        // CA access check completed, user doesn't have active access
        debugLog('[SubscriptionGuard] CA NO ACCESS - redirecting to /select-plan', { caAccessStatus })
        router.push('/select-plan')
      }
      return
    }

    // Still loading - don't show blocking UI yet
    if (isLoading && !isStoreInitialized) {
      debugLog('[SubscriptionGuard] SUBSCRIPTION LOADING - waiting')
      return
    }

    // Use fresh data if available, otherwise use cached
    const subscription = freshSubscription ?? cachedSubscription
    debugLog('[SubscriptionGuard] REGULAR USER', {
      subscription: subscription ? { status: subscription.status, hasAccess: subscription.hasAccess } : null,
      isLoading,
    })

    // No subscription at all - redirect to plan selection
    if (!subscription) {
      // Handle 404/no subscription case
      if (!isLoading) {
        debugLog('[SubscriptionGuard] NO SUBSCRIPTION - redirecting to /select-plan')
        router.push('/select-plan')
      } else {
        debugLog('[SubscriptionGuard] NO SUBSCRIPTION but still loading - waiting')
      }
      return
    }

    // Check subscription access - use hasAccess from API which validates:
    // - Active/PastDue subscriptions have access
    // - Trialing subscriptions only have access if plan has trial AND trial hasn't expired
    // - Cancelled/Expired/Paused subscriptions don't have access
    if (!subscription.hasAccess) {
      debugLog('[SubscriptionGuard] SUBSCRIPTION NO ACCESS - showing blocking UI', { status: subscription.status })
      setShowBlockingUI(true)
    } else {
      debugLog('[SubscriptionGuard] SUBSCRIPTION HAS ACCESS - allowing')
      setShowBlockingUI(false)
    }
  }, [
    user,
    freshSubscription,
    cachedSubscription,
    isLoading,
    isStoreInitialized,
    isExemptRoute,
    router,
    pathname,
    isCA,
    isLoadingCaAccess,
    caAccessStatus,
  ])

  // Handle error case - show error but allow retry. Self-registered CAs are
  // handled entirely by the effect above (a 404 here is expected for them,
  // not an error), so skip this generic error path for them.
  // IMPORTANT: Also wait for user to be loaded - isCA depends on user hydration.
  // Without this check, a 404 error triggers redirect before we know if user is CA.
  if (isError) {
    debugLog('[SubscriptionGuard] RENDER: SUBSCRIPTION ERROR', {
      errorMessage: error instanceof Error ? error.message : 'unknown',
      hasCachedSubscription: !!cachedSubscription,
      isExemptRoute,
      user: !!user,
      isCA,
      willHandleError: !cachedSubscription && !isExemptRoute && !!user && !isCA,
    })
  }
  if (isError && !cachedSubscription && !isExemptRoute && user && !isCA) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    debugLog('[SubscriptionGuard] RENDER: ERROR CASE', { errorMessage, isCA, userId: user?.id })

    // Check if it's a "no subscription" error (404)
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      debugLog('[SubscriptionGuard] RENDER: 404 ERROR - redirecting to /select-plan')
      router.push('/select-plan')
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Unable to verify subscription</CardTitle>
            <CardDescription>
              We couldn&apos;t verify your subscription status. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/select-plan')}>
              View Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Loading state - show spinner (also wait for user to be loaded to avoid race conditions)
  const shouldShowLoadingSpinner = (!user || isLoading || (isCA && isLoadingCaAccess)) && !cachedSubscription && !isExemptRoute
  if (shouldShowLoadingSpinner) {
    debugLog('[SubscriptionGuard] RENDER: LOADING SPINNER', {
      user: !!user,
      isLoading,
      isCA,
      isLoadingCaAccess,
      hasCachedSubscription: !!cachedSubscription,
      isExemptRoute,
    })
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    )
  }

  // Blocking UI for expired/cancelled subscriptions
  if (showBlockingUI) {
    debugLog('[SubscriptionGuard] RENDER: BLOCKING UI')
    const subscription = freshSubscription ?? cachedSubscription

    const handleResume = () => {
      resumeSubscription.mutate(undefined, {
        onError: (error: Error & { response?: { status?: number; data?: { code?: string } } }) => {
          // If payment is required, redirect to plan selection
          const isPaymentRequired =
            error.response?.status === 402 ||
            error.response?.data?.code === 'PAYMENT_REQUIRED' ||
            error.message?.includes('PAYMENT_REQUIRED')

          if (isPaymentRequired) {
            router.push('/select-plan')
          }
        },
      })
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <SubscriptionBlockedCard
          status={subscription?.status || 'expired'}
          planName={subscription?.planName}
          onSelectPlan={() => router.push('/select-plan')}
          onManageBilling={() => router.push('/settings/billing')}
          onResume={handleResume}
          isResuming={resumeSubscription.isPending}
        />
      </div>
    )
  }

  // Exempt routes - render without checks
  if (isExemptRoute) {
    debugLog('[SubscriptionGuard] RENDER: EXEMPT ROUTE - rendering children')
    return <>{children}</>
  }

  // Has valid subscription - render children with optional trial banner
  const subscription = freshSubscription ?? cachedSubscription
  debugLog('[SubscriptionGuard] RENDER: SUCCESS - rendering children', {
    subscriptionStatus: subscription?.status,
    hasAccess: subscription?.hasAccess,
    isCA,
    caAccessStatus,
  })

  return (
    <>
      {subscription?.status === 'trialing' && subscription.isTrialing && (
        <div className="mb-4">
          <TrialBanner subscription={subscription} />
        </div>
      )}
      {children}
    </>
  )
}

interface SubscriptionBlockedCardProps {
  status: SubscriptionStatus | string
  planName?: string
  onSelectPlan: () => void
  onManageBilling: () => void
  onResume?: () => void
  isResuming?: boolean
}

function SubscriptionBlockedCard({
  status,
  planName,
  onSelectPlan,
  onManageBilling,
  onResume,
  isResuming = false,
}: SubscriptionBlockedCardProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'expired':
        return {
          icon: Clock,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          title: 'Subscription Expired',
          description: planName
            ? `Your ${planName} subscription has expired. Renew now to continue using EffortlessInsight.`
            : 'Your subscription has expired. Please renew to continue using the application.',
          primaryAction: 'Renew Subscription',
          showManage: true,
        }
      case 'cancelled':
        return {
          icon: CreditCard,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Subscription Cancelled',
          description:
            'Your subscription has been cancelled. Reactivate or choose a new plan to continue.',
          primaryAction: 'Choose a Plan',
          showManage: true,
        }
      case 'paused':
        return {
          icon: Clock,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'Subscription Paused',
          description:
            'Your subscription is currently paused. Resume it to continue using the application.',
          primaryAction: 'Resume Subscription',
          showManage: true,
        }
      default:
        return {
          icon: AlertTriangle,
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
          title: 'Subscription Required',
          description:
            'You need an active subscription to access EffortlessInsight. Choose a plan to get started.',
          primaryAction: 'Choose a Plan',
          showManage: false,
        }
    }
  }

  const info = getStatusInfo()
  const Icon = info.icon

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${info.iconBg}`}
        >
          <Icon className={`h-8 w-8 ${info.iconColor}`} />
        </div>
        <CardTitle>{info.title}</CardTitle>
        <CardDescription>{info.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h4 className="font-semibold text-sm">With a subscription you get:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">&#10003;</span>
              <span>Full access to GST notice management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">&#10003;</span>
              <span>AI-powered document analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">&#10003;</span>
              <span>Deadline tracking and reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">&#10003;</span>
              <span>Compliance reports and insights</span>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {status === 'paused' && onResume ? (
          <Button
            className="w-full"
            size="lg"
            onClick={onResume}
            disabled={isResuming}
          >
            {isResuming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resuming...
              </>
            ) : (
              info.primaryAction
            )}
          </Button>
        ) : (
          <Button className="w-full" size="lg" onClick={onSelectPlan}>
            {info.primaryAction}
          </Button>
        )}
        {info.showManage && (
          <Button variant="outline" className="w-full" onClick={onManageBilling}>
            Manage Billing
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
