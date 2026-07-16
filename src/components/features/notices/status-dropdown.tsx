'use client'

import { useState } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './status-badge'
import { useUpdateNoticeStatus } from '@/hooks/use-notices'
import { cn } from '@/lib/utils'
import type { NoticeStatus } from '@/types'

interface StatusDropdownProps {
  noticeId: string
  currentStatus: NoticeStatus
  disabled?: boolean
}

// Status configuration with display info and allowed transitions
const STATUS_CONFIG: Record<NoticeStatus, {
  label: string
  description: string
  allowedTransitions: NoticeStatus[]
}> = {
  uploaded: {
    label: 'Uploaded',
    description: 'Notice has been uploaded',
    allowedTransitions: ['processing', 'archived'],
  },
  processing: {
    label: 'Processing',
    description: 'AI is analyzing the notice',
    allowedTransitions: ['analyzed', 'failed'],
  },
  analyzed: {
    label: 'Analyzed',
    description: 'AI analysis complete',
    allowedTransitions: ['in_progress', 'archived'],
  },
  in_progress: {
    label: 'In Progress',
    description: 'Notice is being worked on',
    allowedTransitions: ['responded', 'archived'],
  },
  responded: {
    label: 'Responded',
    description: 'Response has been submitted',
    allowedTransitions: ['closed', 'in_progress'],
  },
  closed: {
    label: 'Closed',
    description: 'Notice has been resolved',
    allowedTransitions: ['archived'],
  },
  archived: {
    label: 'Archived',
    description: 'Notice has been archived',
    allowedTransitions: ['in_progress'],
  },
  failed: {
    label: 'Failed',
    description: 'Processing failed',
    allowedTransitions: ['processing', 'archived'],
  },
}

// Statuses that require a reason
const STATUSES_REQUIRING_REASON: NoticeStatus[] = ['archived', 'closed']

export function StatusDropdown({ noticeId, currentStatus, disabled = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<NoticeStatus | null>(null)
  const [reason, setReason] = useState('')

  const updateStatusMutation = useUpdateNoticeStatus()
  const currentConfig = STATUS_CONFIG[currentStatus]
  const allowedTransitions = currentConfig?.allowedTransitions || []

  const handleStatusSelect = (newStatus: NoticeStatus) => {
    setIsOpen(false)

    if (STATUSES_REQUIRING_REASON.includes(newStatus)) {
      setPendingStatus(newStatus)
      setShowReasonDialog(true)
    } else {
      updateStatusMutation.mutate({ id: noticeId, status: newStatus })
    }
  }

  const handleConfirmWithReason = () => {
    if (pendingStatus) {
      updateStatusMutation.mutate({
        id: noticeId,
        status: pendingStatus,
        reason: reason || undefined,
      })
    }
    setShowReasonDialog(false)
    setPendingStatus(null)
    setReason('')
  }

  const handleCancelReason = () => {
    setShowReasonDialog(false)
    setPendingStatus(null)
    setReason('')
  }

  // Don't show dropdown if no transitions are allowed
  if (allowedTransitions.length === 0) {
    return <StatusBadge status={currentStatus} />
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={disabled || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <StatusBadge status={currentStatus} />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Change Status
          </div>
          <DropdownMenuSeparator />
          {allowedTransitions.map((status) => {
            const config = STATUS_CONFIG[status]
            const isCurrentStatus = status === currentStatus

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusSelect(status)}
                disabled={isCurrentStatus}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </div>
                {isCurrentStatus && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Status to {pendingStatus && STATUS_CONFIG[pendingStatus]?.label}
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for this status change. This will be recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this status change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelReason}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmWithReason}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
