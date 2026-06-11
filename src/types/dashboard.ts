// Dashboard types

export interface DashboardMetrics {
  activeNotices: number
  dueThisWeek: number
  pendingTasks: number
  complianceScore: number
  overdueNotices: number
  totalDemandAmount: number
  // Trends (change from last period)
  activeNoticesTrend?: number
  dueThisWeekTrend?: number
  pendingTasksTrend?: number
  complianceScoreTrend?: number
}

export interface UpcomingDeadline {
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

export interface ActivityItem {
  id: string
  type: 'notice_uploaded' | 'notice_assigned' | 'notice_status_changed' | 'task_completed' | 'comment_added' | 'response_submitted' | 'deadline_approaching'
  title: string
  description: string
  entityId?: string
  entityType?: 'notice' | 'task' | 'comment' | 'response'
  userId: string
  userName: string
  userAvatar?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface DashboardResponse {
  metrics: DashboardMetrics
  upcomingDeadlines: UpcomingDeadline[]
  recentActivity: ActivityItem[]
  noticesByStatus: Record<string, number>
  noticesByPriority: Record<string, number>
}
