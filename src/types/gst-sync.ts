/**
 * GST Sync Module Types
 */

// GST Client (GSTIN connection)
export interface GstClient {
  id: string
  gstin: string
  clientName: string | null
  legalName: string | null
  tradeName: string | null
  status: GstClientStatus
  syncEnabled: boolean
  syncFrequencyHours: number
  lastSyncAt: string | null
  lastSyncStatus: string | null
  totalNoticesSynced: number
  lastNoticeDate: string | null
  createdAt: string
  updatedAt: string
}

export type GstClientStatus =
  | 'pending_first_sync'
  | 'active'
  | 'paused'
  | 'error'
  | 'disconnected'

// GST Sync Session
export interface GstSyncSession {
  id: string
  gstClientId: string
  syncSource: string
  status: SyncSessionStatus
  startedAt: string
  completedAt: string | null
  noticesFound: number
  noticesNew: number
  noticesUpdated: number
  pdfsDownloaded: number
  errorMessage: string | null
  durationMs: number | null
}

export type SyncSessionStatus =
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'partial'

// GST Notice Raw (synced from portal)
export interface GstNoticeRaw {
  id: string
  gstClientId: string
  gstin: string
  portalNoticeId: string
  referenceNumber: string | null
  noticeType: string
  noticeCategory: string | null
  issueDate: string
  dueDate: string | null
  statusOnPortal: string | null
  demandAmount: number | null
  taxAmount: number | null
  interestAmount: number | null
  penaltyAmount: number | null
  taxPeriod: string | null
  financialYear: string | null
  sectionRule: string | null
  officerName: string | null
  officerDesignation: string | null
  jurisdiction: string | null
  pdfAvailable: boolean
  pdfS3Key: string | null
  pdfSizeBytes: number | null
  importedToNotices: boolean
  importedNoticeId: string | null
  firstSyncedAt: string
  lastSyncedAt: string
  syncCount: number
}

// Extension Event
export interface GstExtensionEvent {
  id: string
  eventType: string
  eventData: Record<string, unknown> | null
  extensionVersion: string | null
  browserInfo: string | null
  errorMessage: string | null
  createdAt: string
}

// API Request/Response Types
export interface CreateGstClientRequest {
  gstin: string
  clientName?: string
  syncFrequencyHours?: number
}

export interface UpdateGstClientRequest {
  clientName?: string
  syncEnabled?: boolean
  syncFrequencyHours?: number
}

export interface GstClientListResponse {
  items: GstClient[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GstNoticeRawListResponse {
  items: GstNoticeRaw[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GstSyncSessionListResponse {
  items: GstSyncSession[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface GstClientFilters {
  page?: number
  pageSize?: number
  status?: GstClientStatus
  gstin?: string
  search?: string
}

export interface GstNoticeFilters {
  page?: number
  pageSize?: number
  gstClientId?: string
  noticeType?: string
  importStatus?: 'all' | 'imported' | 'pending'
  dateFrom?: string
  dateTo?: string
}

export interface GstSyncSessionFilters {
  page?: number
  pageSize?: number
  gstClientId?: string
  status?: SyncSessionStatus
  dateFrom?: string
  dateTo?: string
}

// Extension Config
export interface ExtensionConfig {
  autoCapture: boolean
  captureOnNoticesPage: boolean
  autoDownloadPdf: boolean
  enabledGstins: string[]
  syncFrequencyMinutes: number
  selectors?: Record<string, string>
}

// Statistics
export interface GstSyncStatistics {
  totalClients: number
  activeClients: number
  pausedClients: number
  errorClients: number
  totalNoticesSynced: number
  noticesSyncedToday: number
  pendingImports: number
  lastSyncTime: string | null
  totalSyncSessions: number
  syncSessionsToday: number
}

// Import Request
export interface ImportNoticesRequest {
  noticeIds: string[]
  assignToUserId?: string
}

export interface ImportedNoticeInfo {
  rawNoticeId: string
  importedNoticeId: string
}

export interface ImportNoticesResponse {
  imported: number
  alreadyImported: number
  failed: number
  importedNotices: ImportedNoticeInfo[]
  errors: string[]
}
