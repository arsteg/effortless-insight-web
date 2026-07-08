'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  Import,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Filter,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { ImportNoticesDialog } from './import-notices-dialog'

import {
  useGstNoticesRaw,
  useGstClients,
  useGstNoticePdfUrl,
} from '@/hooks/use-gst-sync'
import type { GstNoticeRaw, GstNoticeFilters } from '@/types/gst-sync'

const PAGE_SIZE = 20

export function GstSyncedNotices() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [filters, setFilters] = useState<GstNoticeFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
    importStatus: 'pending',
  })

  const { data, isLoading, error, refetch } = useGstNoticesRaw(filters)
  const { data: clientsData } = useGstClients({ pageSize: 100 })

  const notices = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const clientsMap = useMemo(() => {
    const map = new Map<string, string>()
    clientsData?.items?.forEach((c) => map.set(c.id, c.gstin))
    return map
  }, [clientsData])

  const selectedNotices = useMemo(() => {
    return notices.filter((n) => selectedIds.includes(n.id))
  }, [notices, selectedIds])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select notices that haven't been imported
      setSelectedIds(notices.filter((n) => !n.importedToNotices).map((n) => n.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  const handleImportClick = () => {
    if (selectedIds.length === 0) return
    setIsImportDialogOpen(true)
  }

  const handleImportComplete = () => {
    setSelectedIds([])
    refetch()
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
    setSelectedIds([])
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load synced notices. Please try again.</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={filters.importStatus ?? 'all'}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                importStatus: value as 'all' | 'imported' | 'pending',
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notices</SelectItem>
              <SelectItem value="pending">Pending Import</SelectItem>
              <SelectItem value="imported">Already Imported</SelectItem>
            </SelectContent>
          </Select>

          {clientsData && clientsData.items.length > 1 && (
            <Select
              value={filters.gstClientId ?? 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  gstClientId: value === 'all' ? undefined : value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All GSTINs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GSTINs</SelectItem>
                {clientsData.items.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.gstin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedIds.length > 0 && (
          <Button onClick={handleImportClick}>
            <Import className="mr-2 h-4 w-4" />
            Import {selectedIds.length} Notice(s)
          </Button>
        )}
      </div>

      {/* Notices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      notices.length > 0 && selectedIds.length === notices.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Notice ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {filters.importStatus === 'pending'
                        ? 'No notices pending import. Synced notices will appear here.'
                        : 'No notices found matching your filters.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((notice) => (
                  <NoticeRow
                    key={notice.id}
                    notice={notice}
                    gstin={clientsMap.get(notice.gstClientId) ?? 'Unknown'}
                    selected={selectedIds.includes(notice.id)}
                    onSelect={(checked) => handleSelect(notice.id, checked)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo
            currentPage={filters.page ?? 1}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
          />
          <Pagination
            currentPage={filters.page ?? 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Import Dialog */}
      <ImportNoticesDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        selectedNotices={selectedNotices}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}

interface NoticeRowProps {
  notice: GstNoticeRaw
  gstin: string
  selected: boolean
  onSelect: (checked: boolean) => void
}

function NoticeRow({ notice, gstin, selected, onSelect }: NoticeRowProps) {
  const isImported = notice.importedToNotices

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          disabled={isImported}
        />
      </TableCell>
      <TableCell className="font-mono text-sm">
        {notice.portalNoticeId}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{notice.noticeType}</Badge>
      </TableCell>
      <TableCell className="font-mono text-sm">{gstin}</TableCell>
      <TableCell>
        {notice.issueDate
          ? new Date(notice.issueDate).toLocaleDateString()
          : '-'}
      </TableCell>
      <TableCell>
        {notice.dueDate ? (
          <span
            className={
              new Date(notice.dueDate) < new Date() ? 'text-destructive' : ''
            }
          >
            {new Date(notice.dueDate).toLocaleDateString()}
          </span>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {notice.demandAmount
          ? `₹${notice.demandAmount.toLocaleString('en-IN')}`
          : '-'}
      </TableCell>
      <TableCell>
        {isImported ? (
          <Badge variant="secondary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Imported
          </Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )}
      </TableCell>
      <TableCell>
        {notice.pdfAvailable && notice.pdfS3Key && (
          <PdfDownloadButton noticeId={notice.id} />
        )}
      </TableCell>
    </TableRow>
  )
}

function PdfDownloadButton({ noticeId }: { noticeId: string }) {
  const { data, isLoading } = useGstNoticePdfUrl(noticeId)

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Download className="h-4 w-4" />
      </Button>
    )
  }

  if (!data?.url) {
    return null
  }

  return (
    <Button variant="ghost" size="icon" asChild>
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <Download className="h-4 w-4" />
      </a>
    </Button>
  )
}

export default GstSyncedNotices
