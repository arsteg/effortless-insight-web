'use client'

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon?: LucideIcon
  variant?: 'default' | 'warning' | 'success' | 'danger'
  isLoading?: boolean
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  variant = 'default',
  isLoading = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-muted-foreground'
    // For most metrics, up is good. But for "due this week" or "overdue", up is bad
    if (variant === 'warning' || variant === 'danger') {
      return trend > 0 ? 'text-coral-600' : 'text-mint-600'
    }
    return trend > 0 ? 'text-mint-600' : 'text-coral-600'
  }

  // Map each metric variant to its domain accent family (see DESIGN_SYSTEM.md).
  const accent = {
    default: { bar: 'before:bg-azure-500', tile: 'bg-azure-50 text-azure-600' },
    warning: { bar: 'before:bg-amber-500', tile: 'bg-amber-50 text-amber-600' },
    success: { bar: 'before:bg-mint-500', tile: 'bg-mint-50 text-mint-600' },
    danger: { bar: 'before:bg-coral-500', tile: 'bg-coral-50 text-coral-600' },
  }[variant]

  const TrendIcon = getTrendIcon()

  return (
    <Card
      className={cn(
        'card-lift relative overflow-hidden',
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:content-['']",
        accent.bar
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent.tile)}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-16 animate-pulse rounded bg-muted" />
          </>
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight nums">{value}</div>
            {(trend !== undefined || trendLabel) && (
              <div className="flex items-center gap-1 text-xs">
                {/* eslint-disable-next-line react-hooks/static-components -- icon selected from static lucide components, not created during render */}
                <TrendIcon className={cn('h-3 w-3', getTrendColor())} />
                <span className={getTrendColor()}>
                  {trend !== undefined && (
                    <>{trend > 0 ? '+' : ''}{trend}%</>
                  )}
                </span>
                {trendLabel && (
                  <span className="text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
