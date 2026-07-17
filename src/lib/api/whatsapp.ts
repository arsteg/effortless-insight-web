/**
 * WhatsApp Integration API
 */
import { apiClient } from './client'
import type {
  WhatsAppStatus,
  WhatsAppLinkRequest,
  WhatsAppLinkResponse,
  WhatsAppVerifyRequest,
  WhatsAppPreferences,
  WhatsAppUpdatePreferencesRequest,
  WhatsAppOptInRequest,
  WhatsAppOptInResponse,
  WhatsAppHealthStatus,
  WhatsAppStatistics,
  WhatsAppMessageLog,
  WhatsAppTemplate,
} from '@/types/whatsapp'

const BASE_URL = '/whatsapp'

/**
 * Get WhatsApp connection status
 */
export async function getStatus(): Promise<WhatsAppStatus> {
  const response = await apiClient.get<{ data: WhatsAppStatus }>(`${BASE_URL}/status`)
  return response.data.data || response.data
}

/**
 * Request WhatsApp link (initiates OTP flow)
 */
export async function requestLink(data: WhatsAppLinkRequest): Promise<WhatsAppLinkResponse> {
  const response = await apiClient.post<{ data: WhatsAppLinkResponse } | WhatsAppLinkResponse>(
    `${BASE_URL}/link/request`,
    data
  )
  return 'data' in response.data ? response.data.data : response.data
}

/**
 * Verify WhatsApp link code
 */
export async function verifyLink(data: WhatsAppVerifyRequest): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`${BASE_URL}/link/verify`, data)
  return response.data
}

/**
 * Unlink WhatsApp
 */
export async function unlink(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(`${BASE_URL}/unlink`)
  return response.data
}

/**
 * Get WhatsApp notification preferences
 */
export async function getPreferences(): Promise<WhatsAppPreferences> {
  const response = await apiClient.get<WhatsAppPreferences | { data: WhatsAppPreferences }>(
    `${BASE_URL}/preferences`
  )
  return 'data' in response.data ? response.data.data : response.data
}

/**
 * Update WhatsApp notification preferences
 */
export async function updatePreferences(
  data: WhatsAppUpdatePreferencesRequest
): Promise<WhatsAppPreferences> {
  const response = await apiClient.patch<WhatsAppPreferences | { data: WhatsAppPreferences }>(
    `${BASE_URL}/preferences`,
    data
  )
  return 'data' in response.data ? response.data.data : response.data
}

/**
 * Opt-in or opt-out of WhatsApp notifications
 */
export async function setOptIn(data: WhatsAppOptInRequest): Promise<WhatsAppOptInResponse> {
  const response = await apiClient.post<WhatsAppOptInResponse>(`${BASE_URL}/opt-in`, data)
  return response.data
}

/**
 * Get WhatsApp health status (admin only)
 */
export async function getHealthStatus(): Promise<WhatsAppHealthStatus> {
  const response = await apiClient.get<WhatsAppHealthStatus | { data: WhatsAppHealthStatus }>(
    `${BASE_URL}/health`
  )
  return 'data' in response.data ? response.data.data : response.data
}

/**
 * Get WhatsApp statistics (admin only)
 */
export async function getStatistics(
  startDate?: string,
  endDate?: string
): Promise<WhatsAppStatistics> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await apiClient.get<WhatsAppStatistics | { data: WhatsAppStatistics }>(
    `${BASE_URL}/statistics?${params.toString()}`
  )
  return 'data' in response.data ? response.data.data : response.data
}

/**
 * Get message logs (admin only)
 */
export async function getMessageLogs(params?: {
  page?: number
  pageSize?: number
  direction?: 'inbound' | 'outbound'
  status?: string
  startDate?: string
  endDate?: string
}): Promise<{ messages: WhatsAppMessageLog[]; total: number; page: number; pageSize: number }> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())
  if (params?.direction) searchParams.append('direction', params.direction)
  if (params?.status) searchParams.append('status', params.status)
  if (params?.startDate) searchParams.append('startDate', params.startDate)
  if (params?.endDate) searchParams.append('endDate', params.endDate)

  const response = await apiClient.get<{ data: { messages: WhatsAppMessageLog[]; total: number; page: number; pageSize: number } }>(
    `${BASE_URL}/messages?${searchParams.toString()}`
  )
  return response.data.data
}

/**
 * Get WhatsApp templates (admin only)
 */
export async function getTemplates(): Promise<WhatsAppTemplate[]> {
  const response = await apiClient.get<WhatsAppTemplate[] | { data: WhatsAppTemplate[] }>(
    `${BASE_URL}/templates`
  )
  return Array.isArray(response.data) ? response.data : response.data.data
}

/**
 * Sync templates from Meta (admin only)
 */
export async function syncTemplates(): Promise<{ synced: number; message: string }> {
  const response = await apiClient.post<{ synced: number; message: string }>(
    `${BASE_URL}/templates/sync`
  )
  return response.data
}

/**
 * Retry a failed message (admin only)
 */
export async function retryMessage(messageId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `${BASE_URL}/messages/${messageId}/retry`
  )
  return response.data
}

/**
 * Send a test message (admin only, for debugging)
 */
export async function sendTestMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId: string }> {
  const response = await apiClient.post<{ success: boolean; messageId: string }>(
    `${BASE_URL}/test-message`,
    { phoneNumber, message }
  )
  return response.data
}

export const whatsappApi = {
  getStatus,
  requestLink,
  verifyLink,
  unlink,
  getPreferences,
  updatePreferences,
  setOptIn,
  getHealthStatus,
  getStatistics,
  getMessageLogs,
  getTemplates,
  syncTemplates,
  retryMessage,
  sendTestMessage,
}

export default whatsappApi
