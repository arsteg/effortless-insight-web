'use client'

import Link from 'next/link'
import { Calendar, AlertTriangle, Clock, FileText, CheckSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDate } from '@/lib/utils'
import type { DeadlineItem } from '@/types'

interface DeadlineListProps {
  deadlines: DeadlineItem[]
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
        <DeadlineItemRow key={deadline.id} deadline={deadline} />
      ))}
    </div>
  )
}

interface DeadlineItemRowProps {
  deadline: DeadlineItem
}

function DeadlineItemRow({ deadline }: DeadlineItemRowProps) {
  const getUrgencyStyles = () => {
    if (deadline.isOverdue || deadline.daysRemaining < 0) {
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
    if (deadline.isOverdue || deadline.daysRemaining < 0) {
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

  const getTypeIcon = () => {
    if (deadline.type === 'task') {
      return <CheckSquare className="h-4 w-4 text-muted-foreground" />
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />
  }

  const href = deadline.noticeId
    ? `/notices/${deadline.noticeId}`
    : '#'

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-lg border p-4 transition-colors hover:bg-accent',
        getUrgencyStyles()
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="font-medium truncate">
              {deadline.title}
            </span>
            {getPriorityBadge()}
          </div>
          {deadline.noticeNumber && (
            <div className="mt-1 text-sm text-muted-foreground">
              Notice: {deadline.noticeNumber}
            </div>
          )}
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              {deadline.isOverdue || deadline.daysRemaining < 0 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {getDaysLabel()}
            </div>
            <span className="text-muted-foreground">
              {formatDate(deadline.dueDate)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="capitalize">
            {deadline.type}
          </Badge>
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
        </div>
      </div>
    </div>
  )
}
