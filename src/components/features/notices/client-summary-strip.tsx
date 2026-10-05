'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGstinSummaries } from '@/hooks/use-notices'
import { useGstClients } from '@/hooks/use-gst-sync'
import type { NoticeFilters as NoticeFiltersType } from '@/types'

interface ClientSummaryStripProps {
  filters: NoticeFiltersType
  onFiltersChange: (filters: NoticeFiltersType) => void
}

/** One business = one card. Multi-state clients (same PAN, several GSTINs)
 * are grouped: their card aggregates counts and filters by PAN; single-GSTIN
 * clients filter by GSTIN. Clicking the selected card clears the filter.
 * Hidden when the org has no GSTIN-linked notices. */
export function ClientSummaryStrip({ filters, onFiltersChange }: ClientSummaryStripProps) {
  const { data: summaries } = useGstinSummaries()
  const { data: clientsData } = useGstClients({ pageSize: 100 })

  if (!summaries || summaries.length === 0) {
    return null
  }

  const nameFor = (gstin: string) => {
    const client = clientsData?.items.find((c) => c.gstin === gstin)
    return client?.tradeName || client?.legalName || client?.clientName || gstin
  }

  // Group by PAN (GSTIN chars 3-12) — one business across its state registrations
  const groups = new Map<
    string,
    { gstins: string[]; totalCount: number; overdueCount: number }
  >()
  for (const summary of summaries) {
    const pan = summary.gstin.substring(2, 12)
    const group = groups.get(pan) ?? { gstins: [], totalCount: 0, overdueCount: 0 }
    group.gstins.push(summary.gstin)
    group.totalCount += summary.totalCount
    group.overdueCount += summary.overdueCount
    groups.set(pan, group)
  }

  const cards = [...groups.entries()]
    .map(([pan, group]) => ({ pan, ...group }))
    .sort((a, b) => b.overdueCount - a.overdueCount || b.totalCount - a.totalCount)

  const toggleCard = (card: (typeof cards)[number]) => {
    const isMulti = card.gstins.length > 1
    const selected = isMulti ? filters.pan === card.pan : filters.gstin === card.gstins[0]
    onFiltersChange({
      ...filters,
      pan: !selected && isMulti ? card.pan : undefined,
      gstin: !selected && !isMulti ? card.gstins[0] : undefined,
      page: 1,
    })
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1" role="group" aria-label="Filter notices by client">
      {cards.map((card) => {
        const isMulti = card.gstins.length > 1
        const selected = isMulti ? filters.pan === card.pan : filters.gstin === card.gstins[0]
        return (
          <button
            key={card.pan}
            type="button"
            onClick={() => toggleCard(card)}
            aria-pressed={selected}
            className={cn(
              'flex min-w-[180px] shrink-0 flex-col items-start gap-1 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50',
              selected && 'border-primary ring-1 ring-primary'
            )}
          >
            <span className="max-w-[220px] truncate text-sm font-medium">
              {nameFor(card.gstins[0])}
            </span>
            <span className="text-xs text-muted-foreground">
              {isMulti ? `${card.gstins.length} GSTINs (PAN ${card.pan})` : card.gstins[0]}
            </span>
            <span className="flex items-center gap-2 text-xs">
              <span className="font-semibold">{card.totalCount}</span>
              <span className="text-muted-foreground">
                notice{card.totalCount === 1 ? '' : 's'}
              </span>
              {card.overdueCount > 0 && (
                <Badge variant="destructive" className="gap-1 px-1.5 py-0 text-[11px]">
                  <AlertTriangle className="h-3 w-3" />
                  {card.overdueCount} overdue
                </Badge>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
