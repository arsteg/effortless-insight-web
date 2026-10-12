'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from './status-badge'
import { useUnarchiveNotice } from '@/hooks/use-notices'
import type { Notice, NoticeStatus } from '@/types'

// Notices archived before the API recorded their previous status restore to Analyzed
const restoreStatusOf = (notice: Notice): NoticeStatus => notice.restoreStatus ?? 'analyzed'

interface UnarchiveNoticeDialogProps {
  notices: Notice[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnarchived?: () => void
}

export function UnarchiveNoticeDialog({ notices, open, onOpenChange, onUnarchived }: UnarchiveNoticeDialogProps) {
  const unarchiveMutation = useUnarchiveNotice()

  const count = notices.length
  const single = count === 1 ? notices[0] : undefined

  const handleUnarchive = () => {
    unarchiveMutation.mutate(
      notices.map((n) => ({ id: n.id, status: restoreStatusOf(n) })),
      {
        onSuccess: () => {
          onOpenChange(false)
          onUnarchived?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{single ? 'Unarchive Notice' : `Unarchive ${count} Notices`}</DialogTitle>
          <DialogDescription>
            {single ? (
              <>
                Notice{' '}
                <span className="font-medium">{single.noticeNumber || single.id}</span>{' '}
                will be moved back to the active list with the status it had before it was archived.
              </>
            ) : (
              <>
                {count} selected notices will be moved back to the active list. Each one gets the
                status it had before it was archived.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {single && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Restores to</span>
            <StatusBadge status={restoreStatusOf(single)} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={unarchiveMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUnarchive} disabled={count === 0 || unarchiveMutation.isPending}>
            {unarchiveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unarchiving...
              </>
            ) : (
              'Unarchive'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
