/**
 * GST Sync API Client
 */

import { apiClient } from './client'
import type {
  GstClient,
  GstClientListResponse,
  GstNoticeRaw,
  GstNoticeRawListResponse,
  GstSyncSession,
  GstSyncSessionListResponse,
  GstSyncStatistics,
  CreateGstClientRequest,
  UpdateGstClientRequest,
  GstClientFilters,
  GstNoticeFilters,
  GstSyncSessionFilters,
  ExtensionConfig,
  ImportNoticesRequest,
  ImportNoticesResponse,
} from '@/types/gst-sync'

const BASE_URL = '/gst-sync'

export const gstSyncApi = {
  // ============================================================================
  // GST Clients
  // ============================================================================

  /**
   * List GST clients
   */
  async listClients(filters: GstClientFilters = {}): Promise<GstClientListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.gstin) params.append('gstin', filters.gstin)
    if (filters.search) params.append('search', filters.search)

    const response = await apiClient.get<{ data: GstClientListResponse }>(
      `${BASE_URL}/clients?${params.toString()}`
    )
    return response.data.data
  },

  /**
   * Get single GST client
   */
  async getClient(id: string): Promise<GstClient> {
    const response = await apiClient.get<{ data: GstClient }>(
      `${BASE_URL}/clients/${id}`
    )
    return response.data.data
  },

  /**
   * Create GST client
   */
  async createClient(data: CreateGstClientRequest): Promise<GstClient> {
    const response = await apiClient.post<{ data: GstClient }>(
      `${BASE_URL}/clients`,
      data
    )
    return response.data.data
  },

  /**
   * Update GST client
   */
  async updateClient(id: string, data: UpdateGstClientRequest): Promise<GstClient> {
    const response = await apiClient.patch<{ data: GstClient }>(
      `${BASE_URL}/clients/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Delete GST client
   */
  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/clients/${id}`)
  },

  /**
   * Pause sync for a client
   */
  async pauseClient(id: string): Promise<GstClient> {
    const response = await apiClient.post<{ data: GstClient }>(
      `${BASE_URL}/clients/${id}/pause`
    )
    return response.data.data
  },

  /**
   * Resume sync for a client
   */
  async resumeClient(id: string): Promise<GstClient> {
    const response = await apiClient.post<{ data: GstClient }>(
      `${BASE_URL}/clients/${id}/resume`
    )
    return response.data.data
  },

  // ============================================================================
  // Sync Sessions
  // ============================================================================

  /**
   * List sync sessions
   */
  async listSessions(filters: GstSyncSessionFilters = {}): Promise<GstSyncSessionListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters.gstClientId) params.append('gstClientId', filters.gstClientId)
    if (filters.status) params.append('status', filters.status)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)

    const response = await apiClient.get<{ data: GstSyncSessionListResponse }>(
      `${BASE_URL}/sessions?${params.toString()}`
    )
    return response.data.data
  },

  /**
   * Get single sync session
   */
  async getSession(id: string): Promise<GstSyncSession> {
    const response = await apiClient.get<{ data: GstSyncSession }>(
      `${BASE_URL}/sessions/${id}`
    )
    return response.data.data
  },

  // ============================================================================
  // Raw Notices
  // ============================================================================

  /**
   * List raw notices
   */
  async listNotices(filters: GstNoticeFilters = {}): Promise<GstNoticeRawListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
    if (filters.gstClientId) params.append('gstClientId', filters.gstClientId)
    if (filters.noticeType) params.append('noticeType', filters.noticeType)
    if (filters.importStatus) params.append('importStatus', filters.importStatus)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)

    const response = await apiClient.get<{ data: GstNoticeRawListResponse }>(
      `${BASE_URL}/notices?${params.toString()}`
    )
    return response.data.data
  },

  /**
   * Get single raw notice
   */
  async getNotice(id: string): Promise<GstNoticeRaw> {
    const response = await apiClient.get<{ data: GstNoticeRaw }>(
      `${BASE_URL}/notices/${id}`
    )
    return response.data.data
  },

  /**
   * Import notices to main notices module
   */
  async importNotices(data: ImportNoticesRequest): Promise<ImportNoticesResponse> {
    const response = await apiClient.post<{ data: ImportNoticesResponse }>(
      `${BASE_URL}/notices/import`,
      data
    )
    return response.data.data
  },

  /**
   * Get PDF download URL
   */
  async getPdfDownloadUrl(noticeId: string): Promise<{ url: string; expiresAt: string }> {
    const response = await apiClient.get<{ data: { url: string; expiresAt: string } }>(
      `${BASE_URL}/notices/${noticeId}/pdf-url`
    )
    return response.data.data
  },

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get sync statistics
   */
  async getStatistics(): Promise<GstSyncStatistics> {
    const response = await apiClient.get<{ data: GstSyncStatistics }>(
      `${BASE_URL}/statistics`
    )
    return response.data.data
  },

  // ============================================================================
  // Extension
  // ============================================================================

  /**
   * Get extension configuration
   */
  async getExtensionConfig(): Promise<ExtensionConfig> {
    const response = await apiClient.get<{ data: ExtensionConfig }>(
      `${BASE_URL}/extension/config`
    )
    return response.data.data
  },

  /**
   * Update extension configuration
   */
  async updateExtensionConfig(config: Partial<ExtensionConfig>): Promise<ExtensionConfig> {
    const response = await apiClient.patch<{ data: ExtensionConfig }>(
      `${BASE_URL}/extension/config`,
      config
    )
    return response.data.data
  },
}

export default gstSyncApi
