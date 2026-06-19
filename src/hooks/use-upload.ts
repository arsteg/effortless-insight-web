'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { noticesApi } from '@/lib/api'
import { noticeKeys } from '@/hooks/use-notices'
import { useToast } from '@/hooks/use-toast'
import type { NoticeUploadResponse, ProcessingStatus } from '@/types'

interface UseUploadNoticeOptions {
  onSuccess?: (response: NoticeUploadResponse) => void
  onError?: (error: Error) => void
}

export function useUploadNotice(options?: UseUploadNoticeOptions) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [uploadProgress, setUploadProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      // Field name must match the backend property name (case-insensitive but matching is safer)
      formData.append('File', file)

      // Reset progress at start
      setUploadProgress(0)

      // Use real upload progress tracking via axios onUploadProgress
      const response = await noticesApi.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          // Calculate percentage (cap at 95% until server responds)
          const percentCompleted = Math.round(
            (progressEvent.loaded * 95) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        } else {
          // If total is unknown, show indeterminate progress
          // Increment slowly to show activity
          setUploadProgress((prev) => Math.min(prev + 1, 90))
        }
      })

      // Set to 100% when upload completes and server responds
      setUploadProgress(100)
      return response
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      toast({
        title: 'Notice uploaded',
        description: 'Your notice is being processed.',
        variant: 'success',
      })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      setUploadProgress(0)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload the notice. Please try again.',
        variant: 'destructive',
      })
      options?.onError?.(error)
    },
  })

  const reset = useCallback(() => {
    setUploadProgress(0)
    mutation.reset()
  }, [mutation])

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    uploadResponse: mutation.data,
    error: mutation.error,
    reset,
  }
}

// Hook to poll for processing status
export function useProcessingStatus(
  noticeId: string | undefined,
  options?: {
    enabled?: boolean
    onComplete?: () => void
    onFailed?: () => void
    pollingInterval?: number
  }
) {
  const [status, setStatus] = useState<ProcessingStatus | undefined>()
  const [isPolling, setIsPolling] = useState(false)

  const startPolling = useCallback(async () => {
    if (!noticeId || !options?.enabled) return

    setIsPolling(true)
    const interval = options?.pollingInterval || 2000

    const poll = async () => {
      try {
        const notice = await noticesApi.get(noticeId)
        setStatus(notice.processingStatus)

        if (notice.processingStatus === 'completed') {
          setIsPolling(false)
          options?.onComplete?.()
          return
        }

        if (notice.processingStatus === 'failed') {
          setIsPolling(false)
          options?.onFailed?.()
          return
        }

        // Continue polling
        setTimeout(poll, interval)
      } catch (error) {
        setIsPolling(false)
        options?.onFailed?.()
      }
    }

    poll()
  }, [noticeId, options])

  return {
    status,
    isPolling,
    startPolling,
  }
}
