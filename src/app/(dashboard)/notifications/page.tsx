'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns'
import {
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  Search,
  Settings,
  AlertTriangle,
  Clock,
  FileText,
  CheckSquare,
  MessageCircle,
  User,
  Loader2,
  ChevronRight,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/use-notifications'
import { useAppStore } from '@/stores/app-store'
import type { Notification, NotificationFilters } from '@/types/notification'
import { NotificationCategory, NotificationPriority } from '@/types/notification'

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  deadline: Clock,
  sla: AlertTriangle,
  notice: FileText,
  task: CheckSquare,
  collaboration: MessageCircle,
  account: User,
}

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
}

// Priority badge variants
const PRIORITY_BADGE_VARIANTS: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  high: 'default',
  medium: 'secondary',
  low: 'outline',
}

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  deadline: 'Deadlines',
  sla: 'SLA Alerts',
  notice: 'Notices',
  task: 'Tasks',
  collaboration: 'Collaboration',
  account: 'Account',
}

interface GroupedNotifications {
  today: Notification[]
  yesterday: Notification[]
  thisWeek: Notification[]
  older: Notification[]
}

function groupNotifications(notifications: Notification[]): GroupedNotifications {
  const groups: GroupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  }

  for (const notification of notifications) {
    const date = parseISO(notification.createdAt)
    if (isToday(date)) {
      groups.today.push(notification)
    } else if (isYesterday(date)) {
      groups.yesterday.push(notification)
    } else if (isThisWeek(date)) {
      groups.thisWeek.push(notification)
    } else {
      groups.older.push(notification)
    }
  }

  return groups
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <BellOff className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {filter === 'unread' ? 'All caught up!' : 'No notifications'}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {filter === 'unread'
          ? "You've read all your notifications. Great job staying on top of things!"
          : "You don't have any notifications yet. They'll appear here when you receive them."}
      </p>
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onClick: (notification: Notification) => void
}

function NotificationItem({ notification, onMarkRead, onClick }: NotificationItemProps) {
  const Icon = CATEGORY_ICONS[notification.category] || Bell
  const priorityColor = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.low

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50',
        !notification.isRead && 'bg-primary/5 border-primary/20'
      )}
      onClick={() => onClick(notification)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              priorityColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn('font-medium', !notification.isRead && 'font-semibold')}>
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
                <Badge variant={PRIORITY_BADGE_VARIANTS[notification.priority]}>
                  {notification.priority}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {notification.body}
            </p>

            <div className="mt-2 flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                {CATEGORY_LABELS[notification.category] || notification.category}
              </Badge>

              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkRead(notification.id)
                  }}
                >
                  Mark as read
                </Button>
              )}

              {notification.actionUrl && (
                <span className="flex items-center text-xs text-primary">
                  View details <ChevronRight className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface NotificationGroupProps {
  title: string
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onClick: (notification: Notification) => void
}

function NotificationGroup({ title, notifications, onMarkRead, onClick }: NotificationGroupProps) {
  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const notificationCount = useAppStore((state) => state.notificationCount)

  // Build filters
  const filters: NotificationFilters = {
    status: statusFilter,
    category: categoryFilters.length === 1 ? categoryFilters[0] : undefined,
    pageSize: 50,
  }

  const { data, isLoading, refetch } = useNotifications(filters)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.notifications ?? []

  // Apply client-side filters
  const filteredNotifications = notifications.filter((n) => {
    // Category filter (multiple)
    if (categoryFilters.length > 0 && !categoryFilters.includes(n.category)) {
      return false
    }
    // Priority filter
    if (priorityFilter && n.priority !== priorityFilter) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        n.title.toLowerCase().includes(query) ||
        n.body.toLowerCase().includes(query)
      )
    }
    return true
  })

  const grouped = groupNotifications(filteredNotifications)

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsRead.mutate(id)
    },
    [markAsRead]
  )

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Mark as read
      if (!notification.isRead) {
        markAsRead.mutate(notification.id)
      }
      // Navigate if action URL exists
      if (notification.actionUrl) {
        router.push(notification.actionUrl)
      } else if (notification.referenceType === 'notice' && notification.referenceId) {
        router.push(`/notices/${notification.referenceId}`)
      }
    },
    [markAsRead, router]
  )

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead.mutate({})
  }, [markAllAsRead])

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const clearFilters = () => {
    setCategoryFilters([])
    setPriorityFilter('')
    setSearchQuery('')
  }

  const hasActiveFilters = categoryFilters.length > 0 || priorityFilter || searchQuery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with all your alerts and notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={notificationCount === 0 || markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all read
          </Button>
          <Button variant="outline" onClick={() => router.push('/settings/notifications')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* Status tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread" className="gap-1">
                Unread
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {notificationCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="w-[250px] pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={categoryFilters.includes(value)}
                  onCheckedChange={() => toggleCategoryFilter(value)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {categoryFilters.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleCategoryFilter(cat)}
            >
              {CATEGORY_LABELS[cat]}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {priorityFilter && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setPriorityFilter('')}
            >
              {priorityFilter}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              Search: {searchQuery}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {/* Notifications list */}
      {isLoading ? (
        <NotificationSkeleton />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState filter={statusFilter} />
      ) : (
        <div className="space-y-8">
          <NotificationGroup
            title="Today"
            notifications={grouped.today}
            onMarkRead={handleMarkRead}
            onClick={handleNotificationClick}
          />
          <NotificationGroup
            title="Yesterday"
            notifications={grouped.yesterday}
            onMarkRead={handleMarkRead}
            onClick={handleNotificationClick}
          />
          <NotificationGroup
            title="This Week"
            notifications={grouped.thisWeek}
            onMarkRead={handleMarkRead}
            onClick={handleNotificationClick}
          />
          <NotificationGroup
            title="Older"
            notifications={grouped.older}
            onMarkRead={handleMarkRead}
            onClick={handleNotificationClick}
          />
        </div>
      )}

      {/* Load more (if applicable) */}
      {data?.hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => refetch()}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
