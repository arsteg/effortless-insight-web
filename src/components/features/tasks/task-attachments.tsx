'use client'

import { useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Download, FileText, Loader2, Paperclip, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useTaskAttachments,
  useUploadTaskAttachment,
  useDownloadTaskAttachment,
  useDeleteTaskAttachment,
} from '@/hooks/use-collaboration'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // matches the API request size limit

function formatFileSize(bytes?: number): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface TaskAttachmentsProps {
  taskId: string
  className?: string
}

export function TaskAttachments({ taskId, className }: TaskAttachmentsProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: attachments, isLoading } = useTaskAttachments(taskId)
  const uploadMutation = useUploadTaskAttachment(taskId)
  const downloadMutation = useDownloadTaskAttachment(taskId)
  const deleteMutation = useDeleteTaskAttachment(taskId)

  const items = attachments ?? []

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'The maximum attachment size is 50 MB.',
        variant: 'destructive',
      })
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      toast({
        title: 'File attached',
        description: `"${file.name}" was uploaded.`,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (attachmentId: string) => {
    try {
      const info = await downloadMutation.mutateAsync(attachmentId)
      window.open(info.downloadUrl, '_blank', 'noopener')
    } catch (error) {
      toast({
        title: 'Download failed',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (attachmentId: string, fileName: string) => {
    try {
      await deleteMutation.mutateAsync(attachmentId)
      toast({
        title: 'Attachment deleted',
        description: `"${fileName}" was removed.`,
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Failed to delete attachment',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Files
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-1 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No files attached. Upload supporting documents, working papers, or evidence for this
            task (up to 50 MB per file).
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((attachment) => (
              <div
                key={attachment.id}
                className="group flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="block max-w-full truncate text-sm font-medium hover:text-primary hover:underline"
                      onClick={() => handleDownload(attachment.id)}
                      title={attachment.fileName}
                    >
                      {attachment.fileName}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                      {attachment.fileSize != null && ' • '}
                      {attachment.uploadedBy.name} •{' '}
                      {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDownload(attachment.id)}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive"
                    onClick={() => handleDelete(attachment.id, attachment.fileName)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
