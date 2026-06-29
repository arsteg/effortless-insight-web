import { apiClient } from './client'
import type { ApiResponse, DashboardMetrics } from '@/types'

export const dashboardApi = {
  // Get full dashboard data from analytics endpoint
  async getDashboard(): Promise<DashboardMetrics> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/analytics/dashboard')
    return response.data.data
  },
}
