'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type DashboardParams } from '@/lib/api'
import type { DashboardMetrics, DeadlineItem } from '@/types'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  filtered: (params: DashboardParams) => ['dashboard', params] as const,
  calendar: (startDate: string, endDate: string) => ['dashboard', 'calendar', startDate, endDate] as const,
}

// Get full dashboard data with optional date filtering
export function useDashboard(params?: DashboardParams) {
  return useQuery<DashboardMetrics>({
    queryKey: params?.startDate || params?.endDate
      ? dashboardKeys.filtered(params)
      : dashboardKeys.all,
    queryFn: () => dashboardApi.getDashboard(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Get deadlines for the calendar's visible date range
export function useCalendarDeadlines(startDate: string, endDate: string) {
  return useQuery<DeadlineItem[]>({
    queryKey: dashboardKeys.calendar(startDate, endDate),
    queryFn: () => dashboardApi.getCalendarDeadlines(startDate, endDate),
    staleTime: 30 * 1000,
  })
}
