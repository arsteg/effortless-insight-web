'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage } from './chat-message'
import { TypingIndicator } from './typing-indicator'
import type { MessageDto } from '@/types/ai-chat'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatMessageListProps {
  messages: MessageDto[]
  isStreaming?: boolean
  isTyping?: boolean
  onRegenerate?: (messageId: string) => void
  onFeedback?: (messageId: string, rating: 1 | -1) => void
  isRegenerating?: boolean
  className?: string
}

export function ChatMessageList({
  messages,
  isStreaming = false,
  isTyping = false,
  onRegenerate,
  onFeedback,
  isRegenerating = false,
  className,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Find the last assistant message for regeneration
  const lastAssistantMessageIndex = messages
    .map((m, i) => ({ message: m, index: i }))
    .filter(({ message }) => message.role === 'assistant')
    .pop()?.index

  return (
    <ScrollArea className={cn('flex-1', className)} ref={scrollRef}>
      <div className="px-4 py-4 space-y-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-foreground mb-1">
              Start a conversation
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask questions about this notice and get AI-powered insights based on
              the document and analysis.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isLastAssistant = index === lastAssistantMessageIndex
              const isCurrentlyStreaming =
                isStreaming && message.id.startsWith('streaming-')

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isCurrentlyStreaming}
                  onRegenerate={
                    isLastAssistant && onRegenerate && !isStreaming
                      ? () => onRegenerate(message.id)
                      : undefined
                  }
                  onFeedback={
                    message.role === 'assistant' && onFeedback
                      ? (rating) => onFeedback(message.id, rating)
                      : undefined
                  }
                  isRegenerating={isRegenerating && isLastAssistant}
                />
              )
            })}
          </>
        )}

        {isTyping && !isStreaming && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
