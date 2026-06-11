'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useOrganizationStore } from '@/stores/organization-store'
import type {
  MemberListResponse,
  InvitationListResponse,
  InviteMemberRequest,
  ChangeMemberRoleRequest,
  OrganizationRole,
} from '@/types'

// Query keys
export const teamKeys = {
  all: ['team'] as const,
  members: (orgId: string) => [...teamKeys.all, 'members', orgId] as const,
  invitations: (orgId: string) => [...teamKeys.all, 'invitations', orgId] as const,
}

// Get members
export function useMembers(orgId?: string) {
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useQuery<MemberListResponse>({
    queryKey: teamKeys.members(organizationId || ''),
    queryFn: () => organizationsApi.getMembers(organizationId!),
    enabled: !!organizationId,
  })
}

// Get invitations
export function useInvitations(orgId?: string) {
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useQuery<InvitationListResponse>({
    queryKey: teamKeys.invitations(organizationId || ''),
    queryFn: () => organizationsApi.getInvitations(organizationId!),
    enabled: !!organizationId,
  })
}

// Invite member
export function useInviteMember(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (data: InviteMemberRequest) =>
      organizationsApi.inviteMember(organizationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(organizationId!) })
      toast({
        title: 'Invitation sent',
        description: 'The invitation has been sent successfully.',
        variant: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Change member role
export function useChangeMemberRole(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string
      role: OrganizationRole
    }) => organizationsApi.changeMemberRole(organizationId!, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(organizationId!) })
      toast({
        title: 'Role updated',
        description: 'The member role has been updated.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to update role',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Remove member
export function useRemoveMember(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (memberId: string) =>
      organizationsApi.removeMember(organizationId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(organizationId!) })
      toast({
        title: 'Member removed',
        description: 'The member has been removed from the organization.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to remove member',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Resend invitation
export function useResendInvitation(orgId?: string) {
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationsApi.resendInvitation(organizationId!, invitationId),
    onSuccess: () => {
      toast({
        title: 'Invitation resent',
        description: 'The invitation has been resent.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to resend invitation',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Cancel invitation
export function useCancelInvitation(orgId?: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { currentOrganization } = useOrganizationStore()
  const organizationId = orgId || currentOrganization?.id

  return useMutation({
    mutationFn: (invitationId: string) =>
      organizationsApi.cancelInvitation(organizationId!, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.invitations(organizationId!) })
      toast({
        title: 'Invitation cancelled',
        description: 'The invitation has been cancelled.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to cancel invitation',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
