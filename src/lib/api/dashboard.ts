import { apiClient } from './client'
import type { ApiResponse, DashboardMetrics, DeadlineItem } from '@/types'

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

  // Get all deadlines between two dates for the calendar
  async getCalendarDeadlines(startDate: string, endDate: string): Promise<DeadlineItem[]> {
    const response = await apiClient.get<ApiResponse<DeadlineItem[]>>(
      `/analytics/calendar?startDate=${startDate}&endDate=${endDate}`
    )
    return response.data.data
  },
}
