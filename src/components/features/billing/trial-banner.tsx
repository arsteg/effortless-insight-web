'use client'

import { X, Clock, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Subscription } from '@/types/billing'

interface TrialBannerProps {
  subscription: Subscription
  onUpgrade?: () => void
  className?: string
}

export function TrialBanner({ subscription, onUpgrade, className }: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Only show for trialing subscriptions
  if (subscription.status !== 'trial' || !subscription.isTrialing || !subscription.trialDaysRemaining) {
    return null
  }

  // Don't show if user dismissed
  if (isDismissed) {
    return null
  }

  const daysRemaining = subscription.trialDaysRemaining
  const isUrgent = daysRemaining <= 3

  return (
    <Alert
      className={cn(
        'border-2',
        isUrgent
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20',
        className
      )}
    >
      <Clock className={cn('h-5 w-5', isUrgent ? 'text-amber-600' : 'text-blue-600')} />
      <div className="flex-1">
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={cn('font-medium', isUrgent ? 'text-amber-900' : 'text-blue-900')}>
              {daysRemaining === 1 ? (
                <>
                  <strong>Last day</strong> of your free trial!
                </>
              ) : (
                <>
                  <strong>{daysRemaining} days</strong> left in your free trial
                </>
              )}
            </span>
            {subscription.trialEnd && (
              <Badge variant="outline" className="text-xs">
                Expires {new Date(subscription.trialEnd).toLocaleDateString()}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isUrgent ? 'default' : 'outline'}
              className={cn(
                isUrgent
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'border-blue-600 text-blue-700 hover:bg-blue-100'
              )}
              onClick={onUpgrade}
            >
              Upgrade Now
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss trial banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}
