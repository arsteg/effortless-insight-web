'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: Accept
  maxSize?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT: Accept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function FileDropzone({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        const errorCode = rejection.errors[0]?.code

        if (errorCode === 'file-too-large') {
          setError(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`)
        } else if (errorCode === 'file-invalid-type') {
          setError('Invalid file type. Please upload a PDF, JPG, or PNG file.')
        } else {
          setError('Invalid file. Please try again.')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setSelectedFile(file)
        onFileSelect(file)
      }
    },
    [maxSize, onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled,
  })

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // If a file is selected, show the file preview
  if (selectedFile) {
    return (
      <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <File className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && !isDragReject && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isDragActive && !isDragReject
                ? 'bg-primary/10 text-primary'
                : isDragReject
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            <Upload className="h-6 w-6" />
          </div>
          {isDragActive && !isDragReject ? (
            <p className="text-sm font-medium text-primary">Drop the file here...</p>
          ) : isDragReject ? (
            <p className="text-sm font-medium text-destructive">File type not supported</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag and drop your notice here, or{' '}
                <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG up to {formatFileSize(maxSize)}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
