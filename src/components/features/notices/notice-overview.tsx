'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { NoticeDetail } from '@/types'

interface NoticeOverviewProps {
  notice?: NoticeDetail
  isLoading?: boolean
}

export function NoticeOverview({ notice, isLoading = false }: NoticeOverviewProps) {
  if (isLoading) {
    return <NoticeOverviewSkeleton />
  }

  if (!notice) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Notice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Notice Number" value={notice.noticeNumber} />
          <DetailRow label="Notice Type" value={notice.noticeType} />
          <DetailRow label="Category" value={notice.noticeCategory} />
          <DetailRow label="GSTIN" value={notice.gstin} />
          <DetailRow label="Issuing Authority" value={notice.issuingAuthority} />
          <Separator />
          <DetailRow label="Issue Date" value={formatDate(notice.issueDate)} />
          <DetailRow label="Response Deadline" value={formatDate(notice.responseDeadline)} />
          {notice.extendedDeadline && (
            <DetailRow label="Extended Deadline" value={formatDate(notice.extendedDeadline)} />
          )}
          {notice.periodFrom && notice.periodTo && (
            <DetailRow
              label="Assessment Period"
              value={`${formatDate(notice.periodFrom)} - ${formatDate(notice.periodTo)}`}
            />
          )}
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow
            label="Tax Amount"
            value={formatCurrency(notice.taxAmount)}
            highlight
          />
          <DetailRow
            label="Penalty Amount"
            value={formatCurrency(notice.penaltyAmount)}
          />
          <DetailRow
            label="Interest Amount"
            value={formatCurrency(notice.interestAmount)}
          />
          <Separator />
          <DetailRow
            label="Total Demand"
            value={formatCurrency(
              (notice.taxAmount || 0) +
                (notice.penaltyAmount || 0) +
                (notice.interestAmount || 0)
            )}
            highlight
            large
          />
        </CardContent>
      </Card>

      {/* AI Summary */}
      {notice.summaryEn && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {notice.summaryEn}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plain English Explanation */}
      {notice.aiReport?.plainEnglish && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">What This Means</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              {notice.aiReport.plainEnglish}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface DetailRowProps {
  label: string
  value?: string | null
  highlight?: boolean
  large?: boolean
}

function DetailRow({ label, value, highlight, large }: DetailRowProps) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-sm text-right ${
          highlight ? 'font-semibold' : ''
        } ${large ? 'text-lg font-bold' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  )
}

function NoticeOverviewSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
