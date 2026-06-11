'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import type {
  DashboardResponse,
  DashboardMetrics,
  UpcomingDeadline,
  ActivityItem,
} from '@/types'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  deadlines: (limit?: number) => [...dashboardKeys.all, 'deadlines', { limit }] as const,
  activity: (limit?: number) => [...dashboardKeys.all, 'activity', { limit }] as const,
}

// Get full dashboard data
export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: dashboardKeys.all,
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get dashboard metrics only
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 30 * 1000,
  })
}

// Get upcoming deadlines
export function useUpcomingDeadlines(limit: number = 5) {
  return useQuery<UpcomingDeadline[]>({
    queryKey: dashboardKeys.deadlines(limit),
    queryFn: () => dashboardApi.getUpcomingDeadlines(limit),
    staleTime: 60 * 1000, // 1 minute
  })
}

// Get recent activity
export function useRecentActivity(limit: number = 10) {
  return useQuery<ActivityItem[]>({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 30 * 1000,
  })
}
