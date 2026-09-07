'use client'

import { X, Clock, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/api/billing'
import type { Subscription } from '@/types/billing'

interface TrialBannerProps {
  subscription: Subscription
  className?: string
}

export function TrialBanner({ subscription, className }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Only show for trialing subscriptions
  if (subscription.status !== 'trialing' || !subscription.isTrialing) {
    return null
  }

  // Don't show if user dismissed
  if (isDismissed) {
    return null
  }

  const trialEndDate = subscription.trialEnd
    ? new Date(subscription.trialEnd).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Alert
      className={cn(
        'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20',
        className
      )}
    >
      <Clock className="h-5 w-5 text-blue-600" />
      <div className="flex-1">
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium text-blue-900 dark:text-blue-100">
              You are in Trial Mode.
            </span>
            {trialEndDate && subscription.pricing && (
              <span className="text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                On {trialEndDate}, {formatAmount(subscription.pricing.total, subscription.pricing.currency)} will be automatically debited.
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss trial banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </div>
    </Alert>
  )
}
