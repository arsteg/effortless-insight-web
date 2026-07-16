'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  Save,
  Send,
  CheckCircle,
  FileText,
  Wand2,
  Sparkles,
  Upload,
  Paperclip,
  Download,
  Trash2,
  File,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { noticesApi } from '@/lib/api'
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useDownloadAttachment,
} from '@/hooks/use-attachments'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatFileSize } from '@/lib/utils'
import type { NoticeResponse, Attachment } from '@/types'

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
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(true)
  const [uploadDescription, setUploadDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch attachments (response documents)
  const { data: attachments = [], isLoading: isLoadingAttachments } = useAttachments(noticeId)
  const uploadMutation = useUploadAttachment(noticeId)
  const deleteMutation = useDeleteAttachment(noticeId)
  const downloadMutation = useDownloadAttachment(noticeId)

  // Filter to show only response documents (documentType = 'response')
  const responseDocuments = attachments.filter(
    (a: Attachment) => a.documentType === 'response'
  )

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

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or image file (JPG, PNG).',
          variant: 'destructive',
        })
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB.',
          variant: 'destructive',
        })
        return
      }
      setSelectedFile(file)
      setShowUploadDialog(true)
    }
  }

  // Handle upload
  const handleUpload = () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentType', 'response')
    if (uploadDescription.trim()) {
      formData.append('description', uploadDescription.trim())
    }

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        setShowUploadDialog(false)
        setSelectedFile(null)
        setUploadDescription('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
    })
  }

  // Handle download
  const handleDownload = (attachmentId: string) => {
    downloadMutation.mutate(attachmentId)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteAttachmentId) {
      deleteMutation.mutate(deleteAttachmentId, {
        onSuccess: () => {
          setDeleteAttachmentId(null)
        },
      })
    }
  }

  // Get file icon based on type
  const getFileIcon = (fileType?: string) => {
    if (fileType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (fileType?.includes('image')) return <File className="h-4 w-4 text-blue-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

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

        {/* Response Documents Section */}
        <Collapsible open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
          <div className="border rounded-lg">
            <CollapsibleTrigger asChild>
              <button className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="font-medium">Response Documents</span>
                  {responseDocuments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {responseDocuments.length}
                    </Badge>
                  )}
                </div>
                {isDocumentsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator />
              <div className="p-4 space-y-4">
                {/* Upload Button */}
                {canEdit && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMutation.isPending}
                      className="w-full border-dashed"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Response Document
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Supported formats: PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>
                )}

                {/* Documents List */}
                {isLoadingAttachments ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : responseDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {responseDocuments.map((doc: Attachment) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(doc.fileType)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.fileSize ? formatFileSize(doc.fileSize) : 'Unknown size'}
                              {doc.description && ` • ${doc.description}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(doc.id)}
                            disabled={downloadMutation.isPending}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteAttachmentId(doc.id)}
                              disabled={deleteMutation.isPending}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No response documents uploaded yet.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

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

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Response Document</DialogTitle>
            <DialogDescription>
              Add a supporting document for your response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                {getFileIcon(selectedFile.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g., Bank statement, Payment proof, Supporting evidence..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadDialog(false)
                setSelectedFile(null)
                setUploadDescription('')
              }}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAttachmentId} onOpenChange={() => setDeleteAttachmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
