'use client'

import { useState } from 'react'
import { Plus, CheckSquare, Loader2 } from 'lucide-react'

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
import { TaskItem } from './task-item'
import { TaskForm } from './task-form'
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskComplete,
} from '@/hooks/use-tasks'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types'

interface TaskListProps {
  noticeId: string
  showHeader?: boolean
  maxItems?: number
}

export function TaskList({
  noticeId,
  showHeader = true,
  maxItems,
}: TaskListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const { data: tasks = [], isLoading } = useTasks(noticeId)
  const createMutation = useCreateTask(noticeId)
  const updateMutation = useUpdateTask(noticeId)
  const deleteMutation = useDeleteTask(noticeId)
  const toggleMutation = useToggleTaskComplete(noticeId)

  // Sort tasks: incomplete first, then by priority and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks go to the bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (a.status !== 'completed' && b.status === 'completed') return -1

    // Then by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return 0
  })

  const displayedTasks = maxItems ? sortedTasks.slice(0, maxItems) : sortedTasks
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const totalCount = tasks.length

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

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    toggleMutation.mutate({ taskId, completed })
  }

  if (isLoading) {
    return <TaskListSkeleton showHeader={showHeader} />
  }

  return (
    <>
      <Card>
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
          {!showHeader && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} completed
              </span>
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          )}

          {displayedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No tasks yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Create First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                  isUpdating={toggleMutation.isPending}
                />
              ))}
              {maxItems && sortedTasks.length > maxItems && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{sortedTasks.length - maxItems} more tasks
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Update the task details below.'
                : 'Add a new task to track work on this notice.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask || undefined}
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
              Are you sure you want to delete &quot;{deletingTask?.title}&quot;?
              This action cannot be undone.
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
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
