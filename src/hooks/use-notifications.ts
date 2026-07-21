import { useEffect, useCallback, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications'
import { notificationService } from '@/services/notifications'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'
import type {
  Notification,
  NotificationFilters,
  NotificationEvent,
  UpdatePreferencesRequest,
} from '@/types/notification'

// Query keys for React Query
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
}

/**
 * Hook for managing notifications list
 */
export function useNotifications(filters?: NotificationFilters) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const setNotificationCount = useAppStore((state) => state.setNotificationCount)

  // Fetch notifications
  const query = useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationsApi.list(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  // Update unread count when data changes
  useEffect(() => {
    if (query.data?.unreadCount !== undefined) {
      setNotificationCount(query.data.unreadCount)
    }
  }, [query.data?.unreadCount, setNotificationCount])

  // Subscribe to real-time updates
  useEffect(() => {
    const handleEvent = (event: NotificationEvent) => {
      if (event.type === 'new' && event.notification) {
        // Add new notification to the list
        queryClient.setQueryData(
          notificationKeys.list(filters),
          (old: any) => {
            if (!old) return old
            return {
              ...old,
              notifications: [event.notification, ...old.notifications],
              totalCount: old.totalCount + 1,
              unreadCount: old.unreadCount + 1,
            }
          }
        )

        // Show toast for new notification
        toast({
          title: event.notification.title,
          description: event.notification.body,
          variant: event.notification.priority === 'critical' ? 'destructive' : 'default',
        })
      } else if (event.type === 'read' && event.notificationId) {
        // Mark notification as read in the list
        queryClient.setQueryData(
          notificationKeys.list(filters),
          (old: any) => {
            if (!old) return old
            return {
              ...old,
              notifications: old.notifications.map((n: Notification) =>
                n.id === event.notificationId ? { ...n, isRead: true } : n
              ),
              unreadCount: event.unreadCount,
            }
          }
        )
      } else if (event.type === 'readAll') {
        // Mark all notifications as read
        queryClient.setQueryData(
          notificationKeys.list(filters),
          (old: any) => {
            if (!old) return old
            return {
              ...old,
              notifications: old.notifications.map((n: Notification) => ({ ...n, isRead: true })),
              unreadCount: 0,
            }
          }
        )
      }

      // Update unread count
      if (event.unreadCount >= 0) {
        setNotificationCount(event.unreadCount)
        queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: event.unreadCount })
      }
    }

    const unsubscribe = notificationService.subscribe(handleEvent)
    return unsubscribe
  }, [queryClient, filters, toast, setNotificationCount])

  return query
}

/**
 * Hook for getting unread notification count
 */
export function useUnreadCount() {
  const setNotificationCount = useAppStore((state) => state.setNotificationCount)

  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Poll every minute as fallback
  })

  useEffect(() => {
    if (query.data?.unreadCount !== undefined) {
      setNotificationCount(query.data.unreadCount)
    }
  }, [query.data?.unreadCount, setNotificationCount])

  return query
}

/**
 * Hook for marking a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const setNotificationCount = useAppStore((state) => state.setNotificationCount)

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: (data) => {
      // Update unread count
      setNotificationCount(data.remainingUnread)

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const setNotificationCount = useAppStore((state) => state.setNotificationCount)
  const { toast } = useToast()

  return useMutation({
    mutationFn: (options?: { category?: string; beforeDate?: string }) =>
      notificationsApi.markAllAsRead(options),
    onSuccess: (data) => {
      setNotificationCount(data.remainingUnread)
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast({
        title: 'All notifications marked as read',
        variant: 'default',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to mark notifications as read',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for deleting a notification (soft delete). Optimistically removes it from
 * the cached list and refreshes counts.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: () => {
      toast({
        title: 'Failed to delete notification',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: notificationsApi.getPreferences,
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook for updating notification preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() })
      toast({
        title: 'Preferences updated',
        variant: 'default',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to update preferences',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for managing SignalR connection
 */
export function useNotificationConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(async () => {
    try {
      setError(null)
      await notificationService.connect()
      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'))
      setIsConnected(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await notificationService.disconnect()
    setIsConnected(false)
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Update connection state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(notificationService.isConnected())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return {
    isConnected,
    error,
    connect,
    disconnect,
  }
}
