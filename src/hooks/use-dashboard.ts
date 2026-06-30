'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type DashboardParams } from '@/lib/api'
import type { DashboardMetrics } from '@/types'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  filtered: (params: DashboardParams) => ['dashboard', params] as const,
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
