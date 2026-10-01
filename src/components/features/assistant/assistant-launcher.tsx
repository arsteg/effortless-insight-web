'use client'

import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAssistantStore } from '@/stores/assistant-store'
import { FeatureCodes, useFeatureAccess } from '@/hooks/use-feature-access'

/**
 * Floating launcher for the EI Assistant — a labeled "Ask AI" pill fixed at
 * the bottom-right corner. Hidden while the panel is open, and hidden
 * entirely on plans without AI features (free "Notify Only"): AI turns cost
 * money, and the backend enforces the same gate server-side.
 */
export function AssistantLauncher() {
  const { isOpen, open } = useAssistantStore()
  const { hasAccess, isLoading } = useFeatureAccess(FeatureCodes.AiExplanation)

  if (isOpen || isLoading || !hasAccess) return null

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Ask the AI assistant"
      data-testid="assistant-launcher"
      className={cn(
        'fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full pl-4 pr-5',
        'bg-gradient-to-r from-lavender-600 via-lavender-500 to-azure-500 text-white',
        'shadow-lg shadow-lavender-500/40 ring-1 ring-white/20',
        'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-lavender-500/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-400 focus-visible:ring-offset-2'
      )}
    >
      <Sparkles className="h-5 w-5" />
      <span className="text-sm font-semibold tracking-wide">Ask AI</span>
    </button>
  )
}
