'use client'

import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckSquare,
  TrendingUp,
  Upload,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, error } = useDashboard()

  const firstName = user?.name?.split(' ')[0] || 'there'

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
        <Button asChild>
          <Link href="/notices/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Notice
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Notices"
          value={data?.metrics?.activeNotices ?? '—'}
          trend={data?.metrics?.activeNoticesTrend}
          trendLabel="from last month"
          icon={FileText}
          isLoading={isLoading}
        />
        <MetricCard
          title="Due This Week"
          value={data?.metrics?.dueThisWeek ?? '—'}
          trend={data?.metrics?.dueThisWeekTrend}
          trendLabel="from last week"
          icon={Clock}
          variant={
            data?.metrics?.dueThisWeek && data.metrics.dueThisWeek > 5
              ? 'warning'
              : 'default'
          }
          isLoading={isLoading}
        />
        <MetricCard
          title="Pending Tasks"
          value={data?.metrics?.pendingTasks ?? '—'}
          trend={data?.metrics?.pendingTasksTrend}
          trendLabel="from last week"
          icon={CheckSquare}
          isLoading={isLoading}
        />
        <MetricCard
          title="Compliance Score"
          value={
            data?.metrics?.complianceScore !== undefined
              ? `${data.metrics.complianceScore}%`
              : '—'
          }
          trend={data?.metrics?.complianceScoreTrend}
          trendLabel="from last month"
          icon={TrendingUp}
          variant={
            data?.metrics?.complianceScore && data.metrics.complianceScore >= 80
              ? 'success'
              : data?.metrics?.complianceScore && data.metrics.complianceScore < 60
                ? 'danger'
                : 'default'
          }
          isLoading={isLoading}
        />
      </div>

      {/* Additional Stats Row */}
      {data?.metrics && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Notices</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.metrics.overdueNotices}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Demand Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.metrics.totalDemandAmount)}
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
              deadlines={data?.upcomingDeadlines ?? []}
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
              activities={data?.recentActivity ?? []}
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
          data={data?.noticesByStatus ?? {}}
          isLoading={isLoading}
        />
        <NoticesByPriorityChart
          data={data?.noticesByPriority ?? {}}
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
