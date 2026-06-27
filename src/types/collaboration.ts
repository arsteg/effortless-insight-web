// =============================================================================
// TASK TYPES
// =============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'on_hold' | 'archived'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export interface TaskAssignee {
  id: string
  name: string
  email?: string
  avatarUrl?: string
  assignedAt: string
}

export interface TaskUser {
  id: string
  name: string
  avatarUrl?: string
}

export interface Task {
  id: string
  noticeId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  isOverdue: boolean
  assignees: TaskAssignee[]
  labels?: string[]
  parentTaskId?: string
  subtaskCount: number
  subtasksCompleted: number
  createdBy: TaskUser
  createdAt: string
  updatedAt?: string
  completedAt?: string
  completedBy?: TaskUser
  completionNote?: string
}

export interface TaskDetail extends Task {
  subtasks?: Task[]
  attachments?: Attachment[]
}

export interface TaskListResponse {
  tasks: Task[]
  summary: TaskSummary
}

export interface TaskSummary {
  total: number
  todo: number
  inProgress: number
  done: number
  blocked: number
  onHold: number
  overdue: number
}

export interface MyTask {
  id: string
  title: string
  notice: MyTaskNotice
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  isOverdue: boolean
}

export interface MyTaskNotice {
  id: string
  number?: string
  type?: string
  organization: MyTaskOrganization
}

export interface MyTaskOrganization {
  id: string
  name: string
}

export interface MyTasksResponse {
  tasks: MyTask[]
  pagination: Pagination
}

export interface CreateTaskRequest {
  title: string
  description?: string
  assignees?: string[]
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
  labels?: string[]
  parentTaskId?: string
  templateId?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  assignees?: string[]
  priority?: TaskPriority
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  labels?: string[]
  status?: TaskStatus
  completionNote?: string
}

export interface TaskTemplate {
  id: string
  organizationId?: string
  name: string
  description?: string
  defaultTitle: string
  defaultDescription?: string
  defaultPriority: TaskPriority
  defaultEstimatedHours?: number
  defaultLabels?: string[]
  applicableNoticeTypes?: string[]
  isActive: boolean
  createdAt: string
}

export interface CreateTaskTemplateRequest {
  name: string
  description?: string
  defaultTitle: string
  defaultDescription?: string
  defaultPriority?: TaskPriority
  defaultEstimatedHours?: number
  defaultLabels?: string[]
  applicableNoticeTypes?: string[]
}

// =============================================================================
// COMMENT TYPES
// =============================================================================

export type CommentVisibility = 'all' | 'internal'

export interface Mention {
  userId: string
  username: string
  name: string
}

export interface ReactionSummary {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

export interface CommentAuthor {
  id: string
  name: string
  avatarUrl?: string
}

export interface Comment {
  id: string
  noticeId: string
  content: string
  contentHtml?: string
  visibility: CommentVisibility
  mentions?: Mention[]
  attachmentUrls?: string[]
  reactions: ReactionSummary[]
  replyCount: number
  author: CommentAuthor
  createdAt: string
  updatedAt: string
  isEdited: boolean
  isDeleted: boolean
  parentCommentId?: string
  replies?: Comment[]
}

export interface CommentListResponse {
  comments: Comment[]
  pagination: Pagination
}

export interface CreateCommentRequest {
  content: string
  visibility?: CommentVisibility
  parentCommentId?: string
  attachmentUrls?: string[]
}

export interface UpdateCommentRequest {
  content: string
}

export interface AddReactionRequest {
  emoji: string
}

export interface ReactionResponse {
  commentId: string
  reactions: ReactionSummary[]
}

// =============================================================================
// DOCUMENT REQUEST TYPES
// =============================================================================

export type DocumentRequestStatus =
  | 'pending'
  | 'submitted'
  | 'reviewing'
  | 'fulfilled'
  | 'resubmit_needed'
  | 'cancelled'

export interface DocumentRequestUser {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

export interface DocumentRequestDocument {
  id: string
  fileId: string
  filename: string
  sizeBytes: number
  mimeType: string
  uploadedBy: DocumentRequestUser
  uploadedAt: string
  note?: string
}

export interface DocumentRequest {
  id: string
  noticeId: string
  title: string
  description: string
  status: DocumentRequestStatus
  priority: TaskPriority
  dueDate: string
  isOverdue: boolean
  daysRemaining: number
  acceptedFormats?: string[]
  requestedFrom: DocumentRequestUser
  requestedBy: DocumentRequestUser
  fulfilledAt?: string
  reviewedBy?: DocumentRequestUser
  reviewNote?: string
  documents: DocumentRequestDocument[]
  createdAt: string
  updatedAt?: string
}

export interface DocumentRequestListResponse {
  requests: DocumentRequest[]
  summary: DocumentRequestSummary
}

export interface DocumentRequestSummary {
  total: number
  pending: number
  submitted: number
  reviewing: number
  fulfilled: number
  resubmitNeeded: number
  overdue: number
}

export interface CreateDocumentRequestRequest {
  title: string
  description: string
  requestedFrom: string
  dueDate: string
  priority?: TaskPriority
  acceptedFormats?: string[]
  templateId?: string
}

export interface UpdateDocumentRequestRequest {
  title?: string
  description?: string
  dueDate?: string
  priority?: TaskPriority
  acceptedFormats?: string[]
  status?: DocumentRequestStatus
  reviewNote?: string
}

export interface FulfillDocumentRequestRequest {
  note?: string
}

export interface DocumentReviewRequest {
  status: 'fulfilled' | 'resubmit_needed'
  reviewNote?: string
}

export interface DocumentRequestTemplate {
  id: string
  organizationId?: string
  name: string
  titleTemplate: string
  descriptionTemplate: string
  defaultPriority: TaskPriority
  defaultDueDays: number
  acceptedFormats?: string[]
  applicableNoticeTypes?: string[]
  isActive: boolean
  createdAt: string
}

export interface CreateDocumentRequestTemplateRequest {
  name: string
  titleTemplate: string
  descriptionTemplate: string
  defaultPriority?: TaskPriority
  defaultDueDays?: number
  acceptedFormats?: string[]
  applicableNoticeTypes?: string[]
}

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_assigned'
  | 'task_status_changed'
  | 'comment_added'
  | 'comment_edited'
  | 'comment_deleted'
  | 'comment_reaction'
  | 'user_mentioned'
  | 'document_requested'
  | 'document_uploaded'
  | 'document_reviewed'
  | 'document_overdue'
  | 'notice_assigned'
  | 'notice_status_changed'
  | 'ai_analysis_completed'
  | 'workflow_stage_changed'

export interface ActivityActor {
  id: string
  name: string
  avatarUrl?: string
}

export interface Activity {
  id: string
  type: ActivityType
  timestamp: string
  actor?: ActivityActor
  data: Record<string, unknown>
  message: string
}

export interface ActivityFeedResponse {
  activities: Activity[]
  hasMore: boolean
  nextCursor?: string
}

// =============================================================================
// FILE TYPES
// =============================================================================

export interface FileItem {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  checksum?: string
  uploadedBy: FileUser
  createdAt: string
  folderId?: string
}

export interface FileUser {
  id: string
  name: string
}

export interface FileFolder {
  id: string
  name: string
  parentFolderId?: string
  subFolders: FileFolder[]
  files: FileItem[]
  createdAt: string
}

export interface CreateFolderRequest {
  name: string
  parentFolderId?: string
}

export interface FileListResponse {
  files: FileItem[]
  folders: FileFolder[]
  pagination: Pagination
}

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface Attachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize?: number
  fileType?: string
}

// =============================================================================
// PRIORITY COLORS
// =============================================================================

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
}

export const PRIORITY_BG_COLORS: Record<TaskPriority, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-200 text-gray-500',
}

// =============================================================================
// ACTIVITY TYPE ICONS
// =============================================================================

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, { icon: string; color: string }> = {
  comment_added: { icon: 'message-circle', color: '#3B82F6' },
  task_created: { icon: 'plus-circle', color: '#10B981' },
  task_completed: { icon: 'check-circle', color: '#22C55E' },
  task_updated: { icon: 'edit', color: '#6B7280' },
  task_assigned: { icon: 'user-plus', color: '#06B6D4' },
  task_status_changed: { icon: 'arrow-right', color: '#F59E0B' },
  document_uploaded: { icon: 'file-plus', color: '#8B5CF6' },
  document_requested: { icon: 'file-text', color: '#EC4899' },
  document_reviewed: { icon: 'file-check', color: '#10B981' },
  document_overdue: { icon: 'alert-triangle', color: '#EF4444' },
  user_mentioned: { icon: 'at-sign', color: '#3B82F6' },
  comment_edited: { icon: 'edit-2', color: '#6B7280' },
  comment_deleted: { icon: 'trash', color: '#EF4444' },
  comment_reaction: { icon: 'smile', color: '#F59E0B' },
  notice_assigned: { icon: 'user-check', color: '#06B6D4' },
  notice_status_changed: { icon: 'refresh-cw', color: '#F59E0B' },
  ai_analysis_completed: { icon: 'cpu', color: '#8B5CF6' },
  workflow_stage_changed: { icon: 'git-branch', color: '#06B6D4' },
}

// =============================================================================
// ALLOWED REACTIONS
// =============================================================================

export const ALLOWED_REACTIONS = ['👍', '❤️', '😊', '🎉'] as const
export type AllowedReaction = typeof ALLOWED_REACTIONS[number]

// =============================================================================
// TIME TRACKING TYPES
// =============================================================================

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  userName?: string
  date: string
  hours: number
  description?: string
  isBillable: boolean
  startTime?: string
  endTime?: string
  isTimerRunning: boolean
  createdAt: string
}

export interface TimeEntriesResponse {
  entries: TimeEntry[]
  totalHours: number
  activeTimerId?: string
}

export interface CreateTimeEntryRequest {
  hours: number
  date: string
  description?: string
  isBillable?: boolean
}

export interface UpdateTimeEntryRequest {
  hours?: number
  date?: string
  description?: string
  isBillable?: boolean
}
