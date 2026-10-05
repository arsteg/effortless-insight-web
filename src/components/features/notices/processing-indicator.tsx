'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProcessingStatus } from '@/types'

interface ProcessingIndicatorProps {
  status: ProcessingStatus
  className?: string
}

const PROCESSING_STEPS: Record<ProcessingStatus, { label: string; step: number }> = {
  queued: { label: 'Queued', step: 0 },
  ocr_processing: { label: 'Reading document...', step: 1 },
  extracting: { label: 'Extracting data...', step: 2 },
  classifying: { label: 'Classifying notice...', step: 3 },
  analyzing: { label: 'AI analyzing...', step: 4 },
  completed: { label: 'Completed', step: 5 },
  failed: { label: 'Failed', step: -1 },
  retrying: { label: 'Retrying...', step: 1 },
}

const TOTAL_STEPS = 5

export function ProcessingIndicator({ status, className }: ProcessingIndicatorProps) {
  const config = PROCESSING_STEPS[status] || { label: status, step: 0 }
  const isProcessing = config.step > 0 && config.step < TOTAL_STEPS
  const isFailed = config.step === -1
  const progress = config.step > 0 ? (config.step / TOTAL_STEPS) * 100 : 0

  if (status === 'completed') {
    return null // Don't show indicator for completed
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        {isProcessing && (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        )}
        <span className={cn(
          'text-xs font-medium',
          isFailed ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {config.label}
        </span>
      </div>
      {isProcessing && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
