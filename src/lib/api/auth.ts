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
}
