'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useArchiveNotice } from '@/hooks/use-notices'
import type { Notice, NoticeStatus } from '@/types'

// Statuses the API allows archiving from (NoticeWorkflowService.AllowedTransitions)
const ARCHIVABLE_STATUSES: NoticeStatus[] = ['analyzed', 'closed', 'failed']

export function canArchiveNotice(status: NoticeStatus) {
  return ARCHIVABLE_STATUSES.includes(status)
}

interface ArchiveNoticeDialogProps {
  notices: Notice[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchived?: () => void
}

export function ArchiveNoticeDialog({ notices, open, onOpenChange, onArchived }: ArchiveNoticeDialogProps) {
  const archiveMutation = useArchiveNotice()

  const count = notices.length
  const single = count === 1 ? notices[0] : undefined

  const handleArchive = () => {
    archiveMutation.mutate(
      notices.map((n) => n.id),
      {
        onSuccess: () => {
          onOpenChange(false)
          onArchived?.()
        },
      }
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{single ? 'Archive notice?' : `Archive ${count} notices?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {single ? (
              <>
                Notice{' '}
                <span className="font-medium">{single.noticeNumber || single.id}</span>{' '}
                will be archived and hidden from the default notices list.
              </>
            ) : (
              <>{count} selected notices will be archived and hidden from the default notices list.</>
            )}{' '}
            You can unarchive {single ? 'it' : 'them'} later from the Archived filter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={archiveMutation.isPending}>Cancel</AlertDialogCancel>
          <Button onClick={handleArchive} disabled={count === 0 || archiveMutation.isPending}>
            {archiveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Archiving...
              </>
            ) : (
              'Archive'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
