'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Upload, Trash2, Archive, UserPlus } from 'lucide-react'

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
  NoticeFilters,
  NoticeTable,
  AssignNoticeDialog,
} from '@/components/features/notices'
import { useNotices, useDeleteNotice, useBulkDeleteNotices, useArchiveNotice } from '@/hooks/use-notices'
import type { NoticeFilters as NoticeFiltersType, Notice } from '@/types'

const DEFAULT_PAGE_SIZE = 10

export default function NoticesPage() {
  // Filters state
  const [filters, setFilters] = useState<NoticeFiltersType>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    includeAggregations: true,
  })

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Delete confirmation dialog
  const [deleteNotice, setDeleteNotice] = useState<Notice | null>(null)

  // Assign dialog
  const [assignNotice, setAssignNotice] = useState<Notice | null>(null)

  // Bulk action dialogs
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

  // Data fetching
  const { data, isLoading, error } = useNotices(filters)
  const deleteMutation = useDeleteNotice()
  const bulkDeleteMutation = useBulkDeleteNotices()
  const archiveMutation = useArchiveNotice()

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

  const handleBulkArchive = useCallback(async () => {
    // Archive each selected notice
    await Promise.all(
      selectedIds.map((id) => archiveMutation.mutateAsync({ id }))
    )
    setSelectedIds([])
  }, [selectedIds, archiveMutation])

  const handleAssign = useCallback((notice: Notice) => {
    setAssignNotice(notice)
  }, [])

  const notices = data?.notices ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1
  const currentPage = data?.page ?? 1

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">
            Manage and track all your GST notices.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBulkArchive}
                disabled={archiveMutation.isPending}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive ({selectedIds.length})
              </Button>
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
          <Button asChild>
            <Link href="/notices/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Notice
            </Link>
          </Button>
        </div>
      </div>

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
            <p className="text-sm text-destructive">
              Failed to load notices. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notice Table */}
      <NoticeTable
        notices={notices}
        isLoading={isLoading}
        sortBy={filters.sortBy}
        sortDesc={filters.sortDesc}
        onSortChange={handleSortChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onAssign={handleAssign}
        onArchive={(notice) => archiveMutation.mutate({ id: notice.id })}
        onDelete={setDeleteNotice}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Assign Notice Dialog */}
      <AssignNoticeDialog
        notice={assignNotice}
        open={!!assignNotice}
        onOpenChange={(open) => !open && setAssignNotice(null)}
      />
    </div>
  )
}
