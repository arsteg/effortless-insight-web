'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { noticesApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Attachment } from '@/types'

// Query keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  list: (noticeId: string) => [...attachmentKeys.all, 'list', noticeId] as const,
}

// Get attachments for a notice
export function useAttachments(noticeId: string) {
  return useQuery<Attachment[]>({
    queryKey: attachmentKeys.list(noticeId),
    queryFn: () => noticesApi.getAttachments(noticeId),
    enabled: !!noticeId,
  })
}

// Upload attachment
export function useUploadAttachment(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (formData: FormData) => noticesApi.addAttachment(noticeId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(noticeId) })
      toast({
        title: 'Attachment uploaded',
        description: 'The document has been uploaded successfully.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the document. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Delete attachment
export function useDeleteAttachment(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (attachmentId: string) => noticesApi.deleteAttachment(noticeId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(noticeId) })
      toast({
        title: 'Attachment deleted',
        description: 'The document has been deleted.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Get download URL
export function useDownloadAttachment(noticeId: string) {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (attachmentId: string) =>
      noticesApi.getAttachmentDownloadUrl(noticeId, attachmentId),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.url, '_blank')
    },
    onError: () => {
      toast({
        title: 'Download failed',
        description: 'Failed to get download link. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
