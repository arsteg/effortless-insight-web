'use client'

import { useState, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Upload, Trash2, Archive, ArchiveRestore, UserPlus, Download, FileText, FileSpreadsheet, File } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NoticeFilters,
  NoticeTable,
  AssignNoticeDialog,
  ArchiveNoticeDialog,
  UnarchiveNoticeDialog,
  ClientSummaryStrip,
  canArchiveNotice,
} from '@/components/features/notices'
import { useNotices, useDeleteNotice, useBulkDeleteNotices, useExportNotices } from '@/hooks/use-notices'
import { useToast } from '@/hooks/use-toast'
import { useNoticeUpdates } from '@/hooks/use-notice-updates'
import { useCanAccessFeature } from '@/components/features/subscription/feature-gate'
import { FeatureCodes } from '@/hooks/use-feature-access'
import type { NoticeFilters as NoticeFiltersType, Notice } from '@/types'
import Loading from '../loading'

const DEFAULT_PAGE_SIZE = 10

export default function NoticesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <NoticesPageInner />
    </Suspense>
  )
}

function NoticesPageInner() {
  // Enable real-time notice status updates
  useNoticeUpdates()
  // Deep-link support (e.g. dashboard widget links /notices?gstin=X&overdue=true)
  const searchParams = useSearchParams()
  // Filters state
  const [filters, setFilters] = useState<NoticeFiltersType>(() => ({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    includeAggregations: true,
    gstin: searchParams.get('gstin') || undefined,
    overdue: searchParams.get('overdue') === 'true' ? true : undefined,
    dueWithinDays: searchParams.get('dueWithinDays')
      ? Number(searchParams.get('dueWithinDays'))
      : undefined,
  }))

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Delete confirmation dialog
  const [deleteNotice, setDeleteNotice] = useState<Notice | null>(null)

  // Assign dialog
  const [assignNotice, setAssignNotice] = useState<Notice | null>(null)

  // Archive confirmation (one row or the bulk selection). Targets are kept while the
  // dialog closes so its text doesn't flash empty during the close animation.
  const [archiveTargets, setArchiveTargets] = useState<Notice[]>([])
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  // Unarchive confirmation (one row or the bulk selection), kept like archiveTargets
  const [unarchiveTargets, setUnarchiveTargets] = useState<Notice[]>([])
  const [showUnarchiveDialog, setShowUnarchiveDialog] = useState(false)

  // Bulk action dialogs
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // Data fetching
  const { data, isLoading, error, refetch } = useNotices(filters)
  const deleteMutation = useDeleteNotice()
  const bulkDeleteMutation = useBulkDeleteNotices()
  const exportMutation = useExportNotices()
  const { toast } = useToast()

  // Feature access
  const hasBulkOperations = useCanAccessFeature(FeatureCodes.BulkOperations)
  const hasDataExport = useCanAccessFeature(FeatureCodes.DataExport)

  // Handlers
  const handleFiltersChange = useCallback((newFilters: NoticeFiltersType) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setSelectedIds([]) // Clear selection when filters change
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    setSelectedIds([])
  }, [])

  const handleSortChange = useCallback((sortBy: string, sortDesc: boolean) => {
    setFilters((prev) => ({ ...prev, sortBy, sortDesc, page: 1 }))
  }, [])

  const handleDelete = useCallback(async () => {
    if (!deleteNotice) return
    await deleteMutation.mutateAsync({ id: deleteNotice.id })
    setDeleteNotice(null)
    setSelectedIds((ids) => ids.filter((id) => id !== deleteNotice.id))
  }, [deleteNotice, deleteMutation])

  const handleBulkDelete = useCallback(async () => {
    await bulkDeleteMutation.mutateAsync(selectedIds)
    setSelectedIds([])
    setShowBulkDeleteDialog(false)
  }, [selectedIds, bulkDeleteMutation])

  const notices = useMemo(() => data?.notices ?? [], [data?.notices])
  // Only notices the API allows archiving from (not already archived, not mid-workflow)
  const archivableNotices = useMemo(
    () => notices.filter((n) => selectedIds.includes(n.id) && canArchiveNotice(n.status)),
    [notices, selectedIds]
  )

  // Selected archived notices. When the whole selection is archived, the bulk Archive
  // button becomes Unarchive.
  const unarchivableNotices = useMemo(
    () => notices.filter((n) => selectedIds.includes(n.id) && n.status === 'archived'),
    [notices, selectedIds]
  )
  const showBulkUnarchive = unarchivableNotices.length > 0 && unarchivableNotices.length === selectedIds.length

  const openArchiveDialog = useCallback((targets: Notice[]) => {
    setArchiveTargets(targets)
    setShowArchiveDialog(true)
  }, [])

  const handleBulkArchive = useCallback(() => {
    const skipped = selectedIds.length - archivableNotices.length
    if (skipped > 0) {
      toast({
        title: 'Some notices skipped',
        description: `${skipped} selected notice(s) are already archived or can't be archived in their current status.`,
      })
    }
    openArchiveDialog(archivableNotices)
  }, [selectedIds, archivableNotices, openArchiveDialog, toast])

  // Archived notices leave the list, so start a fresh selection
  const handleArchived = useCallback(() => {
    setSelectedIds([])
  }, [])

  const openUnarchiveDialog = useCallback((targets: Notice[]) => {
    setUnarchiveTargets(targets)
    setShowUnarchiveDialog(true)
  }, [])

  // Unarchived notices leave the Archived list, so start a fresh selection
  const handleUnarchived = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleAssign = useCallback((notice: Notice) => {
    setAssignNotice(notice)
  }, [])

  const handleExport = useCallback(
    (format: 'csv' | 'xlsx' | 'pdf') => {
      exportMutation.mutate({ filters, format })
    },
    [filters, exportMutation]
  )

  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? 1

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notices</h1>
          <p className="text-muted-foreground">
            Manage and track all your GST notices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasBulkOperations && selectedIds.length > 0 && (
            <>
              {showBulkUnarchive ? (
                <Button variant="outline" onClick={() => openUnarchiveDialog(unarchivableNotices)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive ({unarchivableNotices.length})
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleBulkArchive}
                  disabled={archivableNotices.length === 0}
                  title={archivableNotices.length === 0 ? 'None of the selected notices can be archived' : undefined}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive ({archivableNotices.length})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedIds.length})
              </Button>
            </>
          )}
          {hasDataExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exportMutation.isPending}>
                  <Download className="mr-2 h-4 w-4" />
                  {exportMutation.isPending ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <File className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button asChild>
            <Link href="/notices/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Notice
            </Link>
          </Button>
        </div>
      </div>

      {/* Per-client summary — one card per GSTIN, click to filter */}
      <ClientSummaryStrip filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <NoticeFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p role="alert" className="text-sm text-destructive">
              We couldn’t load your notices. Please try again.
            </p>
            <Button variant="outline" className="mt-3" onClick={() => void refetch()}>Try again</Button>
          </CardContent>
        </Card>
      )}

      {/* Notice Table */}
      {!error && <NoticeTable
        notices={notices}
        isLoading={isLoading}
        sortBy={filters.sortBy}
        sortDesc={filters.sortDesc}
        onSortChange={handleSortChange}
        selectedIds={hasBulkOperations ? selectedIds : undefined}
        onSelectionChange={hasBulkOperations ? setSelectedIds : undefined}
        onAssign={handleAssign}
        onArchive={(notice) => openArchiveDialog([notice])}
        onUnarchive={(notice) => openUnarchiveDialog([notice])}
        onDelete={setDeleteNotice}
        filters={filters}
      />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="page-header">
          <PaginationInfo
            currentPage={currentPage}
            pageSize={filters.pageSize || DEFAULT_PAGE_SIZE}
            totalCount={totalCount}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteNotice} onOpenChange={() => setDeleteNotice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete notice{' '}
              <span className="font-medium">
                {deleteNotice?.noticeNumber || deleteNotice?.id}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteNotice(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Notices</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length} selected notice(s)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={bulkDeleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedIds.length} Notices`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <ArchiveNoticeDialog
        notices={archiveTargets}
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        onArchived={handleArchived}
      />

      {/* Unarchive Confirmation Dialog */}
      <UnarchiveNoticeDialog
        notices={unarchiveTargets}
        open={showUnarchiveDialog}
        onOpenChange={setShowUnarchiveDialog}
        onUnarchived={handleUnarchived}
      />

      {/* Assign Notice Dialog */}
      <AssignNoticeDialog
        notice={assignNotice}
        open={!!assignNotice}
        onOpenChange={(open) => !open && setAssignNotice(null)}
      />
    </div>
  )
}
