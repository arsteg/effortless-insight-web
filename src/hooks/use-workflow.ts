'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useToast } from '@/hooks/use-toast';
import workflowService from '@/services/workflow';
import type {
  StartWorkflowRequest,
  TransitionStageRequest,
  BulkTransitionRequest,
  AssignWorkflowRequest,
  BulkAssignRequest,
  PauseWorkflowRequest,
  ResumeWorkflowRequest,
  CancelWorkflowRequest,
} from '@/types/workflow';

// Type-safe error message extraction
interface ApiErrorResponse {
  message?: string;
  errors?: string[];
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as ApiErrorResponse;
    return data.message || data.errors?.join(', ') || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// Query key factory
export const workflowKeys = {
  all: ['workflows'] as const,
  instances: () => [...workflowKeys.all, 'instances'] as const,
  instance: (noticeId: string) => [...workflowKeys.instances(), noticeId] as const,
  progress: (noticeId: string) => [...workflowKeys.all, 'progress', noticeId] as const,
  history: (noticeId: string) => [...workflowKeys.all, 'history', noticeId] as const,
  sla: (noticeId: string) => [...workflowKeys.all, 'sla', noticeId] as const,
  transitions: (noticeId: string) => [...workflowKeys.all, 'transitions', noticeId] as const,
  templates: () => [...workflowKeys.all, 'templates'] as const,
  template: (id: string) => [...workflowKeys.templates(), id] as const,
  defaultTemplate: () => [...workflowKeys.templates(), 'default'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get workflow instance for a notice
 */
export function useWorkflowInstance(noticeId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.instance(noticeId!),
    queryFn: () => workflowService.getWorkflowInstance(noticeId!),
    enabled: !!noticeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get workflow progress for a notice
 */
export function useWorkflowProgress(noticeId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.progress(noticeId!),
    queryFn: () => workflowService.getWorkflowProgress(noticeId!),
    enabled: !!noticeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get workflow history for a notice
 */
export function useWorkflowHistory(noticeId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: workflowKeys.history(noticeId!),
    queryFn: () => workflowService.getWorkflowHistory(noticeId!, limit),
    enabled: !!noticeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get SLA status for a notice
 */
export function useSlaStatus(noticeId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.sla(noticeId!),
    queryFn: () => workflowService.getSlaStatus(noticeId!),
    enabled: !!noticeId,
    staleTime: 15 * 1000, // More frequent updates for SLA
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Get available transitions for a notice
 */
export function useAvailableTransitions(noticeId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.transitions(noticeId!),
    queryFn: () => workflowService.getAvailableTransitions(noticeId!),
    enabled: !!noticeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get available workflow templates
 */
export function useWorkflowTemplates() {
  return useQuery({
    queryKey: workflowKeys.templates(),
    queryFn: () => workflowService.getAvailableTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific workflow template
 */
export function useWorkflowTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: workflowKeys.template(templateId!),
    queryFn: () => workflowService.getTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get the default workflow template
 */
export function useDefaultWorkflowTemplate() {
  return useQuery({
    queryKey: workflowKeys.defaultTemplate(),
    queryFn: () => workflowService.getDefaultTemplate(),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Start a workflow for a notice
 */
export function useStartWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: StartWorkflowRequest) => workflowService.startWorkflow(request),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(variables.noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.progress(variables.noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(variables.noticeId) });
        toast({
          title: 'Workflow started',
          description: result.message || 'The workflow has been started successfully.',
        });
      } else {
        toast({
          title: 'Failed to start workflow',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to start workflow'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Transition workflow to a new stage
 */
export function useTransitionStage(noticeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: TransitionStageRequest) =>
      workflowService.transitionStage(noticeId, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.progress(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.sla(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.transitions(noticeId) });
        toast({
          title: 'Stage transitioned',
          description: result.message || 'The workflow stage has been updated.',
        });
      } else {
        toast({
          title: 'Transition failed',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to transition stage'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Bulk transition multiple notices
 */
export function useBulkTransition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: BulkTransitionRequest) => workflowService.bulkTransition(request),
    onSuccess: (result, variables) => {
      // Invalidate all affected notices
      variables.noticeIds.forEach((noticeId) => {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.progress(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
      });

      toast({
        title: 'Bulk transition completed',
        description: `${result.successCount} of ${result.totalRequested} notices transitioned successfully.`,
        variant: result.failureCount > 0 ? 'default' : 'default',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to perform bulk transition'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Assign workflow to a user or role
 */
export function useAssignWorkflow(noticeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: AssignWorkflowRequest) =>
      workflowService.assignWorkflow(noticeId, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
        toast({
          title: 'Workflow assigned',
          description: result.message || 'The workflow has been assigned.',
        });
      } else {
        toast({
          title: 'Assignment failed',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to assign workflow'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Bulk assign workflows
 */
export function useBulkAssign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: BulkAssignRequest) => workflowService.bulkAssign(request),
    onSuccess: (result, variables) => {
      variables.noticeIds.forEach((noticeId) => {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
      });

      toast({
        title: 'Bulk assignment completed',
        description: `${result.successCount} of ${result.totalRequested} workflows assigned successfully.`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to perform bulk assignment'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Pause workflow
 */
export function usePauseWorkflow(noticeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: PauseWorkflowRequest) =>
      workflowService.pauseWorkflow(noticeId, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.sla(noticeId) });
        toast({
          title: 'Workflow paused',
          description: 'The workflow has been paused. SLA timer stopped.',
        });
      } else {
        toast({
          title: 'Failed to pause',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to pause workflow'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Resume workflow
 */
export function useResumeWorkflow(noticeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: ResumeWorkflowRequest) =>
      workflowService.resumeWorkflow(noticeId, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.sla(noticeId) });
        toast({
          title: 'Workflow resumed',
          description: 'The workflow has been resumed. SLA timer restarted.',
        });
      } else {
        toast({
          title: 'Failed to resume',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to resume workflow'),
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel workflow
 */
export function useCancelWorkflow(noticeId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CancelWorkflowRequest) =>
      workflowService.cancelWorkflow(noticeId, request),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: workflowKeys.instance(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.history(noticeId) });
        queryClient.invalidateQueries({ queryKey: workflowKeys.progress(noticeId) });
        toast({
          title: 'Workflow cancelled',
          description: 'The workflow has been cancelled.',
        });
      } else {
        toast({
          title: 'Failed to cancel',
          description: result.errors?.join(', ') || result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to cancel workflow'),
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// Composite Hook for Workflow Panel
// ============================================================================

/**
 * All-in-one hook for workflow panel with all queries and mutations
 */
export function useWorkflowPanel(noticeId: string | undefined) {
  const instanceQuery = useWorkflowInstance(noticeId);
  const progressQuery = useWorkflowProgress(noticeId);
  const historyQuery = useWorkflowHistory(noticeId);
  const slaQuery = useSlaStatus(noticeId);
  const transitionsQuery = useAvailableTransitions(noticeId);

  const startWorkflow = useStartWorkflow();
  const transitionStage = useTransitionStage(noticeId || '');
  const assignWorkflow = useAssignWorkflow(noticeId || '');
  const pauseWorkflow = usePauseWorkflow(noticeId || '');
  const resumeWorkflow = useResumeWorkflow(noticeId || '');
  const cancelWorkflow = useCancelWorkflow(noticeId || '');

  const isLoading =
    instanceQuery.isLoading ||
    progressQuery.isLoading ||
    historyQuery.isLoading ||
    slaQuery.isLoading ||
    transitionsQuery.isLoading;

  const isMutating =
    startWorkflow.isPending ||
    transitionStage.isPending ||
    assignWorkflow.isPending ||
    pauseWorkflow.isPending ||
    resumeWorkflow.isPending ||
    cancelWorkflow.isPending;

  return {
    // Data
    workflowInstance: instanceQuery.data ?? null,
    workflowProgress: progressQuery.data ?? null,
    workflowHistory: historyQuery.data ?? [],
    slaStatus: slaQuery.data ?? null,
    availableTransitions: transitionsQuery.data ?? [],

    // Loading states
    isLoading,
    isMutating,

    // Actions
    startWorkflow: async () => {
      if (!noticeId) return;
      await startWorkflow.mutateAsync({ noticeId });
    },
    transitionStage: async (targetStageKey: string, reason?: string) => {
      await transitionStage.mutateAsync({ targetStageKey, reason });
    },
    assignWorkflow: async (userId?: string, role?: string, reason?: string) => {
      await assignWorkflow.mutateAsync({
        assignToUserId: userId,
        assignToRole: role,
        reason,
      });
    },
    pauseWorkflow: async (reason: string) => {
      await pauseWorkflow.mutateAsync({ reason });
    },
    resumeWorkflow: async (notes?: string) => {
      await resumeWorkflow.mutateAsync({ notes });
    },
    cancelWorkflow: async (reason: string) => {
      await cancelWorkflow.mutateAsync({ reason });
    },

    // Refetch functions
    refetch: () => {
      instanceQuery.refetch();
      progressQuery.refetch();
      historyQuery.refetch();
      slaQuery.refetch();
      transitionsQuery.refetch();
    },
  };
}
