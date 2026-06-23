import * as signalR from '@microsoft/signalr'
import type { Notification, NotificationEvent } from '@/types/notification'

type NotificationCallback = (event: NotificationEvent) => void

class NotificationService {
  private connection: signalR.HubConnection | null = null
  private callbacks: Set<NotificationCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isConnecting = false

  /**
   * Initialize and connect to the notification hub
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    if (this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No access token available for SignalR connection')
        this.isConnecting = false
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

      // Connection state change handlers
      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error?.message)
        this.reconnectAttempts++
      })

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId)
        this.reconnectAttempts = 0
      })

      this.connection.onclose((error) => {
        console.log('SignalR connection closed', error?.message)
        this.isConnecting = false
      })

      await this.connection.start()
      console.log('SignalR connected')
      this.reconnectAttempts = 0
      this.isConnecting = false
    } catch (error) {
      console.error('Failed to connect to SignalR:', error)
      this.isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from the notification hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('SignalR disconnected')
      } catch (error) {
        console.error('Error disconnecting from SignalR:', error)
      }
      this.connection = null
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
