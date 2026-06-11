'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Trash2,
  Upload,
  MoreHorizontal,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, cn } from '@/lib/utils'
import type { Attachment } from '@/types'

interface DocumentsManagerProps {
  noticeId: string
  noticeFileUrl?: string
  attachments: Attachment[]
  isLoading?: boolean
  onUpload?: () => void
  onDownload?: (attachment: Attachment) => void
  onDownloadNotice?: () => void
  onDelete?: (attachment: Attachment) => void
  isDeleting?: boolean
}

export function DocumentsManager({
  noticeId,
  noticeFileUrl,
  attachments,
  isLoading = false,
  onUpload,
  onDownload,
  onDownloadNotice,
  onDelete,
  isDeleting = false,
}: DocumentsManagerProps) {
  const [deleteAttachment, setDeleteAttachment] = useState<Attachment | null>(null)

  const handleDelete = () => {
    if (deleteAttachment && onDelete) {
      onDelete(deleteAttachment)
      setDeleteAttachment(null)
    }
  }

  if (isLoading) {
    return <DocumentsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Original Notice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Original Notice</CardTitle>
          {onDownloadNotice && noticeFileUrl && (
            <Button variant="outline" size="sm" onClick={onDownloadNotice}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {noticeFileUrl ? (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Notice Document</p>
                <p className="text-sm text-muted-foreground">PDF Document</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Original notice document is not available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Attachments
            {attachments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({attachments.length})
              </span>
            )}
          </CardTitle>
          {onUpload && (
            <Button variant="outline" size="sm" onClick={onUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No attachments yet
              </p>
              {onUpload && (
                <Button variant="outline" className="mt-4" onClick={onUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  onDownload={onDownload}
                  onDelete={onDelete ? () => setDeleteAttachment(attachment) : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteAttachment} onOpenChange={() => setDeleteAttachment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attachment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">{deleteAttachment?.fileName}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAttachment(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AttachmentItemProps {
  attachment: Attachment
  onDownload?: (attachment: Attachment) => void
  onDelete?: () => void
}

function AttachmentItem({ attachment, onDownload, onDelete }: AttachmentItemProps) {
  const getFileIcon = () => {
    const type = attachment.fileType?.toLowerCase() || ''
    if (type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) {
      return <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
    }
    return <File className="h-5 w-5 text-muted-foreground" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{attachment.fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {attachment.fileSize && <span>{formatFileSize(attachment.fileSize)}</span>}
          {attachment.documentType && (
            <>
              <span>•</span>
              <span>{attachment.documentType}</span>
            </>
          )}
          <span>•</span>
          <span>{formatDate(attachment.createdAt)}</span>
          {attachment.uploadedByName && (
            <>
              <span>•</span>
              <span>by {attachment.uploadedByName}</span>
            </>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onDownload && (
            <DropdownMenuItem onClick={() => onDownload(attachment)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
