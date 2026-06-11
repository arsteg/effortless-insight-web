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
      formData.append('file', file)

      // Simulate progress updates during upload
      // In a real implementation, you'd use axios onUploadProgress
      setUploadProgress(0)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      try {
        const response = await noticesApi.upload(formData)
        clearInterval(progressInterval)
        setUploadProgress(100)
        return response
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }
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
