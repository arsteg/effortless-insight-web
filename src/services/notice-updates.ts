import * as signalR from '@microsoft/signalr'
import { getRealtimeAccessToken } from '@/lib/api/client'

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

export class NoticeUpdateService {
  private connection: signalR.HubConnection | null = null
  private callbacks = new Set<NoticeUpdateCallback>()
  private consumers = 0
  private organizationId: string | null = null
  private joinedOrganizationId: string | null = null
  private operations: Promise<void> = Promise.resolve()
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private retryCount = 0

  connect(organizationId: string): Promise<void> {
    this.consumers++
    this.organizationId = organizationId
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer)
    this.disconnectTimer = null
    return this.enqueue(() => this.ensureConnected())
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const pending = this.operations.then(operation)
    this.operations = pending.catch(() => {})
    return pending
  }

  private scheduleRetry(): void {
    if (!this.consumers || this.retryTimer) return
    const delay = Math.min(1000 * 2 ** Math.min(this.retryCount++, 5), 30000)
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      void this.enqueue(() => this.ensureConnected()).catch(() => {})
    }, delay)
  }

  private async joinOrganization(connection: signalR.HubConnection): Promise<void> {
    while (this.organizationId && this.joinedOrganizationId !== this.organizationId) {
      const organizationId = this.organizationId
      if (this.joinedOrganizationId) {
        await connection.invoke('LeaveOrganization', this.joinedOrganizationId)
      }
      await connection.invoke('JoinOrganization', organizationId)
      this.joinedOrganizationId = organizationId
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.consumers) return
    if (!this.connection) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notices`, {
          accessTokenFactory: getRealtimeAccessToken,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build()
      connection.on('NoticeStatusChanged', (event: NoticeStatusEvent) => {
        this.callbacks.forEach((callback) => callback(event))
      })
      connection.onreconnected(() => {
        this.joinedOrganizationId = null
        void this.enqueue(() => this.ensureConnected()).catch(() => {})
      })
      connection.onclose(() => {
        this.joinedOrganizationId = null
        this.scheduleRetry()
      })
      this.connection = connection
    }
    const connection = this.connection
    try {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        await connection.start()
      }
      if (connection.state === signalR.HubConnectionState.Connected) {
        await this.joinOrganization(connection)
        this.retryCount = 0
      }
    } catch (error) {
      this.scheduleRetry()
      throw error
    }
  }

  subscribe(callback: NoticeUpdateCallback): () => void {
    this.callbacks.add(callback)
    return () => { this.callbacks.delete(callback) }
  }

  async disconnect(): Promise<void> {
    this.consumers = Math.max(0, this.consumers - 1)
    if (this.consumers) return
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer)
    // Strict Mode and route transitions can immediately acquire the connection again.
    this.disconnectTimer = setTimeout(() => {
      this.disconnectTimer = null
      void this.enqueue(async () => {
        if (this.consumers) return
        if (this.retryTimer) clearTimeout(this.retryTimer)
        this.retryTimer = null
        const connection = this.connection
        this.connection = null
        this.joinedOrganizationId = null
        this.organizationId = null
        await connection?.stop()
      }).catch(() => {})
    }, 1000)
  }
}

export const noticeUpdateService = new NoticeUpdateService()
