'use client'

import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoticeStatus, ProcessingStatus } from '@/types'

interface WorkflowStage {
  id: string
  label: string
  description?: string
  status: 'completed' | 'current' | 'pending' | 'error'
}

interface WorkflowTimelineProps {
  noticeStatus: NoticeStatus
  processingStatus?: ProcessingStatus
  className?: string
}

const WORKFLOW_STAGES: { id: string; label: string; statuses: NoticeStatus[] }[] = [
  { id: 'uploaded', label: 'Uploaded', statuses: ['uploaded'] },
  { id: 'processing', label: 'Processing', statuses: ['processing'] },
  { id: 'analyzed', label: 'Analyzed', statuses: ['analyzed'] },
  { id: 'in_progress', label: 'In Progress', statuses: ['in_progress'] },
  { id: 'responded', label: 'Responded', statuses: ['responded'] },
  { id: 'closed', label: 'Closed', statuses: ['closed', 'archived'] },
]

function getStageStatus(
  stageStatuses: NoticeStatus[],
  currentStatus: NoticeStatus,
  stageIndex: number
): 'completed' | 'current' | 'pending' | 'error' {
  if (currentStatus === 'failed') {
    // Find where the failure occurred based on typical flow
    if (stageIndex <= 1) return 'error'
    return 'pending'
  }

  const statusOrder: NoticeStatus[] = [
    'uploaded',
    'processing',
    'analyzed',
    'in_progress',
    'responded',
    'closed',
    'archived',
  ]

  const currentIndex = statusOrder.indexOf(currentStatus)
  const stageStatusIndices = stageStatuses.map((s) => statusOrder.indexOf(s))
  const maxStageIndex = Math.max(...stageStatusIndices)
  const minStageIndex = Math.min(...stageStatusIndices)

  if (stageStatuses.includes(currentStatus)) {
    return 'current'
  }

  if (currentIndex > maxStageIndex) {
    return 'completed'
  }

  return 'pending'
}

export function WorkflowTimeline({
  noticeStatus,
  processingStatus,
  className,
}: WorkflowTimelineProps) {
  const stages: WorkflowStage[] = WORKFLOW_STAGES.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    status: getStageStatus(stage.statuses, noticeStatus, index),
  }))

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center flex-1 last:flex-none">
            {/* Stage circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  stage.status === 'completed' &&
                    'border-green-500 bg-green-500 text-white',
                  stage.status === 'current' &&
                    'border-primary bg-primary text-primary-foreground',
                  stage.status === 'pending' &&
                    'border-muted-foreground/30 bg-background text-muted-foreground',
                  stage.status === 'error' &&
                    'border-red-500 bg-red-500 text-white'
                )}
              >
                {stage.status === 'completed' && <Check className="h-5 w-5" />}
                {stage.status === 'current' && (
                  noticeStatus === 'processing' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )
                )}
                {stage.status === 'pending' && (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
                {stage.status === 'error' && <AlertCircle className="h-5 w-5" />}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[80px]',
                  stage.status === 'completed' && 'text-green-600 dark:text-green-400',
                  stage.status === 'current' && 'text-primary',
                  stage.status === 'pending' && 'text-muted-foreground',
                  stage.status === 'error' && 'text-red-600 dark:text-red-400'
                )}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line */}
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 mt-[-20px]',
                  stage.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Processing status detail */}
      {noticeStatus === 'processing' && processingStatus && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {getProcessingStatusLabel(processingStatus)}
          </p>
        </div>
      )}
    </div>
  )
}

function getProcessingStatusLabel(status: ProcessingStatus): string {
  const labels: Record<ProcessingStatus, string> = {
    queued: 'Waiting in queue...',
    ocr_processing: 'Extracting text from document...',
    extracting: 'Extracting notice details...',
    classifying: 'Classifying notice type...',
    analyzing: 'Running AI analysis...',
    completed: 'Processing completed',
    failed: 'Processing failed',
  }
  return labels[status] || status
}
