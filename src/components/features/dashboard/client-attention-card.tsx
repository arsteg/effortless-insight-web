'use client'

import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGstinSummaries } from '@/hooks/use-notices'
import { useGstClients } from '@/hooks/use-gst-sync'

/**
 * "Clients needing attention" — the CA's morning answer at a glance.
 * Lists clients with overdue notices (worst first); each row deep-links to
 * the Notices page pre-filtered to that client. Hidden when nothing is overdue.
 */
export function ClientAttentionCard() {
  const { data: summaries } = useGstinSummaries()
  const { data: clientsData } = useGstClients({ pageSize: 100 })

  const needingAttention = (summaries ?? [])
    .filter((s) => s.overdueCount > 0)
    .slice(0, 6)

  if (needingAttention.length === 0) {
    return null
  }

  const nameFor = (gstin: string) => {
    const client = clientsData?.items.find((c) => c.gstin === gstin)
    return client?.tradeName || client?.legalName || client?.clientName || gstin
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Clients needing attention
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/notices?overdue=true">
            View all overdue
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {needingAttention.map((summary) => (
          <Link
            key={summary.gstin}
            href={`/notices?gstin=${encodeURIComponent(summary.gstin)}&overdue=true`}
            className="flex items-center justify-between rounded-md border p-2.5 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{nameFor(summary.gstin)}</p>
              <p className="text-xs text-muted-foreground">{summary.gstin}</p>
            </div>
            <Badge variant="destructive" className="shrink-0">
              {summary.overdueCount} overdue
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
