// ============================================================================
// CA Profile Types
// ============================================================================

export interface CaRegisterRequest {
  email: string
  password: string
  name: string
  mobile?: string
  acceptTerms: boolean
  firmName?: string
  membershipNumber?: string
  mobileVerificationToken?: string
}

export interface CaRegisterResponse {
  userId: string
  caProfileId: string
  email: string
  name: string
  emailVerified: boolean
  message: string
}

export interface CaProfile {
  id: string
  userId: string
  userName: string
  userEmail: string
  firmName?: string
  membershipNumber?: string
  isVerified: boolean
  verifiedAt?: string
  status: CaProfileStatus
  createdAt: string
  activeClientCount: number
  pendingInvitationCount: number
}

export type CaProfileStatus = 'active' | 'pending_verification' | 'suspended' | 'inactive'

export interface UpdateCaProfileRequest {
  firmName?: string
  membershipNumber?: string
}

// ============================================================================
// CA Invitation Types
// ============================================================================

export interface CreateCaInvitationRequest {
  email: string
  gstin: string
  message?: string
}

export interface CreateCaInvitationResponse {
  invitationId: string
  inviteeEmail: string
  gstin: string
  status: string
  expiresAt: string
  message: string
}

export interface CaInvitation {
  id: string
  invitationType: CaInvitationType
  inviteeEmail: string
  gstin: string
  status: CaInvitationStatus
  expiresAt: string
  respondedAt?: string
  message?: string
  sendCount: number
  lastSentAt: string
  stagedNoticeCount: number
  createdAt: string
  inviter?: CaInviter
  acceptedUser?: AcceptedUser
}

export type CaInvitationType = 'ca_to_bo' | 'bo_to_ca'
export type CaInvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'

export interface CaInviter {
  userId: string
  name: string
  email: string
  firmName?: string
  isVerified: boolean
}

export interface AcceptedUser {
  userId: string
  name: string
  email: string
}

export interface ResendCaInvitationRequest {
  updatedMessage?: string
}

export interface BoInviteCaRequest {
  caEmail: string
  gstins: string[]
  message?: string
}

export interface AcceptCaInvitationRequest {
  token: string
}

export interface AcceptCaInvitationResponse {
  relationshipId: string
  gstin: string
  message: string
  requiresOrganizationSetup: boolean
}

export interface DeclineCaInvitationRequest {
  token: string
  reason?: string
}

// ============================================================================
// CA Client Relationship Types
// ============================================================================

export interface CaClient {
  relationshipId: string
  clientUserId: string
  clientName: string
  clientEmail: string
  organizationId?: string
  organizationName?: string
  status: CaRelationshipStatus
  invitedAt: string
  acceptedAt?: string
  clientReference?: string
  gstinAuthorizations: CaGstinAuthorization[]
  totalNoticeCount: number
  pendingNoticeCount: number
  lastSyncAt?: string
}

export interface CaClientSummary {
  relationshipId: string
  clientUserId: string
  clientName: string
  clientEmail: string
  organizationName?: string
  status: CaRelationshipStatus
  authorizedGstinCount: number
  totalNoticeCount: number
  pendingNoticeCount: number
  lastSyncAt?: string
}

export type CaRelationshipStatus = 'pending' | 'active' | 'revoked' | 'expired'

export interface UpdateCaClientRequest {
  clientReference?: string
  notes?: string
}

export interface RevokeCaRelationshipRequest {
  reason?: string
}

// ============================================================================
// CA GSTIN Authorization Types
// ============================================================================

export interface CaGstinAuthorization {
  id: string
  gstin: string
  organizationGstinId?: string
  tradeName?: string
  legalName?: string
  stateCode?: string
  stateName?: string
  status: CaGstinAuthorizationStatus
  permissions: CaPermission[]
  grantedAt: string
  lastSyncAt?: string
  noticeCount: number
}

export type CaGstinAuthorizationStatus = 'active' | 'revoked' | 'expired'

export type CaPermission =
  | 'view_notices'
  | 'add_comments'
  | 'draft_responses'
  | 'sync_gst_portal'
  | 'manage_tasks'
  | 'view_documents'

export interface UpdateCaGstinPermissionsRequest {
  permissions: CaPermission[]
}

export interface RevokeCaGstinAuthorizationRequest {
  reason?: string
}

// ============================================================================
// CA Context Types
// ============================================================================

export interface SelectClientContextRequest {
  clientRelationshipId: string
}

export interface CaContext {
  caUserId: string
  caName: string
  selectedClientRelationshipId?: string
  selectedOrganizationId?: string
  selectedClientName?: string
  selectedOrganizationName?: string
  authorizedGstins: string[]
  permissions: CaPermission[]
  contextSetAt?: string
}

export interface SelectClientContextResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  context: CaContext
}

// ============================================================================
// CA Dashboard Types
// ============================================================================

export interface CaDashboard {
  totalClients: number
  activeClients: number
  pendingInvitations: number
  totalAuthorizedGstins: number
  totalNoticeCount: number
  pendingNoticeCount: number
  noticesTodayCount: number
  recentClients: CaDashboardClientSummary[]
  recentNotices: CaDashboardNoticeSummary[]
}

export interface CaDashboardClientSummary {
  relationshipId: string
  clientName: string
  organizationName?: string
  noticeCount: number
  pendingCount: number
  lastActivity?: string
}

export interface CaDashboardNoticeSummary {
  noticeId: string
  noticeNumber?: string
  noticeType?: string
  gstin: string
  clientName: string
  status: string
  responseDeadline?: string
  createdAt: string
}

export interface CaClientDashboard {
  clientRelationshipId: string
  clientName: string
  organizationName?: string
  authorizedGstins: CaGstinAuthorization[]
  totalNoticeCount: number
  pendingNoticeCount: number
  overdueNoticeCount: number
  recentNotices: CaDashboardNoticeSummary[]
  recentActivity: CaActivitySummary[]
}

export interface CaActivitySummary {
  activityType: string
  description: string
  entityType?: string
  entityId?: string
  createdAt: string
}

// ============================================================================
// CA Notice Types
// ============================================================================

export interface CaNotice {
  id: string
  noticeNumber?: string
  noticeType?: string
  noticeCategory?: string
  gstin: string
  tradeName?: string
  issueDate?: string
  responseDeadline?: string
  totalDemand?: number
  status: string
  priority: string
  summary?: string
  issuingAuthority?: string
  source: string
  createdAt: string
  caSyncedByUserId?: string
  isStagedByMe: boolean
}

export interface CaNoticeDetail {
  id: string
  noticeNumber?: string
  noticeType?: string
  noticeCategory?: string
  noticeSubCategory?: string
  gstin: string
  tradeName?: string
  issueDate?: string
  responseDeadline?: string
  extendedDeadline?: string
  hearingDate?: string
  taxAmount?: number
  penaltyAmount?: number
  interestAmount?: number
  totalDemand?: number
  periodFrom?: string
  periodTo?: string
  financialYear?: string
  issuingAuthority?: string
  issuingOfficer?: string
  officerDesignation?: string
  jurisdiction?: string
  status: string
  priority: string
  summary?: string
  section?: string
  fileUrl: string
  fileName: string
  source: string
  tags?: string[]
  createdAt: string
  updatedAt?: string
  canComment: boolean
  canDraftResponse: boolean
}

export interface CaNoticeFilter {
  gstin?: string
  status?: string
  priority?: string
  noticeType?: string
  issueDateFrom?: string
  issueDateTo?: string
  deadlineFrom?: string
  deadlineTo?: string
  searchTerm?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}

export interface CaNoticeListResponse {
  items: CaNotice[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface NoticeCounts {
  total: number
  pending: number
  overdue: number
}

// ============================================================================
// CA Sync Types
// ============================================================================

export interface CaStartSyncRequest {
  gstin: string
}

export interface CaSyncSession {
  id: string
  gstin: string
  status: CaSyncStatus
  startedAt: string
  completedAt?: string
  noticesFound: number
  noticesImported: number
  noticesSkipped: number
  errorMessage?: string
}

export type CaSyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// ============================================================================
// Paged Response Types
// ============================================================================

export interface CaClientListResponse {
  items: CaClientSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CaInvitationListResponse {
  items: CaInvitation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// CA Organization Types
// ============================================================================

/**
 * Request to create an organization for a CA user during onboarding.
 * Unlike BO onboarding, GSTIN is optional for CA users.
 */
export interface CreateCaOrganizationRequest {
  name: string
  legalName?: string
  gstin?: string // Optional for CA
  industry?: string
  state: string
  city?: string
}

/**
 * Response after creating CA organization, includes new tokens with org_id claim.
 */
export interface CreateCaOrganizationResponse {
  organizationId: string
  name: string
  legalName?: string
  gstin?: string
  state: string
  city?: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}
