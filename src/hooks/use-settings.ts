'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, usersApi, organizationsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'
import type {
  User,
  Organization,
  UpdateOrganizationRequest,
  OrganizationSettings,
  SessionListResponse,
  ChangePasswordRequest,
} from '@/types'
import type { UpdateProfileRequest } from '@/lib/api/users'

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  organization: (orgId: string) => [...settingsKeys.all, 'organization', orgId] as const,
  sessions: () => [...settingsKeys.all, 'sessions'] as const,
}

// Profile hooks
export function useProfile() {
  return useQuery<User>({
    queryKey: settingsKeys.profile(),
    queryFn: () => authApi.getMe(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(settingsKeys.profile(), updatedUser)
      setUser(updatedUser)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() })
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been updated successfully.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to upload avatar',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => usersApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() })
      toast({
        title: 'Avatar removed',
        description: 'Your avatar has been removed.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to remove avatar',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Organization hooks
export function useOrganization(orgId?: string) {
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useQuery<Organization>({
    queryKey: settingsKeys.organization(organizationId || ''),
    queryFn: () => organizationsApi.get(organizationId!),
    enabled: !!organizationId,
  })
}

export function useUpdateOrganization(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) =>
      organizationsApi.update(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization(organizationId!) })
      toast({
        title: 'Organization updated',
        description: 'Organization settings have been updated.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update organization',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateOrganizationSettings(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) =>
      organizationsApi.updateSettings(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.organization(organizationId!) })
      toast({
        title: 'Settings updated',
        description: 'Notification settings have been updated.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to update settings',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Security hooks
export function useSessions() {
  return useQuery<SessionListResponse>({
    queryKey: settingsKeys.sessions(),
    queryFn: () => authApi.getSessions(),
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() })
      toast({
        title: 'Session revoked',
        description: 'The session has been logged out.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to revoke session',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useChangePassword() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to change password',
        description: error.message || 'Please check your current password and try again.',
        variant: 'destructive',
      })
    },
  })
}
