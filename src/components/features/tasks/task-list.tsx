'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  CheckSquare,
  Loader2,
  ListFilter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  PauseCircle,
  ChevronRight,
  LayoutList,
  LayoutGrid,
  Archive,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { TaskItem } from './task-item'
import { TaskForm } from './task-form'
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
} from '@/hooks/use-collaboration'
import type {
  Task,
  TaskDetail,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskPriority,
  TaskSummary,
} from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface TaskListProps {
  noticeId: string
  noticeType?: string
  availableMembers?: OrganizationMember[]
  showHeader?: boolean
  maxItems?: number
  className?: string
}

type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'title'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'list' | 'grid'

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  blocked: 0,
  in_progress: 1,
  todo: 2,
  on_hold: 3,
  done: 4,
  archived: 5,
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

function StatusSummary({ summary }: { summary: TaskSummary }) {
  const items = [
    { label: 'To Do', count: summary.todo, icon: Circle, color: 'text-gray-500' },
    { label: 'In Progress', count: summary.inProgress, icon: ChevronRight, color: 'text-blue-500' },
    { label: 'Done', count: summary.done, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Blocked', count: summary.blocked, icon: AlertCircle, color: 'text-red-500' },
    { label: 'On Hold', count: summary.onHold, icon: PauseCircle, color: 'text-yellow-500' },
  ]

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
      {items
        .filter((item) => item.count > 0)
        .map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className={cn('h-4 w-4', item.color)} />
            <span className="text-sm">
              <span className="font-medium">{item.count}</span>{' '}
              <span className="text-muted-foreground">{item.label}</span>
            </span>
          </div>
        ))}
      {summary.overdue > 0 && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{summary.overdue} Overdue</span>
        </div>
      )}
    </div>
  )
}

function TaskListSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
              <Skeleton className="h-4 w-4 mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TaskList({
  noticeId,
  noticeType,
  availableMembers = [],
  showHeader = true,
  maxItems,
  className,
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)

  const { data, isLoading } = useTasks(noticeId)
  const createMutation = useCreateTask(noticeId)
  const updateMutation = useUpdateTask(noticeId)
  const deleteMutation = useDeleteTask(noticeId)
  const completeMutation = useCompleteTask(noticeId)

  const tasks = data?.tasks ?? []
  const summary = data?.summary

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Apply filters
    if (statusFilter.length > 0) {
      result = result.filter((task) => statusFilter.includes(task.status))
    }

    if (priorityFilter.length > 0) {
      result = result.filter((task) => priorityFilter.includes(task.priority))
    }

    if (showOverdueOnly) {
      result = result.filter((task) => task.isOverdue && task.status !== 'done')
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          // Secondary sort by status
          if (comparison === 0) {
            comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          }
          break
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [tasks, statusFilter, priorityFilter, sortBy, sortDirection, showOverdueOnly])

  const displayedTasks = maxItems ? filteredAndSortedTasks.slice(0, maxItems) : filteredAndSortedTasks
  const completedCount = tasks.filter((t) => t.status === 'done').length
  const totalCount = tasks.length

  const hasActiveFilters = statusFilter.length > 0 || priorityFilter.length > 0 || showOverdueOnly

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const togglePriorityFilter = (priority: TaskPriority) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setStatusFilter([])
    setPriorityFilter([])
    setShowOverdueOnly(false)
  }

  const handleCreate = async (data: CreateTaskRequest) => {
    await createMutation.mutateAsync(data)
    setShowForm(false)
  }

  const handleUpdate = async (data: CreateTaskRequest) => {
    if (!editingTask) return
    await updateMutation.mutateAsync({
      taskId: editingTask.id,
      data: data as UpdateTaskRequest,
    })
    setEditingTask(null)
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    await deleteMutation.mutateAsync(deletingTask.id)
    setDeletingTask(null)
  }

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    if (status === 'done') {
      completeMutation.mutate({ taskId: task.id })
    } else {
      updateMutation.mutate({
        taskId: task.id,
        data: { status },
      })
    }
  }

  if (isLoading) {
    return <TaskListSkeleton showHeader={showHeader} />
  }

  return (
    <>
      <Card className={className}>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Tasks</CardTitle>
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </p>
              )}
            </div>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          </CardHeader>
        )}
        <CardContent className={showHeader ? '' : 'pt-6'}>
          {/* Summary */}
          {summary && totalCount > 0 && <StatusSummary summary={summary} />}

          {/* Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ListFilter className="h-4 w-4 mr-1" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {statusFilter.length + priorityFilter.length + (showOverdueOnly ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    {(['todo', 'in_progress', 'done', 'blocked', 'on_hold'] as TaskStatus[]).map(
                      (status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={statusFilter.includes(status)}
                          onCheckedChange={() => toggleStatusFilter(status)}
                        >
                          <span className={cn('mr-2', STATUS_COLORS[status])}>
                            {STATUS_ICONS[status]}
                          </span>
                          {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </DropdownMenuCheckboxItem>
                      )
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    {(['critical', 'high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={() => togglePriorityFilter(priority)}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={showOverdueOnly}
                      onCheckedChange={setShowOverdueOnly}
                      className="text-red-600"
                    >
                      Overdue Only
                    </DropdownMenuCheckboxItem>
                    {hasActiveFilters && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={clearFilters}>
                          Clear Filters
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortOption)}
                    >
                      <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dueDate">Due Date</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="createdAt">Created Date</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="title">Title</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Direction</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sortDirection}
                      onValueChange={(value) => setSortDirection(value as SortDirection)}
                    >
                      <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* View Mode & Add Button (compact) */}
              {!showHeader && (
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              )}
            </div>
          )}

          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </p>
              {hasActiveFilters ? (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              ) : (
                <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {displayedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={(status) => handleStatusChange(task, status)}
                  onEdit={(t) => setEditingTask(t as TaskDetail)}
                  onDelete={setDeletingTask}
                />
              ))}
              {maxItems && filteredAndSortedTasks.length > maxItems && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{filteredAndSortedTasks.length - maxItems} more tasks
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showForm || !!editingTask}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingTask(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Update the task details below.'
                : 'Add a new task to track work on this notice.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask || undefined}
            noticeType={noticeType}
            availableMembers={availableMembers}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTask?.title}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTask(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
