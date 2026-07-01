/**
 * GSTN Portal Integration Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as gstnApi from '@/lib/api/gstn';
import type {
  GstnUpdateSettingsRequest,
} from '@/types/gstn';

// Query key factory
export const gstnKeys = {
  all: ['gstn'] as const,
  connections: () => [...gstnKeys.all, 'connections'] as const,
  connection: (gstinId: string) => [...gstnKeys.all, 'connection', gstinId] as const,
  syncHistory: (gstinId: string) => [...gstnKeys.all, 'sync-history', gstinId] as const,
};

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    // Check for API error response
    const apiError = error as any;
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
 * Only retry on network errors or 5xx, not on 4xx client errors
 */
function shouldRetryMutation(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false; // Max 2 retries

  const apiError = error as any;
  const status = apiError?.response?.status;

  // Don't retry client errors (4xx)
  if (status && status >= 400 && status < 500) return false;

  // Retry network errors and server errors
  return true;
}

/**
 * Hook to fetch all GSTN connections
 */
export function useGstnConnections() {
  return useQuery({
    queryKey: gstnKeys.connections(),
    queryFn: gstnApi.getConnections,
    staleTime: 30000, // Consider fresh for 30 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch connection status for a specific GSTIN
 */
export function useGstnConnectionStatus(gstinId: string) {
  return useQuery({
    queryKey: gstnKeys.connection(gstinId),
    queryFn: () => gstnApi.getConnectionStatus(gstinId),
    enabled: !!gstinId,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to fetch sync history for a connection
 */
export function useGstnSyncHistory(gstinId: string, limit: number = 20) {
  return useQuery({
    queryKey: gstnKeys.syncHistory(gstinId),
    queryFn: () => gstnApi.getSyncHistory(gstinId, limit),
    enabled: !!gstinId,
    staleTime: 60000, // History doesn't change often
    retry: 2,
  });
}

/**
 * Hook to initiate GSTN connection (triggers OTP)
 */
export function useInitiateConnection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gstinId: string) => gstnApi.initiateConnection(gstinId),
    retry: shouldRetryMutation,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (data, gstinId) => {
      queryClient.invalidateQueries({ queryKey: gstnKeys.connection(gstinId) });
      if (data.success && data.otpDestination) {
        toast({
          title: 'OTP Sent',
          description: `Verification code sent to ${data.otpDestination}`,
        });
      } else if (!data.success) {
        toast({
          title: 'Connection Failed',
          description: data.errorMessage || 'Failed to initiate connection',
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Connection Failed',
        description: getErrorMessage(error, 'Failed to initiate connection'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to verify OTP
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ gstinId, otp }: { gstinId: string; otp: string }) =>
      gstnApi.verifyOtp(gstinId, { otp }),
    // No retry for OTP verification - user should manually retry
    retry: false,
    onSuccess: (data, { gstinId }) => {
      // Invalidate all related queries on successful connection
      queryClient.invalidateQueries({ queryKey: gstnKeys.connections() });
      queryClient.invalidateQueries({ queryKey: gstnKeys.connection(gstinId) });
      queryClient.invalidateQueries({ queryKey: ['notices'] }); // New notices may be available
      queryClient.invalidateQueries({ queryKey: ['gstins'] }); // GSTIN list may update

      if (data.success) {
        toast({
          title: 'Connected Successfully',
          description: 'Your GSTIN is now connected to the GST Portal',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Verification Failed',
        description: getErrorMessage(error, 'Invalid OTP. Please try again.'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to resend OTP
 */
export function useResendOtp() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gstinId: string) => gstnApi.resendOtp(gstinId),
    retry: shouldRetryMutation,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (data) => {
      if (data.success && data.otpDestination) {
        toast({
          title: 'OTP Resent',
          description: `New verification code sent to ${data.otpDestination}`,
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Failed to Resend',
        description: getErrorMessage(error, 'Please wait before requesting another OTP'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to disconnect from GSTN portal
 */
export function useDisconnect() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ gstinId, reason }: { gstinId: string; reason?: string }) =>
      gstnApi.disconnect(gstinId, reason ? { reason } : undefined),
    retry: false, // Don't retry disconnect
    onSuccess: (_, { gstinId }) => {
      queryClient.invalidateQueries({ queryKey: gstnKeys.connections() });
      queryClient.invalidateQueries({ queryKey: gstnKeys.connection(gstinId) });
      queryClient.invalidateQueries({ queryKey: ['gstins'] });
      toast({
        title: 'Disconnected',
        description: 'GSTIN has been disconnected from the GST Portal',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Disconnect Failed',
        description: getErrorMessage(error, 'Failed to disconnect'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to trigger manual sync
 */
export function useTriggerSync() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gstinId: string) => gstnApi.triggerSync(gstinId),
    retry: shouldRetryMutation,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
    onSuccess: (data, gstinId) => {
      queryClient.invalidateQueries({ queryKey: gstnKeys.connection(gstinId) });
      queryClient.invalidateQueries({ queryKey: gstnKeys.syncHistory(gstinId) });
      queryClient.invalidateQueries({ queryKey: ['notices'] }); // Show new notices
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Update dashboard counts

      if (data.success) {
        const imported = data.noticesImported || 0;
        const found = data.noticesFound || 0;
        toast({
          title: 'Sync Complete',
          description: imported > 0
            ? `Found ${found} notices, imported ${imported} new`
            : found > 0
              ? `Found ${found} notices (all already imported)`
              : 'No new notices found',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Sync Failed',
        description: getErrorMessage(error, 'Failed to sync notices. Please try again.'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update connection settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      gstinId,
      settings,
    }: {
      gstinId: string;
      settings: GstnUpdateSettingsRequest;
    }) => gstnApi.updateSettings(gstinId, settings),
    retry: shouldRetryMutation,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    onSuccess: (_, { gstinId }) => {
      queryClient.invalidateQueries({ queryKey: gstnKeys.connection(gstinId) });
      queryClient.invalidateQueries({ queryKey: gstnKeys.connections() });
      toast({
        title: 'Settings Updated',
        description: 'Sync settings have been updated',
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
