'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'
import type { CaNoticeFilter } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function getPriorityBadge(priority: string) {
  switch (priority?.toLowerCase()) {
    case 'high':
      return <Badge variant="destructive">High</Badge>
    case 'medium':
      return <Badge variant="default">Medium</Badge>
    case 'low':
      return <Badge variant="secondary">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'in_progress':
      return <Badge variant="default">In Progress</Badge>
    case 'responded':
      return <Badge className="bg-green-500">Responded</Badge>
    case 'overdue':
      return <Badge variant="destructive">Overdue</Badge>
    case 'closed':
      return <Badge variant="outline">Closed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CaNoticesPage() {
  const router = useRouter()
  const { isContextActive, context, clearContext } = useCaStore()

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [gstinFilter, setGstinFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Build filter object
  const filter: CaNoticeFilter = {
    page,
    pageSize,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    gstin: gstinFilter !== 'all' ? gstinFilter : undefined,
    sortBy: 'createdAt',
    sortDescending: true,
  }

  // Redirect to clients if no context selected
  useEffect(() => {
    if (!isContextActive) {
      router.push('/ca/clients')
    }
  }, [isContextActive, router])

  // Fetch notices
  const { data: noticesData, isLoading } = useQuery({
    queryKey: ['ca-notices', filter],
    queryFn: () => caApi.getNotices(filter),
    enabled: isContextActive,
  })

  const handleClearContext = async () => {
    await clearContext()
    router.push('/ca/clients')
  }

  if (!isContextActive) {
    return null
  }

  const totalPages = noticesData?.totalPages ?? 1
  const notices = noticesData?.items ?? []

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Working as CA for: {context?.selectedClientName}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Viewing notices for {context?.authorizedGstins?.length ?? 0} authorized GSTIN(s)
          </span>
          <Button variant="outline" size="sm" onClick={handleClearContext}>
            Switch Client
          </Button>
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
          <p className="text-muted-foreground">
            View and manage GST notices for {context?.selectedClientName}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) => {
                setPriorityFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={gstinFilter}
              onValueChange={(value) => {
                setGstinFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="GSTIN" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GSTINs</SelectItem>
                {context?.authorizedGstins?.map((gstin) => (
                  <SelectItem key={gstin} value={gstin}>
                    {gstin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notices Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg">No notices found</CardTitle>
            <CardDescription className="text-center max-w-sm mt-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'No notices have been synced for the authorized GSTINs yet.'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notice</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => (
                  <TableRow key={notice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/ca/notices/${notice.id}`} className="block">
                        <p className="font-medium">{notice.noticeNumber || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">
                          {notice.issueDate
                            ? new Date(notice.issueDate).toLocaleDateString()
                            : 'No date'}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{notice.gstin}</code>
                      {notice.tradeName && (
                        <p className="text-xs text-muted-foreground">{notice.tradeName}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{notice.noticeType || '-'}</p>
                        {notice.noticeCategory && (
                          <p className="text-xs text-muted-foreground">{notice.noticeCategory}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(notice.status)}</TableCell>
                    <TableCell>{getPriorityBadge(notice.priority)}</TableCell>
                    <TableCell>
                      {notice.responseDeadline ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(notice.responseDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {notice.totalDemand ? (
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0,
                          }).format(notice.totalDemand)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, noticesData?.total ?? 0)} of {noticesData?.total ?? 0}{' '}
                notices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
