'use client'

import { useState } from 'react'
import { Calendar, Download, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  OverviewCards,
  MonthlyTrendChart,
  GstinSummaryTable,
  NoticeTypeChart,
} from '@/components/features/reports'
import { NoticesByStatusChart, NoticesByPriorityChart } from '@/components/features/dashboard'
import { useReports, useExportReports } from '@/hooks/use-reports'

type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

function getDateRange(range: DateRange): { startDate?: string; endDate?: string } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]

  switch (range) {
    case '7d':
      return {
        startDate: new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0],
        endDate,
      }
    case '30d':
      return {
        startDate: new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0],
        endDate,
      }
    case '90d':
      return {
        startDate: new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0],
        endDate,
      }
    case '1y':
      return {
        startDate: new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0],
        endDate,
      }
    case 'all':
    default:
      return {}
  }
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const params = getDateRange(dateRange)

  const { data: reports, isLoading } = useReports(params)
  const exportMutation = useExportReports()

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    exportMutation.mutate({ ...params, format })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View analytics and generate compliance reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exportMutation.isPending}>
                {exportMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards overview={reports?.overview} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <NoticesByStatusChart data={reports?.noticesByStatus} isLoading={isLoading} />
        <NoticesByPriorityChart data={reports?.noticesByPriority} isLoading={isLoading} />
      </div>

      {/* Trend Chart */}
      <MonthlyTrendChart data={reports?.monthlyTrend} isLoading={isLoading} />

      {/* Notice Types Chart */}
      <NoticeTypeChart data={reports?.noticesByType} isLoading={isLoading} />

      {/* GSTIN Summary */}
      <GstinSummaryTable data={reports?.gstinSummary} isLoading={isLoading} />

      {/* Period Info */}
      {reports && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              Report generated for period: {new Date(reports.periodStart).toLocaleDateString('en-IN')} to{' '}
              {new Date(reports.periodEnd).toLocaleDateString('en-IN')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
