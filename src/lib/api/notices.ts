import { apiClient } from './client'
import type {
  ApiResponse,
  Notice,
  NoticeDetail,
  NoticeListResponse,
  NoticeFilters,
  NoticeStatistics,
  NoticeUploadResponse,
  UpdateNoticeRequest,
  UpdateNoticeStatusRequest,
  AssignNoticeRequest,
  NoticeAiReport,
  Attachment,
  DownloadUrlResponse,
  NoticeResponse,
  Reminder,
  CreateReminderRequest,
} from '@/types'

export const noticesApi = {
  // Notice CRUD
  async list(filters?: NoticeFilters): Promise<NoticeListResponse> {
    const response = await apiClient.get<ApiResponse<NoticeListResponse>>('/notices', {
      params: filters,
    })
    return response.data.data
  },

  async get(noticeId: string): Promise<NoticeDetail> {
    const response = await apiClient.get<ApiResponse<NoticeDetail>>(`/notices/${noticeId}`)
    return response.data.data
  },

  async update(noticeId: string, data: UpdateNoticeRequest): Promise<NoticeDetail> {
    const response = await apiClient.put<ApiResponse<NoticeDetail>>(
      `/notices/${noticeId}`,
      data
    )
    return response.data.data
  },

  async updateStatus(noticeId: string, data: UpdateNoticeStatusRequest): Promise<Notice> {
    const response = await apiClient.put<ApiResponse<Notice>>(
      `/notices/${noticeId}/status`,
      data
    )
    return response.data.data
  },

  async assign(noticeId: string, data: AssignNoticeRequest): Promise<Notice> {
    const response = await apiClient.put<ApiResponse<Notice>>(
      `/notices/${noticeId}/assign`,
      data
    )
    return response.data.data
  },

  async delete(noticeId: string, reason?: string): Promise<void> {
    await apiClient.delete(`/notices/${noticeId}`, {
      params: { reason },
    })
  },

  // Upload
  async upload(
    formData: FormData,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<NoticeUploadResponse> {
    const response = await apiClient.post<ApiResponse<NoticeUploadResponse>>(
      '/notices/upload',
      formData,
      {
        // Content-Type is handled by the request interceptor for FormData
        timeout: 300000, // 5 minutes for large file uploads
        onUploadProgress: onUploadProgress
          ? (progressEvent) => {
              onUploadProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
              })
            }
          : undefined,
      }
    )
    return response.data.data
  },

  // Statistics
  async getStatistics(): Promise<NoticeStatistics> {
    const response = await apiClient.get<ApiResponse<NoticeStatistics>>('/notices/statistics')
    return response.data.data
  },

  // AI Report
  async getReport(noticeId: string): Promise<NoticeAiReport> {
    const response = await apiClient.get<ApiResponse<NoticeAiReport>>(
      `/notices/${noticeId}/report`
    )
    return response.data.data
  },

  async retryProcessing(noticeId: string): Promise<{ noticeId: string; jobId: string; status: string }> {
    const response = await apiClient.post<ApiResponse<{ noticeId: string; jobId: string; status: string }>>(
      `/notices/${noticeId}/report/retry`
    )
    return response.data.data
  },

  // Download
  async getDownloadUrl(noticeId: string): Promise<DownloadUrlResponse> {
    const response = await apiClient.get<ApiResponse<DownloadUrlResponse>>(
      `/notices/${noticeId}/download`
    )
    return response.data.data
  },

  // Attachments
  async getAttachments(noticeId: string): Promise<Attachment[]> {
    const response = await apiClient.get<ApiResponse<Attachment[]>>(
      `/notices/${noticeId}/attachments`
    )
    return response.data.data
  },

  async addAttachment(
    noticeId: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<Attachment> {
    const response = await apiClient.post<ApiResponse<Attachment>>(
      `/notices/${noticeId}/attachments`,
      formData,
      {
        // Content-Type is handled by the request interceptor for FormData
        timeout: 300000, // 5 minutes for large file uploads
        onUploadProgress: onUploadProgress
          ? (progressEvent) => {
              onUploadProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
              })
            }
          : undefined,
      }
    )
    return response.data.data
  },

  async deleteAttachment(noticeId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/notices/${noticeId}/attachments/${attachmentId}`)
  },

  async getAttachmentDownloadUrl(noticeId: string, attachmentId: string): Promise<DownloadUrlResponse> {
    const response = await apiClient.get<ApiResponse<DownloadUrlResponse>>(
      `/notices/${noticeId}/attachments/${attachmentId}/download`
    )
    return response.data.data
  },

  // Responses (drafts)
  async getResponses(noticeId: string): Promise<NoticeResponse[]> {
    const response = await apiClient.get<ApiResponse<NoticeResponse[]>>(
      `/notices/${noticeId}/responses`
    )
    return response.data.data
  },

  async getLatestResponse(noticeId: string): Promise<NoticeResponse> {
    const response = await apiClient.get<ApiResponse<NoticeResponse>>(
      `/notices/${noticeId}/responses/latest`
    )
    return response.data.data
  },

  async saveDraft(noticeId: string, draftContent: string): Promise<NoticeResponse> {
    const response = await apiClient.post<ApiResponse<NoticeResponse>>(
      `/notices/${noticeId}/responses/draft`,
      { draftContent }
    )
    return response.data.data
  },

  async submitForReview(noticeId: string, responseId: string): Promise<NoticeResponse> {
    const response = await apiClient.post<ApiResponse<NoticeResponse>>(
      `/notices/${noticeId}/responses/${responseId}/submit-for-review`
    )
    return response.data.data
  },

  async approveResponse(noticeId: string, responseId: string): Promise<NoticeResponse> {
    const response = await apiClient.post<ApiResponse<NoticeResponse>>(
      `/notices/${noticeId}/responses/${responseId}/approve`
    )
    return response.data.data
  },

  async markSubmitted(
    noticeId: string,
    responseId: string,
    data: { submissionReference?: string; submissionProofUrl?: string }
  ): Promise<NoticeResponse> {
    const response = await apiClient.post<ApiResponse<NoticeResponse>>(
      `/notices/${noticeId}/responses/${responseId}/mark-submitted`,
      data
    )
    return response.data.data
  },

  // Reminders
  async getReminders(noticeId: string): Promise<Reminder[]> {
    const response = await apiClient.get<ApiResponse<Reminder[]>>(
      `/notices/${noticeId}/reminders`
    )
    return response.data.data
  },

  async createReminder(noticeId: string, data: CreateReminderRequest): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>(
      `/notices/${noticeId}/reminders`,
      data
    )
    return response.data.data
  },

  async deleteReminder(noticeId: string, reminderId: string): Promise<void> {
    await apiClient.delete(`/notices/${noticeId}/reminders/${reminderId}`)
  },

  // Export
  async export(
    filters?: NoticeFilters & { format: 'csv' | 'xlsx' | 'pdf' }
  ): Promise<Blob> {
    const response = await apiClient.get('/notices/export', {
      params: filters,
      responseType: 'blob',
    })
    return response.data
  },
}
