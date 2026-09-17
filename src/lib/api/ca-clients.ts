import { apiClient, updateAccessToken } from './client'
import type {
  ApiResponse,
  CreateCaClientInvitationRequest,
  CaClientInvitation,
  CaClientInvitationDetails,
  CaClientListItem,
  AcceptCaClientInvitationRequest,
  AcceptCaClientInvitationResult,
  UploadCaStagedNoticeResult,
} from '@/types'

export const caClientsApi = {
  async list(): Promise<CaClientListItem[]> {
    const response = await apiClient.get<ApiResponse<CaClientListItem[]>>('/ca/clients')
    return response.data.data
  },

  async createInvitation(data: CreateCaClientInvitationRequest): Promise<CaClientInvitation> {
    const response = await apiClient.post<ApiResponse<CaClientInvitation>>(
      '/ca/clients/invitations',
      data
    )
    return response.data.data
  },

  async getInvitation(token: string): Promise<CaClientInvitationDetails> {
    const response = await apiClient.get<ApiResponse<CaClientInvitationDetails>>(
      `/ca/clients/invitations/${token}`
    )
    return response.data.data
  },

  async resendInvitation(invitationId: string): Promise<CaClientInvitation> {
    const response = await apiClient.post<ApiResponse<CaClientInvitation>>(
      `/ca/clients/invitations/${invitationId}/resend`
    )
    return response.data.data
  },

  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`/ca/clients/invitations/${invitationId}`)
  },

  async acceptInvitation(
    token: string,
    data: AcceptCaClientInvitationRequest
  ): Promise<AcceptCaClientInvitationResult> {
    const response = await apiClient.post<ApiResponse<AcceptCaClientInvitationResult>>(
      `/ca/clients/invitations/${token}/accept`,
      data
    )
    const result = response.data.data

    // Update the access token so subsequent requests carry the new
    // organization's org_id/role claims (same pattern as organizationsApi.create).
    if (result.accessToken) {
      updateAccessToken(result.accessToken)
    }

    return result
  },

  async declineInvitation(token: string): Promise<void> {
    await apiClient.post(`/ca/clients/invitations/${token}/decline`)
  },

  async uploadStagedNotice(prospectClientId: string, file: File): Promise<UploadCaStagedNoticeResult> {
    const formData = new FormData()
    formData.append('File', file)

    const response = await apiClient.post<ApiResponse<UploadCaStagedNoticeResult>>(
      `/ca/clients/${prospectClientId}/notices/upload`,
      formData,
      { timeout: 300000 }
    )
    return response.data.data
  },
}
