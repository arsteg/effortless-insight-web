'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  PauseCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

import { useGstClients, useDeleteGstClient, usePauseGstClient, useResumeGstClient } from '@/hooks/use-gst-sync'
import type { GstClient, GstClientStatus } from '@/types/gst-sync'

interface GstClientListProps {
  onAddNew: () => void
}

export function GstClientList({ onAddNew }: GstClientListProps) {
  const [deleteClient, setDeleteClient] = useState<GstClient | null>(null)
  const { data, isLoading, error, refetch } = useGstClients({ pageSize: 50 })
  const deleteMutation = useDeleteGstClient()
  const pauseMutation = usePauseGstClient()
  const resumeMutation = useResumeGstClient()

  const handleDelete = async () => {
    if (!deleteClient) return
    await deleteMutation.mutateAsync(deleteClient.id)
    setDeleteClient(null)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load GST clients. Please try again.</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const clients = data?.items ?? []

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">
            No GSTINs connected yet. Add your first GSTIN to start syncing notices.
          </p>
          <Button onClick={onAddNew}>Add GSTIN</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <GstClientCard
            key={client.id}
            client={client}
            onPause={() => pauseMutation.mutate(client.id)}
            onResume={() => resumeMutation.mutate(client.id)}
            onDelete={() => setDeleteClient(client)}
            isPausing={pauseMutation.isPending}
            isResuming={resumeMutation.isPending}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove GSTIN</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteClient?.gstin}</strong> from sync?
              This will stop syncing notices for this GSTIN. Previously synced notices will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface GstClientCardProps {
  client: GstClient
  onPause: () => void
  onResume: () => void
  onDelete: () => void
  isPausing: boolean
  isResuming: boolean
}

function GstClientCard({
  client,
  onPause,
  onResume,
  onDelete,
  isPausing,
  isResuming,
}: GstClientCardProps) {
  const statusInfo = getStatusInfo(client.status)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-mono">{client.gstin}</CardTitle>
          {client.clientName && (
            <p className="text-sm text-muted-foreground">{client.clientName}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {client.status === 'paused' ? (
              <DropdownMenuItem onClick={onResume} disabled={isResuming}>
                <Play className="mr-2 h-4 w-4" />
                Resume Sync
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onPause} disabled={isPausing}>
                <Pause className="mr-2 h-4 w-4" />
                Pause Sync
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={statusInfo.variant}>
            {statusInfo.icon}
            <span className="ml-1">{statusInfo.label}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Notices</p>
            <p className="font-medium">{client.totalNoticesSynced}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Sync</p>
            <p className="font-medium">
              {client.lastSyncAt
                ? formatRelativeTime(new Date(client.lastSyncAt))
                : 'Never'}
            </p>
          </div>
        </div>

        {client.lastNoticeDate && (
          <div className="mt-3 pt-3 border-t text-sm">
            <p className="text-muted-foreground">Latest Notice</p>
            <p className="font-medium">
              {new Date(client.lastNoticeDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getStatusInfo(status: GstClientStatus): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ReactNode
} {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
      }
    case 'paused':
      return {
        label: 'Paused',
        variant: 'secondary',
        icon: <PauseCircle className="h-3 w-3" />,
      }
    case 'pending_first_sync':
      return {
        label: 'Pending Sync',
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />,
      }
    case 'error':
      return {
        label: 'Error',
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
      }
    case 'disconnected':
      return {
        label: 'Disconnected',
        variant: 'secondary',
        icon: <AlertCircle className="h-3 w-3" />,
      }
    default:
      return {
        label: status,
        variant: 'outline',
        icon: null,
      }
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default GstClientList
