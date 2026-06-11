'use client'

import { useState } from 'react'
import {
  Check,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  User,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate } from '@/lib/utils'
import type { Task, TaskPriority } from '@/types'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  isUpdating?: boolean
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; variant: 'default' | 'secondary' | 'warning' | 'danger' }
> = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
}

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isUpdating = false,
}: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  const priorityConfig = PRIORITY_CONFIG[task.priority]

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        isCompleted && 'bg-muted/30 opacity-75',
        isOverdue && 'border-l-4 border-l-red-500'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
        disabled={isUpdating}
        className="mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <Badge variant={priorityConfig.variant} className="shrink-0">
            {priorityConfig.label}
          </Badge>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-500 font-medium'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          )}
          {task.assignedToName && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignedToName}
            </span>
          )}
          {isCompleted && task.completedAt && (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Completed {formatDate(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isCompleted ? (
            <DropdownMenuItem onClick={() => onToggleComplete(task.id, false)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reopen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onToggleComplete(task.id, true)}>
              <Check className="mr-2 h-4 w-4" />
              Mark Complete
            </DropdownMenuItem>
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
