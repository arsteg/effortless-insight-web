'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Bell, Check, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useTaskReminders,
  useCreateTaskReminder,
  useDeleteTaskReminder,
} from '@/hooks/use-collaboration'

const PRESETS = [1, 3, 7]

interface TaskRemindersProps {
  taskId: string
  dueDate?: string
  className?: string
}

export function TaskReminders({ taskId, dueDate, className }: TaskRemindersProps) {
  const { toast } = useToast()
  const [customDays, setCustomDays] = useState('')

  const { data: reminders, isLoading } = useTaskReminders(taskId)
  const createMutation = useCreateTaskReminder(taskId)
  const deleteMutation = useDeleteTaskReminder(taskId)

  const items = (reminders ?? []).slice().sort((a, b) => b.daysBeforeDue - a.daysBeforeDue)

  const handleCreate = async (daysBeforeDue: number) => {
    try {
      await createMutation.mutateAsync({ daysBeforeDue })
      setCustomDays('')
    } catch (error) {
      toast({
        title: 'Failed to add reminder',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (reminderId: string) => {
    try {
      await deleteMutation.mutateAsync(reminderId)
    } catch (error) {
      toast({
        title: 'Failed to delete reminder',
        description:
          (error as { message?: string })?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCustomSubmit = () => {
    const days = parseInt(customDays, 10)
    if (isNaN(days) || days < 0 || days > 365) {
      toast({
        title: 'Invalid value',
        description: 'Enter a number of days between 0 and 365.',
        variant: 'destructive',
      })
      return
    }
    handleCreate(days)
  }

  const reminderDate = (daysBeforeDue: number): string | null => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    date.setDate(date.getDate() - daysBeforeDue)
    return format(date, 'MMM d, yyyy')
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminders
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
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!dueDate ? (
          <p className="py-2 text-sm text-muted-foreground">
            Set a due date on this task to schedule reminders. Reminders notify assignees a chosen
            number of days before the deadline.
          </p>
        ) : (
          <>
            {/* Add controls */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Remind assignees before the due date:</p>
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.filter(
                  (days) => !items.some((r) => r.daysBeforeDue === days)
                ).map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCreate(days)}
                    disabled={createMutation.isPending}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {days} {days === 1 ? 'day' : 'days'} before
                  </Button>
                ))}
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={365}
                    placeholder="Custom"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCustomSubmit()
                      }
                    }}
                    className="h-7 w-24 text-xs"
                    disabled={createMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCustomSubmit}
                    disabled={createMutation.isPending || !customDays}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Reminder list */}
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reminders scheduled yet.</p>
            ) : (
              <div className="space-y-1">
                {items.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="group flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                      <Bell className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>
                        {reminder.daysBeforeDue === 0
                          ? 'On the due date'
                          : `${reminder.daysBeforeDue} ${
                              reminder.daysBeforeDue === 1 ? 'day' : 'days'
                            } before due`}
                      </span>
                      {reminderDate(reminder.daysBeforeDue) && (
                        <span className="truncate text-xs text-muted-foreground">
                          ({reminderDate(reminder.daysBeforeDue)})
                        </span>
                      )}
                      {reminder.isSent && (
                        <Badge
                          variant="outline"
                          className="shrink-0 bg-green-100 text-xs text-green-800"
                        >
                          <Check className="mr-0.5 h-3 w-3" />
                          Sent
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => handleDelete(reminder.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete reminder</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
