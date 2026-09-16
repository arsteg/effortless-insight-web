'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Building2,
  Users,
  TrendingUp,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function CaDashboardPage() {
  const router = useRouter()
  const { isContextActive, context, clearContext } = useCaStore()

  // Redirect to clients if no context selected
  useEffect(() => {
    if (!isContextActive) {
      router.push('/ca/clients')
    }
  }, [isContextActive, router])

  // Fetch client dashboard
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['ca-client-dashboard', context?.selectedClientRelationshipId],
    queryFn: () =>
      context?.selectedClientRelationshipId
        ? caApi.getClientDashboard(context.selectedClientRelationshipId)
        : Promise.reject('No client selected'),
    enabled: !!context?.selectedClientRelationshipId,
  })

  // Fetch notice counts
  const { data: noticeCounts } = useQuery({
    queryKey: ['ca-notice-counts'],
    queryFn: () => caApi.getNoticeCounts(),
    enabled: isContextActive,
  })

  const handleClearContext = async () => {
    await clearContext()
    router.push('/ca/clients')
  }

  if (!isContextActive) {
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertTitle>Working as CA for: {context?.selectedClientName}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            {context?.selectedOrganizationName && (
              <span className="text-muted-foreground">
                Organization: {context.selectedOrganizationName}
              </span>
            )}
            {context?.authorizedGstins && context.authorizedGstins.length > 0 && (
              <span className="ml-4 text-muted-foreground">
                {context.authorizedGstins.length} GSTIN(s) authorized
              </span>
            )}
          </span>
          <Button variant="outline" size="sm" onClick={handleClearContext}>
            Switch Client
          </Button>
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noticeCounts?.total ?? dashboard?.totalNoticeCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              All notices for authorized GSTINs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {noticeCounts?.pending ?? dashboard?.pendingNoticeCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {noticeCounts?.overdue ?? dashboard?.overdueNoticeCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authorized GSTINs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.authorizedGstins?.length ?? context?.authorizedGstins?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Active authorizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Notices</CardTitle>
              <CardDescription>Latest notices from authorized GSTINs</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ca/notices">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!dashboard?.recentNotices || dashboard.recentNotices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notices found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.recentNotices.slice(0, 5).map((notice) => (
                    <TableRow key={notice.noticeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notice.noticeNumber || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{notice.noticeType}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notice.status)}</TableCell>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Authorized GSTINs */}
        <Card>
          <CardHeader>
            <CardTitle>Authorized GSTINs</CardTitle>
            <CardDescription>GSTINs you can manage for this client</CardDescription>
          </CardHeader>
          <CardContent>
            {!dashboard?.authorizedGstins || dashboard.authorizedGstins.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No GSTINs authorized</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.authorizedGstins.map((gstin) => (
                  <div
                    key={gstin.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-mono font-medium">{gstin.gstin}</p>
                      <p className="text-sm text-muted-foreground">
                        {gstin.tradeName || gstin.stateName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{gstin.noticeCount} notices</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions for this client</CardDescription>
        </CardHeader>
        <CardContent>
          {!dashboard?.recentActivity || dashboard.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.activityType}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
