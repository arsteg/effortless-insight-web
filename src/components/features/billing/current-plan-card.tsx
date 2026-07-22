'use client'

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
  onCancel?: () => void
  onReactivate?: () => void
  onPause?: () => void
  onResume?: () => void
}

export function CurrentPlanCard({
  subscription,
  isLoading,
  onUpgrade,
  onManage,
  onCancel,
  onReactivate,
  onPause,
  onResume,
}: CurrentPlanCardProps) {
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

  const isTrialing = subscription.status === 'trial'
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
        {/* Trial Warning */}
        {isTrialing && subscription.trialEnd && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Trial Period</AlertTitle>
            <AlertDescription>
              Your trial ends on {formatDate(subscription.trialEnd)}.
              Add a payment method to continue after the trial.
            </AlertDescription>
          </Alert>
        )}

        {/* Cancellation Warning */}
        {isCancelled && !subscription.cancelAtPeriodEnd && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Cancelled</AlertTitle>
            <AlertDescription>
              Your subscription has been cancelled. You can reactivate it within 30 days.
            </AlertDescription>
          </Alert>
        )}

        {subscription.cancelAtPeriodEnd && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cancellation Scheduled</AlertTitle>
            <AlertDescription>
              Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
              You can reactivate anytime before then.
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

        {/* Billing Info */}
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

        {/* Seats */}
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

      <CardFooter className="flex gap-2 flex-wrap">
        {isPaused ? (
          <>
            <Button onClick={onResume}>Resume Subscription</Button>
            <Button onClick={onCancel} variant="ghost" className="text-destructive">
              Cancel Instead
            </Button>
          </>
        ) : isCancelled && !subscription.cancelAtPeriodEnd ? (
          <Button onClick={onReactivate}>Reactivate Subscription</Button>
        ) : subscription.cancelAtPeriodEnd ? (
          <>
            <Button onClick={onReactivate} variant="outline">
              Undo Cancellation
            </Button>
            <Button onClick={onUpgrade}>Change Plan</Button>
          </>
        ) : (
          <>
            <Button onClick={onUpgrade} variant="outline">
              Change Plan
            </Button>
            <Button onClick={onManage} variant="outline">
              Manage Billing
            </Button>
            <Button onClick={onPause} variant="outline">
              Pause
            </Button>
            <Button onClick={onCancel} variant="ghost" className="text-destructive">
              Cancel
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

function formatStatus(status: string): string {
  switch (status) {
    case 'trial':
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
