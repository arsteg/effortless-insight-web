import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Fixed, non-AI-generated disclaimer shown wherever AI output is presented
 * (analysis, generated drafts, exports). Kept as a constant so the wording is
 * consistent and never depends on the model to produce it.
 */
export const AI_DISCLAIMER_TEXT =
  'AI-generated for guidance only — not legal or tax advice. Verify all amounts, ' +
  'deadlines, and legal references against the original notice, and have a qualified ' +
  'professional (e.g. your CA) review before acting or filing.'

export function AIDisclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900',
        'dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{AI_DISCLAIMER_TEXT}</span>
    </div>
  )
}
