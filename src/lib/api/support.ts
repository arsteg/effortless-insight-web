import { apiClient } from './client'

// ============================================================================
// In-app support tickets — support is deliberately an in-app channel
// (no support@ mailbox); customers raise and follow tickets here.
// ============================================================================

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export type SupportTicketCategory =
  | 'question'
  | 'problem'
  | 'billing'
  | 'feature_request'
  | 'other'

export interface SupportTicketSummary {
  id: string
  subject: string
  category: SupportTicketCategory
  status: SupportTicketStatus
  createdAt: string
  lastMessageAt: string
  messageCount: number
  hasUnreadSupportReply: boolean
}

export interface SupportTicketMessage {
  id: string
  isFromSupport: boolean
  senderName: string
  body: string
  createdAt: string
}

export interface SupportTicketDetail {
  id: string
  subject: string
  category: SupportTicketCategory
  status: SupportTicketStatus
  createdAt: string
  lastMessageAt: string
  messages: SupportTicketMessage[]
}

export interface CreateSupportTicketRequest {
  subject: string
  category: SupportTicketCategory
  message: string
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export const supportApi = {
  async list(): Promise<SupportTicketSummary[]> {
    const response = await apiClient.get<ApiEnvelope<SupportTicketSummary[]>>(
      '/support/tickets'
    )
    return response.data.data
  },

  async get(ticketId: string): Promise<SupportTicketDetail> {
    const response = await apiClient.get<ApiEnvelope<SupportTicketDetail>>(
      `/support/tickets/${ticketId}`
    )
    return response.data.data
  },

  async create(data: CreateSupportTicketRequest): Promise<SupportTicketDetail> {
    const response = await apiClient.post<ApiEnvelope<SupportTicketDetail>>(
      '/support/tickets',
      data
    )
    return response.data.data
  },

  async reply(ticketId: string, message: string): Promise<SupportTicketMessage> {
    const response = await apiClient.post<ApiEnvelope<SupportTicketMessage>>(
      `/support/tickets/${ticketId}/messages`,
      { message }
    )
    return response.data.data
  },

  async close(ticketId: string): Promise<void> {
    await apiClient.post(`/support/tickets/${ticketId}/close`)
  },
}
