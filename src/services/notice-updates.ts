import * as signalR from '@microsoft/signalr'
import { getAccessToken } from '@/lib/api/client'

export interface NoticeStatusEvent {
  noticeId: string
  status: string
  processingStatus: string
  riskLevel?: string
  riskScore?: number
  noticeType?: string
  updatedAt: string
}

type NoticeUpdateCallback = (event: NoticeStatusEvent) => void

class NoticeUpdateService {
  private connection: signalR.HubConnection | null = null
  private callbacks = new Set<NoticeUpdateCallback>()
  private isConnecting = false
  private currentOrganizationId: string | null = null
  private shouldConnect = false // Track if connection is desired (for React Strict Mode)
  private connectionPromise: Promise<void> | null = null
  private pendingOrganizationId: string | null = null

  async connect(organizationId: string): Promise<void> {
    this.shouldConnect = true
    this.pendingOrganizationId = organizationId

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      if (this.currentOrganizationId !== organizationId) {
        await this.switchOrganization(organizationId)
      }
      return
    }

    // If already connecting, wait for that connection attempt
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = this.doConnect(organizationId)
    try {
      await this.connectionPromise
    } finally {
      this.connectionPromise = null
    }
  }

  private async doConnect(organizationId: string): Promise<void> {
    if (this.isConnecting) return
    this.isConnecting = true

    try {
      const token = getAccessToken()
      if (!token) {
        console.warn('No access token for NoticeHub')
        this.isConnecting = false
        return
      }

      // Check if connection was cancelled before we start
      if (!this.shouldConnect) {
        this.isConnecting = false
        return
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notices`, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= 5) return null
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build()

      this.connection.on('NoticeStatusChanged', (event: NoticeStatusEvent) => {
        this.notifySubscribers(event)
      })

      this.connection.onreconnected(async () => {
        if (this.currentOrganizationId) {
          await this.connection?.invoke('JoinOrganization', this.currentOrganizationId)
        }
      })

      // Check again if connection was cancelled during setup
      if (!this.shouldConnect) {
        this.connection = null
        this.isConnecting = false
        return
      }

      await this.connection.start()
      await this.connection.invoke('JoinOrganization', organizationId)
      this.currentOrganizationId = organizationId
      this.isConnecting = false
    } catch (error) {
      this.isConnecting = false
      // Don't log or throw if the connection was intentionally stopped
      // This happens in React Strict Mode during development
      if (this.shouldConnect) {
        console.error('Failed to connect to NoticeHub:', error)
        throw error
      }
    }
  }

  private async switchOrganization(newOrgId: string): Promise<void> {
    if (this.currentOrganizationId) {
      await this.connection?.invoke('LeaveOrganization', this.currentOrganizationId)
    }
    await this.connection?.invoke('JoinOrganization', newOrgId)
    this.currentOrganizationId = newOrgId
  }

  subscribe(callback: NoticeUpdateCallback): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notifySubscribers(event: NoticeStatusEvent): void {
    this.callbacks.forEach((cb) => cb(event))
  }

  async disconnect(): Promise<void> {
    this.shouldConnect = false
    this.isConnecting = false

    if (this.connection) {
      try {
        await this.connection.stop()
      } catch {
        // Ignore errors when stopping - connection may already be stopped
        // or may be in a state where stop() throws (e.g., during negotiation)
      }
      this.connection = null
      this.currentOrganizationId = null
    }
  }
}

export const noticeUpdateService = new NoticeUpdateService()
