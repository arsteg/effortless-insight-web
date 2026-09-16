'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  Building2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
} from 'lucide-react'

import { caApi } from '@/lib/api'
import { useCaStore } from '@/stores'
import { useToast } from '@/hooks/use-toast'
import type { CaClientSummary, CaInvitation } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { InviteClientDialog } from '@/components/ca/invite-client-dialog'

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

function getInvitationStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />
    case 'accepted':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'declined':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'expired':
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-muted-foreground" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function CaClientsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { selectClient, isLoadingContext } = useCaStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<CaInvitation | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Fetch clients
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['ca-clients'],
    queryFn: () => caApi.getClients(),
  })

  // Fetch invitations
  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['ca-invitations'],
    queryFn: () => caApi.getInvitations({ status: 'pending' }),
  })

  // Cancel invitation mutation
  const cancelMutation = useMutation({
    mutationFn: (invitationId: string) => caApi.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ca-invitations'] })
      toast({ title: 'Invitation cancelled', variant: 'success' })
      setShowCancelDialog(false)
      setSelectedInvitation(null)
    },
    onError: () => {
      toast({ title: 'Failed to cancel invitation', variant: 'destructive' })
    },
  })

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: (invitationId: string) => caApi.resendInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ca-invitations'] })
      toast({ title: 'Invitation resent', variant: 'success' })
    },
    onError: () => {
      toast({ title: 'Failed to resend invitation', variant: 'destructive' })
    },
  })

  // Select client handler
  const handleSelectClient = async (client: CaClientSummary) => {
    try {
      await selectClient(client.relationshipId)
      toast({
        title: 'Client selected',
        description: `Now working as CA for ${client.clientName}`,
        variant: 'success',
      })
    } catch {
      toast({ title: 'Failed to select client', variant: 'destructive' })
    }
  }

  // Filter clients by search query
  const filteredClients =
    clientsData?.items.filter(
      (client) =>
        client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []

  const activeClients = filteredClients.filter((c) => c.status === 'active')
  const pendingInvitations = invitationsData?.items.filter((i) => i.status === 'pending') ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and invitations
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsData?.items.reduce((acc, c) => acc + c.totalNoticeCount, 0) ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients ({activeClients.length})</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {isLoadingClients ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No clients yet</CardTitle>
                <CardDescription className="text-center max-w-sm mt-2">
                  {searchQuery
                    ? 'No clients match your search. Try a different query.'
                    : 'Start by inviting your clients to manage their GST notices.'}
                </CardDescription>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Your First Client
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-center">GSTINs</TableHead>
                    <TableHead className="text-center">Notices</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.relationshipId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">{client.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.organizationName ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{client.organizationName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{client.authorizedGstinCount}</TableCell>
                      <TableCell className="text-center">{client.totalNoticeCount}</TableCell>
                      <TableCell className="text-center">
                        {client.pendingNoticeCount > 0 ? (
                          <Badge variant="destructive">{client.pendingNoticeCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {client.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectClient(client)}
                              disabled={isLoadingContext}
                            >
                              {isLoadingContext ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Select'
                              )}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/ca/clients/${client.relationshipId}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {client.status === 'active' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Revoke Access
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {isLoadingInvitations ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingInvitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Send className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg">No pending invitations</CardTitle>
                <CardDescription className="text-center max-w-sm mt-2">
                  All your invitations have been responded to.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <p className="font-medium">{invitation.inviteeEmail}</p>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{invitation.gstin}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getInvitationStatusIcon(invitation.status)}
                          <span className="capitalize">{invitation.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invitation.sendCount > 1 ? (
                          <span>{invitation.sendCount} times</span>
                        ) : (
                          <span>Once</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => resendMutation.mutate(invitation.id)}
                              disabled={resendMutation.isPending}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedInvitation(invitation)
                                setShowCancelDialog(true)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invite Client Dialog */}
      <InviteClientDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} />

      {/* Cancel Invitation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation to{' '}
              <strong>{selectedInvitation?.inviteeEmail}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedInvitation && cancelMutation.mutate(selectedInvitation.id)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Invitation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
