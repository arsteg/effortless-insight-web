'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, CreditCard, AlertCircle, PauseCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmount, getStatusBadgeVariant } from '@/lib/api/billing'
import type { Subscription } from '@/types/billing'

interface CurrentPlanCardProps {
  subscription?: Subscription
  isLoading?: boolean
  onUpgrade?: () => void
  onManage?: () => void
  onAddSeats?: () => void
  onCancel?: () => void
  onPause?: () => void
  onResume?: () => void
  /** Whether the current plan allows adding additional seats */
  canAddSeats?: boolean
}

export function CurrentPlanCard({
  subscription,
  isLoading,
  onUpgrade,
  onManage,
  onAddSeats,
  onCancel,
  onPause,
  onResume,
  canAddSeats = false,
}: CurrentPlanCardProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don&apos;t have an active subscription yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onUpgrade}>Choose a Plan</Button>
        </CardFooter>
      </Card>
    )
  }

  const isTrialing = subscription.status === 'trialing'
  const isCancelled = subscription.status === 'cancelled' || subscription.cancelAtPeriodEnd
  const isPastDue = subscription.status === 'past_due'
  const isPaused = subscription.status === 'paused'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {subscription.planName}
              <Badge variant={getStatusBadgeVariant(subscription.status)}>
                {formatStatus(subscription.status)}
              </Badge>
            </CardTitle>
            <CardDescription>
              {subscription.billingCycle === 'annually' ? 'Annual' : 'Monthly'} billing
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatAmount(subscription.pricing.total)}
            </div>
            <div className="text-sm text-muted-foreground">
              per {subscription.billingCycle === 'annually' ? 'year' : 'month'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Info - No actions during trial */}
        {isTrialing && subscription.trialEnd && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">Trial Period</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <p>You are in Trial Mode.</p>
              <p className="mt-1 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                On {formatDate(subscription.trialEnd)}, {formatAmount(subscription.pricing.total, subscription.pricing.currency)} will be automatically debited from your account.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Cancellation Warning */}
        {isCancelled && !subscription.cancelAtPeriodEnd && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Cancelled</AlertTitle>
            <AlertDescription>
              Your subscription has been cancelled. Subscribe to a new plan to continue using the service.
            </AlertDescription>
          </Alert>
        )}

        {subscription.cancelAtPeriodEnd && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cancellation Scheduled</AlertTitle>
            <AlertDescription>
              Your subscription will be cancelled on {formatDate(subscription.currentPeriodEnd)}.
              This cancellation cannot be undone. You will need to subscribe to a new plan after this date.
            </AlertDescription>
          </Alert>
        )}

        {/* Past Due Warning */}
        {isPastDue && (
          <Alert variant="destructive">
            <CreditCard className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              We couldn&apos;t process your payment. Please update your payment method to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Paused Notice */}
        {isPaused && (
          <Alert>
            <PauseCircle className="h-4 w-4" />
            <AlertTitle>Subscription Paused</AlertTitle>
            <AlertDescription>
              Your subscription is currently paused. Resume anytime to regain access to premium features.
            </AlertDescription>
          </Alert>
        )}

        {/* Billing Info - Not shown during trial or for free plans (pricing.total === 0) */}
        {!isTrialing && subscription.pricing.total > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Current Period
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Next Billing Date
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {formatDate(subscription.nextBillingDate)}
              </div>
            </div>
          </div>
        )}

        {/* Plan details during trial */}
        {isTrialing && (
          <div className="pt-2">
            <div className="text-sm font-medium text-muted-foreground">Plan</div>
            <div className="text-sm">{subscription.planName} ({subscription.billingCycle === 'annually' ? 'Annual' : 'Monthly'})</div>
          </div>
        )}

        {/* Seats - show if applicable */}
        {(subscription.seats.included > 1 || subscription.seats.additional > 0) && (
          <div className="pt-2">
            <div className="text-sm font-medium text-muted-foreground">Seats</div>
            <div className="text-sm">
              {subscription.seats.used} of {subscription.seats.included + subscription.seats.additional} seats used
              {subscription.seats.additional > 0 && (
                <span className="text-muted-foreground">
                  {' '}({subscription.seats.additional} additional)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Change */}
        {subscription.scheduledChange && (
          <div className="pt-2 border-t">
            <div className="text-sm">
              <span className="font-medium">Scheduled Change: </span>
              Your plan will change to {subscription.scheduledChange.planCode} on{' '}
              {formatDate(subscription.scheduledChange.effectiveDate)}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with action buttons - NO buttons during trial */}
      {!isTrialing && (
        <CardFooter className="flex gap-2 flex-wrap">
          {isPaused ? (
            <>
              <Button onClick={onResume}>Resume Subscription</Button>
              <Button onClick={onCancel} variant="ghost" className="text-destructive">
                Cancel Instead
              </Button>
            </>
          ) : isCancelled && !subscription.cancelAtPeriodEnd ? (
            <Button onClick={() => router.push('/settings/billing/plans')}>
              Subscribe to New Plan
            </Button>
          ) : subscription.cancelAtPeriodEnd ? (
            <Button onClick={() => router.push('/settings/billing/plans')}>
              Subscribe to New Plan
            </Button>
          ) : (
            <>
              <Button onClick={onUpgrade} variant="outline">
                Change Plan
              </Button>
              {/* Add Seats - only show if plan allows it and callback provided */}
              {canAddSeats && onAddSeats && (
                <Button onClick={onAddSeats} variant="outline">
                  Add Seats
                </Button>
              )}
              {/* Legacy manage billing - for backward compatibility */}
              {onManage && !onAddSeats && (
                <Button onClick={onManage} variant="outline">
                  Manage Billing
                </Button>
              )}
              <Button onClick={onPause} variant="outline">
                Pause
              </Button>
              <Button onClick={onCancel} variant="ghost" className="text-destructive">
                Cancel
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

function formatStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'Trial'
    case 'active':
      return 'Active'
    case 'paused':
      return 'Paused'
    case 'past_due':
      return 'Past Due'
    case 'cancelled':
      return 'Cancelled'
    case 'expired':
      return 'Expired'
    default:
      return status
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
