// CA-as-distributor types: a self-registered Chartered Accountant (User.isCA)
// inviting Business Owner clients by GSTIN, staging notices before they accept,
// and switching between accepted clients via the BO/Client selector.

export interface CreateCaClientInvitationRequest {
  gstin: string
  email: string
  clientDisplayName?: string
  accessDurationDays?: number
  message?: string
}

export interface CaClientInvitation {
  id: string
  gstin: string
  email: string
  clientDisplayName?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  expiresAt: string
  stagedNoticeCount: number
  createdAt: string
}

export interface CaClientInvitationDetails {
  caOrganizationName: string
  gstin: string
  clientDisplayName?: string
  email: string
  status: string
  expiresAt: string
  message?: string
}

/**
 * A single row in the CA's unified client list - either a "staged" prospect
 * (pre-acceptance, no organization yet) or an "active" client (already
 * accepted, backed by a real role="ca" organization membership).
 */
export interface CaClientListItem {
  id: string
  type: 'staged' | 'active'
  gstin?: string
  displayName: string
  status: string
  noticeCount: number
  overdueCount?: number
  invitationExpiresAt?: string
  organizationId?: string
  prospectClientId?: string
  invitationId?: string
}

export interface AcceptCaClientInvitationRequest {
  organizationName: string
  legalName?: string
  industry?: string
  state: string
  city?: string
  annualTurnoverRange?: string
}

export interface AcceptCaClientInvitationResult {
  organizationId: string
  organizationName: string
  mergedNoticeCount: number
  newNoticeCount: number
  accessToken: string
  expiresIn: number
}

export interface UploadCaStagedNoticeResult {
  id: string
  fileName?: string
  fileSize?: number
  uploadedAt: string
}
