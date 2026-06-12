'use client'

import { useState } from 'react'
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns'
import {
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  RotateCcw,
  ChevronRight,
  Circle,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  Archive,
  UserPlus,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Task, TaskDetail, TaskStatus, TaskPriority } from '@/types/collaboration'

interface TaskItemProps {
  task: Task
  onStatusChange?: (status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  isUpdating?: boolean
  compact?: boolean
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  low: { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' },
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  todo: { label: 'To Do', icon: <Circle className="h-4 w-4" />, color: 'text-gray-500' },
  in_progress: {
    label: 'In Progress',
    icon: <ChevronRight className="h-4 w-4" />,
    color: 'text-blue-500',
  },
  done: { label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-green-500' },
  blocked: { label: 'Blocked', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
  on_hold: {
    label: 'On Hold',
    icon: <PauseCircle className="h-4 w-4" />,
    color: 'text-yellow-500',
  },
  archived: {
    label: 'Archived',
    icon: <Archive className="h-4 w-4" />,
    color: 'text-gray-400',
  },
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
    text: format(date, 'MMM d'),
    isOverdue: false,
    isToday: false,
  }
}

export function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating = false,
  compact = false,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isCompleted = task.status === 'done'
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const statusConfig = STATUS_CONFIG[task.status]
  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null
  const hasSubtasks = task.subtaskCount > 0
  const subtaskProgress = hasSubtasks ? (task.subtasksCompleted / task.subtaskCount) * 100 : 0

  const handleQuickStatusToggle = () => {
    if (!onStatusChange) return
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

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border p-3 transition-all',
        'hover:shadow-sm hover:border-primary/20',
        isCompleted && 'bg-muted/30 opacity-75',
        task.isOverdue && !isCompleted && 'border-l-4 border-l-red-500 bg-red-50/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Icon / Toggle */}
      <button
        className={cn(
          'mt-0.5 flex-shrink-0 transition-colors',
          statusConfig.color,
          'hover:opacity-70',
          isUpdating && 'opacity-50 pointer-events-none'
        )}
        onClick={handleQuickStatusToggle}
        disabled={isUpdating}
      >
        {statusConfig.icon}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium text-sm',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            {!compact && task.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <Badge variant="outline" className={cn('shrink-0', priorityConfig.className)}>
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          {/* Due Date */}
          {dueDateInfo && !isCompleted && (
            <span
              className={cn(
                'flex items-center gap-1',
                dueDateInfo.isOverdue && 'text-red-600 font-medium',
                dueDateInfo.isToday && 'text-amber-600 font-medium'
              )}
            >
              <Calendar className="h-3 w-3" />
              {dueDateInfo.text}
            </span>
          )}

          {/* Estimated Hours */}
          {task.estimatedHours && !compact && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
              {task.actualHours && (
                <span className="text-muted-foreground/70">
                  ({task.actualHours}h actual)
                </span>
              )}
            </span>
          )}

          {/* Completion info */}
          {isCompleted && task.completedAt && (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Completed {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
            </span>
          )}

          {/* Labels */}
          {!compact && task.labels && task.labels.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {task.labels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="text-xs px-1 py-0">
                  {label}
                </Badge>
              ))}
              {task.labels.length > 2 && (
                <span className="text-muted-foreground">+{task.labels.length - 2}</span>
              )}
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
          <div className="mt-2 flex items-center gap-1">
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

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 shrink-0 opacity-0 transition-opacity',
              isHovered && 'opacity-100'
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Status Change Submenu */}
          {onStatusChange && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span className={cn('mr-2', statusConfig.color)}>{statusConfig.icon}</span>
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(STATUS_CONFIG)
                  .filter(([status]) => status !== task.status && status !== 'archived')
                  .map(([status, config]) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onStatusChange(status as TaskStatus)}
                    >
                      <span className={cn('mr-2', config.color)}>{config.icon}</span>
                      {config.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Quick Complete/Reopen */}
          {onStatusChange && (
            <>
              {isCompleted ? (
                <DropdownMenuItem onClick={() => onStatusChange('todo')}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reopen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onStatusChange('done')}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark Complete
                </DropdownMenuItem>
              )}
            </>
          )}

          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
