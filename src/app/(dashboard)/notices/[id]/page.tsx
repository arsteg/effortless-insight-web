'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  NoticeHeader,
  WorkflowTimeline,
  NoticeOverview,
  AIAnalysisView,
  DocumentsManager,
  ActivityTimeline,
  CollaborationPanel,
  ResponseEditor,
  EditNoticeDialog,
  SimilarNotices,
} from '@/components/features/notices'
import { AIChatPanel } from '@/components/features/ai-chat'
import { CommentList } from '@/components/features/comments'
import { DocumentRequestPanel } from '@/components/features/document-requests/document-request-panel'
import { WorkflowPanel } from '@/components/features/workflow'
import { useNotice, useDeleteNotice } from '@/hooks/use-notices'
import {
  useAttachments,
  useDeleteAttachment,
  useDownloadAttachment,
} from '@/hooks/use-attachments'
import { useWorkflowPanel } from '@/hooks/use-workflow'
import { useMembers } from '@/hooks/use-team'
import { noticesApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { NoticeActivity } from '@/components/features/notices/activity-timeline'

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { id: noticeId } = use(params)

  // State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Data fetching
  const { data: notice, isLoading: isLoadingNotice, error } = useNotice(noticeId)
  const { data: attachments = [], isLoading: isLoadingAttachments } = useAttachments(noticeId)
  const deleteMutation = useDeleteNotice()
  const deleteAttachmentMutation = useDeleteAttachment(noticeId)
  const downloadAttachmentMutation = useDownloadAttachment(noticeId)

  // Workflow data
  const workflow = useWorkflowPanel(noticeId)

  // Team members for assignment
  const { data: membersData } = useMembers()
  const teamMembers = (membersData?.members || []).map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
  }))

  // Convert workflow history to activity format for the activity tab
  const workflowActivities: NoticeActivity[] = workflow.workflowHistory.map((h) => ({
    id: h.id,
    type: h.eventType as NoticeActivity['type'],
    description: h.description || h.eventType,
    userId: h.performedById || 'system',
    userName: h.performedByName || h.performedBySystem || 'System',
    createdAt: h.createdAt,
  }))

  // Handlers
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: noticeId })
    setShowDeleteDialog(false)
    router.push('/notices')
  }

  const handleDownloadNotice = async () => {
    if (!notice?.fileUrl) return
    try {
      const { url } = await noticesApi.getDownloadUrl(noticeId)
      window.open(url, '_blank')
    } catch {
      toast({
        title: 'Download failed',
        description: 'Failed to get download link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRetryAnalysis = async () => {
    setIsRetrying(true)
    try {
      await noticesApi.retryProcessing(noticeId)
      toast({
        title: 'Analysis restarted',
        description: 'The notice is being re-analyzed. This may take a few moments.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Retry failed',
        description: 'Failed to restart analysis. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsRetrying(false)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Notice Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The notice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push('/notices')}>
              Back to Notices
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notice Header */}
      <NoticeHeader
        notice={notice}
        isLoading={isLoadingNotice}
        onEdit={notice ? () => setShowEditDialog(true) : undefined}
        onDownload={notice?.fileUrl ? handleDownloadNotice : undefined}
        onDelete={() => setShowDeleteDialog(true)}
      />

      {/* Main Content with Workflow Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Processing Status Timeline (for notices being processed) */}
          {notice && (notice.status === 'uploaded' || notice.status === 'processing' || notice.status === 'failed') && (
            <Card>
              <CardContent className="pt-6">
                <WorkflowTimeline
                  noticeStatus={notice.status}
                  processingStatus={notice.processingStatus}
                />
              </CardContent>
            </Card>
          )}

          {/* Tab Navigation */}
          <Tabs defaultValue="overview">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-10">
            <TabsTrigger value="overview" className="flex-1 md:flex-none">Overview</TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 md:flex-none whitespace-nowrap">AI Analysis</TabsTrigger>
            <TabsTrigger value="similar" className="flex-1 md:flex-none">Similar</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 md:flex-none whitespace-nowrap">AI Chat</TabsTrigger>
            <TabsTrigger value="collaboration" className="flex-1 md:flex-none">Tasks</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1 md:flex-none">Comments</TabsTrigger>
            <TabsTrigger value="response" className="flex-1 md:flex-none">Response</TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 md:flex-none">Documents</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 md:flex-none">Requests</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 md:flex-none">Activity</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <NoticeOverview notice={notice} isLoading={isLoadingNotice} />
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <AIAnalysisView
            report={notice?.aiReport}
            processingStatus={notice?.processingStatus}
            isLoading={isLoadingNotice}
            onRetry={handleRetryAnalysis}
            isRetrying={isRetrying}
          />
        </TabsContent>

        <TabsContent value="similar" className="mt-6">
          <SimilarNotices noticeId={noticeId} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className="h-[600px]">
            <AIChatPanel noticeId={noticeId} className="h-full" />
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="mt-6">
          <CollaborationPanel noticeId={noticeId} />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <CommentList
            noticeId={noticeId}
            availableUsers={teamMembers.map(m => ({
              id: m.id,
              name: m.name,
              email: m.email,
            }))}
          />
        </TabsContent>

        <TabsContent value="response" className="mt-6">
          <ResponseEditor noticeId={noticeId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsManager
            noticeId={noticeId}
            noticeFileUrl={notice?.fileUrl}
            attachments={attachments}
            isLoading={isLoadingAttachments}
            onDownloadNotice={handleDownloadNotice}
            onDownload={(attachment) => downloadAttachmentMutation.mutate(attachment.id)}
            onDelete={(attachment) => deleteAttachmentMutation.mutate(attachment.id)}
            isDeleting={deleteAttachmentMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <DocumentRequestPanel
            noticeId={noticeId}
            noticeType={notice?.noticeType}
            availableMembers={teamMembers}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityTimeline
            activities={workflowActivities}
            isLoading={isLoadingNotice || workflow.isLoading}
            emptyMessage="No activity recorded for this notice yet."
          />
        </TabsContent>
      </Tabs>
        </div>

        {/* Right Column - Workflow Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <WorkflowPanel
              noticeId={noticeId}
              workflowInstance={workflow.workflowInstance}
              workflowProgress={workflow.workflowProgress}
              workflowHistory={workflow.workflowHistory}
              slaStatus={workflow.slaStatus}
              availableTransitions={workflow.availableTransitions}
              teamMembers={teamMembers}
              onTransition={workflow.transitionStage}
              onAssign={workflow.assignWorkflow}
              onPause={workflow.pauseWorkflow}
              onResume={workflow.resumeWorkflow}
              onCancel={workflow.cancelWorkflow}
              onStartWorkflow={workflow.startWorkflow}
              isLoading={workflow.isLoading}
              isTransitioning={workflow.isMutating}
            />
          </div>
        </div>
      </div>

      {/* Edit Notice Dialog */}
      {notice && (
        <EditNoticeDialog
          notice={notice}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone
              and will remove all associated data including attachments and comments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
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
                'Delete Notice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
