'use client'

import * as React from 'react'
import { AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription, AlertTitle } from './alert'
import { Button } from './button'
import { cn } from '@/lib/utils'

export type LimitType = 'storage' | 'users' | 'notices' | 'organizations' | 'api_calls'

export interface LimitExceededAlertProps {
  type: LimitType
  currentUsage: number
  limit: number
  className?: string
  showUpgradeButton?: boolean
  onUpgrade?: () => void
}

const limitConfig: Record<LimitType, { title: string; unit: string; upgradeText: string }> = {
  storage: {
    title: 'Storage Limit Reached',
    unit: 'GB',
    upgradeText: 'Upgrade for more storage',
  },
  users: {
    title: 'User Limit Reached',
    unit: 'users',
    upgradeText: 'Add more seats',
  },
  notices: {
    title: 'Notice Upload Limit Reached',
    unit: 'notices',
    upgradeText: 'Upgrade for more notices',
  },
  organizations: {
    title: 'Organization Limit Reached',
    unit: 'organizations',
    upgradeText: 'Upgrade for more organizations',
  },
  api_calls: {
    title: 'API Call Limit Reached',
    unit: 'API calls',
    upgradeText: 'Upgrade for more API calls',
  },
}

export function LimitExceededAlert({
  type,
  currentUsage,
  limit,
  className,
  showUpgradeButton = true,
  onUpgrade,
}: LimitExceededAlertProps) {
  const config = limitConfig[type]
  const isOverLimit = currentUsage >= limit
  const usagePercentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 100
  const isWarning = usagePercentage >= 80 && usagePercentage < 100

  return (
    <Alert
      variant={isOverLimit ? 'destructive' : 'default'}
      className={cn(
        isWarning && 'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600',
        className
      )}
    >
      {isOverLimit ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          You have used {currentUsage} of {limit} {config.unit} ({usagePercentage}%).
          {isOverLimit && ' You cannot perform this action until you free up space or upgrade your plan.'}
        </p>
        {showUpgradeButton && (
          <div className="flex gap-2">
            {onUpgrade ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onUpgrade}
                className="w-fit"
              >
                {config.upgradeText}
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-fit" asChild>
                <Link href="/settings/billing">
                  {config.upgradeText}
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

export interface AdditionalUsersNotAllowedAlertProps {
  baseLimit: number
  className?: string
  showUpgradeButton?: boolean
}

export function AdditionalUsersNotAllowedAlert({
  baseLimit,
  className,
  showUpgradeButton = true,
}: AdditionalUsersNotAllowedAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Additional Users Not Allowed</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Your plan includes {baseLimit} user{baseLimit > 1 ? 's' : ''} and does not allow adding additional users.
          To invite more team members, please upgrade to a plan that supports additional seats.
        </p>
        {showUpgradeButton && (
          <Button size="sm" variant="outline" className="w-fit" asChild>
            <Link href="/settings/billing">
              View upgrade options
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
