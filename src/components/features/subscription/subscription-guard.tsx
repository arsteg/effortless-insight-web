'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, AlertTriangle, CreditCard, Clock, RefreshCw } from 'lucide-react'

import { useSubscriptionStore } from '@/stores'
import { useCurrentSubscription } from '@/hooks/use-billing'
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

// Statuses that allow app access
const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due']

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter()
  const pathname = usePathname()

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

  const [showBlockingUI, setShowBlockingUI] = useState(false)

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
    // Don't check on exempt routes
    if (isExemptRoute) {
      setShowBlockingUI(false)
      return
    }

    // Still loading - don't show blocking UI yet
    if (isLoading && !isStoreInitialized) {
      return
    }

    // Use fresh data if available, otherwise use cached
    const subscription = freshSubscription ?? cachedSubscription

    // No subscription at all - redirect to plan selection
    if (!subscription) {
      // Handle 404/no subscription case
      if (!isLoading) {
        router.push('/select-plan')
      }
      return
    }

    // Check subscription status
    const hasAccess = ACTIVE_STATUSES.includes(subscription.status)

    if (!hasAccess) {
      setShowBlockingUI(true)
    } else {
      setShowBlockingUI(false)
    }
  }, [
    freshSubscription,
    cachedSubscription,
    isLoading,
    isStoreInitialized,
    isExemptRoute,
    router,
    pathname,
  ])

  // Handle error case - show error but allow retry
  if (isError && !cachedSubscription && !isExemptRoute) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'

    // Check if it's a "no subscription" error (404)
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
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

  // Loading state - show spinner
  if (isLoading && !cachedSubscription && !isExemptRoute) {
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
    const subscription = freshSubscription ?? cachedSubscription

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <SubscriptionBlockedCard
          status={subscription?.status || 'expired'}
          planName={subscription?.planName}
          onSelectPlan={() => router.push('/select-plan')}
          onManageBilling={() => router.push('/settings/billing')}
        />
      </div>
    )
  }

  // Exempt routes - render without checks
  if (isExemptRoute) {
    return <>{children}</>
  }

  // Has valid subscription - render children with optional trial banner
  const subscription = freshSubscription ?? cachedSubscription

  // Build upgrade URL from subscription data (stored in BillingSubscription table)
  const getUpgradeUrl = () => {
    const planCode = subscription?.planCode || ''
    const billingCycle = subscription?.billingCycle || 'annually'
    return `/checkout?plan=${planCode}&billing=${billingCycle}`
  }

  return (
    <>
      {subscription?.status === 'trialing' && subscription.isTrialing && (
        <div className="mb-4">
          <TrialBanner
            subscription={subscription}
            onUpgrade={() => router.push(getUpgradeUrl())}
          />
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
}

function SubscriptionBlockedCard({
  status,
  planName,
  onSelectPlan,
  onManageBilling,
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
        <Button className="w-full" size="lg" onClick={onSelectPlan}>
          {info.primaryAction}
        </Button>
        {info.showManage && (
          <Button variant="outline" className="w-full" onClick={onManageBilling}>
            Manage Billing
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
