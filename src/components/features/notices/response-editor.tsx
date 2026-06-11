'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Send, CheckCircle, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { noticesApi } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NoticeResponse } from '@/types'

interface ResponseEditorProps {
  noticeId: string
}

const statusConfig: Record<
  NoticeResponse['status'],
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'secondary' },
  review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  submitted: { label: 'Submitted', variant: 'default' },
}

export function ResponseEditor({ noticeId }: ResponseEditorProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Fetch latest response
  const { data: response, isLoading } = useQuery({
    queryKey: ['notices', noticeId, 'response'],
    queryFn: () => noticesApi.getLatestResponse(noticeId).catch(() => null),
  })

  // Initialize content from response
  useEffect(() => {
    if (response) {
      setContent(response.draftContent || response.finalContent || '')
    }
  }, [response])

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (draftContent: string) => noticesApi.saveDraft(noticeId, draftContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices', noticeId, 'response'] })
      toast({
        title: 'Draft saved',
        description: 'Your response draft has been saved.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Save failed',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      })
    },
  })

  // Submit for review mutation
  const submitForReviewMutation = useMutation({
    mutationFn: () => {
      if (!response) throw new Error('No response to submit')
      return noticesApi.submitForReview(noticeId, response.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices', noticeId, 'response'] })
      setShowSubmitDialog(false)
      toast({
        title: 'Submitted for review',
        description: 'Your response has been submitted for review.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Submit failed',
        description: 'Failed to submit for review. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSaveDraft = () => {
    saveDraftMutation.mutate(content)
  }

  const handleSubmitForReview = () => {
    submitForReviewMutation.mutate()
  }

  const canEdit = !response || response.status === 'draft'
  const canSubmit = response?.status === 'draft' && content.trim().length > 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Response Editor
            </CardTitle>
            <CardDescription>
              Draft and submit your response to this notice.
            </CardDescription>
          </div>
          {response && (
            <Badge variant={statusConfig[response.status].variant}>
              {statusConfig[response.status].label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {response?.status === 'submitted' && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Response Submitted</p>
              <p className="text-sm">
                Submitted on {new Date(response.submittedAt!).toLocaleDateString()}
                {response.submissionReference && ` • Ref: ${response.submissionReference}`}
              </p>
            </div>
          </div>
        )}

        <Textarea
          placeholder="Draft your response here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          disabled={!canEdit}
          className="font-mono text-sm"
        />

        {canEdit && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saveDraftMutation.isPending}
            >
              {saveDraftMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={!canSubmit}
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          </div>
        )}

        {response?.status === 'review' && (
          <p className="text-sm text-muted-foreground text-center">
            This response is awaiting approval. You cannot edit it until it&apos;s returned for revision.
          </p>
        )}

        {response?.status === 'approved' && (
          <p className="text-sm text-muted-foreground text-center">
            This response has been approved and is ready to be submitted to the GST portal.
          </p>
        )}
      </CardContent>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will submit your response for review by an approver.
              You won&apos;t be able to edit it until the review is complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitForReviewMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitForReview}
              disabled={submitForReviewMutation.isPending}
            >
              {submitForReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
