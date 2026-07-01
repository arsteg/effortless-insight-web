// User types
export interface User {
  id: string
  email: string
  name: string
  mobile?: string
  avatarUrl?: string
  emailVerified: boolean
  mobileVerified: boolean
  is2faEnabled: boolean
  role: UserRole
  organization?: UserOrganization
  organizations: UserOrganization[]
  preferences?: Record<string, unknown>
  createdAt: string
  lastLogin?: string
}

export interface UserOrganization {
  id: string
  name: string
  role: OrganizationRole
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'ca' | 'viewer'
export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'member' | 'ca' | 'viewer'

// Auth request types
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  deviceInfo?: DeviceInfo
}

export interface DeviceInfo {
  deviceId?: string
  deviceName?: string
  platform: 'web' | 'ios' | 'android'
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  mobile?: string
  acceptTerms: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

// Auth response types
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
  /** Mobile OAuth redirect URI - present when login initiated from mobile app */
  mobileRedirectUri?: string
}

export interface TwoFactorRequiredResponse {
  requires2fa: true
  partialToken: string
  expiresIn: number
  methods: string[]
}

export interface RegisterResponse {
  userId: string
  email: string
  name: string
  emailVerified: boolean
  message: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// Session types
export interface Session {
  id: string
  deviceName?: string
  platform: string
  ipAddress: string
  location?: string
  lastActiveAt: string
  createdAt: string
  isCurrent: boolean
}

export interface SessionListResponse {
  currentSessionId: string
  sessions: Session[]
}

// Switch organization
export interface SwitchOrganizationRequest {
  organizationId: string
}

export interface SwitchOrganizationResponse {
  accessToken: string
  refreshToken: string
  organization: {
    id: string
    name: string
    role: OrganizationRole
  }
}
