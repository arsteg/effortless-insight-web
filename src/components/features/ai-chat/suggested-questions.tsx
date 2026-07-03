'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Lightbulb, Loader2 } from 'lucide-react'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function SuggestedQuestions({
  questions,
  onSelect,
  isLoading = false,
  disabled = false,
  className,
}: SuggestedQuestionsProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading suggestions...</span>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>Suggested questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className={cn(
              'h-auto whitespace-normal text-left py-2 px-3',
              'hover:bg-primary/5 hover:border-primary/20',
              'transition-colors'
            )}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
