'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskList } from '@/components/features/tasks'
import { CommentList } from '@/components/features/comments'
import { useTasks } from '@/hooks/use-tasks'
import { useComments } from '@/hooks/use-comments'

interface CollaborationPanelProps {
  noticeId: string
}

export function CollaborationPanel({ noticeId }: CollaborationPanelProps) {
  const { data: tasks = [] } = useTasks(noticeId)
  const { data: comments = [] } = useComments(noticeId)

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length

  // Count total comments including replies
  const countComments = (items: typeof comments): number => {
    return items.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
  }
  const totalComments = countComments(comments)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tasks">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks" className="relative">
            Tasks
            {pendingTasks > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {pendingTasks}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="relative">
            Comments
            {totalComments > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
                {totalComments}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <TaskList noticeId={noticeId} showHeader={false} />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentList noticeId={noticeId} showHeader={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
