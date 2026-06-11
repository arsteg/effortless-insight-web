'use client'

import Link from 'next/link'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { UpcomingDeadline } from '@/types'

interface DeadlineListProps {
  deadlines: UpcomingDeadline[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DeadlineList({
  deadlines,
  isLoading = false,
  emptyMessage = 'No upcoming deadlines',
}: DeadlineListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <DeadlineItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/notices/upload">Upload a notice</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deadlines.map((deadline) => (
        <DeadlineItem key={deadline.noticeId} deadline={deadline} />
      ))}
    </div>
  )
}

interface DeadlineItemProps {
  deadline: UpcomingDeadline
}

function DeadlineItem({ deadline }: DeadlineItemProps) {
  const getUrgencyStyles = () => {
    if (deadline.daysRemaining < 0) {
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20'
    }
    if (deadline.daysRemaining <= 3) {
      return 'border-l-4 border-l-red-500'
    }
    if (deadline.daysRemaining <= 7) {
      return 'border-l-4 border-l-yellow-500'
    }
    return 'border-l-4 border-l-green-500'
  }

  const getDaysLabel = () => {
    if (deadline.daysRemaining < 0) {
      return (
        <span className="text-red-500 font-medium">
          Overdue by {Math.abs(deadline.daysRemaining)} day{Math.abs(deadline.daysRemaining) !== 1 ? 's' : ''}
        </span>
      )
    }
    if (deadline.daysRemaining === 0) {
      return <span className="text-red-500 font-medium">Due today</span>
    }
    if (deadline.daysRemaining === 1) {
      return <span className="text-yellow-600 font-medium">Due tomorrow</span>
    }
    return (
      <span className="text-muted-foreground">
        {deadline.daysRemaining} days remaining
      </span>
    )
  }

  const getPriorityBadge = () => {
    switch (deadline.priority) {
      case 'critical':
        return <Badge variant="danger">Critical</Badge>
      case 'high':
        return <Badge variant="warning">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      default:
        return <Badge variant="secondary">Low</Badge>
    }
  }

  return (
    <Link
      href={`/notices/${deadline.noticeId}`}
      className={cn(
        'block rounded-lg border p-4 transition-colors hover:bg-accent',
        getUrgencyStyles()
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {deadline.noticeNumber || `Notice #${deadline.noticeId.slice(0, 8)}`}
            </span>
            {getPriorityBadge()}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {deadline.noticeType}
            {deadline.gstin && ` - ${deadline.gstin}`}
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {deadline.daysRemaining < 0 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {getDaysLabel()}
            </div>
            <span className="text-muted-foreground">
              {formatDate(deadline.deadline)}
            </span>
          </div>
        </div>
        <div className="text-right">
          {deadline.demandAmount !== undefined && deadline.demandAmount > 0 && (
            <div className="font-medium">{formatCurrency(deadline.demandAmount)}</div>
          )}
          {deadline.assignedToName && (
            <div className="text-sm text-muted-foreground mt-1">
              {deadline.assignedToName}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function DeadlineItemSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-1 h-4 w-48" />
          <Skeleton className="mt-2 h-4 w-36" />
        </div>
        <div className="text-right">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
      </div>
    </div>
  )
}
