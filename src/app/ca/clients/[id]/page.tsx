'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  Shield,
  Loader2,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'
import type { CaGstinAuthorization } from '@/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="default">Active</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'revoked':
      return <Badge variant="destructive">Revoked</Badge>
    case 'expired':
      return <Badge variant="outline">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getPermissionLabel(permission: string): string {
  const labels: Record<string, string> = {
    view_notices: 'View Notices',
    add_comments: 'Add Comments',
    draft_responses: 'Draft Responses',
    sync_gst_portal: 'Sync GST Portal',
    manage_tasks: 'Manage Tasks',
    view_documents: 'View Documents',
  }
  return labels[permission] || permission
}

function GstinCard({ authorization }: { authorization: CaGstinAuthorization }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-mono">{authorization.gstin}</CardTitle>
            <CardDescription>
              {authorization.tradeName || authorization.legalName || 'No trade name'}
            </CardDescription>
          </div>
          {getStatusBadge(authorization.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">State</p>
            <p className="font-medium">{authorization.stateName || authorization.stateCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Notices</p>
            <p className="font-medium">{authorization.noticeCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Sync</p>
            <p className="font-medium">
              {authorization.lastSyncAt
                ? new Date(authorization.lastSyncAt).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Granted</p>
            <p className="font-medium">
              {new Date(authorization.grantedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-2">Permissions</p>
          <div className="flex flex-wrap gap-1">
            {authorization.permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {getPermissionLabel(permission)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CaClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { selectClient, isLoadingContext } = useCaStore()

  const relationshipId = params.id as string

  // Fetch client details
  const {
    data: client,
    isLoading: isLoadingClient,
    error: clientError,
  } = useQuery({
    queryKey: ['ca-client', relationshipId],
    queryFn: () => caApi.getClient(relationshipId),
    enabled: !!relationshipId,
  })

  // Fetch client dashboard
  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['ca-client-dashboard', relationshipId],
    queryFn: () => caApi.getClientDashboard(relationshipId),
    enabled: !!relationshipId,
  })

  // Select client handler
  const handleSelectClient = async () => {
    if (!client) return
    try {
      await selectClient(client.relationshipId)
      toast({
        title: 'Client selected',
        description: `Now working as CA for ${client.clientName}`,
        variant: 'success',
      })
      router.push('/ca/dashboard')
    } catch {
      toast({ title: 'Failed to select client', variant: 'destructive' })
    }
  }

  if (isLoadingClient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (clientError || !client) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/ca/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-lg">Client Not Found</CardTitle>
            <CardDescription className="text-center max-w-sm mt-2">
              The client you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
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
          <Link href="/ca/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.clientName}</h1>
          <p className="text-muted-foreground">{client.clientEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          {client.status === 'active' && (
            <Button onClick={handleSelectClient} disabled={isLoadingContext}>
              {isLoadingContext ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Selecting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Work with Client
                </>
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">Revoke Access</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {client.organizationName || 'Not set'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GSTINs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.gstinAuthorizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.totalNoticeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {client.pendingNoticeCount > 0 ? (
                <span className="text-amber-600">{client.pendingNoticeCount}</span>
              ) : (
                '0'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gstins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gstins">
            GSTINs ({client.gstinAuthorizations.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="notices">Recent Notices</TabsTrigger>
        </TabsList>

        <TabsContent value="gstins" className="space-y-4">
          {client.gstinAuthorizations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No GSTINs Authorized</CardTitle>
                <CardDescription className="text-center max-w-sm mt-2">
                  This client hasn&apos;t authorized any GSTINs yet.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {client.gstinAuthorizations.map((authorization) => (
                <GstinCard key={authorization.id} authorization={authorization} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {isLoadingDashboard ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !dashboard?.recentActivity || dashboard.recentActivity.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No Recent Activity</CardTitle>
                <CardDescription>Activity will appear here as you work with this client.</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{activity.activityType}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>{new Date(activity.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          {isLoadingDashboard ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !dashboard?.recentNotices || dashboard.recentNotices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No Recent Notices</CardTitle>
                <CardDescription>Notices will appear here once synced.</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Notice</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.recentNotices.map((notice) => (
                    <TableRow key={notice.noticeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notice.noticeNumber || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{notice.noticeType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{notice.gstin}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {notice.responseDeadline
                          ? new Date(notice.responseDeadline).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
