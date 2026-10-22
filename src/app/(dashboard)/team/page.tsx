'use client'

import { MemberList, InviteMemberDialog, InvitationList } from '@/components/features/team'
import { FeatureGate } from '@/components/features/subscription/feature-gate'
import { FeatureCodes } from '@/hooks/use-feature-access'
import { useOrganizationStore } from '@/stores/organization-store'

// Team is a paid feature: opening /team directly on a plan without it shows the upgrade prompt
export default function TeamPage() {
  return (
    <FeatureGate feature={FeatureCodes.Collaboration} featureDisplayName="Team" showLoadingState>
      <TeamContent />
    </FeatureGate>
  )
}

function TeamContent() {
  const { currentOrganization } = useOrganizationStore()
  const currentUserRole = currentOrganization?.role || 'viewer'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
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
