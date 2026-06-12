'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from './task-list'
import { useMyTasks } from '@/hooks/use-collaboration'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskItem } from './task-item'
import { AlertCircle, Clock, CheckCircle2, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MyTask, TaskStatus } from '@/types/collaboration'

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface TaskPanelProps {
  noticeId: string
  noticeType?: string
  availableMembers?: OrganizationMember[]
  className?: string
}

export function TaskPanel({
  noticeId,
  noticeType,
  availableMembers = [],
  className,
}: TaskPanelProps) {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn('space-y-4', className)}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All Tasks</TabsTrigger>
        <TabsTrigger value="my">My Tasks</TabsTrigger>
        <TabsTrigger value="overdue">Overdue</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4">
        <TaskList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>

      <TabsContent value="my" className="mt-4">
        <MyTasksView noticeId={noticeId} />
      </TabsContent>

      <TabsContent value="overdue" className="mt-4">
        <TaskList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>

      <TabsContent value="completed" className="mt-4">
        <TaskList
          noticeId={noticeId}
          noticeType={noticeType}
          availableMembers={availableMembers}
        />
      </TabsContent>
    </Tabs>
  )
}

interface MyTasksViewProps {
  noticeId?: string
}

function MyTasksView({ noticeId }: MyTasksViewProps) {
  const { data, isLoading } = useMyTasks()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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

  const tasks = data?.tasks ?? []

  // Group tasks by status
  const taskGroups = {
    overdue: tasks.filter((t) => t.isOverdue && t.status !== 'done'),
    dueToday: tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate).toDateString() === new Date().toDateString() &&
        !t.isOverdue &&
        t.status !== 'done'
    ),
    inProgress: tasks.filter((t) => t.status === 'in_progress' && !t.isOverdue),
    todo: tasks.filter(
      (t) =>
        t.status === 'todo' &&
        !t.isOverdue &&
        !(
          t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()
        )
    ),
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tasks assigned to you</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overdue Section */}
      {taskGroups.overdue.length > 0 && (
        <TaskGroupCard
          title="Overdue"
          icon={<AlertCircle className="h-5 w-5" />}
          iconColor="text-red-500"
          badgeColor="bg-red-100 text-red-800"
          tasks={taskGroups.overdue}
        />
      )}

      {/* Due Today Section */}
      {taskGroups.dueToday.length > 0 && (
        <TaskGroupCard
          title="Due Today"
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-amber-500"
          badgeColor="bg-amber-100 text-amber-800"
          tasks={taskGroups.dueToday}
        />
      )}

      {/* In Progress Section */}
      {taskGroups.inProgress.length > 0 && (
        <TaskGroupCard
          title="In Progress"
          icon={<ListTodo className="h-5 w-5" />}
          iconColor="text-blue-500"
          badgeColor="bg-blue-100 text-blue-800"
          tasks={taskGroups.inProgress}
        />
      )}

      {/* To Do Section */}
      {taskGroups.todo.length > 0 && (
        <TaskGroupCard
          title="To Do"
          icon={<ListTodo className="h-5 w-5" />}
          iconColor="text-gray-500"
          badgeColor="bg-gray-100 text-gray-800"
          tasks={taskGroups.todo}
        />
      )}
    </div>
  )
}

interface TaskGroupCardProps {
  title: string
  icon: React.ReactNode
  iconColor: string
  badgeColor: string
  tasks: MyTask[]
}

function TaskGroupCard({ title, icon, iconColor, badgeColor, tasks }: TaskGroupCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={iconColor}>{icon}</span>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge className={badgeColor}>{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {tasks.map((task) => (
            <MyTaskItem key={task.id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface MyTaskItemProps {
  task: MyTask
}

function MyTaskItem({ task }: MyTaskItemProps) {
  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
        task.isOverdue && 'border-l-4 border-l-red-500 bg-red-50/50'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{task.title}</p>
          <Badge variant="outline" className={cn('shrink-0 text-xs', priorityColors[task.priority])}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="truncate">
            {task.notice.organization.name} • {task.notice.type || 'Notice'}
            {task.notice.number && ` #${task.notice.number}`}
          </span>
        </div>
        {task.dueDate && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 text-xs',
              task.isOverdue && 'text-red-600 font-medium'
            )}
          >
            <Clock className="h-3 w-3" />
            {task.isOverdue
              ? `Overdue`
              : new Date(task.dueDate).toDateString() === new Date().toDateString()
              ? 'Due today'
              : `Due ${new Date(task.dueDate).toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  )
}

export { TaskList } from './task-list'
export { TaskForm } from './task-form'
export { TaskItem } from './task-item'
