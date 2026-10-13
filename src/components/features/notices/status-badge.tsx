'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Portal } from '@radix-ui/react-tooltip'
import type { NoticeStatus } from '@/types'

interface StatusBadgeProps {
  status: NoticeStatus
  error?: string | null
  className?: string
}

const STATUS_CONFIG: Record<
  NoticeStatus,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' }
> = {
  uploaded: { label: 'Uploaded', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'default' },
  analyzed: { label: 'Analyzed', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  responded: { label: 'Responded', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
  archived: { label: 'Archived', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'danger' },
}

export function StatusBadge({ status, error, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary' as const }

  const badge = (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )

  if (status !== 'failed' || !error) return badge

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex w-fit cursor-help rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" aria-label="Failed status details">
            {badge}
          </span>
        </TooltipTrigger>
        <Portal>
          <TooltipContent className="max-w-xs whitespace-normal break-words">
            {error}
          </TooltipContent>
        </Portal>
      </Tooltip>
    </TooltipProvider>
  )
}
