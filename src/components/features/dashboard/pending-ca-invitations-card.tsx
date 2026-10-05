'use client'

import { formatDistanceToNow } from 'date-fns'
import { Mail, RotateCw, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useCaClients,
  useResendCaClientInvitation,
  useCancelCaClientInvitation,
} from '@/hooks/use-ca-clients'

/**
 * Staged (pre-acceptance) clients with a pending CaClientInvitation - the CA
 * may already be syncing/uploading notices for these even though no
 * organization exists yet. Once the Business Owner accepts, the row moves to
 * MyClientsCard instead.
 */
export function PendingCaInvitationsCard() {
  const { data: clients, isLoading } = useCaClients()
  const resendMutation = useResendCaClientInvitation()
  const cancelMutation = useCancelCaClientInvitation()

  const pending = (clients ?? []).filter(
    (c) => c.type === 'staged' && c.status === 'pending'
  )

  if (isLoading) {
    return null
  }

  if (pending.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="h-4 w-4" />
          Pending Invitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pending.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-md border p-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{client.displayName}</p>
              <p className="text-xs text-muted-foreground">
                GSTIN: {client.gstin} · {client.noticeCount} notice
                {client.noticeCount === 1 ? '' : 's'} staged
                {client.invitationExpiresAt && (
                  <>
                    {' '}
                    · expires{' '}
                    {formatDistanceToNow(new Date(client.invitationExpiresAt), { addSuffix: true })}
                  </>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Badge variant="secondary">Pending</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Resend invitation"
                disabled={!client.invitationId || resendMutation.isPending}
                onClick={() => client.invitationId && resendMutation.mutate(client.invitationId)}
              >
                {resendMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCw className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                title="Cancel invitation"
                disabled={!client.invitationId || cancelMutation.isPending}
                onClick={() => client.invitationId && cancelMutation.mutate(client.invitationId)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
