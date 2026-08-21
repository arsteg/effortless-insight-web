import * as signalR from '@microsoft/signalr'
import type { Notification, NotificationEvent } from '@/types/notification'

type NotificationCallback = (event: NotificationEvent) => void

class NotificationService {
  private connection: signalR.HubConnection | null = null
  private callbacks: Set<NotificationCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private startPromise: Promise<void> | null = null
  private refCount = 0
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Initialize and connect to the notification hub.
   * Ref-counted: each connect() should be paired with a disconnect().
   * Concurrent calls share a single in-flight start.
   */
  async connect(): Promise<void> {
    this.refCount++

    // A consumer came back before a deferred teardown ran — keep the connection
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer)
      this.disconnectTimer = null
    }

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    if (this.startPromise) {
      return this.startPromise
    }

    this.startPromise = this.startConnection()
    try {
      await this.startPromise
    } finally {
      this.startPromise = null
    }
  }

  private async startConnection(): Promise<void> {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No access token available for SignalR connection')
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notifications`, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null // Stop retrying
            }
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      // Handle incoming notifications
      this.connection.on('NotificationReceived', (notification: Notification) => {
        this.notifySubscribers({
          type: 'new',
          notification,
          unreadCount: -1, // Will be updated by the component
        })
      })

      // Handle notification read events
      this.connection.on('NotificationRead', (data: { notificationId: string; unreadCount: number }) => {
        this.notifySubscribers({
          type: 'read',
          notificationId: data.notificationId,
          unreadCount: data.unreadCount,
        })
      })

      // Handle mark all read
      this.connection.on('AllNotificationsRead', (data: { unreadCount: number }) => {
        this.notifySubscribers({
          type: 'readAll',
          unreadCount: data.unreadCount,
        })
      })

      // Handle unread count update
      this.connection.on('UnreadCountUpdated', (data: { unreadCount: number }) => {
        this.notifySubscribers({
          type: 'new',
          unreadCount: data.unreadCount,
        })
      })

      // The API's InAppNotificationService actually sends "notification" with an
      // envelope ({ type, payload }) and "badgeUpdate" ({ unreadCount }) — the
      // handlers above cover an older contract and never fire for new
      // notifications. Handle the real protocol here.
      this.connection.on('notification', (message: { type?: string; payload?: Record<string, unknown> }) => {
        const p = (message?.payload ?? message) as Record<string, unknown> | undefined
        if (!p?.id) return
        const notification = {
          ...(p as unknown as Notification),
          isRead: Boolean(p.isRead ?? p.read ?? false),
        }
        this.notifySubscribers({
          type: 'new',
          notification,
          unreadCount: -1, // Will be updated by the component
        })
      })

      this.connection.on('badgeUpdate', (data: { unreadCount: number }) => {
        this.notifySubscribers({
          type: 'new',
          unreadCount: data.unreadCount,
        })
      })

      // Connection state change handlers
      this.connection.onreconnecting(() => {
        this.reconnectAttempts++
      })

      this.connection.onreconnected(() => {
        this.reconnectAttempts = 0
      })

      await this.connection.start()
      this.reconnectAttempts = 0
    } catch (error) {
      console.error('Failed to connect to SignalR:', error)
      throw error
    }
  }

  /**
   * Release one consumer of the connection. The actual teardown is deferred
   * briefly and skipped if a consumer reconnects (e.g. React StrictMode's
   * mount → cleanup → mount cycle in development), so the connection is never
   * stopped mid-negotiation.
   */
  async disconnect(): Promise<void> {
    this.refCount = Math.max(0, this.refCount - 1)
    if (this.refCount > 0) return

    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer)
    }
    this.disconnectTimer = setTimeout(() => {
      this.disconnectTimer = null
      void this.teardown()
    }, 1000)
  }

  private async teardown(): Promise<void> {
    if (this.refCount > 0) return

    const connection = this.connection
    this.connection = null

    // Never stop while a start is negotiating — wait for it to settle first
    try {
      await this.startPromise
    } catch {
      // start failed; there is nothing healthy to stop
    }

    try {
      await connection?.stop()
    } catch (error) {
      console.error('Error disconnecting from SignalR:', error)
    }
  }

  /**
   * Subscribe to notification events
   */
  subscribe(callback: NotificationCallback): () => void {
    this.callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  /**
   * Notify all subscribers of an event
   */
  private notifySubscribers(event: NotificationEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in notification callback:', error)
      }
    })
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  /**
   * Get connection state
   */
  getState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

export default notificationService
