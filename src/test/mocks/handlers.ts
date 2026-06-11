// Mock API responses for testing
// This file can be extended with MSW (Mock Service Worker) handlers

import type {
  User,
  DashboardResponse,
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

export const mockDashboardResponse: DashboardResponse = {
  metrics: {
    activeNotices: 45,
    dueThisWeek: 8,
    pendingTasks: 12,
    complianceScore: 92,
    overdueNotices: 2,
    totalDemandAmount: 1500000,
    activeNoticesTrend: 5,
    dueThisWeekTrend: -2,
    pendingTasksTrend: 3,
    complianceScoreTrend: 1,
  },
  upcomingDeadlines: [
    {
      noticeId: 'notice-1',
      noticeNumber: 'GST/2024/001',
      noticeType: 'ASMT-10',
      deadline: '2024-02-15T00:00:00Z',
      daysRemaining: 5,
      priority: 'high',
      status: 'in_progress',
      demandAmount: 50000,
    },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'notice_uploaded',
      title: 'Notice uploaded',
      description: 'New notice GST/2024/001 was uploaded',
      userId: 'user-1',
      userName: 'Test User',
      createdAt: '2024-02-10T10:00:00Z',
    },
  ],
  noticesByStatus: {
    uploaded: 10,
    processing: 5,
    analyzed: 15,
    in_progress: 8,
    responded: 5,
    closed: 2,
  },
  noticesByPriority: {
    low: 10,
    medium: 20,
    high: 10,
    critical: 5,
  },
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
