'use client'

import { useRouter } from 'next/navigation'
import { Users, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCaClients } from '@/hooks/use-ca-clients'
import { useOrganizationStore } from '@/stores'
import { InviteCaClientDialog } from './invite-ca-client-dialog'

/**
 * A CA's cross-organization client portfolio - distinct from
 * ClientAttentionCard, which is scoped to GSTINs within the currently
 * selected org. Each row here is a real, accepted BO organization the CA has
 * a role="ca" membership in; selecting one switches into it via the same
 * mechanism as the header's BO/Client selector.
 */
export function MyClientsCard() {
  const router = useRouter()
  const { switchOrganization } = useOrganizationStore()
  const { data: clients, isLoading } = useCaClients()

  const activeClients = (clients ?? []).filter((c) => c.type === 'active')

  const handleSelectClient = async (organizationId: string) => {
    await switchOrganization(organizationId)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          My Clients
        </CardTitle>
        <InviteCaClientDialog />
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : activeClients.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No clients yet. Invite a Business Owner to get started.
          </p>
        ) : (
          activeClients.map((client) => (
            <button
              key={client.id}
              onClick={() => client.organizationId && handleSelectClient(client.organizationId)}
              className="flex w-full items-center justify-between rounded-md border p-2.5 text-left transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{client.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {client.noticeCount} notice{client.noticeCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {typeof client.overdueCount === 'number' && client.overdueCount > 0 && (
                  <Badge variant="destructive">{client.overdueCount} overdue</Badge>
                )}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
