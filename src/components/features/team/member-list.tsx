'use client'

import { useState } from 'react'
import { Loader2, Users } from 'lucide-react'

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MemberItem } from './member-item'
import { useMembers, useChangeMemberRole, useRemoveMember } from '@/hooks/use-team'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type { Member, OrganizationRole } from '@/types'

export function MemberList() {
  const { user } = useAuthStore()
  const { currentOrganization } = useOrganizationStore()
  const { data: membersData, isLoading } = useMembers()
  const changeMemberRoleMutation = useChangeMemberRole()
  const removeMemberMutation = useRemoveMember()

  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)

  const handleChangeRole = (memberId: string, role: OrganizationRole) => {
    changeMemberRoleMutation.mutate({ memberId, role })
  }

  const handleRemoveConfirm = () => {
    if (!memberToRemove) return
    removeMemberMutation.mutate(memberToRemove.id, {
      onSuccess: () => setMemberToRemove(null),
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People who have access to your organization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b last:border-b-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const members = membersData?.members || []

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People who have access to your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No team members found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? 'person has' : 'people have'} access to your
            organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              currentUserRole={currentOrganization?.role || 'viewer'}
              isCurrentUser={member.user.id === user?.id}
              onChangeRole={handleChangeRole}
              onRemove={setMemberToRemove}
              isUpdating={changeMemberRoleMutation.isPending}
            />
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name} from the organization?
              They will lose access to all resources immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
