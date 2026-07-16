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

// Multi-file upload progress state
interface MultiUploadProgress {
  current: number
  total: number
  fileName: string
  fileProgress: number
  completedFiles: string[]
  failedFiles: { name: string; error: string }[]
}

interface UseUploadMultipleNoticesOptions {
  onSuccess?: (responses: NoticeUploadResponse[]) => void
  onError?: (error: Error) => void
  onFileComplete?: (fileName: string, response: NoticeUploadResponse) => void
  onFileFailed?: (fileName: string, error: Error) => void
}

export function useUploadMultipleNotices(options?: UseUploadMultipleNoticesOptions) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [progress, setProgress] = useState<MultiUploadProgress>({
    current: 0,
    total: 0,
    fileName: '',
    fileProgress: 0,
    completedFiles: [],
    failedFiles: [],
  })

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      setProgress({
        current: 0,
        total: files.length,
        fileName: '',
        fileProgress: 0,
        completedFiles: [],
        failedFiles: [],
      })

      const results: NoticeUploadResponse[] = []
      const completed: string[] = []
      const failed: { name: string; error: string }[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(prev => ({
          ...prev,
          current: i + 1,
          fileName: file.name,
          fileProgress: 0,
        }))

        try {
          const formData = new FormData()
          formData.append('File', file)

          const response = await noticesApi.upload(formData, (progressEvent) => {
            if (progressEvent.total) {
              const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setProgress(prev => ({ ...prev, fileProgress }))
            }
          })

          results.push(response)
          completed.push(file.name)
          setProgress(prev => ({ ...prev, completedFiles: [...prev.completedFiles, file.name] }))
          options?.onFileComplete?.(file.name, response)
        } catch (err) {
          // Extract error message from API error or regular error
          const errorMessage = (err as { message?: string })?.message
            || (err as Error)?.message
            || 'Upload failed'
          failed.push({ name: file.name, error: errorMessage })
          setProgress(prev => ({
            ...prev,
            failedFiles: [...prev.failedFiles, { name: file.name, error: errorMessage }],
          }))
          options?.onFileFailed?.(file.name, err as Error)
        }
      }

      if (failed.length > 0 && results.length === 0) {
        // Include first error message for context
        const firstError = failed[0]?.error || 'Upload failed'
        throw new Error(failed.length === 1
          ? firstError
          : `${failed.length} file(s) failed to upload. ${firstError}`)
      }

      return results
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
      const failedCount = progress.failedFiles.length
      if (failedCount > 0) {
        toast({
          title: 'Upload partially complete',
          description: `${data.length} notice(s) uploaded, ${failedCount} failed.`,
          variant: 'default',
        })
      } else {
        toast({
          title: 'Notices uploaded',
          description: `${data.length} notice(s) are being processed.`,
          variant: 'success',
        })
      }
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload notices. Please try again.',
        variant: 'destructive',
      })
      options?.onError?.(error)
    },
  })

  const reset = useCallback(() => {
    setProgress({
      current: 0,
      total: 0,
      fileName: '',
      fileProgress: 0,
      completedFiles: [],
      failedFiles: [],
    })
    mutation.reset()
  }, [mutation])

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    uploadResponses: mutation.data,
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
