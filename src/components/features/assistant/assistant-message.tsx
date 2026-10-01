'use client'

import { Bot, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { FormattedContent } from '@/components/features/ai-chat/chat-message'
import { Badge } from '@/components/ui/badge'
import { AssistantActions } from './assistant-actions'
import type { AssistantAction } from '@/types/assistant'

interface AssistantBubbleProps {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  actions?: AssistantAction[] | null
  isError?: boolean
  isStreaming?: boolean
  activeTool?: string | null
}

const TOOL_LABELS: Record<string, string> = {
  get_notices: 'Checking your notices…',
  get_notice: 'Reading the notice…',
  get_notice_report: 'Reading the AI analysis…',
  get_notice_statistics: 'Checking your stats…',
  get_upcoming_deadlines: 'Checking deadlines…',
  get_my_tasks: 'Checking your tasks…',
  get_subscription_usage: 'Checking your plan…',
  get_members: 'Checking your team…',
}

export function AssistantBubble({
  role,
  content,
  citations,
  actions,
  isError,
  isStreaming,
  activeTool,
}: AssistantBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-azure-600 px-3.5 py-2 text-sm text-white">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lavender-100 dark:bg-lavender-900">
        <Bot className="h-3.5 w-3.5 text-lavender-600 dark:text-lavender-300" />
      </div>
      <div className="min-w-0 max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm',
            isError
              ? 'bg-coral-50 text-coral-700 dark:bg-coral-950/40 dark:text-coral-300'
              : 'bg-muted'
          )}
        >
          {activeTool && (
            <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {TOOL_LABELS[activeTool] ?? 'Working…'}
            </p>
          )}
          {content ? (
            <FormattedContent content={content} />
          ) : (
            isStreaming &&
            !activeTool && (
              <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-foreground/50" />
            )
          )}
        </div>

        {!!citations?.length && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {citations.map((citation) => (
              <Badge key={citation} variant="outline" className="text-[10px]">
                {citation}
              </Badge>
            ))}
          </div>
        )}

        {!!actions?.length && <AssistantActions actions={actions} />}
      </div>
    </div>
  )
}
