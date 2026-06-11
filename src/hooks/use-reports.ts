'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { reportsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useOrganizationStore } from '@/stores/organization-store'
import type { ReportsResponse, ReportsParams } from '@/types'

// Query keys
export const reportsKeys = {
  all: ['reports'] as const,
  reports: (params?: ReportsParams) => [...reportsKeys.all, params] as const,
}

// Get reports data
export function useReports(params?: ReportsParams) {
  const { currentOrganization } = useOrganizationStore()

  return useQuery<ReportsResponse>({
    queryKey: reportsKeys.reports(params),
    queryFn: () => reportsApi.getReports(params),
    enabled: !!currentOrganization?.id,
  })
}

// Export reports
export function useExportReports() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (params: ReportsParams & { format: 'csv' | 'xlsx' | 'pdf' }) =>
      reportsApi.exportReports(params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reports.${variables.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Report exported',
        description: 'Your report has been downloaded.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Export failed',
        description: 'Failed to export report. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
