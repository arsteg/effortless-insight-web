/**
 * WhatsApp Integration Types
 */

/**
 * WhatsApp connection status response
 */
export interface WhatsAppStatus {
  linked: boolean
  phoneNumber: string | null
  linkedAt: string | null
  optedIn: boolean
  lastMessageAt: string | null
  displayPhoneNumber?: string
}

/**
 * Request to initiate WhatsApp linking
 */
export interface WhatsAppLinkRequest {
  phoneNumber: string
}

/**
 * Response from link request
 */
export interface WhatsAppLinkResponse {
  success: boolean
  expiresAt: string | null
  message: string
}

/**
 * Request to verify WhatsApp link code
 */
export interface WhatsAppVerifyRequest {
  code: string
}

/**
 * WhatsApp notification preferences
 */
export interface WhatsAppPreferences {
  deadlineReminders: boolean
  highRiskAlerts: boolean
  taskAssignments: boolean
  dailyDigest: boolean
}

/**
 * Request to update WhatsApp preferences
 */
export interface WhatsAppUpdatePreferencesRequest {
  deadlineReminders?: boolean
  highRiskAlerts?: boolean
  taskAssignments?: boolean
  dailyDigest?: boolean
}

/**
 * Request to opt-in/out
 */
export interface WhatsAppOptInRequest {
  optIn: boolean
}

/**
 * Response from opt-in request
 */
export interface WhatsAppOptInResponse {
  optedIn: boolean
  message: string
}

/**
 * WhatsApp message log entry (for admin)
 */
export interface WhatsAppMessageLog {
  id: string
  userId: string | null
  organizationId: string | null
  phoneNumber: string
  direction: 'inbound' | 'outbound'
  messageType: string
  wamId: string
  content: string | null
  command: string | null
  templateName: string | null
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
  errorCode: string | null
  errorMessage: string | null
  processingTimeMs: number | null
  deliveredAt: string | null
  readAt: string | null
  retryCount: number
  createdAt: string
}

/**
 * WhatsApp statistics (for admin)
 */
export interface WhatsAppStatistics {
  totalMessages: number
  inboundMessages: number
  outboundMessages: number
  failedMessages: number
  uniqueUsers: number
  linkedUsers: number
  optedInUsers: number
  deliveryRate: number
  readRate: number
  averageProcessingTimeMs: number
  messagesByDate: Array<{
    date: string
    inbound: number
    outbound: number
    failed: number
  }>
  messagesByCommand: Array<{
    command: string
    count: number
  }>
  messagesByTemplate: Array<{
    template: string
    count: number
  }>
}

/**
 * WhatsApp template
 */
export interface WhatsAppTemplate {
  id: string
  templateId: string
  name: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  language: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  headerFormat: string | null
  headerText: string | null
  bodyText: string
  footerText: string | null
  variables: string[]
  buttons: Array<{
    type: string
    text: string
    url?: string
    phoneNumber?: string
  }>
  isActive: boolean
  usageCount: number
  lastUsedAt: string | null
  syncedAt: string
  rejectionReason: string | null
}

/**
 * WhatsApp health status
 */
export interface WhatsAppHealthStatus {
  enabled: boolean
  apiConnected: boolean
  lastApiCheck: string | null
  lastApiError: string | null
  templatesConfigured: boolean
  approvedTemplateCount: number
  pendingTemplateCount: number
  webhookLastReceived: string | null
  activeSessionCount: number
  linkedUserCount: number
  queuedMessageCount: number
  failedMessageCount24h: number
}
