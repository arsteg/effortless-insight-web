'use client'

import {
  FileText,
  CheckCircle2,
  Clock,
  IndianRupee,
  TrendingUp,
  Calendar,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ReportsOverview } from '@/types'

interface OverviewCardsProps {
  overview?: ReportsOverview
  isLoading?: boolean
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function OverviewCards({ overview, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Notices',
      value: overview?.totalNotices || 0,
      description: `${overview?.resolvedNotices || 0} resolved, ${overview?.pendingNotices || 0} pending`,
      icon: FileText,
    },
    {
      title: 'Resolution Rate',
      value: overview?.totalNotices
        ? `${Math.round(((overview?.resolvedNotices || 0) / overview.totalNotices) * 100)}%`
        : '0%',
      description: `Avg. ${overview?.avgResolutionDays || 0} days to resolve`,
      icon: CheckCircle2,
    },
    {
      title: 'Total Demand',
      value: formatCurrency(overview?.totalDemandAmount || 0),
      description: `${formatCurrency(overview?.pendingAmount || 0)} pending`,
      icon: IndianRupee,
    },
    {
      title: 'Compliance Score',
      value: `${overview?.complianceScore || 0}%`,
      description: 'Based on timely responses',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
