'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns'
import {
  Calendar,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  PauseCircle,
  Archive,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
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
import type { Task, TaskStatus, TaskPriority } from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange?: (status: TaskStatus) => void
  onAssign?: () => void
  compact?: boolean
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle className="h-4 w-4" />,
  in_progress: <ChevronRight className="h-4 w-4" />,
  done: <CheckCircle2 className="h-4 w-4" />,
  blocked: <AlertCircle className="h-4 w-4" />,
  on_hold: <PauseCircle className="h-4 w-4" />,
  archived: <Archive className="h-4 w-4" />,
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'text-gray-500',
  in_progress: 'text-blue-500',
  done: 'text-green-500',
  blocked: 'text-red-500',
  on_hold: 'text-yellow-500',
  archived: 'text-gray-400',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
  on_hold: 'On Hold',
  archived: 'Archived',
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDueDate(dueDate: string): { text: string; isOverdue: boolean; isToday: boolean } {
  const date = new Date(dueDate)
  const now = new Date()

  if (isPast(date) && !isToday(date)) {
    return {
      text: `Overdue by ${formatDistanceToNow(date)}`,
      isOverdue: true,
      isToday: false,
    }
  }

  if (isToday(date)) {
    return {
      text: 'Due today',
      isOverdue: false,
      isToday: true,
    }
  }

  return {
    text: `Due ${format(date, 'MMM d')}`,
    isOverdue: false,
    isToday: false,
  }
}

export function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  onAssign,
  compact = false,
}: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null
  const hasSubtasks = task.subtaskCount > 0
  const subtaskProgress = hasSubtasks ? (task.subtasksCompleted / task.subtaskCount) * 100 : 0

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        'hover:shadow-md hover:border-primary/20',
        task.isOverdue && task.status !== 'done' && 'border-red-200 bg-red-50/50',
        onClick && 'cursor-pointer'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <button
          className={cn(
            'mt-0.5 flex-shrink-0 transition-colors',
            STATUS_COLORS[task.status],
            'hover:opacity-70'
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (onStatusChange) {
              const nextStatus: Record<TaskStatus, TaskStatus> = {
                todo: 'in_progress',
                in_progress: 'done',
                done: 'todo',
                blocked: 'in_progress',
                on_hold: 'in_progress',
                archived: 'todo',
              }
              onStatusChange(nextStatus[task.status])
            }
          }}
        >
          {STATUS_ICONS[task.status]}
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  'font-medium text-sm leading-tight',
                  task.status === 'done' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h4>

              {!compact && task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-7 w-7 opacity-0 transition-opacity',
                    isHovered && 'opacity-100'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                {onAssign && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssign()
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </DropdownMenuItem>
                )}
                {onStatusChange && (
                  <>
                    <DropdownMenuSeparator />
                    {Object.entries(STATUS_LABELS)
                      .filter(([status]) => status !== task.status && status !== 'archived')
                      .map(([status, label]) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(status as TaskStatus)
                          }}
                        >
                          <span className={cn('mr-2', STATUS_COLORS[status as TaskStatus])}>
                            {STATUS_ICONS[status as TaskStatus]}
                          </span>
                          {label}
                        </DropdownMenuItem>
                      ))}
                  </>
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Priority Badge */}
            <Badge variant="outline" className={cn('text-xs', PRIORITY_COLORS[task.priority])}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>

            {/* Labels */}
            {task.labels?.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {task.labels && task.labels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{task.labels.length - 2}
              </Badge>
            )}

            {/* Due Date */}
            {dueDateInfo && task.status !== 'done' && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs',
                  dueDateInfo.isOverdue && 'text-red-600 font-medium',
                  dueDateInfo.isToday && 'text-amber-600 font-medium',
                  !dueDateInfo.isOverdue && !dueDateInfo.isToday && 'text-muted-foreground'
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{dueDateInfo.text}</span>
              </div>
            )}

            {/* Estimated Hours */}
            {task.estimatedHours && !compact && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* Subtasks Progress */}
          {hasSubtasks && !compact && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Subtasks</span>
                <span>
                  {task.subtasksCompleted}/{task.subtaskCount}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Assignees */}
          {task.assignees.length > 0 && (
            <div className="mt-3 flex items-center gap-1">
              <TooltipProvider>
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <Tooltip key={assignee.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignee.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
              {task.assignees.length > 3 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{task.assignees.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
