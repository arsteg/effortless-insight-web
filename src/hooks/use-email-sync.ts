import { useOrganizationStore } from '@/stores/organization-store';
/**
 * Email Sync Integration Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as emailSyncApi from '@/lib/api/email-sync';
import type { EmailAccountSettingsRequest, EmailConnectCallbackRequest } from '@/types/email-sync';

// Query key factory
export const emailSyncKeys = {
  all: ['email-sync'] as const,
  accounts: () => [...emailSyncKeys.all, 'accounts'] as const,
  account: (accountId: string) => [...emailSyncKeys.all, 'account', accountId] as const,
  syncHistory: (accountId: string) => [...emailSyncKeys.all, 'sync-history', accountId] as const,
};

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    const apiError = error as any;
    if (apiError.response?.data?.data?.errorMessage) return apiError.response.data.data.errorMessage;
    if (apiError.response?.data?.errorMessage) {
      return apiError.response.data.errorMessage;
    }
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    return error.message || defaultMessage;
  }
  return defaultMessage;
}

/**
 * Retry configuration for mutations
 */
function shouldRetryMutation(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;

  const apiError = error as any;
  const status = apiError?.response?.status;

  if (status && status >= 400 && status < 500) return false;

  return true;
}

/**
 * Hook to fetch all connected email accounts
 */
export function useEmailAccounts() {
  const organizationId = useOrganizationStore(s => s.currentOrganization?.id);
  return useQuery({
    queryKey: [...emailSyncKeys.accounts(), organizationId],
    enabled: !!organizationId,
    queryFn: emailSyncApi.getAccounts,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to fetch a specific email account
 */
export function useEmailAccount(accountId: string) {
  const organizationId = useOrganizationStore(s => s.currentOrganization?.id);
  return useQuery({
    queryKey: [...emailSyncKeys.account(accountId), organizationId],
    queryFn: () => emailSyncApi.getAccount(accountId),
    enabled: !!accountId && !!organizationId,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to fetch sync history for an account
 */
export function useEmailSyncHistory(accountId: string, limit: number = 20) {
  const organizationId = useOrganizationStore(s => s.currentOrganization?.id);
  return useQuery({
    queryKey: [...emailSyncKeys.syncHistory(accountId), organizationId, limit],
    queryFn: () => emailSyncApi.getSyncHistory(accountId, limit),
    enabled: !!accountId && !!organizationId,
    staleTime: 60000,
    retry: 2,
  });
}

/**
 * Hook to initiate OAuth connection
 */
export function useInitiateEmailConnection() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ provider, redirectUri }: { provider: string; redirectUri?: string }) =>
      emailSyncApi.initiateConnection(provider, redirectUri),
    retry: false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (data) => {
      if (!data.success) {
        toast({
          title: 'Connection Failed',
          description: data.errorMessage || 'Failed to start connection',
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Connection Failed',
        description: getErrorMessage(error, 'Failed to start connection'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to complete OAuth connection
 */
export function useCompleteEmailConnection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      provider,
      code,
      state,
      redirectUri,
    }: {
      provider: string;
      code: string;
      state: string;
      redirectUri?: string;
    }) => emailSyncApi.completeConnection(provider, { code, state }, redirectUri),
    retry: false,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: ['notices'] });

      if (data.success) {
        toast({
          title: 'Connected Successfully',
          description: `${data.account?.email} is now connected`,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: data.errorMessage || 'Failed to complete connection',
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Connection Failed',
        description: getErrorMessage(error, 'Failed to complete connection'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to disconnect an email account
 */
export function useDisconnectEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (accountId: string) => emailSyncApi.disconnectAccount(accountId),
    retry: false,
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.account(accountId) });
      toast({
        title: 'Disconnected',
        description: 'Email account has been disconnected',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Disconnect Failed',
        description: getErrorMessage(error, 'Failed to disconnect account'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to trigger manual sync
 */
export function useTriggerEmailSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (accountId: string) => emailSyncApi.triggerSync(accountId),
    retry: false,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
    onSuccess: (data, accountId) => {
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.account(accountId) });
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.syncHistory(accountId) });
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (!data.success || data.errorMessage) {
        toast({ title: 'Sync needs attention', description: data.errorMessage || 'Please retry syncing this account.', variant: 'destructive' });
        return;
      }
      if (data.success) {
        const imported = data.noticesImported || 0;
        const scanned = data.emailsScanned || 0;
        toast({
          title: 'Sync Complete',
          description: imported > 0
            ? `Scanned ${scanned} emails, imported ${imported} notices`
            : scanned > 0
              ? `Scanned ${scanned} emails, no new notices found`
              : 'No new emails to scan',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Sync Failed',
        description: getErrorMessage(error, 'Failed to sync emails'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update account settings
 */
export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      accountId,
      settings,
    }: {
      accountId: string;
      settings: EmailAccountSettingsRequest;
    }) => emailSyncApi.updateSettings(accountId, settings),
    retry: false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.account(accountId) });
      queryClient.invalidateQueries({ queryKey: emailSyncKeys.accounts() });
      toast({
        title: 'Settings Updated',
        description: 'Email sync settings have been updated',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Update Failed',
        description: getErrorMessage(error, 'Failed to update settings'),
        variant: 'destructive',
      });
    },
  });
}
