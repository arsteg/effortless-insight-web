'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  AlertTriangle,
  FileText,
  CheckCircle,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Shield,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notification'
import { NotificationType, NotificationCategory } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
  onMarkAsRead?: (notificationId: string) => void
}

// Get icon based on notification type/category
function getNotificationIcon(type: string, category: string) {
  switch (category) {
    case NotificationCategory.DEADLINE:
      return Calendar
    case NotificationCategory.SLA:
      return Clock
    case NotificationCategory.NOTICE:
      return FileText
    case NotificationCategory.TASK:
      return CheckCircle
    case NotificationCategory.COLLABORATION:
      return MessageSquare
    case NotificationCategory.ACCOUNT:
      return User
    default:
      return Bell
  }
}

// Get priority color
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Get icon background color
function getIconBackground(priority: string) {
  switch (priority) {
    case 'critical':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-gray-400'
    default:
      return 'bg-primary'
  }
}

export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type, notification.category)
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
    if (onClick) {
      onClick(notification)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-4 border-b cursor-pointer transition-colors',
        'hover:bg-muted/50',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          getIconBackground(notification.priority)
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm truncate',
              !notification.isRead ? 'font-semibold' : 'font-medium'
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          </div>

          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full border',
              getPriorityColor(notification.priority)
            )}
          >
            {notification.priority}
          </span>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem
