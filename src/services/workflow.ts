import { apiClient as api } from '@/lib/api/client';
import { AxiosError } from 'axios';
import type {
  WorkflowTemplate,
  WorkflowTemplateSummary,
  WorkflowInstance,
  WorkflowInstanceSummary,
  WorkflowHistory,
  WorkflowProgress,
  WorkflowStage,
  SlaStatusDto,
  StartWorkflowRequest,
  TransitionStageRequest,
  BulkTransitionRequest,
  AssignWorkflowRequest,
  BulkAssignRequest,
  PauseWorkflowRequest,
  ResumeWorkflowRequest,
  CancelWorkflowRequest,
  TransitionResult,
  BulkTransitionResult,
  ValidationResult,
} from '@/types/workflow';

// Helper to check if error is a 404 response
function isNotFoundError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 404;
}

const BASE_URL = '/workflows';

// ============================================================================
// Workflow Instance Operations
// ============================================================================

/**
 * Starts a workflow for a notice.
 */
export async function startWorkflow(request: StartWorkflowRequest): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(`${BASE_URL}/start`, request);
  return response.data;
}

/**
 * Gets the active workflow instance for a notice.
 */
export async function getWorkflowInstance(noticeId: string): Promise<WorkflowInstance | null> {
  try {
    const response = await api.get<WorkflowInstance>(`${BASE_URL}/notices/${noticeId}`);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * Gets workflow instances for multiple notices (batch operation).
 */
export async function getWorkflowInstancesBatch(
  noticeIds: string[]
): Promise<Record<string, WorkflowInstanceSummary>> {
  const response = await api.post<Record<string, WorkflowInstanceSummary>>(
    `${BASE_URL}/notices/batch`,
    noticeIds
  );
  return response.data;
}

// ============================================================================
// Stage Transition Operations
// ============================================================================

/**
 * Transitions a workflow to a new stage.
 */
export async function transitionStage(
  noticeId: string,
  request: TransitionStageRequest
): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(
    `${BASE_URL}/notices/${noticeId}/transition`,
    request
  );
  return response.data;
}

/**
 * Validates if a transition is allowed.
 */
export async function validateTransition(
  noticeId: string,
  targetStageKey: string
): Promise<ValidationResult> {
  const response = await api.get<ValidationResult>(
    `${BASE_URL}/notices/${noticeId}/validate-transition/${targetStageKey}`
  );
  return response.data;
}

/**
 * Gets available transitions for the current stage.
 */
export async function getAvailableTransitions(noticeId: string): Promise<WorkflowStage[]> {
  const response = await api.get<WorkflowStage[]>(
    `${BASE_URL}/notices/${noticeId}/available-transitions`
  );
  return response.data;
}

/**
 * Performs bulk stage transition for multiple notices.
 */
export async function bulkTransition(request: BulkTransitionRequest): Promise<BulkTransitionResult> {
  const response = await api.post<BulkTransitionResult>(`${BASE_URL}/bulk/transition`, request);
  return response.data;
}

// ============================================================================
// Assignment Operations
// ============================================================================

/**
 * Assigns a workflow to a user or role.
 */
export async function assignWorkflow(
  noticeId: string,
  request: AssignWorkflowRequest
): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(
    `${BASE_URL}/notices/${noticeId}/assign`,
    request
  );
  return response.data;
}

/**
 * Bulk assigns workflows to a user or role.
 */
export async function bulkAssign(request: BulkAssignRequest): Promise<BulkTransitionResult> {
  const response = await api.post<BulkTransitionResult>(`${BASE_URL}/bulk/assign`, request);
  return response.data;
}

// ============================================================================
// Workflow Control Operations
// ============================================================================

/**
 * Pauses a workflow instance.
 */
export async function pauseWorkflow(
  noticeId: string,
  request: PauseWorkflowRequest
): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(
    `${BASE_URL}/notices/${noticeId}/pause`,
    request
  );
  return response.data;
}

/**
 * Resumes a paused workflow instance.
 */
export async function resumeWorkflow(
  noticeId: string,
  request: ResumeWorkflowRequest
): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(
    `${BASE_URL}/notices/${noticeId}/resume`,
    request
  );
  return response.data;
}

/**
 * Cancels a workflow instance.
 */
export async function cancelWorkflow(
  noticeId: string,
  request: CancelWorkflowRequest
): Promise<TransitionResult> {
  const response = await api.post<TransitionResult>(
    `${BASE_URL}/notices/${noticeId}/cancel`,
    request
  );
  return response.data;
}

// ============================================================================
// History and Progress Operations
// ============================================================================

/**
 * Gets workflow history for a notice.
 */
export async function getWorkflowHistory(
  noticeId: string,
  limit?: number
): Promise<WorkflowHistory[]> {
  const params = limit ? { limit } : undefined;
  const response = await api.get<WorkflowHistory[]>(
    `${BASE_URL}/notices/${noticeId}/history`,
    { params }
  );
  return response.data;
}

/**
 * Gets workflow progress information.
 */
export async function getWorkflowProgress(noticeId: string): Promise<WorkflowProgress | null> {
  try {
    const response = await api.get<WorkflowProgress>(`${BASE_URL}/notices/${noticeId}/progress`);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// SLA Operations
// ============================================================================

/**
 * Gets the SLA status for a workflow instance.
 */
export async function getSlaStatus(noticeId: string): Promise<SlaStatusDto | null> {
  try {
    const response = await api.get<SlaStatusDto>(`${BASE_URL}/notices/${noticeId}/sla`);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// Template Operations
// ============================================================================

/**
 * Gets available workflow templates for the current organization.
 */
export async function getAvailableTemplates(): Promise<WorkflowTemplateSummary[]> {
  const response = await api.get<WorkflowTemplateSummary[]>(`${BASE_URL}/templates`);
  return response.data;
}

/**
 * Gets a workflow template by ID.
 */
export async function getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
  try {
    const response = await api.get<WorkflowTemplate>(`${BASE_URL}/templates/${templateId}`);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * Gets the default workflow template.
 */
export async function getDefaultTemplate(): Promise<WorkflowTemplate | null> {
  try {
    const response = await api.get<WorkflowTemplate>(`${BASE_URL}/templates/default`);
    return response.data;
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

// ============================================================================
// Workflow Service Object Export
// ============================================================================

const workflowService = {
  // Instance operations
  startWorkflow,
  getWorkflowInstance,
  getWorkflowInstancesBatch,

  // Stage transitions
  transitionStage,
  validateTransition,
  getAvailableTransitions,
  bulkTransition,

  // Assignment
  assignWorkflow,
  bulkAssign,

  // Control
  pauseWorkflow,
  resumeWorkflow,
  cancelWorkflow,

  // History and progress
  getWorkflowHistory,
  getWorkflowProgress,

  // SLA
  getSlaStatus,

  // Templates
  getAvailableTemplates,
  getTemplate,
  getDefaultTemplate,
};

export default workflowService;
