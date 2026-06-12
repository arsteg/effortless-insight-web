'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isPast, isToday, differenceInDays } from 'date-fns'
import {
  FileText,
  MoreHorizontal,
  Calendar,
  User,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Eye,
  Send,
  Trash2,
  Edit,
  Download,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import type { DocumentRequest, DocumentRequestStatus, TaskPriority } from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface DocumentRequestCardProps {
  request: DocumentRequest
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUpload?: () => void
  onReview?: () => void
  onSendReminder?: () => void
}

const STATUS_CONFIG: Record<
  DocumentRequestStatus,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  submitted: {
    label: 'Submitted',
    icon: <Upload className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  reviewing: {
    label: 'Reviewing',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  fulfilled: {
    label: 'Fulfilled',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  resubmit_needed: {
    label: 'Resubmit Needed',
    icon: <RotateCcw className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function DocumentRequestCard({
  request,
  onClick,
  onEdit,
  onDelete,
  onUpload,
  onReview,
  onSendReminder,
}: DocumentRequestCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const statusConfig = STATUS_CONFIG[request.status]
  const priorityConfig = PRIORITY_CONFIG[request.priority]

  const dueDate = new Date(request.dueDate)
  const isOverdue = request.isOverdue
  const isDueToday = isToday(dueDate)
  const daysRemaining = request.daysRemaining

  const canUpload = request.status === 'pending' || request.status === 'resubmit_needed'
  const canReview = request.status === 'submitted' || request.status === 'reviewing'
  const canSendReminder = request.status === 'pending' || request.status === 'resubmit_needed'

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        'hover:shadow-md hover:border-primary/20',
        isOverdue && request.status !== 'fulfilled' && 'border-red-200 bg-red-50/50',
        onClick && 'cursor-pointer'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Status Icon */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              statusConfig.bgColor
            )}
          >
            <span className={statusConfig.color}>{statusConfig.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{request.title}</h4>
              <Badge variant="outline" className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', priorityConfig.className)}>
                {priorityConfig.label}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 opacity-0 transition-opacity',
                isHovered && 'opacity-100'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpload && onUpload && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onUpload()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </DropdownMenuItem>
            )}
            {canReview && onReview && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onReview()
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Document
              </DropdownMenuItem>
            )}
            {canSendReminder && onSendReminder && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onSendReminder()
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Metadata Row */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {/* Due Date */}
        <div
          className={cn(
            'flex items-center gap-1',
            isOverdue && request.status !== 'fulfilled' && 'text-red-600 font-medium',
            isDueToday && request.status !== 'fulfilled' && 'text-amber-600 font-medium'
          )}
        >
          <Calendar className="h-3 w-3" />
          {isOverdue && request.status !== 'fulfilled' ? (
            <span>Overdue by {Math.abs(daysRemaining)} days</span>
          ) : isDueToday ? (
            <span>Due today</span>
          ) : daysRemaining > 0 ? (
            <span>{daysRemaining} days remaining</span>
          ) : (
            <span>Due {format(dueDate, 'MMM d, yyyy')}</span>
          )}
        </div>

        {/* Requested From */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={request.requestedFrom.avatarUrl} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(request.requestedFrom.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">{request.requestedFrom.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Requested from: {request.requestedFrom.name}</p>
              {request.requestedFrom.email && (
                <p className="text-xs text-muted-foreground">{request.requestedFrom.email}</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Accepted Formats */}
        {request.acceptedFormats && request.acceptedFormats.length > 0 && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{request.acceptedFormats.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Documents (if any submitted) */}
      {request.documents.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Submitted Documents ({request.documents.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {request.documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 rounded-md border bg-muted/50 px-2 py-1"
              >
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs truncate max-w-[120px]">{doc.filename}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(doc.sizeBytes)})
                </span>
              </div>
            ))}
            {request.documents.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{request.documents.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Review Note (if resubmit needed) */}
      {request.status === 'resubmit_needed' && request.reviewNote && (
        <div className="mt-3 p-2 rounded-md bg-amber-50 border border-amber-200">
          <p className="text-xs font-medium text-amber-800">Review Note:</p>
          <p className="text-xs text-amber-700 mt-1">{request.reviewNote}</p>
        </div>
      )}
    </div>
  )
}
