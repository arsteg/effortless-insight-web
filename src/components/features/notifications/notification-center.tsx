'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Settings, CheckCheck } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { NotificationList } from './notification-list'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/hooks/use-notifications'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import type { NotificationFilters } from '@/types/notification'

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const notificationCount = useAppStore((state) => state.notificationCount)

  // Build filters based on selected tab
  const filters: NotificationFilters = {
    status: filter === 'unread' ? 'unread' : 'all',
    pageSize: 20,
  }

  const { data, isLoading } = useNotifications(filters)

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const notifications = data?.notifications ?? []

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate({})
  }

  const handleOpenSettings = () => {
    setOpen(false)
    router.push('/settings/notifications')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {notificationCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notificationCount} unread
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMarkAllAsRead}
              disabled={notificationCount === 0 || markAllAsRead.isPending}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenSettings}
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onClose={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={notifications.filter(n => !n.isRead)}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onClose={() => setOpen(false)}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              setOpen(false)
              router.push('/notifications')
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationCenter
