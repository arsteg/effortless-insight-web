// Notification types matching backend DTOs

export interface Notification {
  id: string
  type: string
  category: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  body: string
  data: Record<string, unknown>
  actionUrl?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  expiresAt?: string
  referenceId?: string
  referenceType?: string
}

export interface NotificationListResponse {
  notifications: Notification[]
  totalCount: number
  unreadCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface MarkReadResponse {
  notificationId: string
  isRead: boolean
  readAt: string
  remainingUnread: number
}

export interface MarkAllReadResponse {
  markedCount: number
  remainingUnread: number
}

// Channel preferences
export interface ChannelPreferences {
  email: EmailChannelPreferences
  sms: SmsChannelPreferences
  push: PushChannelPreferences
  whatsApp: WhatsAppChannelPreferences
  inApp: InAppChannelPreferences
}

export interface EmailChannelPreferences {
  enabled: boolean
  address?: string
  verified?: boolean
}

export interface SmsChannelPreferences {
  enabled: boolean
  phoneNumber?: string
  verified?: boolean
}

export interface PushChannelPreferences {
  enabled: boolean
  registeredDevices: number
}

export interface WhatsAppChannelPreferences {
  enabled: boolean
  phoneNumber?: string
  verified?: boolean
}

export interface InAppChannelPreferences {
  enabled: boolean
  showBadge: boolean
  playSound: boolean
}

// Quiet hours
export interface QuietHours {
  enabled: boolean
  start: string
  end: string
  timezone: string
}

// Type preferences
export interface TypeChannelPreferences {
  email: boolean
  sms: boolean
  push: boolean
  whatsApp: boolean
  inApp: boolean
}

// Digest preferences
export interface DigestPreferences {
  daily: DailyDigest
  weekly: WeeklyDigest
}

export interface DailyDigest {
  enabled: boolean
  time: string
  timezone: string
}

export interface WeeklyDigest {
  enabled: boolean
  day: number
  time: string
}

// Full notification preferences
export interface NotificationPreferences {
  channels: ChannelPreferences
  quietHours: QuietHours
  preferences: Record<string, TypeChannelPreferences>
  digest: DigestPreferences
}

// Update requests
export interface UpdateChannelPreferences {
  email?: Partial<EmailChannelPreferences>
  sms?: Partial<SmsChannelPreferences>
  push?: Partial<PushChannelPreferences>
  whatsApp?: Partial<WhatsAppChannelPreferences>
  inApp?: Partial<InAppChannelPreferences>
}

export interface UpdateQuietHours {
  enabled?: boolean
  start?: string
  end?: string
  timezone?: string
}

export interface UpdateDigest {
  daily?: Partial<DailyDigest>
  weekly?: Partial<WeeklyDigest>
}

export interface UpdatePreferencesRequest {
  channels?: UpdateChannelPreferences
  quietHours?: UpdateQuietHours
  preferences?: Record<string, TypeChannelPreferences>
  digest?: UpdateDigest
}

// Push token
export interface RegisterPushTokenRequest {
  token: string
  platform: 'web' | 'android' | 'ios'
  deviceId?: string
  deviceModel?: string
  appVersion?: string
}

export interface PushToken {
  id: string
  platform: string
  createdAt: string
  lastUsedAt?: string
}

// Notification type constants
export const NotificationType = {
  // Deadline notifications
  DEADLINE_7_DAY: 'deadline_7_day',
  DEADLINE_3_DAY: 'deadline_3_day',
  DEADLINE_1_DAY: 'deadline_1_day',
  DEADLINE_TODAY: 'deadline_today',
  DEADLINE_MISSED: 'deadline_missed',

  // SLA notifications
  SLA_WARNING: 'sla_warning',
  SLA_CRITICAL: 'sla_critical',
  SLA_BREACH: 'sla_breach',

  // Notice notifications
  NOTICE_UPLOADED: 'notice_uploaded',
  NOTICE_ANALYZED: 'notice_analyzed',
  NOTICE_HIGH_RISK: 'notice_high_risk',
  NOTICE_ASSIGNED: 'notice_assigned',

  // Task notifications
  TASK_ASSIGNED: 'task_assigned',
  TASK_DUE_SOON: 'task_due_soon',
  TASK_OVERDUE: 'task_overdue',
  TASK_COMPLETED: 'task_completed',

  // Collaboration notifications
  COMMENT_ADDED: 'comment_added',
  USER_MENTIONED: 'user_mentioned',
  DOCUMENT_REQUESTED: 'document_requested',
  DOCUMENT_RECEIVED: 'document_received',

  // Account notifications
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  LOGIN_ALERT: 'login_alert',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
} as const

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType]

// Category constants
export const NotificationCategory = {
  DEADLINE: 'deadline',
  SLA: 'sla',
  NOTICE: 'notice',
  TASK: 'task',
  COLLABORATION: 'collaboration',
  ACCOUNT: 'account',
} as const

export type NotificationCategoryValue = typeof NotificationCategory[keyof typeof NotificationCategory]

// Priority constants
export const NotificationPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export type NotificationPriorityValue = typeof NotificationPriority[keyof typeof NotificationPriority]

// Filter types
export interface NotificationFilters {
  status?: 'read' | 'unread' | 'all'
  type?: string
  category?: string
  since?: string
  page?: number
  pageSize?: number
}

// Real-time notification event
export interface NotificationEvent {
  type: 'new' | 'read' | 'readAll' | 'delete'
  notification?: Notification
  notificationId?: string
  unreadCount: number
}
