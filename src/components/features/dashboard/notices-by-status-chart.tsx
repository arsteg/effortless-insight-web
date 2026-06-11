'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface NoticesByStatusChartProps {
  data?: Record<string, number>
  isLoading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  uploaded: '#3b82f6',    // blue
  processing: '#8b5cf6',  // purple
  analyzed: '#06b6d4',    // cyan
  in_progress: '#f59e0b', // amber
  responded: '#22c55e',   // green
  closed: '#6b7280',      // gray
  archived: '#9ca3af',    // light gray
  failed: '#ef4444',      // red
}

const STATUS_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  analyzed: 'Analyzed',
  in_progress: 'In Progress',
  responded: 'Responded',
  closed: 'Closed',
  archived: 'Archived',
  failed: 'Failed',
}

export function NoticesByStatusChart({
  data,
  isLoading = false,
}: NoticesByStatusChartProps) {
  const chartData = Object.entries(data || {})
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || '#6b7280',
    }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notices by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notices by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No notices to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notices by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  'Count',
                ]}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
