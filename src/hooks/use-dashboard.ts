'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'
import type { DashboardMetrics } from '@/types'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
}

// Get full dashboard data
export function useDashboard() {
  return useQuery<DashboardMetrics>({
    queryKey: dashboardKeys.all,
    queryFn: () => dashboardApi.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds
  })
}
