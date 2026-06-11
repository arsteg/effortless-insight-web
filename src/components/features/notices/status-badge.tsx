'use client'

import { Badge } from '@/components/ui/badge'
import type { NoticeStatus } from '@/types'

interface StatusBadgeProps {
  status: NoticeStatus
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

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
