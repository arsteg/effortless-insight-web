'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  RotateCw,
  X,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  useCaClients,
  useCreateCaProspect,
  useCreateCaClientInvitation,
  useResendCaClientInvitation,
  useCancelCaClientInvitation,
} from '@/hooks/use-ca-clients'
import { useAuthStore } from '@/stores/auth-store'
import { formatDistanceToNow } from 'date-fns'

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const inviteClientSchema = z.object({
  gstin: z
    .string()
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(gstinRegex, 'Please enter a valid GSTIN format'),
  email: z.string().email('Please enter a valid email address'),
  clientDisplayName: z.string().max(255).optional(),
  message: z.string().max(500).optional(),
})

type InviteClientFormValues = z.infer<typeof inviteClientSchema>

export default function InviteClientPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: clients, isLoading: isLoadingClients } = useCaClients()
  const inviteMutation = useCreateCaClientInvitation()
  const prospectMutation = useCreateCaProspect()
  const resendMutation = useResendCaClientInvitation()
  const cancelMutation = useCancelCaClientInvitation()

  const [activeTab, setActiveTab] = useState('pending')

  const form = useForm<InviteClientFormValues>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: {
      gstin: '',
      email: '',
      clientDisplayName: '',
      message: '',
    },
  })

  // Redirect non-CA users
  if (user && !user.isCA) {
    router.push('/dashboard')
    return null
  }

  const pendingClients = (clients ?? []).filter((c) => c.type === 'staged')
  const activeClients = (clients ?? []).filter((c) => c.type === 'active')

  const onSubmit = async (data: InviteClientFormValues) => {
    await inviteMutation.mutateAsync({
      gstin: data.gstin.toUpperCase(),
      email: data.email,
      clientDisplayName: data.clientDisplayName || undefined,
      message: data.message || undefined,
    })
    form.reset()
  }

  const saveWithoutInvitation = async () => {
    if (!await form.trigger(['gstin', 'clientDisplayName'])) return
    try {
      await prospectMutation.mutateAsync({ gstin: form.getValues('gstin'), clientDisplayName: form.getValues('clientDisplayName') })
      form.reset()
    } catch { /* mutation displays the server error */ }
  }

  const handleResend = (invitationId: string) => {
    resendMutation.mutate(invitationId)
  }

  const handleCancel = (invitationId: string) => {
    cancelMutation.mutate(invitationId)
  }

  const formatExpiryDate = (expiresAt: string) => {
    const date = new Date(expiresAt)
    const now = new Date()
    if (date < now) {
      return <span className="text-destructive">Expired</span>
    }
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invite Client</h1>
          <p className="text-muted-foreground">
            Invite Business Owners to connect their GSTIN with your CA practice.
          </p>
        </div>
      </div>

      {/* Invite Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Invite a Business Owner to set up their organization for a GSTIN. You can start
            syncing or uploading notices for this GSTIN right away, even before they accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client GSTIN *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="22AAAAA0000A1Z5"
                          autoComplete="off"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Email (required for invitation)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        They&apos;ll receive an email to set up their organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clientDisplayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Client Name{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Traders" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your own label for this client, shown until they accept and name their
                      organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Personal Message{' '}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a personal note to the invitation email..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={saveWithoutInvitation} disabled={prospectMutation.isPending || inviteMutation.isPending}>
                  Save client without inviting
                </Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Client Lists */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending
            {pendingClients.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingClients.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Accepted
            {activeClients.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeClients.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Prospect clients
              </CardTitle>
              <CardDescription>
                Saved clients and pending invitations. You can work on these GSTINs before sending an invitation or while waiting for acceptance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : pendingClients.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Save a client above to start working, or send an invitation.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-center">Staged Notices</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.displayName}</TableCell>
                        <TableCell className="font-mono text-sm">{client.gstin}</TableCell>
                        <TableCell>
                          {client.invitationExpiresAt
                            ? formatExpiryDate(client.invitationExpiresAt)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{client.noticeCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => client.invitationId && handleResend(client.invitationId)}
                              disabled={!client.invitationId || resendMutation.isPending}
                            >
                              <RotateCw className="mr-1 h-3 w-3" />
                              Resend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => client.invitationId && handleCancel(client.invitationId)}
                              disabled={!client.invitationId || cancelMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accepted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Active Clients
              </CardTitle>
              <CardDescription>
                Clients who have accepted your invitation and are now connected to your CA practice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeClients.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No active clients yet. Once clients accept your invitations, they will appear
                  here.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization Name</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead className="text-center">Notices</TableHead>
                      <TableHead className="text-center">Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.displayName}</TableCell>
                        <TableCell className="font-mono text-sm">{client.gstin || '—'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{client.noticeCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {typeof client.overdueCount === 'number' && client.overdueCount > 0 ? (
                            <Badge variant="destructive">{client.overdueCount}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
