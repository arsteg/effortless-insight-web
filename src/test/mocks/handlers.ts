// Mock API responses for testing
// This file can be extended with MSW (Mock Service Worker) handlers

import type {
  User,
  DashboardMetrics,
  NoticeListResponse,
  MemberListResponse,
} from '@/types'

export const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  mobileVerified: false,
  is2faEnabled: false,
  role: 'admin',
  organizations: [
    { id: 'org-1', name: 'Test Organization', role: 'admin' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockDashboardResponse: DashboardMetrics = {
  notices: {
    total: 45,
    open: 38,
    closed: 7,
    overdue: 2,
    processing: 5,
    inProgress: 8,
    uploadedThisWeek: 3,
    closedThisWeek: 1,
    totalDemandAmount: 1500000,
    byType: {
      'ASMT-10': 15,
      'DRC-01': 10,
      'DRC-07': 8,
      'other': 12,
    },
    byPriority: {
      low: 10,
      medium: 20,
      high: 10,
      critical: 5,
    },
  },
  tasks: {
    total: 25,
    pending: 12,
    inProgress: 5,
    completed: 8,
    completedThisWeek: 3,
    overdue: 2,
    blocked: 0,
    onHold: 0,
    avgCompletionTimeHours: 24,
    byPriority: {
      low: 5,
      medium: 12,
      high: 6,
      critical: 2,
    },
  },
  workflows: {
    activeWorkflows: 15,
    completedWorkflows: 10,
    completedThisWeek: 2,
    avgCompletionTimeHours: 48,
    slaBreaches: 1,
    atRiskWorkflows: 3,
    byStatus: {
      active: 15,
      completed: 10,
      cancelled: 2,
    },
  },
  deadlines: {
    next7Days: [
      {
        id: 'deadline-1',
        type: 'notice',
        title: 'GST/2024/001',
        dueDate: '2024-02-15',
        daysRemaining: 5,
        isOverdue: false,
        priority: 'high',
        noticeId: 'notice-1',
        noticeNumber: 'GST/2024/001',
      },
    ],
    totalUpcoming: 8,
    overdueCount: 2,
    dueToday: 1,
    dueTomorrow: 2,
    dueThisWeek: 5,
  },
  activity: {
    items: [
      {
        id: 'activity-1',
        type: 'notice_uploaded',
        message: 'uploaded notice GST/2024/001',
        timestamp: '2024-02-10T10:00:00Z',
        actor: {
          id: 'user-1',
          name: 'Test User',
          avatarUrl: undefined,
        },
        noticeId: 'notice-1',
        noticeNumber: 'GST/2024/001',
      },
    ],
    totalToday: 5,
    totalThisWeek: 25,
  },
  generatedAt: '2024-02-10T12:00:00Z',
}

export const mockNoticeListResponse: NoticeListResponse = {
  notices: [
    {
      id: 'notice-1',
      noticeNumber: 'GST/2024/001',
      noticeType: 'ASMT-10',
      gstin: '27AABCU9603R1ZM',
      status: 'in_progress',
      priority: 'high',
      responseDeadline: '2024-02-15T00:00:00Z',
      taxAmount: 50000,
      createdAt: '2024-02-01T00:00:00Z',
    },
  ],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
}

export const mockMemberListResponse: MemberListResponse = {
  members: [
    {
      id: 'member-1',
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
      role: 'admin',
      isExternal: false,
      status: 'active',
      joinedAt: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
}
