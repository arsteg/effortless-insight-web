'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CheckSquare,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  ExternalLink,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMyTasks } from '@/hooks/use-collaboration'
import type { TaskPriority, TaskStatus } from '@/types/collaboration'

const statusColors: Record<string, string> = {
  todo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const ACTIVE_STATUSES: TaskStatus[] = ['todo', 'blocked', 'on_hold']

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useMyTasks({
    status: statusFilter !== 'all' ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as TaskPriority) : undefined,
    page,
    pageSize: 20,
  })

  // Unfiltered fetch for the stat tiles (counts across recent tasks, not just
  // the current filtered page)
  const { data: statsData, isLoading: isLoadingStats } = useMyTasks({
    page: 1,
    pageSize: 100,
  })

  const statTasks = statsData?.tasks ?? []
  const summary = {
    pending: statTasks.filter((t) => ACTIVE_STATUSES.includes(t.status)).length,
    inProgress: statTasks.filter((t) => t.status === 'in_progress').length,
    overdue: statTasks.filter((t) => t.isOverdue && t.status !== 'done').length,
    done: statTasks.filter((t) => t.status === 'done').length,
  }

  const tasks = data?.tasks ?? []
  const totalPages = data?.pagination?.totalPages ?? 1

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          Manage and track tasks related to your GST notices.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.pending}</div>
                <p className="text-xs text-muted-foreground">Tasks awaiting action</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary.inProgress}</div>
                <p className="text-xs text-muted-foreground">Tasks being worked on</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">{summary.overdue}</div>
                <p className="text-xs text-muted-foreground">Tasks past their due date</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{summary.done}</div>
                <p className="text-xs text-muted-foreground">Tasks done</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tasks</CardTitle>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={priorityFilter}
                onValueChange={(value) => {
                  setPriorityFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load tasks</h3>
              <p className="text-muted-foreground">Please try again later.</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => {
                const overdue = task.isOverdue && task.status !== 'done'
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="pt-0.5">
                      {task.status === 'done' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : overdue ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : task.status === 'in_progress' ? (
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium truncate">{task.title}</h4>
                          <Link
                            href={`/notices/${task.notice.id}`}
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            {task.notice.organization.name}
                            {task.notice.type && ` • ${task.notice.type}`}
                            {task.notice.number && ` #${task.notice.number}`}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className={priorityColors[task.priority] || ''}
                          >
                            {task.priority}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={
                              overdue
                                ? statusColors.overdue
                                : statusColors[task.status] || ''
                            }
                          >
                            {overdue ? 'Overdue' : task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {task.dueDate && (
                        <p
                          className={`text-xs mt-2 ${
                            overdue ? 'text-destructive' : 'text-muted-foreground'
                          }`}
                        >
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Tasks created from notice details will appear here. Navigate to a
                notice and add tasks to get started.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/notices">Browse Notices</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
