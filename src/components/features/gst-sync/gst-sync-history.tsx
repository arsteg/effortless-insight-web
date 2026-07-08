'use client'

import { useMemo, useState } from 'react'
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

import { useGstSyncSessions, useGstClients } from '@/hooks/use-gst-sync'
import type { GstSyncSession, GstSyncSessionFilters, SyncSessionStatus } from '@/types/gst-sync'

const PAGE_SIZE = 20

export function GstSyncHistory() {
  const [filters, setFilters] = useState<GstSyncSessionFilters>({
    page: 1,
    pageSize: PAGE_SIZE,
  })

  const { data, isLoading, error, refetch } = useGstSyncSessions(filters)
  const { data: clientsData } = useGstClients({ pageSize: 100 })

  const sessions = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const totalPages = data?.totalPages ?? 1

  const clientsMap = useMemo(() => {
    const map = new Map<string, string>()
    clientsData?.items?.forEach((c) => map.set(c.id, c.gstin))
    return map
  }, [clientsData])

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
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
            <p>Failed to load sync history. Please try again.</p>
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
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select
          value={filters.status ?? 'all'}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === 'all' ? undefined : (value as SyncSessionStatus),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
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

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Found</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="text-right">PDFs</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-muted-foreground">
                      No sync sessions found. Syncs will appear here when notices are captured.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    gstin={clientsMap.get(session.gstClientId) ?? 'Unknown'}
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
    </div>
  )
}

interface SessionRowProps {
  session: GstSyncSession
  gstin: string
}

function SessionRow({ session, gstin }: SessionRowProps) {
  const statusInfo = getStatusInfo(session.status)
  const startTime = new Date(session.startedAt)

  return (
    <TableRow>
      <TableCell>
        <div className="text-sm">
          <div>{startTime.toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{gstin}</TableCell>
      <TableCell>
        <Badge variant="outline">{formatSource(session.syncSource)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={statusInfo.variant}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.label}</span>
        </Badge>
        {session.errorMessage && (
          <p className="text-xs text-destructive mt-1 max-w-[200px] truncate">
            {session.errorMessage}
          </p>
        )}
      </TableCell>
      <TableCell className="text-right">{session.noticesFound}</TableCell>
      <TableCell className="text-right text-green-600">
        {session.noticesNew > 0 ? `+${session.noticesNew}` : '-'}
      </TableCell>
      <TableCell className="text-right text-blue-600">
        {session.noticesUpdated > 0 ? session.noticesUpdated : '-'}
      </TableCell>
      <TableCell className="text-right">{session.pdfsDownloaded || '-'}</TableCell>
      <TableCell className="text-right text-muted-foreground">
        {session.durationMs ? formatDuration(session.durationMs) : '-'}
      </TableCell>
    </TableRow>
  )
}

function getStatusInfo(status: SyncSessionStatus): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ReactNode
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
      }
    case 'failed':
      return {
        label: 'Failed',
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
      }
    case 'partial':
      return {
        label: 'Partial',
        variant: 'secondary',
        icon: <AlertTriangle className="h-3 w-3" />,
      }
    case 'in_progress':
      return {
        label: 'In Progress',
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />,
      }
    default:
      return {
        label: status,
        variant: 'outline',
        icon: null,
      }
  }
}

function formatSource(source: string): string {
  switch (source) {
    case 'chrome_extension':
      return 'Chrome'
    case 'desktop_agent':
      return 'Desktop'
    case 'manual':
      return 'Manual'
    default:
      return source
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export default GstSyncHistory
