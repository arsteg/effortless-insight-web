import { apiClient } from './client'
import type {
  ApiResponse,
  Organization,
  OrganizationListResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  Gstin,
  AddGstinRequest,
  GstinValidationResult,
  MemberListResponse,
  Member,
  ChangeMemberRoleRequest,
  InviteMemberRequest,
  Invitation,
  InvitationListResponse,
  OrganizationSettings,
} from '@/types'

export const organizationsApi = {
  // Organization CRUD
  async list(): Promise<OrganizationListResponse> {
    const response = await apiClient.get<ApiResponse<OrganizationListResponse>>('/organizations')
    return response.data.data
  },

  async get(orgId: string): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<Organization>>(`/organizations/${orgId}`)
    return response.data.data
  },

  async create(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.post<ApiResponse<Organization>>('/organizations', data)
    return response.data.data
  },

  async update(orgId: string, data: UpdateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.put<ApiResponse<Organization>>(`/organizations/${orgId}`, data)
    return response.data.data
  },

  async delete(orgId: string, confirmation: string, password: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}`, {
      data: { confirmation, password },
    })
  },

  // GSTIN
  async validateGstin(gstin: string): Promise<GstinValidationResult> {
    const response = await apiClient.get<ApiResponse<GstinValidationResult>>(
      `/organizations/validate-gstin/${gstin}`
    )
    return response.data.data
  },

  async addGstin(orgId: string, data: AddGstinRequest): Promise<Gstin> {
    const response = await apiClient.post<ApiResponse<Gstin>>(
      `/organizations/${orgId}/gstins`,
      data
    )
    return response.data.data
  },

  async removeGstin(orgId: string, gstinId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/gstins/${gstinId}`)
  },

  async setPrimaryGstin(orgId: string, gstinId: string): Promise<void> {
    await apiClient.put(`/organizations/${orgId}/gstins/${gstinId}/primary`)
  },

  // Members
  async getMembers(
    orgId: string,
    params?: { role?: string; status?: string; page?: number; limit?: number }
  ): Promise<MemberListResponse> {
    const response = await apiClient.get<ApiResponse<MemberListResponse>>(
      `/organizations/${orgId}/members`,
      { params }
    )
    return response.data.data
  },

  async changeMemberRole(
    orgId: string,
    memberId: string,
    data: ChangeMemberRoleRequest
  ): Promise<Member> {
    const response = await apiClient.put<ApiResponse<Member>>(
      `/organizations/${orgId}/members/${memberId}/role`,
      data
    )
    return response.data.data
  },

  async removeMember(orgId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/members/${memberId}`)
  },

  async leaveOrganization(orgId: string): Promise<void> {
    await apiClient.post(`/organizations/${orgId}/leave`)
  },

  async transferOwnership(
    orgId: string,
    newOwnerId: string,
    password: string
  ): Promise<void> {
    await apiClient.post(`/organizations/${orgId}/transfer-ownership`, {
      newOwnerId,
      password,
    })
  },

  // Invitations
  async inviteMember(orgId: string, data: InviteMemberRequest): Promise<Invitation> {
    const response = await apiClient.post<ApiResponse<Invitation>>(
      `/organizations/${orgId}/invitations`,
      data
    )
    return response.data.data
  },

  async getInvitations(orgId: string): Promise<InvitationListResponse> {
    const response = await apiClient.get<ApiResponse<InvitationListResponse>>(
      `/organizations/${orgId}/invitations`
    )
    return response.data.data
  },

  async resendInvitation(orgId: string, invitationId: string): Promise<void> {
    await apiClient.post(`/organizations/${orgId}/invitations/${invitationId}/resend`)
  },

  async cancelInvitation(orgId: string, invitationId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgId}/invitations/${invitationId}`)
  },

  // Settings
  async updateSettings(
    orgId: string,
    data: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> {
    const response = await apiClient.put<ApiResponse<OrganizationSettings>>(
      `/organizations/${orgId}/settings`,
      data
    )
    return response.data.data
  },
}
