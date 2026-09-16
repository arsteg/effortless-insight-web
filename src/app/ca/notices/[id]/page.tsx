'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  AlertTriangle,
  Download,
  MessageSquare,
  ExternalLink,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function getPriorityBadge(priority: string) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return <Badge variant="destructive">High Priority</Badge>
    case 'medium':
      return <Badge variant="default">Medium Priority</Badge>
    case 'low':
      return <Badge variant="secondary">Low Priority</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return <Badge variant="secondary" className="text-base px-3 py-1">Pending</Badge>
    case 'in_progress':
      return <Badge variant="default" className="text-base px-3 py-1">In Progress</Badge>
    case 'responded':
      return <Badge className="bg-green-500 text-base px-3 py-1">Responded</Badge>
    case 'overdue':
      return <Badge variant="destructive" className="text-base px-3 py-1">Overdue</Badge>
    case 'closed':
      return <Badge variant="outline" className="text-base px-3 py-1">Closed</Badge>
    default:
      return <Badge variant="outline" className="text-base px-3 py-1">{status}</Badge>
  }
}

function formatCurrency(amount: number | undefined | null) {
  if (amount == null) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || '-'}</span>
    </div>
  )
}

export default function CaNoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isContextActive, context } = useCaStore()
  const noticeId = params.id as string

  // Redirect to clients if no context selected
  useEffect(() => {
    if (!isContextActive) {
      router.push('/ca/clients')
    }
  }, [isContextActive, router])

  // Fetch notice details
  const {
    data: notice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ca-notice', noticeId],
    queryFn: () => caApi.getNotice(noticeId),
    enabled: isContextActive && !!noticeId,
  })

  if (!isContextActive) {
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !notice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/ca/notices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notices
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-lg">Notice Not Found</CardTitle>
            <CardDescription className="text-center max-w-sm mt-2">
              The notice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ca/notices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {notice.noticeNumber || 'Notice Details'}
            </h1>
            {getStatusBadge(notice.status)}
          </div>
          <p className="text-muted-foreground">
            {notice.noticeType}
            {notice.noticeCategory && ` - ${notice.noticeCategory}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notice.canComment && (
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          )}
          {notice.fileUrl && (
            <Button asChild>
              <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Permissions Alert */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>CA Access for {context?.selectedClientName}</AlertTitle>
        <AlertDescription>
          You can {notice.canComment ? 'view and comment on' : 'view'} this notice.
          {notice.canDraftResponse && ' You can also draft responses.'}
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notice Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GSTIN Info */}
            <div>
              <h4 className="font-medium mb-2">GSTIN Details</h4>
              <div className="rounded-lg border p-4">
                <p className="font-mono text-lg">{notice.gstin}</p>
                {notice.tradeName && (
                  <p className="text-muted-foreground">{notice.tradeName}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Notice Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Basic Details</h4>
                <div className="space-y-1 text-sm">
                  <InfoRow label="Notice Number" value={notice.noticeNumber} />
                  <InfoRow label="Notice Type" value={notice.noticeType} />
                  <InfoRow label="Category" value={notice.noticeCategory} />
                  {notice.noticeSubCategory && (
                    <InfoRow label="Sub-Category" value={notice.noticeSubCategory} />
                  )}
                  <InfoRow label="Section" value={notice.section} />
                  <InfoRow label="Source" value={notice.source} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Dates</h4>
                <div className="space-y-1 text-sm">
                  <InfoRow
                    label="Issue Date"
                    value={
                      notice.issueDate
                        ? new Date(notice.issueDate).toLocaleDateString()
                        : null
                    }
                  />
                  <InfoRow
                    label="Response Deadline"
                    value={
                      notice.responseDeadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(notice.responseDeadline).toLocaleDateString()}
                        </span>
                      ) : null
                    }
                  />
                  {notice.extendedDeadline && (
                    <InfoRow
                      label="Extended Deadline"
                      value={new Date(notice.extendedDeadline).toLocaleDateString()}
                    />
                  )}
                  {notice.hearingDate && (
                    <InfoRow
                      label="Hearing Date"
                      value={new Date(notice.hearingDate).toLocaleDateString()}
                    />
                  )}
                  <InfoRow
                    label="Period"
                    value={
                      notice.periodFrom && notice.periodTo
                        ? `${new Date(notice.periodFrom).toLocaleDateString()} - ${new Date(notice.periodTo).toLocaleDateString()}`
                        : notice.financialYear
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Authority Info */}
            <div>
              <h4 className="font-medium mb-3">Issuing Authority</h4>
              <div className="space-y-1 text-sm">
                <InfoRow label="Authority" value={notice.issuingAuthority} />
                <InfoRow label="Officer" value={notice.issuingOfficer} />
                <InfoRow label="Designation" value={notice.officerDesignation} />
                <InfoRow label="Jurisdiction" value={notice.jurisdiction} />
              </div>
            </div>

            {/* Summary */}
            {notice.summary && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Summary</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {notice.summary}
                  </p>
                </div>
              </>
            )}

            {/* Tags */}
            {notice.tags && notice.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {notice.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Priority & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                {getStatusBadge(notice.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority</p>
                {getPriorityBadge(notice.priority)}
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Amount</span>
                  <span className="font-medium">{formatCurrency(notice.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penalty</span>
                  <span className="font-medium">{formatCurrency(notice.penaltyAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest</span>
                  <span className="font-medium">{formatCurrency(notice.interestAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Total Demand</span>
                  <span className="font-bold">{formatCurrency(notice.totalDemand)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document */}
          {notice.fileUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{notice.fileName}</p>
                    <p className="text-sm text-muted-foreground">PDF Document</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={notice.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(notice.createdAt).toLocaleString()}</span>
                </div>
                {notice.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{new Date(notice.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
