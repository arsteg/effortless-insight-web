import { apiClient, setTokens, clearTokens } from './client'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  User,
  RefreshTokenRequest,
  TokenResponse,
  SessionListResponse,
  SwitchOrganizationRequest,
  SwitchOrganizationResponse,
  TwoFactorRequiredResponse,
} from '@/types'

export interface TwoFactorSetupResponse {
  secret: string
  qrCodeUri: string
}

export interface TwoFactorVerifySetupResponse {
  recoveryCodes: string[]
}

// OAuth types
export interface OAuthProviderInfo {
  name: string        // Provider identifier (e.g., "google", "microsoft")
  displayName: string // Human-readable name (e.g., "Google", "Microsoft")
  enabled: boolean
}

export interface OAuthProvidersResponse {
  providers: OAuthProviderInfo[]
}

export interface OAuthLoginUrlResponse {
  loginUrl: string
  provider: string
}

export interface OAuthCallbackRequest {
  code: string
  state: string  // Required for CSRF protection
}

export interface UserOAuthInfoResponse {
  provider: string | null
  providerId: string | null
  hasPassword: boolean
}

export interface LinkedOAuthProviderDto {
  id: string
  provider: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  linkedAt: string
  lastUsedAt: string | null
}

export interface UserOAuthProvidersResponse {
  linkedProviders: LinkedOAuthProviderDto[]
  availableProviders: string[]
  hasPassword: boolean
}

export interface DisconnectOAuthRequest {
  provider: string
  password: string
}

export const authApi = {
  // Registration & verification
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data)
    return response.data.data
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', data)
  },

  // Login
  async login(data: LoginRequest): Promise<LoginResponse | TwoFactorRequiredResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse | TwoFactorRequiredResponse>>(
      '/auth/login',
      data
    )
    const result = response.data.data

    // Store tokens if login successful (not 2FA required)
    if ('accessToken' in result) {
      setTokens(result.accessToken, result.refreshToken)
    }

    return result
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },

  // Token management
  async refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', data)
    const result = response.data.data
    setTokens(result.accessToken, result.refreshToken)
    return result
  },

  // Password management
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data)
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', data)
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put('/auth/change-password', data)
  },

  // Profile
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data.data
  },

  // Organization switching
  async switchOrganization(data: SwitchOrganizationRequest): Promise<SwitchOrganizationResponse> {
    const response = await apiClient.post<ApiResponse<SwitchOrganizationResponse>>(
      '/auth/switch-organization',
      data
    )
    const result = response.data.data
    setTokens(result.accessToken, result.refreshToken)
    return result
  },

  // Sessions
  async getSessions(): Promise<SessionListResponse> {
    const response = await apiClient.get<ApiResponse<SessionListResponse>>('/auth/sessions')
    return response.data.data
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`)
  },

  // Two-factor authentication
  async setup2fa(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post<ApiResponse<TwoFactorSetupResponse>>('/auth/2fa/setup')
    return response.data.data
  },

  async verifySetup2fa(code: string): Promise<TwoFactorVerifySetupResponse> {
    const response = await apiClient.post<ApiResponse<TwoFactorVerifySetupResponse>>(
      '/auth/2fa/verify-setup',
      { code }
    )
    return response.data.data
  },

  async disable2fa(password: string): Promise<void> {
    await apiClient.delete('/auth/2fa', { data: { password } })
  },

  // OAuth
  async getOAuthProviders(): Promise<OAuthProvidersResponse> {
    const response = await apiClient.get<ApiResponse<OAuthProvidersResponse>>('/auth/oauth/providers')
    return response.data.data
  },

  async getOAuthLoginUrl(
    provider: string,
    options?: { state?: string; forceReauth?: boolean }
  ): Promise<OAuthLoginUrlResponse> {
    const params: Record<string, string | boolean> = {}
    if (options?.state) params.state = options.state
    if (options?.forceReauth) params.forceReauth = true

    const response = await apiClient.get<ApiResponse<OAuthLoginUrlResponse>>(
      `/auth/oauth/${provider}/login`,
      { params }
    )
    return response.data.data
  },

  async handleOAuthCallback(
    provider: string,
    data: OAuthCallbackRequest
  ): Promise<LoginResponse | TwoFactorRequiredResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse | TwoFactorRequiredResponse>>(
      `/auth/oauth/${provider}/callback`,
      data
    )
    const result = response.data.data

    // Store tokens if login successful (not 2FA required)
    if ('accessToken' in result) {
      setTokens(result.accessToken, result.refreshToken)
    }

    return result
  },

  async getOAuthInfo(): Promise<UserOAuthInfoResponse> {
    const response = await apiClient.get<ApiResponse<UserOAuthInfoResponse>>('/auth/oauth/info')
    return response.data.data
  },

  async getLinkedOAuthProviders(): Promise<UserOAuthProvidersResponse> {
    const response = await apiClient.get<ApiResponse<UserOAuthProvidersResponse>>(
      '/auth/oauth/providers/linked'
    )
    return response.data.data
  },

  async linkOAuthProvider(
    provider: string,
    data: OAuthCallbackRequest
  ): Promise<LinkedOAuthProviderDto> {
    const response = await apiClient.post<ApiResponse<LinkedOAuthProviderDto>>(
      `/auth/oauth/${provider}/link`,
      data
    )
    return response.data.data
  },

  async disconnectOAuth(provider: string, password: string): Promise<void> {
    await apiClient.delete(`/auth/oauth/${provider}`, {
      data: { provider, password },
    })
  },
}
