'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  Archive,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Upload,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './status-badge'
import { PriorityBadge } from './priority-badge'
import { RiskBadge } from './risk-badge'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Notice, NoticeFilters } from '@/types'

interface NoticeTableProps {
  notices: Notice[]
  isLoading?: boolean
  sortBy?: string
  sortDesc?: boolean
  onSortChange?: (sortBy: string, sortDesc: boolean) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  onAssign?: (notice: Notice) => void
  onArchive?: (notice: Notice) => void
  onDelete?: (notice: Notice) => void
}

type SortableColumn = 'noticeNumber' | 'noticeType' | 'responseDeadline' | 'taxAmount' | 'status' | 'priority' | 'createdAt'

export function NoticeTable({
  notices,
  isLoading = false,
  sortBy,
  sortDesc = false,
  onSortChange,
  selectedIds = [],
  onSelectionChange,
  onAssign,
  onArchive,
  onDelete,
}: NoticeTableProps) {
  const allSelected = notices.length > 0 && selectedIds.length === notices.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < notices.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(notices.map((n) => n.id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id])
    } else {
      onSelectionChange?.(selectedIds.filter((i) => i !== id))
    }
  }

  const handleSort = (column: SortableColumn) => {
    if (!onSortChange) return
    if (sortBy === column) {
      onSortChange(column, !sortDesc)
    } else {
      onSortChange(column, false)
    }
  }

  const getSortIcon = (column: SortableColumn) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />
    }
    return sortDesc ? (
      <ArrowDown className="ml-1 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-1 h-4 w-4" />
    )
  }

  if (isLoading) {
    return <NoticeTableSkeleton />
  }

  if (notices.length === 0) {
    return <NoticeTableEmpty />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={someSelected ? 'opacity-50' : ''}
                />
              </TableHead>
            )}
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
                onClick={() => handleSort('noticeNumber')}
              >
                Notice
                {getSortIcon('noticeNumber')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => handleSort('noticeType')}
              >
                Type
                {getSortIcon('noticeType')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => handleSort('responseDeadline')}
              >
                Deadline
                {getSortIcon('responseDeadline')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => handleSort('taxAmount')}
              >
                Amount
                {getSortIcon('taxAmount')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => handleSort('status')}
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => handleSort('priority')}
              >
                Priority
                {getSortIcon('priority')}
              </Button>
            </TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map((notice) => (
            <TableRow
              key={notice.id}
              className={cn(
                selectedIds.includes(notice.id) && 'bg-muted/50'
              )}
            >
              {onSelectionChange && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(notice.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(notice.id, checked as boolean)
                    }
                    aria-label={`Select notice ${notice.noticeNumber}`}
                  />
                </TableCell>
              )}
              <TableCell>
                <Link
                  href={`/notices/${notice.id}`}
                  className="font-medium hover:underline"
                >
                  {notice.noticeNumber || `#${notice.id.slice(0, 8)}`}
                </Link>
                {notice.gstin && (
                  <div className="text-xs text-muted-foreground">
                    {notice.gstin}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[150px] truncate">
                  {notice.noticeType || '—'}
                </div>
                {notice.noticeCategory && (
                  <div className="text-xs text-muted-foreground">
                    {notice.noticeCategory}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <DeadlineCell
                  deadline={notice.responseDeadline}
                  daysRemaining={notice.daysRemaining}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(notice.taxAmount)}
                </div>
                {notice.penaltyAmount !== undefined && notice.penaltyAmount > 0 && (
                  <div className="text-xs text-muted-foreground">
                    +{formatCurrency(notice.penaltyAmount)} penalty
                  </div>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={notice.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={notice.priority} />
              </TableCell>
              <TableCell>
                {notice.riskScore !== undefined ? (
                  <RiskBadge score={notice.riskScore} level={notice.riskLevel} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/notices/${notice.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {onAssign && (
                      <DropdownMenuItem onClick={() => onAssign(notice)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onArchive && (
                      <DropdownMenuItem onClick={() => onArchive(notice)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(notice)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface DeadlineCellProps {
  deadline?: string
  daysRemaining?: number
}

function DeadlineCell({ deadline, daysRemaining }: DeadlineCellProps) {
  if (!deadline) {
    return <span className="text-muted-foreground">—</span>
  }

  const getDeadlineColor = () => {
    if (daysRemaining === undefined) return ''
    if (daysRemaining < 0) return 'text-red-600 dark:text-red-400'
    if (daysRemaining <= 3) return 'text-red-600 dark:text-red-400'
    if (daysRemaining <= 7) return 'text-yellow-600 dark:text-yellow-400'
    return ''
  }

  const getDaysLabel = () => {
    if (daysRemaining === undefined) return null
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)}d overdue`
    if (daysRemaining === 0) return 'Today'
    if (daysRemaining === 1) return 'Tomorrow'
    return `${daysRemaining}d left`
  }

  return (
    <div>
      <div className={cn('font-medium', getDeadlineColor())}>
        {formatDate(deadline)}
      </div>
      {daysRemaining !== undefined && (
        <div className={cn('text-xs', getDeadlineColor())}>
          {getDaysLabel()}
        </div>
      )}
    </div>
  )
}

function NoticeTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead>Notice</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-1 h-3 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function NoticeTableEmpty() {
  return (
    <div className="rounded-md border">
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notices found</h3>
        <p className="text-muted-foreground mb-4 text-center max-w-sm">
          Upload your first GST notice to get started with AI-powered analysis.
        </p>
        <Button asChild>
          <Link href="/notices/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Notice
          </Link>
        </Button>
      </div>
    </div>
  )
}
