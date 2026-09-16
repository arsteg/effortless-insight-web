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

// Domain risk color language (see DESIGN_SYSTEM.md): mint / amber / coral.
const RISK_CONFIG: Record<RiskLevel, { label: string; dot: string; bgColor: string; textColor: string }> = {
  low: { label: 'Low Risk', dot: 'bg-mint-500', bgColor: 'bg-mint-50 dark:bg-mint-500/15', textColor: 'text-mint-700 dark:text-mint-300' },
  medium: { label: 'Medium Risk', dot: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-500/15', textColor: 'text-amber-700 dark:text-amber-300' },
  high: { label: 'High Risk', dot: 'bg-coral-500', bgColor: 'bg-coral-50 dark:bg-coral-500/15', textColor: 'text-coral-700 dark:text-coral-300' },
  critical: { label: 'Critical Risk', dot: 'bg-coral-600', bgColor: 'bg-coral-100 ring-1 ring-coral-500/25 dark:bg-coral-500/20', textColor: 'text-coral-800 dark:text-coral-200' },
}

export function RiskBadge({ score, level, showScore = true, className }: RiskBadgeProps) {
  const riskLevel = level || (score !== undefined ? getRiskLevel(score) : 'low')
  const config = RISK_CONFIG[riskLevel]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)} aria-hidden />
      {showScore && score !== undefined && (
        <span className="font-bold nums">{score}</span>
      )}
      <span>{config.label}</span>
    </span>
  )
}
