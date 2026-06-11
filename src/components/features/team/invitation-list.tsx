'use client'

import { Mail, MoreHorizontal, Send, X, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleBadge } from './role-badge'
import { useInvitations, useResendInvitation, useCancelInvitation } from '@/hooks/use-team'
import type { Invitation, OrganizationRole } from '@/types'

interface InvitationListProps {
  currentUserRole: OrganizationRole
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  return `Expires in ${diffDays} days`
}

function InvitationItem({
  invitation,
  canManage,
  onResend,
  onCancel,
  isResending,
  isCancelling,
}: {
  invitation: Invitation
  canManage: boolean
  onResend: (id: string) => void
  onCancel: (id: string) => void
  isResending: boolean
  isCancelling: boolean
}) {
  const isExpired = new Date(invitation.expiresAt) < new Date()

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{invitation.email}</span>
            {invitation.isExternal && (
              <Badge variant="secondary" className="text-xs">
                External
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Invited by {invitation.invitedBy.name}</span>
            <span>•</span>
            <span>{formatDate(invitation.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
            {formatRelativeTime(invitation.expiresAt)}
          </span>
        </div>
        <RoleBadge role={invitation.role} />

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isResending || isCancelling}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onResend(invitation.id)} disabled={isResending}>
                <Send className="mr-2 h-4 w-4" />
                Resend invitation
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onCancel(invitation.id)}
                disabled={isCancelling}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

export function InvitationList({ currentUserRole }: InvitationListProps) {
  const { data: invitationsData, isLoading } = useInvitations()
  const resendMutation = useResendInvitation()
  const cancelMutation = useCancelInvitation()

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Invitations that haven&apos;t been accepted yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const invitations = invitationsData?.invitations.filter((inv) => inv.status === 'pending') || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          {invitations.length === 0
            ? "No pending invitations."
            : `${invitations.length} pending ${invitations.length === 1 ? 'invitation' : 'invitations'}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No pending invitations. Invite team members to get started.
            </p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <InvitationItem
              key={invitation.id}
              invitation={invitation}
              canManage={canManage}
              onResend={(id) => resendMutation.mutate(id)}
              onCancel={(id) => cancelMutation.mutate(id)}
              isResending={resendMutation.isPending}
              isCancelling={cancelMutation.isPending}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
