'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { NoticeUploadResponse, ProcessingStatus } from '@/types'

type UploadState = 'uploading' | 'processing' | 'success' | 'error'

interface UploadProgressProps {
  uploadResponse?: NoticeUploadResponse
  isUploading?: boolean
  uploadProgress?: number
  processingStatus?: ProcessingStatus
  error?: string
  onRetry?: () => void
  onUploadAnother?: () => void
}

export function UploadProgress({
  uploadResponse,
  isUploading = false,
  uploadProgress = 0,
  processingStatus,
  error,
  onRetry,
  onUploadAnother,
}: UploadProgressProps) {
  const [state, setState] = useState<UploadState>('uploading')
  const [progressValue, setProgressValue] = useState(0)

  useEffect(() => {
    if (error) {
      setState('error')
    } else if (isUploading) {
      setState('uploading')
      setProgressValue(uploadProgress)
    } else if (uploadResponse) {
      if (processingStatus === 'completed') {
        setState('success')
        setProgressValue(100)
      } else if (processingStatus === 'failed') {
        setState('error')
      } else {
        setState('processing')
        setProgressValue(getProcessingProgress(processingStatus))
      }
    }
  }, [isUploading, uploadProgress, uploadResponse, processingStatus, error])

  // Auto-advance progress for visual feedback during processing
  useEffect(() => {
    if (state === 'processing' && progressValue < 95) {
      const timer = setInterval(() => {
        setProgressValue((prev) => Math.min(prev + 1, 95))
      }, 500)
      return () => clearInterval(timer)
    }
  }, [state, progressValue])

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full mb-4',
              state === 'uploading' && 'bg-blue-100 dark:bg-blue-900/30',
              state === 'processing' && 'bg-yellow-100 dark:bg-yellow-900/30',
              state === 'success' && 'bg-green-100 dark:bg-green-900/30',
              state === 'error' && 'bg-red-100 dark:bg-red-900/30'
            )}
          >
            {state === 'uploading' && (
              <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
            {state === 'processing' && (
              <Loader2 className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
            )}
            {state === 'success' && (
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            )}
            {state === 'error' && (
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2">
            {state === 'uploading' && 'Uploading Notice'}
            {state === 'processing' && 'Processing Notice'}
            {state === 'success' && 'Upload Complete!'}
            {state === 'error' && 'Upload Failed'}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {state === 'uploading' && 'Please wait while we upload your document...'}
            {state === 'processing' && getProcessingMessage(processingStatus)}
            {state === 'success' &&
              'Your notice has been uploaded and analyzed successfully.'}
            {state === 'error' && (error || 'Something went wrong. Please try again.')}
          </p>

          {/* Progress bar */}
          {(state === 'uploading' || state === 'processing') && (
            <div className="w-full mb-4">
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progressValue)}%
              </p>
            </div>
          )}

          {/* File info for success state */}
          {state === 'success' && uploadResponse && (
            <div className="w-full rounded-lg border bg-muted/30 p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium truncate">{uploadResponse.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    Notice ID: {uploadResponse.noticeId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full">
            {state === 'success' && uploadResponse && (
              <>
                <Button asChild>
                  <Link href={`/notices/${uploadResponse.noticeId}`}>
                    View Notice
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={onUploadAnother}>
                  Upload Another
                </Button>
              </>
            )}
            {state === 'error' && (
              <>
                <Button onClick={onRetry}>Try Again</Button>
                <Button variant="outline" asChild>
                  <Link href="/notices">Back to Notices</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getProcessingProgress(status?: ProcessingStatus): number {
  if (!status) return 50
  const progress: Record<ProcessingStatus, number> = {
    queued: 55,
    ocr_processing: 65,
    extracting: 75,
    classifying: 85,
    analyzing: 92,
    completed: 100,
    failed: 0,
    retrying: 60,
  }
  return progress[status] || 50
}

function getProcessingMessage(status?: ProcessingStatus): string {
  if (!status) return 'Analyzing your notice...'
  const messages: Record<ProcessingStatus, string> = {
    queued: 'Your notice is queued for processing...',
    ocr_processing: 'Extracting text from your document...',
    extracting: 'Identifying key information...',
    classifying: 'Classifying notice type...',
    analyzing: 'Running AI analysis...',
    completed: 'Analysis complete!',
    failed: 'Processing failed.',
    retrying: 'Retrying processing...',
  }
  return messages[status] || 'Processing...'
}
