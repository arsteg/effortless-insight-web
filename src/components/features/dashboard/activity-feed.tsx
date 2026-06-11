'use client'

import Link from 'next/link'
import {
  Upload,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Send,
  Bell,
  Activity,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import type { ActivityItem } from '@/types'

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  emptyMessage?: string
  maxHeight?: string
}

export function ActivityFeed({
  activities,
  isLoading = false,
  emptyMessage = 'No recent activity',
  maxHeight = '400px',
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <ActivityFeedItem key={activity.id} activity={activity} />
        ))}
      </div>
    </ScrollArea>
  )
}

interface ActivityFeedItemProps {
  activity: ActivityItem
}

function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'notice_uploaded':
        return <Upload className="h-4 w-4 text-blue-500" />
      case 'notice_assigned':
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case 'notice_status_changed':
        return <RefreshCw className="h-4 w-4 text-orange-500" />
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-cyan-500" />
      case 'response_submitted':
        return <Send className="h-4 w-4 text-indigo-500" />
      case 'deadline_approaching':
        return <Bell className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getLink = () => {
    if (activity.entityType === 'notice' && activity.entityId) {
      return `/notices/${activity.entityId}`
    }
    return null
  }

  const link = getLink()

  const content = (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{activity.userName}</span>{' '}
          <span className="text-muted-foreground">{activity.description}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>
      <Avatar className="h-6 w-6 flex-shrink-0">
        <AvatarImage src={activity.userAvatar} alt={activity.userName} />
        <AvatarFallback className="text-xs">
          {getInitials(activity.userName)}
        </AvatarFallback>
      </Avatar>
    </div>
  )

  if (link) {
    return (
      <Link
        href={link}
        className="block rounded-lg p-2 -mx-2 transition-colors hover:bg-accent"
      >
        {content}
      </Link>
    )
  }

  return <div className="p-2 -mx-2">{content}</div>
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-20 mt-1" />
      </div>
      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
    </div>
  )
}
