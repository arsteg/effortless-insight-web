// Report types

export interface MonthlyTrend {
  month: string
  year: number
  noticesReceived: number
  noticesResolved: number
  totalDemand: number
  complianceScore: number
}

export interface NoticeTypeBreakdown {
  type: string
  count: number
  percentage: number
  totalDemand: number
}

export interface GstinSummary {
  gstin: string
  stateName: string
  tradeName?: string
  activeNotices: number
  resolvedNotices: number
  pendingAmount: number
  resolvedAmount: number
}

export interface ReportsOverview {
  totalNotices: number
  resolvedNotices: number
  pendingNotices: number
  totalDemandAmount: number
  resolvedAmount: number
  pendingAmount: number
  avgResolutionDays: number
  complianceScore: number
}

export interface ReportsResponse {
  overview: ReportsOverview
  monthlyTrend: MonthlyTrend[]
  noticesByType: NoticeTypeBreakdown[]
  noticesByStatus: Record<string, number>
  noticesByPriority: Record<string, number>
  gstinSummary: GstinSummary[]
  periodStart: string
  periodEnd: string
}

export interface ReportsParams {
  startDate?: string
  endDate?: string
  gstin?: string
  noticeType?: string
}
