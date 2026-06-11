'use client'

import { MemberList, InviteMemberDialog, InvitationList } from '@/components/features/team'
import { useOrganizationStore } from '@/stores/organization-store'

export default function TeamPage() {
  const { currentOrganization } = useOrganizationStore()
  const currentUserRole = currentOrganization?.role || 'viewer'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage team members and their access to your organization.
          </p>
        </div>
        <InviteMemberDialog currentUserRole={currentUserRole} />
      </div>

      {/* Members List */}
      <MemberList />

      {/* Pending Invitations */}
      <InvitationList currentUserRole={currentUserRole} />
    </div>
  )
}
