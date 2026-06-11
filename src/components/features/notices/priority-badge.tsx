'use client'

import { Badge } from '@/components/ui/badge'
import type { NoticePriority } from '@/types'

interface PriorityBadgeProps {
  priority: NoticePriority
  className?: string
}

const PRIORITY_CONFIG: Record<
  NoticePriority,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' }
> = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, variant: 'secondary' as const }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
