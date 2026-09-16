import { apiClient, setTokens } from './client'
import { track } from '@/lib/analytics'
import type {
  ApiResponse,
  CaRegisterRequest,
  CaRegisterResponse,
  CaProfile,
  UpdateCaProfileRequest,
  CreateCaInvitationRequest,
  CreateCaInvitationResponse,
  CaInvitation,
  CaInvitationListResponse,
  ResendCaInvitationRequest,
  AcceptCaInvitationRequest,
  AcceptCaInvitationResponse,
  DeclineCaInvitationRequest,
  CaClient,
  CaClientSummary,
  CaClientListResponse,
  UpdateCaClientRequest,
  RevokeCaRelationshipRequest,
  CaGstinAuthorization,
  SelectClientContextRequest,
  SelectClientContextResponse,
  CaContext,
  CaDashboard,
  CaClientDashboard,
  CaNotice,
  CaNoticeDetail,
  CaNoticeFilter,
  CaNoticeListResponse,
  NoticeCounts,
  CreateCaOrganizationRequest,
  CreateCaOrganizationResponse,
} from '@/types'

export const caApi = {
  // ============================================================================
  // Registration
  // ============================================================================

  async register(data: CaRegisterRequest): Promise<CaRegisterResponse> {
    const response = await apiClient.post<ApiResponse<CaRegisterResponse>>(
      '/ca/register',
      data
    )
    track('ca_signup_completed')
    return response.data.data
  },

  // ============================================================================
  // Profile
  // ============================================================================

  async getProfile(): Promise<CaProfile> {
    const response = await apiClient.get<ApiResponse<CaProfile>>('/ca/profile')
    return response.data.data
  },

  async updateProfile(data: UpdateCaProfileRequest): Promise<CaProfile> {
    const response = await apiClient.patch<ApiResponse<CaProfile>>(
      '/ca/profile',
      data
    )
    return response.data.data
  },

  // ============================================================================
  // Organization (CA Onboarding)
  // ============================================================================

  /**
   * Create an organization for a CA user during onboarding.
   * Unlike BO onboarding, GSTIN is optional for CA users.
   */
  async createOrganization(
    data: CreateCaOrganizationRequest
  ): Promise<CreateCaOrganizationResponse> {
    const response = await apiClient.post<
      ApiResponse<CreateCaOrganizationResponse>
    >('/ca/organization', data)

    const result = response.data.data

    // Update tokens with organization context
    if (result.accessToken && result.refreshToken) {
      setTokens(result.accessToken, result.refreshToken)
    }

    track('ca_organization_created')
    return result
  },

  // ============================================================================
  // Dashboard
  // ============================================================================

  async getDashboard(): Promise<CaDashboard> {
    const response = await apiClient.get<ApiResponse<CaDashboard>>(
      '/ca/dashboard'
    )
    return response.data.data
  },

  // ============================================================================
  // Invitations
  // ============================================================================

  async createInvitation(
    data: CreateCaInvitationRequest
  ): Promise<CreateCaInvitationResponse> {
    const response = await apiClient.post<
      ApiResponse<CreateCaInvitationResponse>
    >('/ca/invitations', data)
    track('ca_invitation_sent')
    return response.data.data
  },

  async getInvitations(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<CaInvitationListResponse> {
    const response = await apiClient.get<ApiResponse<CaInvitationListResponse>>(
      '/ca/invitations',
      { params }
    )
    return response.data.data
  },

  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.post(`/ca/invitations/${invitationId}/cancel`)
  },

  async resendInvitation(
    invitationId: string,
    data?: ResendCaInvitationRequest
  ): Promise<void> {
    await apiClient.post(`/ca/invitations/${invitationId}/resend`, data || {})
  },

  async validateInvitationToken(token: string): Promise<CaInvitation> {
    const response = await apiClient.get<ApiResponse<CaInvitation>>(
      '/ca/invitations/validate',
      { params: { token } }
    )
    return response.data.data
  },

  async acceptInvitation(
    data: AcceptCaInvitationRequest
  ): Promise<AcceptCaInvitationResponse> {
    const response = await apiClient.post<
      ApiResponse<AcceptCaInvitationResponse>
    >('/ca/invitations/accept', data)
    track('ca_invitation_accepted')
    return response.data.data
  },

  async declineInvitation(data: DeclineCaInvitationRequest): Promise<void> {
    await apiClient.post('/ca/invitations/decline', data)
  },

  async getPendingInvitations(): Promise<CaInvitation[]> {
    const response = await apiClient.get<ApiResponse<CaInvitation[]>>(
      '/ca/invitations/pending'
    )
    return response.data.data
  },

  // ============================================================================
  // Clients
  // ============================================================================

  async getClients(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<CaClientListResponse> {
    const response = await apiClient.get<ApiResponse<CaClientListResponse>>(
      '/ca/clients',
      { params }
    )
    return response.data.data
  },

  async getClient(relationshipId: string): Promise<CaClient> {
    const response = await apiClient.get<ApiResponse<CaClient>>(
      `/ca/clients/${relationshipId}`
    )
    return response.data.data
  },

  async getClientDashboard(relationshipId: string): Promise<CaClientDashboard> {
    const response = await apiClient.get<ApiResponse<CaClientDashboard>>(
      `/ca/clients/${relationshipId}/dashboard`
    )
    return response.data.data
  },

  async updateClient(
    relationshipId: string,
    data: UpdateCaClientRequest
  ): Promise<void> {
    await apiClient.patch(`/ca/clients/${relationshipId}`, data)
  },

  async revokeClient(
    relationshipId: string,
    data?: RevokeCaRelationshipRequest
  ): Promise<void> {
    await apiClient.post(`/ca/clients/${relationshipId}/revoke`, data || {})
  },

  async getClientAuthorizations(
    relationshipId: string
  ): Promise<CaGstinAuthorization[]> {
    const response = await apiClient.get<ApiResponse<CaGstinAuthorization[]>>(
      `/ca/clients/${relationshipId}/authorizations`
    )
    return response.data.data
  },

  // ============================================================================
  // Context
  // ============================================================================

  async selectClient(
    data: SelectClientContextRequest
  ): Promise<SelectClientContextResponse> {
    const response = await apiClient.post<
      ApiResponse<SelectClientContextResponse>
    >('/ca/context/select', data)
    const result = response.data.data
    // Update tokens with CA context claims
    setTokens(result.accessToken, result.refreshToken)
    track('ca_client_selected')
    return result
  },

  async getCurrentContext(): Promise<CaContext> {
    const response = await apiClient.get<ApiResponse<CaContext>>(
      '/ca/context/current'
    )
    return response.data.data
  },

  async clearContext(): Promise<void> {
    await apiClient.post('/ca/context/clear')
  },

  // ============================================================================
  // Notices (requires client context)
  // ============================================================================

  async getNotices(filter?: CaNoticeFilter): Promise<CaNoticeListResponse> {
    const response = await apiClient.get<ApiResponse<CaNoticeListResponse>>(
      '/ca/notices',
      { params: filter }
    )
    return response.data.data
  },

  async getNotice(noticeId: string): Promise<CaNoticeDetail> {
    const response = await apiClient.get<ApiResponse<CaNoticeDetail>>(
      `/ca/notices/${noticeId}`
    )
    return response.data.data
  },

  async getNoticeCounts(): Promise<NoticeCounts> {
    const response = await apiClient.get<ApiResponse<NoticeCounts>>(
      '/ca/notices/counts'
    )
    return response.data.data
  },
}
