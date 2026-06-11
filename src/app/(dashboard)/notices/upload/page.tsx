'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  FileDropzone,
  UploadProgress,
  DuplicateWarning,
} from '@/components/features/upload'
import { useUploadNotice, useProcessingStatus } from '@/hooks/use-upload'
import type { DuplicateWarning as DuplicateWarningType } from '@/types'

type UploadStep = 'select' | 'confirm-duplicate' | 'uploading' | 'processing' | 'complete' | 'error'

export default function UploadNoticePage() {
  const [step, setStep] = useState<UploadStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarningType | null>(null)

  const {
    upload,
    isUploading,
    uploadProgress,
    uploadResponse,
    error,
    reset,
  } = useUploadNotice({
    onSuccess: (response) => {
      if (response.duplicateWarning?.isPotentialDuplicate) {
        setDuplicateWarning(response.duplicateWarning)
        setStep('confirm-duplicate')
      } else {
        setStep('processing')
      }
    },
    onError: () => {
      setStep('error')
    },
  })

  const { status: processingStatus, startPolling } = useProcessingStatus(
    uploadResponse?.noticeId,
    {
      enabled: step === 'processing',
      onComplete: () => setStep('complete'),
      onFailed: () => setStep('error'),
    }
  )

  // Start polling when we enter the processing step
  useEffect(() => {
    if (step === 'processing' && uploadResponse?.noticeId) {
      startPolling()
    }
  }, [step, uploadResponse?.noticeId, startPolling])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleUpload = useCallback(() => {
    if (!selectedFile) return
    setStep('uploading')
    upload(selectedFile)
  }, [selectedFile, upload])

  const handleContinueDespiteDuplicate = useCallback(() => {
    setDuplicateWarning(null)
    setStep('processing')
  }, [])

  const handleCancelDuplicate = useCallback(() => {
    setDuplicateWarning(null)
    setSelectedFile(null)
    reset()
    setStep('select')
  }, [reset])

  const handleRetry = useCallback(() => {
    reset()
    setStep('select')
    setSelectedFile(null)
  }, [reset])

  const handleUploadAnother = useCallback(() => {
    reset()
    setStep('select')
    setSelectedFile(null)
  }, [reset])

  // Show progress/status view for uploading, processing, complete, or error states
  if (step === 'uploading' || step === 'processing' || step === 'complete' || step === 'error') {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <Link
            href="/notices"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Notices
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Upload Notice</h1>
        </div>

        {/* Upload Progress */}
        <UploadProgress
          uploadResponse={uploadResponse}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          processingStatus={processingStatus}
          error={error?.message}
          onRetry={handleRetry}
          onUploadAnother={handleUploadAnother}
        />
      </div>
    )
  }

  // Show duplicate warning
  if (step === 'confirm-duplicate' && duplicateWarning) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <Link
            href="/notices"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Notices
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Upload Notice</h1>
        </div>

        <div className="max-w-md mx-auto">
          <DuplicateWarning
            warning={duplicateWarning}
            onContinue={handleContinueDespiteDuplicate}
            onCancel={handleCancelDuplicate}
          />
        </div>
      </div>
    )
  }

  // Default: File selection view
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/notices"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Notices
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Upload Notice</h1>
        <p className="text-muted-foreground">
          Upload a GST notice document for AI-powered analysis.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Supported formats: PDF, JPG, PNG. Maximum file size: 10MB.
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  Upload your GST notice document. Our AI will automatically extract
                  key information, assess risk, and provide actionable insights.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Dropzone */}
          <FileDropzone onFileSelect={handleFileSelect} />

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                Upload Notice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Ensure the document is clear and readable. Blurry or low-quality
                scans may affect accuracy.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Upload the complete notice document including all pages and
                annexures.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                For best OCR results, ensure the document is not rotated or
                skewed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>
                Password-protected PDFs are not supported. Please remove
                protection before uploading.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
