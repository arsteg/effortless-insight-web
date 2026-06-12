'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Plus,
  FileText,
  Loader2,
  ListFilter,
  ArrowUpDown,
  Clock,
  Upload,
  Eye,
  CheckCircle,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { DocumentRequestCard } from './document-request-card'
import { DocumentRequestForm } from './document-request-form'
import {
  useDocumentRequests,
  useCreateDocumentRequest,
  useUpdateDocumentRequest,
  useDeleteDocumentRequest,
  useFulfillDocumentRequest,
  useReviewDocumentRequest,
  useSendDocumentRequestReminder,
} from '@/hooks/use-collaboration'
import type {
  DocumentRequest,
  CreateDocumentRequestRequest,
  UpdateDocumentRequestRequest,
  DocumentRequestStatus,
  TaskPriority,
  DocumentRequestSummary,
} from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface OrganizationMember {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

interface DocumentRequestListProps {
  noticeId: string
  noticeType?: string
  availableMembers?: OrganizationMember[]
  showHeader?: boolean
  maxItems?: number
  className?: string
}

type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const STATUS_ORDER: Record<DocumentRequestStatus, number> = {
  pending: 0,
  resubmit_needed: 1,
  submitted: 2,
  reviewing: 3,
  fulfilled: 4,
  cancelled: 5,
}

const STATUS_CONFIG: Record<
  DocumentRequestStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'text-gray-500' },
  submitted: { label: 'Submitted', icon: <Upload className="h-4 w-4" />, color: 'text-blue-500' },
  reviewing: { label: 'Reviewing', icon: <Eye className="h-4 w-4" />, color: 'text-purple-500' },
  fulfilled: { label: 'Fulfilled', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' },
  resubmit_needed: { label: 'Resubmit', icon: <RotateCcw className="h-4 w-4" />, color: 'text-amber-500' },
  cancelled: { label: 'Cancelled', icon: <XCircle className="h-4 w-4" />, color: 'text-red-500' },
}

function StatusSummary({ summary }: { summary: DocumentRequestSummary }) {
  const items = [
    { label: 'Pending', count: summary.pending, icon: Clock, color: 'text-gray-500' },
    { label: 'Submitted', count: summary.submitted, icon: Upload, color: 'text-blue-500' },
    { label: 'Reviewing', count: summary.reviewing, icon: Eye, color: 'text-purple-500' },
    { label: 'Fulfilled', count: summary.fulfilled, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Resubmit', count: summary.resubmitNeeded, icon: RotateCcw, color: 'text-amber-500' },
  ]

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
      {items
        .filter((item) => item.count > 0)
        .map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <item.icon className={cn('h-4 w-4', item.color)} />
            <span className="text-sm">
              <span className="font-medium">{item.count}</span>{' '}
              <span className="text-muted-foreground">{item.label}</span>
            </span>
          </div>
        ))}
      {summary.overdue > 0 && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">{summary.overdue} Overdue</span>
        </div>
      )}
    </div>
  )
}

function DocumentRequestListSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DocumentRequestList({
  noticeId,
  noticeType,
  availableMembers = [],
  showHeader = true,
  maxItems,
  className,
}: DocumentRequestListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState<DocumentRequest | null>(null)
  const [deletingRequest, setDeletingRequest] = useState<DocumentRequest | null>(null)
  const [uploadingRequest, setUploadingRequest] = useState<DocumentRequest | null>(null)
  const [reviewingRequest, setReviewingRequest] = useState<DocumentRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<DocumentRequestStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('dueDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadNote, setUploadNote] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'fulfilled' | 'resubmit_needed'>('fulfilled')
  const [reviewNote, setReviewNote] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useDocumentRequests(noticeId)
  const createMutation = useCreateDocumentRequest(noticeId)
  const updateMutation = useUpdateDocumentRequest(noticeId)
  const deleteMutation = useDeleteDocumentRequest(noticeId)
  const fulfillMutation = useFulfillDocumentRequest(noticeId)
  const reviewMutation = useReviewDocumentRequest(noticeId)
  const reminderMutation = useSendDocumentRequestReminder()

  const requests = data?.requests ?? []
  const summary = data?.summary

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests]

    // Apply filters
    if (statusFilter.length > 0) {
      result = result.filter((req) => statusFilter.includes(req.status))
    }

    if (priorityFilter.length > 0) {
      result = result.filter((req) => priorityFilter.includes(req.priority))
    }

    if (showOverdueOnly) {
      result = result.filter((req) => req.isOverdue && req.status !== 'fulfilled')
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          break
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'status':
          comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [requests, statusFilter, priorityFilter, sortBy, sortDirection, showOverdueOnly])

  const displayedRequests = maxItems
    ? filteredAndSortedRequests.slice(0, maxItems)
    : filteredAndSortedRequests
  const totalCount = requests.length

  const hasActiveFilters = statusFilter.length > 0 || priorityFilter.length > 0 || showOverdueOnly

  const toggleStatusFilter = (status: DocumentRequestStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const togglePriorityFilter = (priority: TaskPriority) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    )
  }

  const clearFilters = () => {
    setStatusFilter([])
    setPriorityFilter([])
    setShowOverdueOnly(false)
  }

  const handleCreate = async (data: CreateDocumentRequestRequest) => {
    await createMutation.mutateAsync(data)
    setShowForm(false)
  }

  const handleUpdate = async (data: CreateDocumentRequestRequest) => {
    if (!editingRequest) return
    await updateMutation.mutateAsync({
      requestId: editingRequest.id,
      data: data as UpdateDocumentRequestRequest,
    })
    setEditingRequest(null)
  }

  const handleDelete = async () => {
    if (!deletingRequest) return
    await deleteMutation.mutateAsync(deletingRequest.id)
    setDeletingRequest(null)
  }

  const handleUpload = async () => {
    if (!uploadingRequest || !uploadFile) return
    await fulfillMutation.mutateAsync({
      requestId: uploadingRequest.id,
      file: uploadFile,
      note: uploadNote || undefined,
    })
    setUploadingRequest(null)
    setUploadFile(null)
    setUploadNote('')
  }

  const handleReview = async () => {
    if (!reviewingRequest) return
    await reviewMutation.mutateAsync({
      requestId: reviewingRequest.id,
      data: {
        status: reviewStatus,
        reviewNote: reviewNote || undefined,
      },
    })
    setReviewingRequest(null)
    setReviewStatus('fulfilled')
    setReviewNote('')
  }

  const handleSendReminder = async (request: DocumentRequest) => {
    await reminderMutation.mutateAsync(request.id)
  }

  if (isLoading) {
    return <DocumentRequestListSkeleton showHeader={showHeader} />
  }

  return (
    <>
      <Card className={className}>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Document Requests</CardTitle>
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {summary?.fulfilled || 0} of {totalCount} fulfilled
                </p>
              )}
            </div>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Request Document
            </Button>
          </CardHeader>
        )}
        <CardContent className={showHeader ? '' : 'pt-6'}>
          {/* Summary */}
          {summary && totalCount > 0 && <StatusSummary summary={summary} />}

          {/* Controls */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ListFilter className="h-4 w-4 mr-1" />
                      Filter
                      {hasActiveFilters && (
                        <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {statusFilter.length + priorityFilter.length + (showOverdueOnly ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    {(
                      [
                        'pending',
                        'submitted',
                        'reviewing',
                        'fulfilled',
                        'resubmit_needed',
                      ] as DocumentRequestStatus[]
                    ).map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      >
                        <span className={cn('mr-2', STATUS_CONFIG[status].color)}>
                          {STATUS_CONFIG[status].icon}
                        </span>
                        {STATUS_CONFIG[status].label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    {(['critical', 'high', 'medium', 'low'] as TaskPriority[]).map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={() => togglePriorityFilter(priority)}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={showOverdueOnly}
                      onCheckedChange={setShowOverdueOnly}
                      className="text-red-600"
                    >
                      Overdue Only
                    </DropdownMenuCheckboxItem>
                    {hasActiveFilters && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={clearFilters}>
                          Clear Filters
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortOption)}
                    >
                      <DropdownMenuRadioItem value="dueDate">Due Date</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="createdAt">Created Date</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Direction</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={sortDirection}
                      onValueChange={(value) => setSortDirection(value as SortDirection)}
                    >
                      <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!showHeader && (
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Request
                </Button>
              )}
            </div>
          )}

          {displayedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters ? 'No requests match your filters' : 'No document requests yet'}
              </p>
              {hasActiveFilters ? (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              ) : (
                <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create First Request
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRequests.map((request) => (
                <DocumentRequestCard
                  key={request.id}
                  request={request}
                  onEdit={() => setEditingRequest(request)}
                  onDelete={() => setDeletingRequest(request)}
                  onUpload={() => setUploadingRequest(request)}
                  onReview={() => setReviewingRequest(request)}
                  onSendReminder={() => handleSendReminder(request)}
                />
              ))}
              {maxItems && filteredAndSortedRequests.length > maxItems && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{filteredAndSortedRequests.length - maxItems} more requests
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showForm || !!editingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingRequest(null)
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRequest ? 'Edit Document Request' : 'Request Document'}
            </DialogTitle>
            <DialogDescription>
              {editingRequest
                ? 'Update the document request details.'
                : 'Create a new document request for this notice.'}
            </DialogDescription>
          </DialogHeader>
          <DocumentRequestForm
            request={editingRequest || undefined}
            noticeType={noticeType}
            availableMembers={availableMembers}
            onSubmit={editingRequest ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false)
              setEditingRequest(null)
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRequest} onOpenChange={() => setDeletingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingRequest?.title}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingRequest(null)}
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
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog
        open={!!uploadingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setUploadingRequest(null)
            setUploadFile(null)
            setUploadNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to fulfill the request: &quot;{uploadingRequest?.title}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept={
                  uploadingRequest?.acceptedFormats
                    ?.map((f) => `.${f}`)
                    .join(',') || undefined
                }
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              {uploadingRequest?.acceptedFormats &&
                uploadingRequest.acceptedFormats.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: {uploadingRequest.acceptedFormats.join(', ').toUpperCase()}
                  </p>
                )}
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                placeholder="Add a note about this document..."
                value={uploadNote}
                onChange={(e) => setUploadNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadingRequest(null)
                setUploadFile(null)
                setUploadNote('')
              }}
              disabled={fulfillMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || fulfillMutation.isPending}
            >
              {fulfillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Document Dialog */}
      <Dialog
        open={!!reviewingRequest}
        onOpenChange={(open) => {
          if (!open) {
            setReviewingRequest(null)
            setReviewStatus('fulfilled')
            setReviewNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review the submitted document for: &quot;{reviewingRequest?.title}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewingRequest?.documents && reviewingRequest.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Submitted Documents</Label>
                <div className="space-y-2">
                  {reviewingRequest.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc.filename}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Decision</Label>
              <div className="flex gap-2">
                <Button
                  variant={reviewStatus === 'fulfilled' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setReviewStatus('fulfilled')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant={reviewStatus === 'resubmit_needed' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setReviewStatus('resubmit_needed')}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Request Resubmit
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Review Note{' '}
                {reviewStatus === 'resubmit_needed' ? '(required)' : '(optional)'}
              </Label>
              <Textarea
                placeholder={
                  reviewStatus === 'resubmit_needed'
                    ? 'Explain what needs to be corrected...'
                    : 'Add a note about the review...'
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewingRequest(null)
                setReviewStatus('fulfilled')
                setReviewNote('')
              }}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={
                (reviewStatus === 'resubmit_needed' && !reviewNote.trim()) ||
                reviewMutation.isPending
              }
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
