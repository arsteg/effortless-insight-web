'use client'

import { useRouter } from 'next/navigation'
import { Bell, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './notification-item'
import type { Notification } from '@/types/notification'

interface NotificationListProps {
  notifications: Notification[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onMarkAsRead?: (notificationId: string) => void
  onClose?: () => void
}

export function NotificationList({
  notifications,
  isLoading,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onClose
}: NotificationListProps) {
  const router = useRouter()

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      onClose?.()
    } else if (notification.referenceType && notification.referenceId) {
      switch (notification.referenceType) {
        case 'notice':
          router.push(`/notices/${notification.referenceId}`)
          break
        case 'task':
          router.push(`/tasks/${notification.referenceId}`)
          break
        case 'comment':
          // Navigate to notice with comment
          const noticeId = notification.data?.noticeId as string
          if (noticeId) {
            router.push(`/notices/${noticeId}#comments`)
          }
          break
        default:
          break
      }
      onClose?.()
    }
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <Bell className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No notifications</p>
        <p className="text-sm text-muted-foreground mt-1">
          You're all caught up!
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>

      {hasMore && (
        <div className="p-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </ScrollArea>
  )
}

export default NotificationList
