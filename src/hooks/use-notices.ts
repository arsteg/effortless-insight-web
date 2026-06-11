'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticesApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type {
  Notice,
  NoticeDetail,
  NoticeFilters,
  NoticeListResponse,
  NoticeStatistics,
  UpdateNoticeRequest,
  AssignNoticeRequest,
} from '@/types'

// Query keys
export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (filters: NoticeFilters) => [...noticeKeys.lists(), filters] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: string) => [...noticeKeys.details(), id] as const,
  statistics: () => [...noticeKeys.all, 'statistics'] as const,
}

// Get notices list with filters
export function useNotices(filters: NoticeFilters = {}) {
  return useQuery<NoticeListResponse>({
    queryKey: noticeKeys.list(filters),
    queryFn: () => noticesApi.list(filters),
    staleTime: 30 * 1000,
  })
}

// Get single notice detail
export function useNotice(id: string) {
  return useQuery<NoticeDetail>({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticesApi.get(id),
    enabled: !!id,
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

// Delete notice mutation
export function useDeleteNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      noticesApi.delete(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
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

// Archive notice mutation
export function useArchiveNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      noticesApi.updateStatus(id, { status: 'archived', reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      toast({
        title: 'Notice archived',
        description: 'The notice has been archived successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Archive failed',
        description: 'Failed to archive the notice. Please try again.',
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
