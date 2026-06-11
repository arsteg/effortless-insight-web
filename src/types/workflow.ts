// Workflow Engine Types

// ============================================================================
// Workflow Template Types
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  version: number;
  isSystem: boolean;
  isActive: boolean;
  applicableNoticeTypes: string[];
  stages: WorkflowStage[];
  createdAt: string;
  updatedAt: string | null;
}

export interface WorkflowStage {
  id: string;
  stageKey: string;
  name: string;
  description: string | null;
  stageType: WorkflowStageType;
  stageOrder: number;
  slaHours: number | null;
  slaWarningPercent: number;
  color: string;
  icon: string;
  allowedTransitions: string[];
}

export interface WorkflowTemplateSummary {
  id: string;
  name: string;
  description: string | null;
  version: number;
  isSystem: boolean;
  isActive: boolean;
  stageCount: number;
  activeInstanceCount: number;
}

export type WorkflowStageType = 'start' | 'intermediate' | 'end' | 'pause';

// ============================================================================
// Workflow Instance Types
// ============================================================================

export interface WorkflowInstance {
  id: string;
  noticeId: string;
  workflowTemplateId: string;
  workflowTemplateName: string;
  currentStageKey: string;
  currentStageName: string;
  stageEnteredAt: string;
  slaDeadline: string | null;
  slaStatus: SlaStatus;
  slaPercentConsumed: number;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedRole: string | null;
  status: WorkflowInstanceStatus;
  completedAt: string | null;
  completionOutcome: string | null;
  totalTimeMinutes: number;
  slaBreachCount: number;
  transitionCount: number;
  availableTransitions: string[];
  createdAt: string;
}

export interface WorkflowInstanceSummary {
  id: string;
  noticeId: string;
  currentStageKey: string;
  currentStageName: string;
  slaStatus: SlaStatus;
  slaPercentConsumed: number;
  slaDeadline: string | null;
  assignedToName: string | null;
  status: WorkflowInstanceStatus;
}

export type WorkflowInstanceStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type SlaStatus = 'on_track' | 'warning' | 'at_risk' | 'breached' | 'paused';

// ============================================================================
// Workflow History Types
// ============================================================================

export interface WorkflowHistory {
  id: string;
  eventType: WorkflowEventType;
  fromStageKey: string | null;
  toStageKey: string | null;
  performedById: string | null;
  performedByName: string | null;
  performedBySystem: string | null;
  description: string | null;
  reason: string | null;
  timeInStageMinutes: number | null;
  slaStatusAtEvent: string | null;
  createdAt: string;
}

export type WorkflowEventType =
  | 'workflow_started'
  | 'stage_transition'
  | 'assignment'
  | 'reassignment'
  | 'sla_warning'
  | 'sla_breach'
  | 'escalation'
  | 'comment_added'
  | 'attachment_added'
  | 'deadline_extended'
  | 'workflow_paused'
  | 'workflow_resumed'
  | 'workflow_completed'
  | 'workflow_cancelled'
  | 'action_executed'
  | 'ai_analysis'
  | 'notification_sent';

// ============================================================================
// Workflow Progress Types
// ============================================================================

export interface WorkflowProgress {
  noticeId: string;
  workflowInstanceId: string;
  currentStageKey: string;
  stages: WorkflowStageInfo[];
  completedStages: number;
  totalStages: number;
  progressPercent: number;
}

export interface WorkflowStageInfo {
  stageKey: string;
  name: string;
  stageType: WorkflowStageType;
  color: string;
  icon: string;
  slaHours: number | null;
  isCurrentStage: boolean;
  isCompleted: boolean;
  enteredAt: string | null;
  exitedAt: string | null;
  timeInStageMinutes: number | null;
}

// ============================================================================
// SLA Types
// ============================================================================

export interface SlaStatusDto {
  workflowInstanceId: string;
  noticeId: string;
  currentStageKey: string;
  status: SlaStatus;
  percentConsumed: number;
  deadline: string | null;
  hoursRemaining: number | null;
  minutesRemaining: number | null;
  isBreached: boolean;
  isAtRisk: boolean;
  isWarning: boolean;
}

// ============================================================================
// Request Types
// ============================================================================

export interface StartWorkflowRequest {
  noticeId: string;
  workflowTemplateId?: string;
  assignToUserId?: string;
  assignToRole?: string;
}

export interface TransitionStageRequest {
  targetStageKey: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface BulkTransitionRequest {
  noticeIds: string[];
  targetStageKey: string;
  reason?: string;
}

export interface AssignWorkflowRequest {
  assignToUserId?: string;
  assignToRole?: string;
  reason?: string;
}

export interface BulkAssignRequest {
  noticeIds: string[];
  assignToUserId?: string;
  assignToRole?: string;
  reason?: string;
}

export interface PauseWorkflowRequest {
  reason: string;
}

export interface ResumeWorkflowRequest {
  notes?: string;
}

export interface CancelWorkflowRequest {
  reason: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface TransitionResult {
  success: boolean;
  message: string | null;
  instance: WorkflowInstance | null;
  errors: string[] | null;
}

export interface BulkTransitionResult {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: BulkItemResult[];
}

export interface BulkItemResult {
  noticeId: string;
  success: boolean;
  message: string | null;
  error: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

// ============================================================================
// Stage Badge Helpers
// ============================================================================

export const SLA_STATUS_COLORS: Record<SlaStatus, string> = {
  on_track: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  at_risk: 'bg-orange-100 text-orange-800 border-orange-200',
  breached: 'bg-red-100 text-red-800 border-red-200',
  paused: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const SLA_STATUS_LABELS: Record<SlaStatus, string> = {
  on_track: 'On Track',
  warning: 'Warning',
  at_risk: 'At Risk',
  breached: 'Breached',
  paused: 'Paused',
};

export const WORKFLOW_STATUS_COLORS: Record<WorkflowInstanceStatus, string> = {
  active: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const WORKFLOW_STATUS_LABELS: Record<WorkflowInstanceStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Default stage keys for the standard workflow
export const DEFAULT_STAGE_KEYS = {
  INTAKE: 'intake',
  ANALYSIS: 'analysis',
  DRAFTING: 'drafting',
  REVIEW: 'review',
  APPROVAL: 'approval',
  SUBMISSION: 'submission',
  AWAITING: 'awaiting',
  CLOSED: 'closed',
} as const;

export type DefaultStageKey = typeof DEFAULT_STAGE_KEYS[keyof typeof DEFAULT_STAGE_KEYS];
