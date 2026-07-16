'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MultiFileDropzoneProps {
  onFilesChange: (files: File[]) => void
  accept?: Accept
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPT: Accept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_MAX_FILES = 10

export function MultiFileDropzone({
  onFilesChange,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  disabled = false,
  className,
}: MultiFileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.flatMap(r => r.errors)
        const errorCodes = new Set(errors.map(e => e.code))

        if (errorCodes.has('file-too-large')) {
          setError(`One or more files exceed the maximum size of ${formatFileSize(maxSize)}.`)
        } else if (errorCodes.has('file-invalid-type')) {
          setError('One or more files have invalid type. Please upload PDF, JPG, or PNG files only.')
        } else if (errorCodes.has('too-many-files')) {
          setError(`Maximum ${maxFiles} files allowed.`)
        } else {
          setError('One or more files are invalid. Please try again.')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        const newFiles = [...selectedFiles, ...acceptedFiles]

        // Check if we exceed max files
        if (newFiles.length > maxFiles) {
          setError(`Maximum ${maxFiles} files allowed. Please remove some files.`)
          return
        }

        setSelectedFiles(newFiles)
        onFilesChange(newFiles)
      }
    },
    [maxSize, maxFiles, selectedFiles, onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - selectedFiles.length, // Allow up to remaining slots
    disabled,
    multiple: true,
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesChange(newFiles)
    setError(null)
  }

  const clearAll = () => {
    setSelectedFiles([])
    onFilesChange([])
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={className}>
      {/* Dropzone */}
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
            <p className="text-sm font-medium text-primary">Drop the files here...</p>
          ) : isDragReject ? (
            <p className="text-sm font-medium text-destructive">One or more files not supported</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag and drop your files here, or{' '}
                <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, or PNG up to {formatFileSize(maxSize)} each. Max {maxFiles} files.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Selected files ({selectedFiles.length}/{maxFiles})
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
