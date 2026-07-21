import { apiClient } from './client'
import type { ApiResponse } from '@/types/api'
import type {
  Notification,
  NotificationListResponse,
  NotificationFilters,
  MarkReadResponse,
  MarkAllReadResponse,
  NotificationPreferences,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
  PushToken,
} from '@/types/notification'

export const notificationsApi = {
  /**
   * Get user's notifications with optional filtering
   */
  async list(filters?: NotificationFilters): Promise<NotificationListResponse> {
    const response = await apiClient.get<ApiResponse<NotificationListResponse>>(
      '/notifications',
      { params: filters }
    )
    return response.data.data
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count'
    )
    return response.data.data
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    const response = await apiClient.post<ApiResponse<MarkReadResponse>>(
      `/notifications/${notificationId}/read`
    )
    return response.data.data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(options?: {
    category?: string
    beforeDate?: string
  }): Promise<MarkAllReadResponse> {
    const response = await apiClient.post<ApiResponse<MarkAllReadResponse>>(
      '/notifications/read-all',
      options
    )
    return response.data.data
  },

  /**
   * Delete (soft-delete) a notification
   */
  async delete(notificationId: string): Promise<void> {
    await apiClient.delete(`/notifications/${notificationId}`)
  },

  /**
   * Get user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
      '/users/me/notification-preferences'
    )
    return response.data.data
  },

  /**
   * Update user's notification preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<NotificationPreferences> {
    const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
      '/users/me/notification-preferences',
      data
    )
    return response.data.data
  },

  /**
   * Register a push notification token
   */
  async registerPushToken(data: RegisterPushTokenRequest): Promise<PushToken> {
    const response = await apiClient.post<ApiResponse<PushToken>>(
      '/push-tokens',
      data
    )
    return response.data.data
  },

  /**
   * Deactivate a push token (e.g., on logout)
   */
  async deactivatePushToken(token: string): Promise<void> {
    await apiClient.delete(`/push-tokens/${encodeURIComponent(token)}`)
  },
}

export default notificationsApi
