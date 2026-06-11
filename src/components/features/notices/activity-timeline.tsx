'use client'

import {
  Upload,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Send,
  Bell,
  FileText,
  Edit,
  Clock,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, getInitials, cn } from '@/lib/utils'

// Activity types for notices
type NoticeActivityType =
  | 'created'
  | 'uploaded'
  | 'status_changed'
  | 'assigned'
  | 'comment_added'
  | 'task_created'
  | 'task_completed'
  | 'response_drafted'
  | 'response_submitted'
  | 'document_uploaded'
  | 'reminder_set'
  | 'edited'

interface NoticeActivity {
  id: string
  type: NoticeActivityType
  description: string
  userId: string
  userName: string
  userAvatar?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

interface ActivityTimelineProps {
  activities: NoticeActivity[]
  isLoading?: boolean
  emptyMessage?: string
}

export function ActivityTimeline({
  activities,
  isLoading = false,
  emptyMessage = 'No activity yet',
}: ActivityTimelineProps) {
  if (isLoading) {
    return <ActivityTimelineSkeleton />
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  // Group activities by date
  const groupedActivities = groupActivitiesByDate(activities)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {formatDateGroup(date)}
              </h4>
              <div className="space-y-4">
                {dayActivities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    isLast={index === dayActivities.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  activity: NoticeActivity
  isLast: boolean
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'created':
      case 'uploaded':
        return <Upload className="h-4 w-4 text-blue-500" />
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case 'status_changed':
        return <RefreshCw className="h-4 w-4 text-orange-500" />
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'task_created':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-cyan-500" />
      case 'response_drafted':
        return <Edit className="h-4 w-4 text-yellow-500" />
      case 'response_submitted':
        return <Send className="h-4 w-4 text-indigo-500" />
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-teal-500" />
      case 'reminder_set':
        return <Bell className="h-4 w-4 text-pink-500" />
      case 'edited':
        return <Edit className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted z-10">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm">
              <span className="font-medium">{activity.userName}</span>{' '}
              <span className="text-muted-foreground">{activity.description}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDateTime(activity.createdAt)}
            </p>
          </div>
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={activity.userAvatar} alt={activity.userName} />
            <AvatarFallback className="text-xs">
              {getInitials(activity.userName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Metadata */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
            {Boolean(activity.metadata.oldStatus && activity.metadata.newStatus) && (
              <p>
                Status changed from{' '}
                <span className="font-medium">{String(activity.metadata.oldStatus)}</span> to{' '}
                <span className="font-medium">{String(activity.metadata.newStatus)}</span>
              </p>
            )}
            {Boolean(activity.metadata.comment) && (
              <p className="text-muted-foreground italic">
                &quot;{String(activity.metadata.comment)}&quot;
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function groupActivitiesByDate(activities: NoticeActivity[]): Record<string, NoticeActivity[]> {
  const groups: Record<string, NoticeActivity[]> = {}

  activities.forEach((activity) => {
    const date = new Date(activity.createdAt).toISOString().split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
  })

  return groups
}

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date)
}

function ActivityTimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Export type for use in other components
export type { NoticeActivity, NoticeActivityType }
