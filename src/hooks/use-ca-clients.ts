'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { caClientsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'
import type {
  CreateCaClientInvitationRequest,
  AcceptCaClientInvitationRequest,
} from '@/types'

export const caClientKeys = {
  all: ['ca-clients'] as const,
  list: () => [...caClientKeys.all, 'list'] as const,
  invitation: (token: string) => [...caClientKeys.all, 'invitation', token] as const,
}

/**
 * The CA's unified client list (staged + active). Only fetched for CA
 * accounts - a non-CA user has no clients to list.
 */
export function useCaClients() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: caClientKeys.list(),
    queryFn: () => caClientsApi.list(),
    enabled: !!user?.isCA,
    staleTime: 30 * 1000,
  })
}

export function useCreateCaClientInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateCaClientInvitationRequest) => caClientsApi.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caClientKeys.list() })
      toast({
        title: 'Invitation sent',
        description: 'The client will be able to set up their organization from the link we emailed them.',
        variant: 'success',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Please check the GSTIN and try again.',
        variant: 'destructive',
      })
    },
  })
}

export function useResendCaClientInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (invitationId: string) => caClientsApi.resendInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caClientKeys.list() })
      toast({ title: 'Invitation resent', variant: 'success' })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to resend invitation',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useCancelCaClientInvitation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (invitationId: string) => caClientsApi.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caClientKeys.list() })
      toast({ title: 'Invitation cancelled', variant: 'success' })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to cancel invitation',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useCaClientInvitationDetails(token: string) {
  return useQuery({
    queryKey: caClientKeys.invitation(token),
    queryFn: () => caClientsApi.getInvitation(token),
    enabled: !!token,
    retry: false,
  })
}

export function useAcceptCaClientInvitation() {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: AcceptCaClientInvitationRequest }) =>
      caClientsApi.acceptInvitation(token, data),
  })
}

export function useDeclineCaClientInvitation() {
  return useMutation({
    mutationFn: (token: string) => caClientsApi.declineInvitation(token),
  })
}

export function useUploadCaStagedNotice() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ prospectClientId, file }: { prospectClientId: string; file: File }) =>
      caClientsApi.uploadStagedNotice(prospectClientId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caClientKeys.list() })
      toast({ title: 'Notice uploaded', description: 'It will be imported once the client accepts your invitation.', variant: 'success' })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
