'use client'

import { useState, useEffect } from 'react'
import { Play, Square, Clock, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useTimeEntries,
  useActiveTimer,
  useLogTime,
  useStartTimer,
  useStopTimer,
  useDeleteTimeEntry,
} from '@/hooks/use-collaboration'
import { cn } from '@/lib/utils'
import type { TimeEntry } from '@/types/collaboration'

interface TimeTrackerProps {
  taskId: string
  estimatedHours?: number
  className?: string
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes}m`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) {
    return `${h}h`
  }
  return `${h}h ${m}m`
}

export function TimeTracker({ taskId, estimatedHours, className }: TimeTrackerProps) {
  const { toast } = useToast()
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [logHours, setLogHours] = useState('')
  const [logDescription, setLogDescription] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const { data: timeEntriesData, isLoading: isLoadingEntries } = useTimeEntries(taskId)
  const { data: activeTimer } = useActiveTimer(taskId)
  const startTimer = useStartTimer(taskId)
  const stopTimer = useStopTimer(taskId)
  const logTime = useLogTime(taskId)
  const deleteTimeEntry = useDeleteTimeEntry(taskId)

  const totalHours = timeEntriesData?.totalHours ?? 0
  const entries = timeEntriesData?.entries ?? []
  const isTimerRunning = activeTimer?.isTimerRunning ?? false

  // Update elapsed time when timer is running
  useEffect(() => {
    if (!isTimerRunning || !activeTimer?.startTime) {
      setElapsedSeconds(0)
      return
    }

    const startTime = new Date(activeTimer.startTime).getTime()
    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedSeconds(elapsed)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, activeTimer?.startTime])

  const handleStartTimer = () => {
    startTimer.mutate(undefined, {
      onError: (error) => {
        toast({
          title: 'Failed to start timer',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }

  const handleStopTimer = () => {
    if (activeTimer?.id) {
      stopTimer.mutate(activeTimer.id, {
        onError: (error) => {
          toast({
            title: 'Failed to stop timer',
            description: error.message,
            variant: 'destructive',
          })
        },
      })
    }
  }

  const handleLogTime = () => {
    const hours = parseFloat(logHours)
    if (isNaN(hours) || hours <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter a valid number of hours.',
        variant: 'destructive',
      })
      return
    }

    logTime.mutate(
      {
        hours,
        date: new Date().toISOString().split('T')[0],
        description: logDescription || undefined,
        isBillable: true,
      },
      {
        onSuccess: () => {
          setShowLogDialog(false)
          setLogHours('')
          setLogDescription('')
          toast({
            title: 'Time logged',
            description: `${hours} hours logged successfully.`,
          })
        },
        onError: (error) => {
          toast({
            title: 'Failed to log time',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleDeleteEntry = (entryId: string) => {
    deleteTimeEntry.mutate(entryId, {
      onError: (error) => {
        toast({
          title: 'Failed to delete entry',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }

  if (isLoadingEntries) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            {estimatedHours && (
              <Badge variant="outline" className="text-xs">
                Est: {formatHours(estimatedHours)}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Total: {formatHours(totalHours)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Controls */}
        <div className="flex items-center gap-3">
          {isTimerRunning ? (
            <>
              <div className="flex-1">
                <div className="text-2xl font-mono font-bold text-primary">
                  {formatDuration(elapsedSeconds)}
                </div>
                <p className="text-xs text-muted-foreground">Timer running...</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStopTimer}
                disabled={stopTimer.isPending}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleStartTimer}
                disabled={startTimer.isPending}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Timer
              </Button>
              <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Time</DialogTitle>
                    <DialogDescription>
                      Manually log time spent on this task.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.25"
                        min="0.25"
                        placeholder="e.g., 1.5"
                        value={logHours}
                        onChange={(e) => setLogHours(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Input
                        id="description"
                        placeholder="What did you work on?"
                        value={logDescription}
                        onChange={(e) => setLogDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLogDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleLogTime} disabled={logTime.isPending}>
                      {logTime.isPending ? 'Logging...' : 'Log Time'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {estimatedHours && estimatedHours > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((totalHours / estimatedHours) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  totalHours > estimatedHours ? 'bg-red-500' : 'bg-primary'
                )}
                style={{ width: `${Math.min((totalHours / estimatedHours) * 100, 100)}%` }}
              />
            </div>
            {totalHours > estimatedHours && (
              <p className="text-xs text-red-500">
                Over estimate by {formatHours(totalHours - estimatedHours)}
              </p>
            )}
          </div>
        )}

        {/* Time Entries List */}
        {entries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Entries</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {entries.slice(0, 5).map((entry) => (
                <TimeEntryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              ))}
              {entries.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  +{entries.length - 5} more entries
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TimeEntryRowProps {
  entry: TimeEntry
  onDelete: () => void
}

function TimeEntryRow({ entry, onDelete }: TimeEntryRowProps) {
  return (
    <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50 group text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium">{formatHours(entry.hours)}</span>
        {entry.description && (
          <span className="text-muted-foreground truncate">{entry.description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {new Date(entry.date).toLocaleDateString()}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete entry</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
