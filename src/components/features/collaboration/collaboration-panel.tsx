'use client'

import { useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  CheckSquare,
  FileText,
  Activity,
} from 'lucide-react'
import { ActivityFeed } from '../activity/activity-feed'
import { TaskList } from '../tasks/task-list'
import { DocumentRequestList } from '../document-requests/document-request-list'
import { CommentList } from '../comments/comment-list'
import {
  useTasks,
  useDocumentRequests,
  useComments,
} from '@/hooks/use-collaboration'
import { cn } from '@/lib/utils'

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface CollaborationPanelProps {
  noticeId: string
  noticeType?: string
  availableMembers?: OrganizationMember[]
  defaultTab?: 'activity' | 'tasks' | 'documents' | 'comments'
  className?: string
}

export function CollaborationPanel({
  noticeId,
  noticeType,
  availableMembers = [],
  defaultTab = 'activity',
  className,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Fetch counts for badges
  const { data: tasksData } = useTasks(noticeId)
  const { data: docsData } = useDocumentRequests(noticeId)
  const { data: commentsData } = useComments(noticeId)

  const taskCount = tasksData?.summary?.total ?? 0
  const pendingTaskCount =
    (tasksData?.summary?.todo ?? 0) +
    (tasksData?.summary?.inProgress ?? 0) +
    (tasksData?.summary?.blocked ?? 0)

  const docCount = docsData?.summary?.total ?? 0
  const pendingDocCount =
    (docsData?.summary?.pending ?? 0) +
    (docsData?.summary?.submitted ?? 0) +
    (docsData?.summary?.reviewing ?? 0) +
    (docsData?.summary?.resubmitNeeded ?? 0)

  const commentCount = commentsData?.pagination?.totalItems ?? 0

  const tabs = [
    {
      value: 'activity',
      label: 'Activity',
      icon: Activity,
      badge: null,
    },
    {
      value: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTaskCount > 0 ? pendingTaskCount : null,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'documents',
      label: 'Documents',
      icon: FileText,
      badge: pendingDocCount > 0 ? pendingDocCount : null,
      badgeColor:
        (docsData?.summary?.overdue ?? 0) > 0
          ? 'bg-red-100 text-red-800'
          : 'bg-amber-100 text-amber-800',
    },
    {
      value: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      badge: commentCount > 0 ? commentCount : null,
      badgeColor: 'bg-gray-100 text-gray-800',
    },
  ]

  return (
    <div className={cn('', className)}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                'data-[state=active]:shadow-none'
              )}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <Badge
                    variant="secondary"
                    className={cn('h-5 min-w-[20px] px-1.5 text-xs', tab.badgeColor)}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="activity" className="m-0">
            <ActivityFeed noticeId={noticeId} />
          </TabsContent>

          <TabsContent value="tasks" className="m-0">
            <TaskList
              noticeId={noticeId}
              noticeType={noticeType}
              availableMembers={availableMembers}
              showHeader={false}
            />
          </TabsContent>

          <TabsContent value="documents" className="m-0">
            <DocumentRequestList
              noticeId={noticeId}
              noticeType={noticeType}
              availableMembers={availableMembers}
              showHeader={false}
            />
          </TabsContent>

          <TabsContent value="comments" className="m-0">
            <CommentList
              noticeId={noticeId}
              availableUsers={availableMembers}
              showHeader={false}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
