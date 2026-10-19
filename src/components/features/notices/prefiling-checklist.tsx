'use client'

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  FileText,
  Calculator,
  Scale,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PreFilingChecklistItem } from '@/types'

interface PrefilingChecklistProps {
  items: PreFilingChecklistItem[]
}

const categoryConfig: Record<
  PreFilingChecklistItem['category'],
  { label: string; icon: typeof Clock; color: string }
> = {
  limitation: { label: 'Limitation', icon: Clock, color: 'text-purple-500' },
  documents: { label: 'Documents', icon: FileText, color: 'text-azure-500' },
  calculations: { label: 'Calculations', icon: Calculator, color: 'text-amber-500' },
  deadlines: { label: 'Deadlines', icon: Clock, color: 'text-coral-500' },
  procedural: { label: 'Procedural', icon: Scale, color: 'text-indigo-500' },
  compliance: { label: 'Compliance', icon: Shield, color: 'text-mint-500' },
}

const statusConfig: Record<
  PreFilingChecklistItem['status'],
  { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }
> = {
  pass: {
    icon: CheckCircle2,
    color: 'text-mint-600 dark:text-mint-400',
    bgColor: 'bg-mint-50 dark:bg-mint-950/30',
    label: 'Pass',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    label: 'Warning',
  },
  fail: {
    icon: XCircle,
    color: 'text-coral-600 dark:text-coral-400',
    bgColor: 'bg-coral-50 dark:bg-coral-950/30',
    label: 'Fail',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    label: 'Unknown',
  },
}

function groupByCategory(items: PreFilingChecklistItem[]) {
  const groups: Record<string, PreFilingChecklistItem[]> = {}
  for (const item of items) {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  }
  return groups
}

export function PrefilingChecklist({ items }: PrefilingChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(categoryConfig))
  )

  if (!items || items.length === 0) {
    return null
  }

  const grouped = groupByCategory(items)

  // Calculate summary counts
  const summary = {
    pass: items.filter((i) => i.status === 'pass').length,
    warning: items.filter((i) => i.status === 'warning').length,
    fail: items.filter((i) => i.status === 'fail').length,
    unknown: items.filter((i) => i.status === 'unknown').length,
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-azure-500" />
            Pre-filing Review Checklist
          </span>
          <div className="flex gap-2">
            {summary.fail > 0 && (
              <Badge variant="danger" className="text-xs">
                {summary.fail} fail
              </Badge>
            )}
            {summary.warning > 0 && (
              <Badge variant="warning" className="text-xs">
                {summary.warning} warning
              </Badge>
            )}
            {summary.pass > 0 && (
              <Badge variant="success" className="text-xs">
                {summary.pass} pass
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([category, categoryItems]) => {
          const config = categoryConfig[category as PreFilingChecklistItem['category']]
          const Icon = config?.icon || FileText
          const isExpanded = expandedCategories.has(category)

          // Sort by priority
          const sortedItems = [...categoryItems].sort((a, b) => a.priority - b.priority)

          // Count statuses in this category
          const hasIssues = sortedItems.some(
            (i) => i.status === 'fail' || i.status === 'warning'
          )

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left',
                  'hover:bg-muted/50 transition-colors',
                  hasIssues ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', config?.color || 'text-muted-foreground')} />
                  <span className="font-medium">{config?.label || category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({sortedItems.length} items)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {sortedItems.some((i) => i.status === 'fail') && (
                    <XCircle className="h-4 w-4 text-coral-500" />
                  )}
                  {sortedItems.some((i) => i.status === 'warning') && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                  {sortedItems.map((item, index) => {
                    const statusConf = statusConfig[item.status]
                    const StatusIcon = statusConf.icon

                    return (
                      <div
                        key={index}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm',
                          statusConf.bgColor
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <StatusIcon
                            className={cn('h-4 w-4 mt-0.5 shrink-0', statusConf.color)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.item}</span>
                              {item.priority === 1 && (
                                <Badge variant="danger" className="text-xs px-1 py-0">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            {item.details && (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {item.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
