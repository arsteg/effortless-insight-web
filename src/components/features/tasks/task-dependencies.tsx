'use client'

import { useState } from 'react'
import { AlertTriangle, Link2, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useTasks,
  useTaskDependencies,
  useAddTaskDependency,
  useRemoveTaskDependency,
} from '@/hooks/use-collaboration'
import type { TaskStatus } from '@/types/collaboration'
import { cn } from '@/lib/utils'

const STATUS_BADGES: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-500',
}

interface TaskDependenciesProps {
  taskId: string
  noticeId: string
  className?: string
}

export function TaskDependencies({ taskId, noticeId, className }: TaskDependenciesProps) {
  const { toast } = useToast()
  const [pickerOpen, setPickerOpen] = useState(false)

  const { data: dependencies, isLoading } = useTaskDependencies(taskId)
  const { data: tasksData } = useTasks(noticeId)
  const addMutation = useAddTaskDependency(taskId)
  const removeMutation = useRemoveTaskDependency(taskId)

  const deps = dependencies ?? []
  const incompleteDeps = deps.filter((d) => d.dependsOnTask.status !== 'done')

  // Tasks on this notice that can still be added as dependencies
  const candidateTasks = (tasksData?.tasks ?? []).filter(
    (t) => t.id !== taskId && !deps.some((d) => d.dependsOnTaskId === t.id)
  )

  const handleAdd = async (dependsOnTaskId: string) => {
    setPickerOpen(false)
    try {
      await addMutation.mutateAsync({ dependsOnTaskId })
    } catch (error) {
      toast({
        title: 'Failed to add dependency',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemove = async (dependsOnId: string) => {
    try {
      await removeMutation.mutateAsync(dependsOnId)
    } catch (error) {
      toast({
        title: 'Failed to remove dependency',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Dependencies
          </CardTitle>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={addMutation.isPending || candidateTasks.length === 0}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search tasks on this notice..." />
                <CommandList>
                  <CommandEmpty>No other tasks available.</CommandEmpty>
                  <CommandGroup heading="This task will wait for:">
                    {candidateTasks.map((task) => (
                      <CommandItem key={task.id} onSelect={() => handleAdd(task.id)}>
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <span className="truncate text-sm">{task.title}</span>
                          <Badge
                            variant="outline"
                            className={cn('shrink-0 text-xs', STATUS_BADGES[task.status])}
                          >
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {incompleteDeps.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Waiting on {incompleteDeps.length} incomplete{' '}
            {incompleteDeps.length === 1 ? 'task' : 'tasks'}
          </div>
        )}

        {deps.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No dependencies. Add one to make this task wait for other work to finish first.
          </p>
        ) : (
          <div className="space-y-1">
            {deps.map((dep) => (
              <div
                key={dep.id}
                className="group flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'truncate text-sm',
                      dep.dependsOnTask.status === 'done' &&
                        'text-muted-foreground line-through'
                    )}
                  >
                    {dep.dependsOnTask.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 text-xs', STATUS_BADGES[dep.dependsOnTask.status])}
                  >
                    {dep.dependsOnTask.status.replace('_', ' ')}
                  </Badge>
                  {dep.dependsOnTask.isOverdue && dep.dependsOnTask.status !== 'done' && (
                    <Badge variant="outline" className="shrink-0 bg-red-100 text-xs text-red-800">
                      Overdue
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleRemove(dep.dependsOnTaskId)}
                  disabled={removeMutation.isPending}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove dependency</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
