'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckSquare,
  TrendingUp,
  Upload,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MetricCard,
  DeadlineList,
  ActivityFeed,
  NoticesByStatusChart,
  NoticesByPriorityChart,
} from '@/components/features/dashboard'
import { useDashboard } from '@/hooks/use-dashboard'
import { useAuthStore } from '@/stores/auth-store'
import { formatCurrency } from '@/lib/utils'

type DateRangeOption = '7d' | '30d' | '90d' | '1y' | 'all'

function getDateRange(range: DateRangeOption): { startDate?: string; endDate?: string } {
  if (range === 'all') return {}

  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  let startDate: string

  switch (range) {
    case '7d':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case '30d':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case '90d':
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case '1y':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    default:
      return {}
  }

  return { startDate, endDate }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState<DateRangeOption>('all')
  const params = getDateRange(dateRange)
  const { data, isLoading, error } = useDashboard(params)

  const firstName = user?.name?.split(' ')[0] || 'there'

  // Calculate compliance score as percentage of closed notices
  const complianceScore = data?.notices
    ? data.notices.total > 0
      ? Math.round((data.notices.closed / data.notices.total) * 100)
      : 100
    : undefined

  // Build status chart data from individual counts
  const noticesByStatus: Record<string, number> | undefined = data?.notices
    ? {
        open: data.notices.open,
        closed: data.notices.closed,
        processing: data.notices.processing,
        in_progress: data.notices.inProgress,
      }
    : undefined

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your GST notices and tasks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeOption)}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/notices/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Notice
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Notices"
          value={data?.notices?.open ?? '—'}
          icon={FileText}
          isLoading={isLoading}
        />
        <MetricCard
          title="Due This Week"
          value={data?.deadlines?.dueThisWeek ?? '—'}
          icon={Clock}
          variant={
            data?.deadlines?.dueThisWeek && data.deadlines.dueThisWeek > 5
              ? 'warning'
              : 'default'
          }
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending Tasks"
          value={data?.tasks?.pending ?? '—'}
          icon={CheckSquare}
          isLoading={isLoading}
        />
        <MetricCard
          title="Compliance Score"
          value={complianceScore !== undefined ? `${complianceScore}%` : '—'}
          icon={TrendingUp}
          variant={
            complianceScore !== undefined && complianceScore >= 80
              ? 'success'
              : complianceScore !== undefined && complianceScore < 60
                ? 'danger'
                : 'default'
          }
          isLoading={isLoading}
        />
      </div>

      {/* Additional Stats Row */}
      {data?.notices && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Notices</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.notices.overdue}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Demand Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.notices.totalDemandAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Deadlines */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/notices?sort=deadline">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DeadlineList
              deadlines={data?.deadlines?.next7Days ?? []}
              isLoading={isLoading}
              emptyMessage="No upcoming deadlines. Upload a notice to get started."
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={data?.activity?.items ?? []}
              isLoading={isLoading}
              emptyMessage="No recent activity"
              maxHeight="350px"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <NoticesByStatusChart
          data={noticesByStatus}
          isLoading={isLoading}
        />
        <NoticesByPriorityChart
          data={data?.notices?.byPriority ?? {}}
          isLoading={isLoading}
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load dashboard data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
