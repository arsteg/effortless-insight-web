'use client'

import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex gap-3 py-4', className)}>
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>

      {/* Typing animation */}
      <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3">
        <span className="sr-only">AI is typing</span>
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" />
      </div>
    </div>
  )
}
