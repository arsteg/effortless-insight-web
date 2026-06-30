// Dashboard types - matching backend DashboardMetrics from AnalyticsController

export interface NoticeMetrics {
  total: number
  open: number
  closed: number
  overdue: number
  processing: number
  inProgress: number
  uploadedThisWeek: number
  closedThisWeek: number
  totalDemandAmount: number
  byType: Record<string, number>
  byPriority: Record<string, number>
}

export interface TaskMetrics {
  total: number
  pending: number
  inProgress: number
  completed: number
  completedThisWeek: number
  overdue: number
  blocked: number
  onHold: number
  avgCompletionTimeHours: number
  byPriority: Record<string, number>
}

export interface WorkflowMetrics {
  activeWorkflows: number
  completedWorkflows: number
  completedThisWeek: number
  avgCompletionTimeHours: number
  slaBreaches: number
  atRiskWorkflows: number
  byStatus: Record<string, number>
}

export interface DeadlineItem {
  id: string
  type: 'notice' | 'task'
  title: string
  dueDate: string
  daysRemaining: number
  isOverdue: boolean
  priority: string
  noticeId?: string
  noticeNumber?: string
}

export interface UpcomingDeadlines {
  next7Days: DeadlineItem[]
  totalUpcoming: number
  overdueCount: number
  dueToday: number
  dueTomorrow: number
  dueThisWeek: number
}

export interface ActivityActorInfo {
  id: string
  name: string
  avatarUrl?: string
}

export interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  actor?: ActivityActorInfo
  noticeId?: string
  noticeNumber?: string
}

export interface RecentActivity {
  items: ActivityItem[]
  totalToday: number
  totalThisWeek: number
}

export interface DashboardMetrics {
  notices: NoticeMetrics
  tasks: TaskMetrics
  workflows: WorkflowMetrics
  deadlines: UpcomingDeadlines
  activity: RecentActivity
  generatedAt: string
  periodStart?: string // YYYY-MM-DD format, present when date filtering is applied
  periodEnd?: string // YYYY-MM-DD format, present when date filtering is applied
}

// Alias for backward compatibility with hook return type
export type DashboardResponse = DashboardMetrics

// Legacy types kept for reference (can be removed later)
export interface LegacyDashboardMetrics {
  activeNotices: number
  dueThisWeek: number
  pendingTasks: number
  complianceScore: number
  overdueNotices: number
  totalDemandAmount: number
  activeNoticesTrend?: number
  dueThisWeekTrend?: number
  pendingTasksTrend?: number
  complianceScoreTrend?: number
}

export interface LegacyUpcomingDeadline {
  noticeId: string
  noticeNumber: string
  noticeType: string
  gstin?: string
  deadline: string
  daysRemaining: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  demandAmount?: number
  assignedToName?: string
}
