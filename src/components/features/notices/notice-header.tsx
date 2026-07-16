'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  MoreHorizontal,
  UserPlus,
  Archive,
  Trash2,
  Clock,
  Calendar,
  Building2,
  FileText,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './status-badge'
import { StatusDropdown } from './status-dropdown'
import { PriorityBadge } from './priority-badge'
import { RiskBadge } from './risk-badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { NoticeDetail } from '@/types'

interface NoticeHeaderProps {
  notice?: NoticeDetail
  isLoading?: boolean
  canChangeStatus?: boolean
  onDownload?: () => void
  onEdit?: () => void
  onAssign?: () => void
  onArchive?: () => void
  onDelete?: () => void
}

export function NoticeHeader({
  notice,
  isLoading = false,
  canChangeStatus = true,
  onDownload,
  onEdit,
  onAssign,
  onArchive,
  onDelete,
}: NoticeHeaderProps) {
  if (isLoading) {
    return <NoticeHeaderSkeleton />
  }

  if (!notice) {
    return null
  }

  const totalAmount =
    (notice.taxAmount || 0) +
    (notice.penaltyAmount || 0) +
    (notice.interestAmount || 0)

  const getDeadlineColor = () => {
    if (!notice.daysRemaining) return ''
    if (notice.daysRemaining < 0) return 'text-red-600 dark:text-red-400'
    if (notice.daysRemaining <= 3) return 'text-red-600 dark:text-red-400'
    if (notice.daysRemaining <= 7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="space-y-4">
      {/* Back link and actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/notices"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Notices
        </Link>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAssign && (
                <DropdownMenuItem onClick={onAssign}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {notice.noticeNumber || `Notice #${notice.id.slice(0, 8)}`}
            </h1>
            {canChangeStatus ? (
              <StatusDropdown
                noticeId={notice.id}
                currentStatus={notice.status}
              />
            ) : (
              <StatusBadge status={notice.status} />
            )}
            <PriorityBadge priority={notice.priority} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {notice.noticeType && (
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {notice.noticeType}
                {notice.noticeCategory && ` - ${notice.noticeCategory}`}
              </span>
            )}
            {notice.gstin && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {notice.gstin}
              </span>
            )}
            {notice.issueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Issued: {formatDate(notice.issueDate)}
              </span>
            )}
          </div>
          {notice.assignedToName && (
            <p className="text-sm">
              <span className="text-muted-foreground">Assigned to: </span>
              <span className="font-medium">{notice.assignedToName}</span>
            </p>
          )}
        </div>

        {/* Right side - Amount and Deadline */}
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 md:min-w-[200px]">
          {/* Total Amount */}
          <div>
            <p className="text-xs text-muted-foreground">Total Demand</p>
            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            {(notice.taxAmount || notice.penaltyAmount || notice.interestAmount) && (
              <div className="mt-1 text-xs text-muted-foreground">
                {notice.taxAmount && <span>Tax: {formatCurrency(notice.taxAmount)}</span>}
                {notice.penaltyAmount && (
                  <span className="ml-2">Penalty: {formatCurrency(notice.penaltyAmount)}</span>
                )}
                {notice.interestAmount && (
                  <span className="ml-2">Interest: {formatCurrency(notice.interestAmount)}</span>
                )}
              </div>
            )}
          </div>

          {/* Deadline */}
          {notice.responseDeadline && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">Response Deadline</p>
              <p className={cn('text-lg font-semibold', getDeadlineColor())}>
                {formatDate(notice.responseDeadline)}
              </p>
              {notice.daysRemaining !== undefined && (
                <p className={cn('text-sm', getDeadlineColor())}>
                  {notice.daysRemaining < 0
                    ? `${Math.abs(notice.daysRemaining)} days overdue`
                    : notice.daysRemaining === 0
                      ? 'Due today'
                      : `${notice.daysRemaining} days remaining`}
                </p>
              )}
              {notice.extendedDeadline && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Extended to: {formatDate(notice.extendedDeadline)}
                </p>
              )}
            </div>
          )}

          {/* Risk Score */}
          {notice.riskScore !== undefined && (
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-1">Risk Assessment</p>
              <RiskBadge score={notice.riskScore} level={notice.riskLevel} />
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {notice.tags && notice.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {notice.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function NoticeHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-lg border bg-muted/30 p-4 md:min-w-[200px]">
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-full mt-2" />
          <div className="border-t pt-3 mt-3">
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}
