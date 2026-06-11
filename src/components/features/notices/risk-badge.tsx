'use client'

import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types'

interface RiskBadgeProps {
  score?: number
  level?: RiskLevel
  showScore?: boolean
  className?: string
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const RISK_CONFIG: Record<RiskLevel, { label: string; bgColor: string; textColor: string }> = {
  low: { label: 'Low Risk', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400' },
  medium: { label: 'Medium Risk', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400' },
  high: { label: 'High Risk', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-400' },
  critical: { label: 'Critical Risk', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400' },
}

export function RiskBadge({ score, level, showScore = true, className }: RiskBadgeProps) {
  const riskLevel = level || (score !== undefined ? getRiskLevel(score) : 'low')
  const config = RISK_CONFIG[riskLevel]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {showScore && score !== undefined && (
        <span className="font-bold">{score}</span>
      )}
      <span>{config.label}</span>
    </span>
  )
}
