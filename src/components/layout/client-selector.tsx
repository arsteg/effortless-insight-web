'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, Users } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuthStore, useOrganizationStore } from '@/stores'
import { useCaClients } from '@/hooks/use-ca-clients'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQueryClient } from '@tanstack/react-query'

/**
 * A second organization-switcher, scoped to only the CA's accepted clients
 * (CaClientListItem.type === 'active', each backed by a real role="ca"
 * organization membership). Deliberately reuses the same
 * useOrganizationStore().switchOrganization flow as the main Organization
 * dropdown in the header - selecting a client here just switches "current
 * organization" the same way, so every existing module (Notices, GST Sync,
 * Dashboard, etc.) works unmodified once scoped to that client.
 *
 * Staged (pre-acceptance) clients are intentionally not selectable here -
 * there is no organization to switch into yet. They surface instead as
 * "Pending Invitations" on the CA's dashboard.
 */
export function ClientSelector() {
  const router = useRouter()
  const queryClient = useQueryClient();
  const { user } = useAuthStore()
  const { currentOrganization, switchOrganization } = useOrganizationStore()
  const { data: clients } = useCaClients()

  if (!user?.isCA) {
    return null
  }

  const activeClients = (clients ?? []).filter((c) => c.type === 'active')

  if (activeClients.length === 0) {
    return null
  }

  const handleSelectClient = async (organizationId: string) => {
    await switchOrganization(organizationId)
     queryClient.clear();
    router.refresh()
  }

  const currentClient = activeClients.find((c) => c.organizationId === currentOrganization?.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-2 gap-2">
          <Users className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentClient?.displayName || 'Select Client'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>My Clients</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {activeClients.map((client) => (
          <DropdownMenuItem
            key={client.id}
            onClick={() => client.organizationId && handleSelectClient(client.organizationId)}
            className={cn(
              'cursor-pointer',
              currentOrganization?.id === client.organizationId && 'bg-accent'
            )}
          >
            <div className="flex flex-col">
              <span>{client.displayName}</span>
              <span className="text-xs text-muted-foreground">
                {client.noticeCount} notices
                {typeof client.overdueCount === 'number' && client.overdueCount > 0
                  ? ` · ${client.overdueCount} overdue`
                  : ''}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
