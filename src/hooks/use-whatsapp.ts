/**
 * WhatsApp Integration Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { whatsappApi } from '@/lib/api/whatsapp'
import { useToast } from '@/hooks/use-toast'
import type {
  WhatsAppLinkRequest,
  WhatsAppVerifyRequest,
  WhatsAppUpdatePreferencesRequest,
  WhatsAppOptInRequest,
} from '@/types/whatsapp'

// Query keys
export const whatsappKeys = {
  all: ['whatsapp'] as const,
  status: () => [...whatsappKeys.all, 'status'] as const,
  preferences: () => [...whatsappKeys.all, 'preferences'] as const,
  health: () => [...whatsappKeys.all, 'health'] as const,
  statistics: (startDate?: string, endDate?: string) =>
    [...whatsappKeys.all, 'statistics', { startDate, endDate }] as const,
  messages: (params?: Record<string, unknown>) =>
    [...whatsappKeys.all, 'messages', params] as const,
  templates: () => [...whatsappKeys.all, 'templates'] as const,
}

/**
 * Hook for getting WhatsApp connection status
 */
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: whatsappKeys.status(),
    queryFn: whatsappApi.getStatus,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for requesting WhatsApp link
 */
export function useRequestWhatsAppLink() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: WhatsAppLinkRequest) => whatsappApi.requestLink(data),
    onSuccess: (response) => {
      toast({
        title: 'Verification code sent',
        description: response.message || 'Check your app notifications for the code.',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to send verification code',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for verifying WhatsApp link code
 */
export function useVerifyWhatsAppLink() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: WhatsAppVerifyRequest) => whatsappApi.verifyLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.status() })
      toast({
        title: 'WhatsApp linked successfully',
        description: 'You will now receive notifications via WhatsApp.',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid code. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for unlinking WhatsApp
 */
export function useUnlinkWhatsApp() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => whatsappApi.unlink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.status() })
      queryClient.invalidateQueries({ queryKey: whatsappKeys.preferences() })
      toast({
        title: 'WhatsApp unlinked',
        description: 'You will no longer receive WhatsApp notifications.',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to unlink WhatsApp',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for getting WhatsApp preferences
 */
export function useWhatsAppPreferences() {
  return useQuery({
    queryKey: whatsappKeys.preferences(),
    queryFn: whatsappApi.getPreferences,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for updating WhatsApp preferences
 */
export function useUpdateWhatsAppPreferences() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: WhatsAppUpdatePreferencesRequest) => whatsappApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.preferences() })
      toast({
        title: 'Preferences updated',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to update preferences',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for opt-in/opt-out
 */
export function useWhatsAppOptIn() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: WhatsAppOptInRequest) => whatsappApi.setOptIn(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.status() })
      toast({
        title: response.optedIn ? 'Opted in' : 'Opted out',
        description: response.message,
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to update opt-in status',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for getting WhatsApp health status (admin)
 */
export function useWhatsAppHealth() {
  return useQuery({
    queryKey: whatsappKeys.health(),
    queryFn: whatsappApi.getHealthStatus,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refresh every minute
  })
}

/**
 * Hook for getting WhatsApp statistics (admin)
 */
export function useWhatsAppStatistics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: whatsappKeys.statistics(startDate, endDate),
    queryFn: () => whatsappApi.getStatistics(startDate, endDate),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for getting message logs (admin)
 */
export function useWhatsAppMessages(params?: {
  page?: number
  pageSize?: number
  direction?: 'inbound' | 'outbound'
  status?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: whatsappKeys.messages(params),
    queryFn: () => whatsappApi.getMessageLogs(params),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for getting WhatsApp templates (admin)
 */
export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: whatsappKeys.templates(),
    queryFn: whatsappApi.getTemplates,
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook for syncing templates (admin)
 */
export function useSyncWhatsAppTemplates() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => whatsappApi.syncTemplates(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.templates() })
      toast({
        title: 'Templates synced',
        description: `${response.synced} templates synchronized from Meta.`,
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to sync templates',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for retrying a failed message (admin)
 */
export function useRetryWhatsAppMessage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (messageId: string) => whatsappApi.retryMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappKeys.messages() })
      toast({
        title: 'Message retry initiated',
      })
    },
    onError: (error: { message?: string }) => {
      toast({
        title: 'Failed to retry message',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      })
    },
  })
}
