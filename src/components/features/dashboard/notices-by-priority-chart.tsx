'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface NoticesByPriorityChartProps {
  data?: Record<string, number>
  isLoading?: boolean
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',      // green
  medium: '#3b82f6',   // blue
  high: '#f59e0b',     // amber
  critical: '#ef4444', // red
}

const PRIORITY_ORDER = ['low', 'medium', 'high', 'critical']

export function NoticesByPriorityChart({
  data,
  isLoading = false,
}: NoticesByPriorityChartProps) {
  const safeData = data || {}
  const chartData = PRIORITY_ORDER
    .filter((priority) => safeData[priority] !== undefined)
    .map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: safeData[priority] || 0,
      color: PRIORITY_COLORS[priority],
    }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notices by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end justify-around gap-4 px-4">
            {[100, 150, 80, 60].map((height, i) => (
              <Skeleton key={i} className="w-12" style={{ height: `${height}px` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.every((item) => item.value === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notices by Priority</CardTitle>
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
        <CardTitle>Notices by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                formatter={(value: number) => [value, 'Notices']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
