import type { OrganizationRole } from './auth'

// Organization types
export interface Organization {
  id: string
  name: string
  legalName?: string
  displayName?: string
  industry?: string
  subIndustry?: string
  businessType?: string
  annualTurnoverRange?: string
  employeeCountRange?: string
  email?: string
  phone?: string
  website?: string
  address?: Address
  pan?: string
  gstins: Gstin[]
  subscription?: SubscriptionInfo
  settings?: OrganizationSettings
  logoUrl?: string
  memberCount: number
  currentUserRole: OrganizationRole
  createdAt: string
  updatedAt?: string
}

export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  pinCode?: string
  country?: string
}

export interface Gstin {
  id: string
  gstin: string
  tradeName?: string
  stateCode: string
  stateName: string
  status: 'active' | 'inactive' | 'suspended'
  isPrimary: boolean
  isVerified: boolean
  verifiedAt?: string
}

export interface SubscriptionInfo {
  status: 'trial' | 'active' | 'suspended' | 'cancelled'
  planName?: string
  trialEndsAt?: string
  currentPeriodEnd?: string
}

export interface OrganizationSettings {
  defaultReminderDays?: number[]
  notificationEmail: boolean
  notificationSms: boolean
  allowCaAccess: boolean
  requireResponseApproval: boolean
  timezone: string
  language: string
  dateFormat: string
}

// Organization list item (lighter version)
export interface OrganizationListItem {
  id: string
  name: string
  logoUrl?: string
  role: OrganizationRole
  isExternal: boolean
  noticeCount: number
  pendingNoticeCount: number
  memberCount: number
  gstinCount: number
  subscriptionStatus: string
}

export interface OrganizationListResponse {
  organizations: OrganizationListItem[]
  total: number
}

// Create organization
export interface CreateOrganizationRequest {
  name: string
  legalName?: string
  gstin: string
  industry?: string
  state: string
  city?: string
  annualTurnoverRange?: string
}

// Update organization
export interface UpdateOrganizationRequest {
  name?: string
  legalName?: string
  displayName?: string
  industry?: string
  subIndustry?: string
  businessType?: string
  annualTurnoverRange?: string
  employeeCountRange?: string
  email?: string
  phone?: string
  website?: string
  address?: Address
  pan?: string
  tan?: string
}

// GSTIN
export interface AddGstinRequest {
  gstin: string
  tradeName?: string
  isPrimary?: boolean
}

export interface GstinValidationResult {
  isValid: boolean
  errorMessage?: string
  gstin?: string
  stateCode?: string
  stateName?: string
  pan?: string
  entityCode?: string
}

// Members
export interface Member {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  role: OrganizationRole
  isExternal: boolean
  status: 'active' | 'pending' | 'expired' | 'inactive'
  accessExpiresAt?: string
  clientReference?: string
  joinedAt: string
  lastActiveAt?: string
}

export interface MemberListResponse {
  members: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ChangeMemberRoleRequest {
  role: OrganizationRole
}

// Invitations
export interface InviteMemberRequest {
  email: string
  role: OrganizationRole
  isExternal?: boolean
  accessDurationDays?: number
  clientReference?: string
  message?: string
}

export interface Invitation {
  id: string
  email: string
  role: OrganizationRole
  isExternal: boolean
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  invitedBy: {
    id: string
    name: string
  }
  expiresAt: string
  lastSentAt: string
  sendCount: number
  createdAt: string
}

export interface InvitationListResponse {
  invitations: Invitation[]
  total: number
}
