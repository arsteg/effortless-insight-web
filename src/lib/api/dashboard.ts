import { apiClient } from './client'
import type { ApiResponse, DashboardMetrics } from '@/types'

export interface DashboardParams {
  startDate?: string // YYYY-MM-DD format
  endDate?: string // YYYY-MM-DD format
}

export const dashboardApi = {
  // Get full dashboard data from analytics endpoint
  async getDashboard(params?: DashboardParams): Promise<DashboardMetrics> {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.set('startDate', params.startDate)
    if (params?.endDate) searchParams.set('endDate', params.endDate)

    const queryString = searchParams.toString()
    const url = `/analytics/dashboard${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<ApiResponse<DashboardMetrics>>(url)
    return response.data.data
  },
}
