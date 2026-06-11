import { apiClient } from './client'
import type {
  ApiResponse,
  DashboardResponse,
  DashboardMetrics,
  UpcomingDeadline,
  ActivityItem,
} from '@/types'

export const dashboardApi = {
  // Get full dashboard data
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.get<ApiResponse<DashboardResponse>>('/dashboard')
    return response.data.data
  },

  // Get dashboard metrics only
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics')
    return response.data.data
  },

  // Get upcoming deadlines
  async getUpcomingDeadlines(limit: number = 5): Promise<UpcomingDeadline[]> {
    const response = await apiClient.get<ApiResponse<UpcomingDeadline[]>>(
      '/dashboard/deadlines',
      { params: { limit } }
    )
    return response.data.data
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const response = await apiClient.get<ApiResponse<ActivityItem[]>>(
      '/dashboard/activity',
      { params: { limit } }
    )
    return response.data.data
  },
}
