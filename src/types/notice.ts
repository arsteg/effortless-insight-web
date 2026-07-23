// Notice types
export type NoticeStatus =
  | 'uploaded'
  | 'processing'
  | 'analyzed'
  | 'in_progress'
  | 'responded'
  | 'closed'
  | 'archived'
  | 'failed'

export type NoticePriority = 'low' | 'medium' | 'high' | 'critical'

export type ProcessingStatus =
  | 'queued'
  | 'ocr_processing'
  | 'extracting'
  | 'classifying'
  | 'analyzing'
  | 'completed'
  | 'failed'
  | 'retrying'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type NoticeSource = 'upload' | 'manual' | 'gstn_portal'

// Notice list item
export interface Notice {
  id: string
  noticeType?: string
  noticeCategory?: string
  noticeNumber?: string
  gstin?: string
  issueDate?: string
  responseDeadline?: string
  daysRemaining?: number
  taxAmount?: number
  penaltyAmount?: number
  status: NoticeStatus
  priority: NoticePriority
  processingStatus?: ProcessingStatus
  riskScore?: number
  riskLevel?: RiskLevel
  summaryEn?: string
  assignedToId?: string
  assignedToName?: string
  source?: NoticeSource
  gstnNoticeId?: string
  createdAt: string
}

// Notice detail
export interface NoticeDetail extends Notice {
  extendedDeadline?: string
  interestAmount?: number
  periodFrom?: string
  periodTo?: string
  issuingAuthority?: string
  fileUrl: string
  processingStatus: ProcessingStatus
  tags?: string[]
  aiReport?: NoticeAiReport
  updatedAt?: string
}

// AI Report
export interface NoticeAiReport {
  id: string
  riskScore?: number
  riskLevel?: RiskLevel
  summaryEn?: string
  summaryHi?: string
  plainEnglish?: string
  actionItems?: ActionItem[]
  requiredDocuments?: RequiredDocument[]
  legalReferences?: LegalReference[]
  confidenceScores?: Record<string, number>
  modelUsed?: string
  processingTimeMs?: number
  createdAt: string
}

export interface ActionItem {
  priority: number
  action: string
  description: string
  dueInDays?: number
  assigneeSuggestion?: string
}

export interface RequiredDocument {
  document: string
  mandatory: boolean
}

export interface LegalReference {
  section: string
  description: string
}

// Notice filters
export interface NoticeFilters {
  status?: NoticeStatus
  priority?: NoticePriority
  noticeType?: string
  gstin?: string
  deadlineFrom?: string
  deadlineTo?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDesc?: boolean
  includeAggregations?: boolean
}

// Notice list response
export interface NoticeListResponse {
  notices: Notice[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  aggregations?: NoticeAggregations
}

export interface NoticeAggregations {
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  overdueCount: number
  dueThisWeek: number
}

// Notice statistics
export interface NoticeStatistics {
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  overdueCount: number
  dueThisWeek: number
  dueThisMonth: number
  totalDemandAmount: number
  totalCount: number
}

// Upload
export interface NoticeUploadResponse {
  noticeId: string
  fileName: string
  fileSize: number
  status: string
  processingJobId?: string
  estimatedCompletionSeconds: number
  duplicateWarning?: DuplicateWarning
  createdAt: string
}

export interface DuplicateWarning {
  isPotentialDuplicate: boolean
  similarNoticeId?: string
  similarNoticeNumber?: string
  similarityScore: number
  uploadedAt?: string
}

// Update notice
export interface UpdateNoticeRequest {
  noticeNumber?: string
  noticeType?: string
  noticeCategory?: string
  gstin?: string
  issueDate?: string
  responseDeadline?: string
  extendedDeadline?: string
  taxAmount?: number
  penaltyAmount?: number
  interestAmount?: number
  periodFrom?: string
  periodTo?: string
  issuingAuthority?: string
  priority?: NoticePriority
  tags?: string[]
}

export interface UpdateNoticeStatusRequest {
  status: NoticeStatus
  reason?: string
}

export interface AssignNoticeRequest {
  assigneeId: string
}

// Attachments
export interface Attachment {
  id: string
  fileName: string
  fileSize?: number
  fileType?: string
  documentType?: string
  description?: string
  uploadedById: string
  uploadedByName?: string
  createdAt: string
}

export interface DownloadUrlResponse {
  url: string
  expiresAt: string
}

// Responses (notice response drafts)
export interface NoticeResponse {
  id: string
  noticeId: string
  draftContent?: string
  finalContent?: string
  status: 'draft' | 'review' | 'approved' | 'submitted'
  version: number
  submissionReference?: string
  submissionProofUrl?: string
  submittedAt?: string
  createdById: string
  createdByName?: string
  approvedById?: string
  approvedByName?: string
  createdAt: string
  updatedAt?: string
}

// Auto-draft AI response
export interface AutoDraftResponse {
  draftContent: string
  metadata: AutoDraftMetadata
}

export interface AutoDraftMetadata {
  model: string
  processingTimeMs: number
  noticeType?: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

// Reminders
export interface Reminder {
  id: string
  noticeId: string
  reminderType: 'email' | 'sms' | 'push' | 'whatsapp'
  remindAt: string
  daysBefore?: number
  isSent: boolean
  sentAt?: string
  userId: string
  userName?: string
  createdAt: string
}

export interface CreateReminderRequest {
  reminderType: 'email' | 'sms' | 'push' | 'whatsapp'
  remindAt: string
  daysBefore?: number
}

// Similar notices (AI-detected)
export interface SimilarNotice {
  id: string
  noticeNumber?: string
  noticeType?: string
  status: NoticeStatus
  similarityScore: number
  summary?: string
  responseDeadline?: string
}
