'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticesApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { dashboardKeys } from '@/hooks/use-dashboard'
import { billingKeys } from '@/hooks/use-billing'
import { getValidationErrorMessage } from '@/lib/api/error-utils'
import type {
  Notice,
  NoticeDetail,
  NoticeFilters,
  NoticeListResponse,
  NoticeStatistics,
  GstinNoticeSummary,
  NoticeStatus,
  UpdateNoticeRequest,
  AssignNoticeRequest,
  SimilarNotice,
} from '@/types'

// Query keys
export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (filters: NoticeFilters) => [...noticeKeys.lists(), filters] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: string) => [...noticeKeys.details(), id] as const,
  statistics: () => [...noticeKeys.all, 'statistics'] as const,
  similarNotices: (id: string) => [...noticeKeys.details(), id, 'similar'] as const,
}

// Get notices list with filters
export function useNotices(filters: NoticeFilters = {}) {
  return useQuery<NoticeListResponse>({
    queryKey: noticeKeys.list(filters),
    queryFn: () => noticesApi.list(filters),
    staleTime: 30 * 1000,
    // Recover missed hub events, including notices outside the current filter.
    refetchInterval: 15000,
  })
}

// Get single notice detail
export function useNotice(id: string) {
  return useQuery<NoticeDetail>({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticesApi.get(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const notice = query.state.data
      return notice && (notice.status === 'uploaded' || notice.status === 'processing' ||
        notice.processingStatus === 'retrying') ? 5000 : false
    },
  })
}

// Get notice statistics
export function useNoticeStatistics() {
  return useQuery<NoticeStatistics>({
    queryKey: noticeKeys.statistics(),
    queryFn: () => noticesApi.getStatistics(),
    staleTime: 60 * 1000,
  })
}

// Get per-GSTIN notice counts for the client summary strip
export function useGstinSummaries() {
  return useQuery<GstinNoticeSummary[]>({
    queryKey: [...noticeKeys.all, 'gstin-summary'] as const,
    queryFn: () => noticesApi.getGstinSummary(),
    staleTime: 60 * 1000,
  })
}

// Update notice mutation
export function useUpdateNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeRequest }) =>
      noticesApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast({
        title: 'Notice updated',
        description: 'The notice has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update the notice. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Assign notice mutation
export function useAssignNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignNoticeRequest }) =>
      noticesApi.assign(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(data.id) })
      toast({
        title: 'Notice assigned',
        description: 'The notice has been assigned successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Assignment failed',
        description: 'Failed to assign the notice. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Deleting a failed notice gives its quota slot back, so refresh the usage the
// upload page (['usage']) and billing widgets (billingKeys.usage()) read.
function invalidateNoticeUsage(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['usage'] })
  queryClient.invalidateQueries({ queryKey: billingKeys.usage() })
}

// Delete notice mutation
export function useDeleteNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      noticesApi.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      invalidateNoticeUsage(queryClient)
      toast({
        title: 'Notice deleted',
        description: 'The notice has been deleted successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the notice. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Update notice status mutation
export function useUpdateNoticeStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: NoticeStatus; reason?: string }) =>
      noticesApi.updateStatus(id, { status, reason }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast({
        title: 'Status updated',
        description: 'The notice status has been updated successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update the notice status. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Refresh everything that shows a notice's status after archive/unarchive
function invalidateNoticeStatus(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
  queryClient.invalidateQueries({ queryKey: noticeKeys.details() })
  queryClient.invalidateQueries({ queryKey: noticeKeys.statistics() })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
}

// Archive one or more notices. Each goes through the status endpoint, so a partial
// failure still archives the rest and reports how many could not be archived.
export function useArchiveNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => noticesApi.updateStatus(id, { status: 'archived' }))
      )
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      // Nothing archived: let onError show the API's reason
      if (failures.length === ids.length) throw failures[0].reason
      return { archived: ids.length - failures.length, failed: failures.length, firstError: failures[0]?.reason }
    },
    onSuccess: ({ archived, failed, firstError }) => {
      invalidateNoticeStatus(queryClient)
      if (failed > 0) {
        toast({
          title: 'Some notices were not archived',
          description: `${archived} of ${archived + failed} notices archived. ${getValidationErrorMessage(firstError, '')}`.trim(),
          variant: 'destructive',
        })
        return
      }
      toast({
        title: archived === 1 ? 'Notice archived' : `${archived} notices archived`,
        description:
          archived === 1
            ? 'The notice has been archived successfully.'
            : 'The selected notices have been archived successfully.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Archive failed',
        description: getValidationErrorMessage(error, 'Failed to archive the notice. Please try again.'),
        variant: 'destructive',
      })
    },
  })
}

// Unarchive one or more notices. The API only accepts the status each notice was archived
// from (notice.restoreStatus). Like archive, a partial failure still restores the rest.
export function useUnarchiveNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (targets: { id: string; status: NoticeStatus }[]) => {
      const results = await Promise.allSettled(
        targets.map(({ id, status }) => noticesApi.updateStatus(id, { status }))
      )
      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      // Nothing unarchived: let onError show the API's reason
      if (failures.length === targets.length) throw failures[0].reason
      return { unarchived: targets.length - failures.length, failed: failures.length, firstError: failures[0]?.reason }
    },
    onSuccess: ({ unarchived, failed, firstError }) => {
      invalidateNoticeStatus(queryClient)
      if (failed > 0) {
        toast({
          title: 'Some notices were not unarchived',
          description: `${unarchived} of ${unarchived + failed} notices unarchived. ${getValidationErrorMessage(firstError, '')}`.trim(),
          variant: 'destructive',
        })
        return
      }
      toast({
        title: unarchived === 1 ? 'Notice unarchived' : `${unarchived} notices unarchived`,
        description:
          unarchived === 1
            ? 'The notice has been restored to the active list.'
            : 'The selected notices have been restored to the active list.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Unarchive failed',
        description: getValidationErrorMessage(error, 'Failed to unarchive the notice. Please try again.'),
        variant: 'destructive',
      })
    },
  })
}

// Bulk delete notices mutation
export function useBulkDeleteNotices() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Delete notices one by one (could be optimized with batch API)
      await Promise.all(ids.map((id) => noticesApi.delete(id)))
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      invalidateNoticeUsage(queryClient)
      toast({
        title: 'Notices deleted',
        description: `${ids.length} notice(s) have been deleted.`,
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete some notices. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Export notices mutation
export function useExportNotices() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      filters,
      format,
    }: {
      filters?: NoticeFilters
      format: 'csv' | 'xlsx' | 'pdf'
    }) => {
      const blob = await noticesApi.export({ ...filters, format })
      return { blob, format }
    },
    onSuccess: ({ blob, format }) => {
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `notices-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Notices have been exported to ${format.toUpperCase()}.`,
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Export failed',
        description: 'Failed to export notices. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Get similar notices (AI-detected)
export function useSimilarNotices(noticeId: string) {
  return useQuery<SimilarNotice[]>({
    queryKey: noticeKeys.similarNotices(noticeId),
    queryFn: () => noticesApi.getSimilarNotices(noticeId),
    enabled: !!noticeId,
  })
}

// Export notice summary as PDF
export function useExportNoticeSummary() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      noticeId,
      noticeNumber,
    }: {
      noticeId: string
      noticeNumber?: string
    }) => {
      const blob = await noticesApi.exportSummary(noticeId)
      return { blob, noticeNumber }
    },
    onSuccess: ({ blob, noticeNumber }) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = noticeNumber
        ? `notice-${noticeNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}-summary.pdf`
        : `notice-summary-${new Date().toISOString().split('T')[0]}.pdf`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: 'Notice summary has been exported to PDF.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Export failed',
        description: 'Failed to export notice summary. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
