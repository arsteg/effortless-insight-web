'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import {
  MultiFileDropzone,
  DuplicateWarning,
} from '@/components/features/upload'
import { useUploadMultipleNotices } from '@/hooks/use-upload'
import type { DuplicateWarning as DuplicateWarningType } from '@/types'

type UploadStep = 'select' | 'confirm-duplicate' | 'uploading' | 'complete' | 'error'

export default function UploadNoticePage() {
  const [step, setStep] = useState<UploadStep>('select')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarningType | null>(null)

  const {
    upload,
    isUploading,
    progress,
    uploadResponses,
    error,
    reset,
  } = useUploadMultipleNotices({
    onSuccess: (responses) => {
      setStep('complete')
    },
    onError: () => {
      setStep('error')
    },
  })

  const handleFilesChange = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return
    setStep('uploading')
    upload(selectedFiles)
  }, [selectedFiles, upload])

  const handleContinueDespiteDuplicate = useCallback(() => {
    setDuplicateWarning(null)
    setStep('complete')
  }, [])

  const handleCancelDuplicate = useCallback(() => {
    setDuplicateWarning(null)
    setSelectedFiles([])
    reset()
    setStep('select')
  }, [reset])

  const handleRetry = useCallback(() => {
    reset()
    setStep('select')
    setSelectedFiles([])
  }, [reset])

  const handleUploadAnother = useCallback(() => {
    reset()
    setStep('select')
    setSelectedFiles([])
  }, [reset])

  // Show progress/status view for uploading, complete, or error states
  if (step === 'uploading' || step === 'complete' || step === 'error') {
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
          <h1 className="text-3xl font-bold tracking-tight">Upload Notices</h1>
        </div>

        {/* Multi-file Upload Progress */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {isUploading ? 'Uploading...' : step === 'complete' ? 'Upload Complete' : 'Upload Failed'}
            </CardTitle>
            <CardDescription>
              {isUploading
                ? `Uploading file ${progress.current} of ${progress.total}`
                : step === 'complete'
                  ? progress.failedFiles.length > 0
                    ? `${progress.completedFiles.length} file(s) uploaded, ${progress.failedFiles.length} failed`
                    : `${progress.completedFiles.length} file(s) uploaded successfully`
                  : progress.failedFiles.length > 0
                    ? `${progress.failedFiles.length} file(s) could not be uploaded`
                    : 'An error occurred during upload'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isUploading && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px]">{progress.fileName}</span>
                    <span>{progress.fileProgress}%</span>
                  </div>
                  <Progress value={progress.fileProgress} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall progress: {progress.current} / {progress.total} files
                </div>
              </>
            )}

            {step === 'complete' && (
              <div className="space-y-3">
                {progress.completedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">Successfully uploaded:</p>
                    {progress.completedFiles.map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {progress.failedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">Failed to upload:</p>
                    {progress.failedFiles.map((file, i) => (
                      <div key={i} className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-sm text-destructive">{file.error}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'error' && progress.failedFiles.length === 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>{error?.message || 'Upload failed'}</span>
              </div>
            )}

            {step === 'error' && progress.failedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">Failed to upload:</p>
                {progress.failedFiles.map((file, i) => (
                  <div key={i} className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-sm text-destructive">{file.error}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(step === 'complete' || step === 'error') && (
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleUploadAnother}>
                  Upload More
                </Button>
                <Link href="/notices" className={buttonVariants({ variant: 'default' })}>
                  View Notices
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
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
        <h1 className="text-3xl font-bold tracking-tight">Upload Notices</h1>
        <p className="text-muted-foreground">
          Upload one or more GST notice documents for AI-powered analysis.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Supported formats: PDF, JPG, PNG. Maximum 10MB per file. Up to 10 files at once.
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
                  Upload your GST notice documents. Our AI will automatically extract
                  key information, assess risk, and provide actionable insights for each notice.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multi-File Dropzone */}
          <MultiFileDropzone onFilesChange={handleFilesChange} />

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} Notice${selectedFiles.length > 1 ? 's' : ''}`
                )}
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
