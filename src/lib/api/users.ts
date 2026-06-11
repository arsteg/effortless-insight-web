import { apiClient } from './client'
import type { ApiResponse, User } from '@/types'

export interface UpdateProfileRequest {
  name?: string
  mobile?: string
}

export interface UpdateAvatarResponse {
  avatarUrl: string
}

export const usersApi = {
  // Profile
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data)
    return response.data.data
  },

  async uploadAvatar(file: File): Promise<UpdateAvatarResponse> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.post<ApiResponse<UpdateAvatarResponse>>(
      '/users/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data
  },

  async deleteAvatar(): Promise<void> {
    await apiClient.delete('/users/avatar')
  },

  // Preferences
  async updatePreferences(preferences: Record<string, unknown>): Promise<void> {
    await apiClient.put('/users/preferences', preferences)
  },

  // Account deletion
  async deleteAccount(password: string): Promise<void> {
    await apiClient.delete('/users/account', {
      data: { password },
    })
  },
}
