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
      return trend > 0 ? 'text-red-500' : 'text-green-500'
    }
    return trend > 0 ? 'text-green-500' : 'text-red-500'
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-l-4 border-l-yellow-500'
      case 'success':
        return 'border-l-4 border-l-green-500'
      case 'danger':
        return 'border-l-4 border-l-red-500'
      default:
        return ''
    }
  }

  const TrendIcon = getTrendIcon()

  return (
    <Card className={cn(getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold">{value}</div>
            {(trend !== undefined || trendLabel) && (
              <div className="flex items-center gap-1 text-xs">
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
