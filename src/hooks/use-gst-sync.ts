'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gstSyncApi } from '@/lib/api/gst-sync'
import { useToast } from '@/hooks/use-toast'
import type {
  GstClient,
  GstClientListResponse,
  GstNoticeRaw,
  GstNoticeRawListResponse,
  GstSyncSession,
  GstSyncSessionListResponse,
  GstSyncStatistics,
  GstClientFilters,
  GstNoticeFilters,
  GstSyncSessionFilters,
  CreateGstClientRequest,
  UpdateGstClientRequest,
  ImportNoticesRequest,
  ExtensionConfig,
} from '@/types/gst-sync'

// Query keys
export const gstSyncKeys = {
  all: ['gst-sync'] as const,
  // Clients
  clients: () => [...gstSyncKeys.all, 'clients'] as const,
  clientList: (filters: GstClientFilters) => [...gstSyncKeys.clients(), 'list', filters] as const,
  clientDetail: (id: string) => [...gstSyncKeys.clients(), 'detail', id] as const,
  // Sessions
  sessions: () => [...gstSyncKeys.all, 'sessions'] as const,
  sessionList: (filters: GstSyncSessionFilters) => [...gstSyncKeys.sessions(), 'list', filters] as const,
  sessionDetail: (id: string) => [...gstSyncKeys.sessions(), 'detail', id] as const,
  // Notices
  notices: () => [...gstSyncKeys.all, 'notices'] as const,
  noticeList: (filters: GstNoticeFilters) => [...gstSyncKeys.notices(), 'list', filters] as const,
  noticeDetail: (id: string) => [...gstSyncKeys.notices(), 'detail', id] as const,
  // Other
  statistics: () => [...gstSyncKeys.all, 'statistics'] as const,
  extensionConfig: () => [...gstSyncKeys.all, 'extension-config'] as const,
}

// ============================================================================
// GST Clients Hooks
// ============================================================================

export function useGstClients(filters: GstClientFilters = {}) {
  return useQuery<GstClientListResponse>({
    queryKey: gstSyncKeys.clientList(filters),
    queryFn: () => gstSyncApi.listClients(filters),
    staleTime: 30 * 1000,
  })
}

export function useGstClient(id: string) {
  return useQuery<GstClient>({
    queryKey: gstSyncKeys.clientDetail(id),
    queryFn: () => gstSyncApi.getClient(id),
    enabled: !!id,
  })
}

export function useCreateGstClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateGstClientRequest) => gstSyncApi.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clients() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.statistics() })
      toast({
        title: 'GSTIN Added',
        description: 'The GSTIN has been added successfully. Install the Chrome extension to start syncing.',
        variant: 'success',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to add GSTIN',
        description: error.message || 'Please check the GSTIN and try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateGstClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGstClientRequest }) =>
      gstSyncApi.updateClient(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clients() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clientDetail(data.id) })
      toast({
        title: 'Client Updated',
        description: 'The GST client settings have been updated.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update client settings. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteGstClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => gstSyncApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clients() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.statistics() })
      toast({
        title: 'Client Removed',
        description: 'The GSTIN has been removed from sync.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to remove the client. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function usePauseGstClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => gstSyncApi.pauseClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clients() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clientDetail(data.id) })
      toast({
        title: 'Sync Paused',
        description: 'Notice sync has been paused for this GSTIN.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Action Failed',
        description: 'Failed to pause sync. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useResumeGstClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => gstSyncApi.resumeClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clients() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.clientDetail(data.id) })
      toast({
        title: 'Sync Resumed',
        description: 'Notice sync has been resumed for this GSTIN.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Action Failed',
        description: 'Failed to resume sync. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// ============================================================================
// Sync Sessions Hooks
// ============================================================================

export function useGstSyncSessions(filters: GstSyncSessionFilters = {}) {
  return useQuery<GstSyncSessionListResponse>({
    queryKey: gstSyncKeys.sessionList(filters),
    queryFn: () => gstSyncApi.listSessions(filters),
    staleTime: 30 * 1000,
  })
}

export function useGstSyncSession(id: string) {
  return useQuery<GstSyncSession>({
    queryKey: gstSyncKeys.sessionDetail(id),
    queryFn: () => gstSyncApi.getSession(id),
    enabled: !!id,
  })
}

// ============================================================================
// Raw Notices Hooks
// ============================================================================

export function useGstNoticesRaw(filters: GstNoticeFilters = {}) {
  return useQuery<GstNoticeRawListResponse>({
    queryKey: gstSyncKeys.noticeList(filters),
    queryFn: () => gstSyncApi.listNotices(filters),
    staleTime: 30 * 1000,
  })
}

export function useGstNoticeRaw(id: string) {
  return useQuery<GstNoticeRaw>({
    queryKey: gstSyncKeys.noticeDetail(id),
    queryFn: () => gstSyncApi.getNotice(id),
    enabled: !!id,
  })
}

export function useImportGstNotices() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: ImportNoticesRequest) => gstSyncApi.importNotices(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.notices() })
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.statistics() })
      // Also invalidate main notices
      queryClient.invalidateQueries({ queryKey: ['notices'] })

      if (result.failed > 0) {
        toast({
          title: 'Partial Import',
          description: `Imported ${result.imported} notices. ${result.failed} failed.`,
          variant: 'default',
        })
      } else {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${result.imported} notice(s).`,
          variant: 'success',
        })
      }
    },
    onError: () => {
      toast({
        title: 'Import Failed',
        description: 'Failed to import notices. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useGstNoticePdfUrl(noticeId: string) {
  return useQuery({
    queryKey: ['gst-notice-pdf', noticeId],
    queryFn: () => gstSyncApi.getPdfDownloadUrl(noticeId),
    enabled: !!noticeId,
    staleTime: 5 * 60 * 1000, // 5 minutes (URLs expire)
  })
}

// ============================================================================
// Statistics Hook
// ============================================================================

export function useGstSyncStatistics() {
  return useQuery<GstSyncStatistics>({
    queryKey: gstSyncKeys.statistics(),
    queryFn: () => gstSyncApi.getStatistics(),
    staleTime: 60 * 1000,
  })
}

// ============================================================================
// Extension Config Hook
// ============================================================================

export function useExtensionConfig() {
  return useQuery<ExtensionConfig>({
    queryKey: gstSyncKeys.extensionConfig(),
    queryFn: () => gstSyncApi.getExtensionConfig(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateExtensionConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (config: Partial<ExtensionConfig>) => gstSyncApi.updateExtensionConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gstSyncKeys.extensionConfig() })
      toast({
        title: 'Settings Saved',
        description: 'Extension settings have been updated.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
