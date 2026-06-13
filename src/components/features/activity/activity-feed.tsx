'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import {
  MessageCircle,
  PlusCircle,
  CheckCircle,
  Edit,
  UserPlus,
  ArrowRight,
  FilePlus,
  FileText,
  FileCheck,
  AlertTriangle,
  AtSign,
  Trash,
  Smile,
  UserCheck,
  RefreshCw,
  Cpu,
  GitBranch,
  Filter,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityFeed } from '@/hooks/use-collaboration'
import type { Activity, ActivityType } from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  noticeId: string
  className?: string
}

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  comment_added: <MessageCircle className="h-4 w-4" />,
  task_created: <PlusCircle className="h-4 w-4" />,
  task_completed: <CheckCircle className="h-4 w-4" />,
  task_updated: <Edit className="h-4 w-4" />,
  task_assigned: <UserPlus className="h-4 w-4" />,
  task_status_changed: <ArrowRight className="h-4 w-4" />,
  document_uploaded: <FilePlus className="h-4 w-4" />,
  document_requested: <FileText className="h-4 w-4" />,
  document_reviewed: <FileCheck className="h-4 w-4" />,
  document_overdue: <AlertTriangle className="h-4 w-4" />,
  user_mentioned: <AtSign className="h-4 w-4" />,
  comment_edited: <Edit className="h-4 w-4" />,
  comment_deleted: <Trash className="h-4 w-4" />,
  comment_reaction: <Smile className="h-4 w-4" />,
  notice_assigned: <UserCheck className="h-4 w-4" />,
  notice_status_changed: <RefreshCw className="h-4 w-4" />,
  ai_analysis_completed: <Cpu className="h-4 w-4" />,
  workflow_stage_changed: <GitBranch className="h-4 w-4" />,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  comment_added: 'text-blue-500 bg-blue-100',
  task_created: 'text-emerald-500 bg-emerald-100',
  task_completed: 'text-green-500 bg-green-100',
  task_updated: 'text-gray-500 bg-gray-100',
  task_assigned: 'text-cyan-500 bg-cyan-100',
  task_status_changed: 'text-amber-500 bg-amber-100',
  document_uploaded: 'text-violet-500 bg-violet-100',
  document_requested: 'text-pink-500 bg-pink-100',
  document_reviewed: 'text-emerald-500 bg-emerald-100',
  document_overdue: 'text-red-500 bg-red-100',
  user_mentioned: 'text-blue-500 bg-blue-100',
  comment_edited: 'text-gray-500 bg-gray-100',
  comment_deleted: 'text-red-500 bg-red-100',
  comment_reaction: 'text-amber-500 bg-amber-100',
  notice_assigned: 'text-cyan-500 bg-cyan-100',
  notice_status_changed: 'text-amber-500 bg-amber-100',
  ai_analysis_completed: 'text-violet-500 bg-violet-100',
  workflow_stage_changed: 'text-cyan-500 bg-cyan-100',
}

const FILTER_OPTIONS = [
  { value: 'comment', label: 'Comments' },
  { value: 'task', label: 'Tasks' },
  { value: 'document', label: 'Documents' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'system', label: 'System' },
]

function groupActivitiesByDate(activities: Activity[]) {
  const groups: { label: string; activities: Activity[] }[] = []
  let currentGroup: { label: string; activities: Activity[] } | null = null

  for (const activity of activities) {
    const date = new Date(activity.timestamp)
    let label: string

    if (isToday(date)) {
      label = 'Today'
    } else if (isYesterday(date)) {
      label = 'Yesterday'
    } else {
      label = format(date, 'MMMM d, yyyy')
    }

    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, activities: [] }
      groups.push(currentGroup)
    }

    currentGroup.activities.push(activity)
  }

  return groups
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ActivityItem({ activity }: { activity: Activity }) {
  const icon = ACTIVITY_ICONS[activity.type] || <MessageCircle className="h-4 w-4" />
  const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-500 bg-gray-100'

  return (
    <div className="flex gap-3 py-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', colorClass)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {activity.actor && (
            <>
              <Avatar className="h-5 w-5">
                <AvatarImage src={activity.actor.avatarUrl} alt={activity.actor.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(activity.actor.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{activity.actor.name}</span>
            </>
          )}
          <span className="text-sm text-muted-foreground">{activity.message}</span>
        </div>
        {Boolean(activity.data.preview) && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {String(activity.data.preview)}
          </p>
        )}
        {Boolean(activity.data.taskTitle) && (
          <p className="mt-1 text-sm text-muted-foreground">
            &quot;{String(activity.data.taskTitle)}&quot;
          </p>
        )}
        {Boolean(activity.data.duration) && (
          <p className="mt-1 text-xs text-muted-foreground">
            Completed in {String(activity.data.duration)}
          </p>
        )}
        {Boolean(activity.data.filename) && (
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <FilePlus className="h-3 w-3" />
            <span>{String(activity.data.filename)}</span>
            {Boolean(activity.data.size) && (
              <span className="text-xs">
                ({(Number(activity.data.size) / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(activity.timestamp), 'h:mm a')}
      </div>
    </div>
  )
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({ noticeId, className }: ActivityFeedProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const { data, isLoading, refetch } = useActivityFeed(noticeId, {
    types: selectedFilters.length > 0 ? selectedFilters.join(',') : undefined,
  })

  const toggleFilter = (value: string) => {
    setSelectedFilters((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    )
  }

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <ActivityFeedSkeleton />
      </div>
    )
  }

  const groups = data ? groupActivitiesByDate(data.activities) : []

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Activity Feed</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                {selectedFilters.length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                    {selectedFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FILTER_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedFilters.includes(option.value)}
                  onCheckedChange={() => toggleFilter(option.value)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{group.label}</h4>
              <div className="divide-y">
                {group.activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.hasMore && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm">
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
