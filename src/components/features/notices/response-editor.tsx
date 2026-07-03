'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, Send, CheckCircle, FileText, Wand2, Sparkles } from 'lucide-react'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  const [showAutoDraftDialog, setShowAutoDraftDialog] = useState(false)

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

  // Auto-draft mutation
  const autoDraftMutation = useMutation({
    mutationFn: () => noticesApi.generateAutoDraft(noticeId, { tone: 'formal', language: 'en' }),
    onSuccess: (data) => {
      setContent(data.draftContent)
      setShowAutoDraftDialog(false)
      toast({
        title: 'Draft generated',
        description: `AI draft created in ${(data.metadata.processingTimeMs / 1000).toFixed(1)}s. Review and edit as needed.`,
        variant: 'success',
      })
    },
    onError: (error: unknown) => {
      setShowAutoDraftDialog(false)

      // Parse error response
      let errorTitle = 'Auto-draft failed'
      let errorDescription = 'Failed to generate draft. Please try again.'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiError = error as any
      const errorCode = apiError?.response?.data?.error || apiError?.response?.data?.code
      const errorMessage = apiError?.response?.data?.message || apiError?.message

      switch (errorCode) {
        case 'RATE_LIMIT_EXCEEDED':
          errorTitle = 'Too many requests'
          errorDescription = errorMessage || 'Please wait a minute before generating another draft.'
          break
        case 'NO_CONTENT':
          errorTitle = 'Notice not processed'
          errorDescription = 'The notice is still being processed. Please wait for analysis to complete.'
          break
        case 'TIMEOUT':
          errorTitle = 'Request timed out'
          errorDescription = 'The AI service took too long. Please try again.'
          break
        case 'VALIDATION_ERROR':
          errorTitle = 'Invalid request'
          errorDescription = errorMessage || 'Please check your input and try again.'
          break
        case 'FORBIDDEN':
          errorTitle = 'Permission denied'
          errorDescription = 'You do not have permission to generate auto-drafts.'
          break
        default:
          if (errorMessage) {
            errorDescription = errorMessage
          }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
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

  const handleAutoDraft = () => {
    // If there's existing content, show confirmation dialog
    if (content.trim().length > 0) {
      setShowAutoDraftDialog(true)
    } else {
      autoDraftMutation.mutate()
    }
  }

  const handleConfirmAutoDraft = () => {
    autoDraftMutation.mutate()
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
          placeholder="Draft your response here, or click 'Auto-Draft' to generate an AI-powered response..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          disabled={!canEdit || autoDraftMutation.isPending}
          className="font-mono text-sm"
        />

        {canEdit && (
          <div className="flex gap-2 justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleAutoDraft}
                    disabled={autoDraftMutation.isPending || saveDraftMutation.isPending}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-purple-950 dark:to-blue-950 dark:hover:from-purple-900 dark:hover:to-blue-900 border-purple-200 dark:border-purple-800"
                  >
                    {autoDraftMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                        Auto-Draft
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate an AI-powered draft response based on the notice content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending || autoDraftMutation.isPending}
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
                disabled={!canSubmit || autoDraftMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit for Review
              </Button>
            </div>
          </div>
        )}

        {autoDraftMutation.isPending && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Wand2 className="h-5 w-5 animate-pulse" />
            <p className="text-sm">
              AI is analyzing the notice and generating a professional response...
            </p>
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

      {/* Submit for Review Dialog */}
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

      {/* Auto-Draft Confirmation Dialog */}
      <AlertDialog open={showAutoDraftDialog} onOpenChange={setShowAutoDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Replace existing draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have an existing draft. Generating a new AI draft will replace your current content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={autoDraftMutation.isPending}>
              Keep Current
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAutoDraft}
              disabled={autoDraftMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {autoDraftMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate New Draft
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
