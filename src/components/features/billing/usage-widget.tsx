'use client'

import { FileText, Users, HardDrive, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { Usage, UsageMetric, StorageUsage } from '@/types/billing'

interface UsageWidgetProps {
  usage?: Usage
  isLoading?: boolean
}

export function UsageWidget({ usage, isLoading }: UsageWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-2" />
                <div className="h-2 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Usage This Period</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(usage.period.start, usage.period.end)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerts */}
        {usage.alerts && usage.alerts.length > 0 && (
          <div className="space-y-2">
            {usage.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.level === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Notices */}
        <UsageMeter
          icon={FileText}
          label="Notices"
          metric={usage.notices}
        />

        {/* Users */}
        <UsageMeter
          icon={Users}
          label="Team Members"
          metric={usage.users}
        />

        {/* Storage */}
        <StorageMeter
          icon={HardDrive}
          storage={usage.storage}
        />

        {/* API Calls (if available) */}
        {usage.apiCalls && (
          <UsageMeter
            icon={Activity}
            label="API Calls"
            metric={usage.apiCalls}
          />
        )}
      </CardContent>
    </Card>
  )
}

interface UsageMeterProps {
  icon: React.ElementType
  label: string
  metric: UsageMetric
}

function UsageMeter({ icon: Icon, label, metric }: UsageMeterProps) {
  const isUnlimited = metric.limit === -1
  const percentage = isUnlimited ? 0 : metric.percentage

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {label}
        </div>
        <span className="text-sm text-muted-foreground">
          {metric.used.toLocaleString()}
          {!isUnlimited && ` / ${metric.limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          className={cn(
            'h-2',
            percentage >= 90 && 'bg-destructive/20',
            percentage >= 80 && percentage < 90 && 'bg-yellow-500/20'
          )}
        />
      )}
    </div>
  )
}

interface StorageMeterProps {
  icon: React.ElementType
  storage: StorageUsage
}

function StorageMeter({ icon: Icon, storage }: StorageMeterProps) {
  const isUnlimited = storage.limitGb === -1

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          Storage
        </div>
        <span className="text-sm text-muted-foreground">
          {formatStorageSize(storage.usedBytes)}
          {!isUnlimited && ` / ${storage.limitGb}GB`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={storage.percentage}
          className={cn(
            'h-2',
            storage.percentage >= 90 && 'bg-destructive/20'
          )}
        />
      )}
    </div>
  )
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
