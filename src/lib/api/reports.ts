import { apiClient } from './client'
import type { ApiResponse, ReportsResponse, ReportsParams } from '@/types'

export const reportsApi = {
  async getReports(params?: ReportsParams): Promise<ReportsResponse> {
    const response = await apiClient.get<ApiResponse<ReportsResponse>>('/reports', { params })
    return response.data.data
  },

  async exportReports(params?: ReportsParams & { format: 'csv' | 'xlsx' | 'pdf' }): Promise<Blob> {
    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
