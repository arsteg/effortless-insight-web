'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Check,
  Pencil,
} from 'lucide-react'
import type { MessageDto, Citation } from '@/types/ai-chat'

interface ChatMessageProps {
  message: MessageDto
  isStreaming?: boolean
  onRegenerate?: () => void
  onFeedback?: (rating: 1 | -1) => void
  onEdit?: (newContent: string) => void
  isRegenerating?: boolean
}

export function ChatMessage({
  message,
  isStreaming = false,
  onRegenerate,
  onFeedback,
  onEdit,
  isRegenerating = false,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<1 | -1 | null>(
    (message.feedback?.rating ?? null) as 1 | -1 | null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(message.content)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (rating: 1 | -1) => {
    if (feedbackGiven === rating) return
    setFeedbackGiven(rating)
    onFeedback?.(rating)
  }

  const startEditing = () => {
    setEditedContent(message.content)
    setIsEditing(true)
  }

  const submitEdit = () => {
    const trimmed = editedContent.trim()
    setIsEditing(false)
    if (!trimmed || trimmed === message.content) return
    onEdit?.(trimmed)
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex flex-col gap-2 max-w-[85%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Edit mode */}
        {isUser && isEditing ? (
          <div className="w-full min-w-[280px] flex flex-col gap-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitEdit()
                } else if (e.key === 'Escape') {
                  setIsEditing(false)
                }
              }}
              rows={3}
              autoFocus
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={submitEdit}
                disabled={!editedContent.trim()}
              >
                Save & Resend
              </Button>
            </div>
          </div>
        ) : (
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <FormattedContent content={message.content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-foreground/50 animate-pulse" />
              )}
            </div>
          )}
        </div>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {message.citations.map((citation, index) => (
              <CitationBadge key={index} citation={citation} />
            ))}
          </div>
        )}

        {/* Actions and metadata */}
        <div
          className={cn(
            'flex items-center gap-2 text-xs text-muted-foreground',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>

          {isUser && onEdit && !isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={startEditing}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit &amp; resend</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isAssistant && !isStreaming && (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                {/* Copy button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? 'Copied!' : 'Copy message'}
                  </TooltipContent>
                </Tooltip>

                {/* Regenerate button */}
                {onRegenerate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                      >
                        <RefreshCw
                          className={cn(
                            'h-3 w-3',
                            isRegenerating && 'animate-spin'
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate response</TooltipContent>
                  </Tooltip>
                )}

                {/* Feedback buttons */}
                {onFeedback && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6',
                            feedbackGiven === 1 && 'text-green-500'
                          )}
                          onClick={() => handleFeedback(1)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Good response</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6',
                            feedbackGiven === -1 && 'text-red-500'
                          )}
                          onClick={() => handleFeedback(-1)}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Poor response</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}

function CitationBadge({ citation }: { citation: Citation }) {
  const getLabel = () => {
    switch (citation.source) {
      case 'notice':
        return 'Notice'
      case 'analysis':
        return 'Analysis'
      case 'conversation':
        return 'Earlier'
      default:
        return citation.source
    }
  }

  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {getLabel()}
    </span>
  )
}

// Validate URL to prevent XSS via javascript: protocol
function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    // If URL parsing fails, check if it starts with safe protocols
    const lowerUrl = url.toLowerCase().trim()
    return (
      lowerUrl.startsWith('http://') ||
      lowerUrl.startsWith('https://') ||
      lowerUrl.startsWith('mailto:') ||
      lowerUrl.startsWith('/') // relative URLs
    )
  }
}

// Simple markdown-like formatting without external dependencies
function FormattedContent({ content }: { content: string }) {
  // Process the content line by line
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null
  let listKey = 0

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol'
      const listClass = currentList.type === 'ul' ? 'list-disc' : 'list-decimal'
      elements.push(
        <ListTag key={`list-${listKey++}`} className={cn(listClass, 'pl-5 my-2 space-y-1')}>
          {currentList.items.map((item, idx) => (
            <li key={idx}>{formatInline(item)}</li>
          ))}
        </ListTag>
      )
      currentList = null
    }
  }

  lines.forEach((line, idx) => {
    // Check for headers
    const h3Match = line.match(/^###\s+(.+)$/)
    const h2Match = line.match(/^##\s+(.+)$/)
    const h1Match = line.match(/^#\s+(.+)$/)

    // Check for list items
    const ulMatch = line.match(/^[-*]\s+(.+)$/)
    const olMatch = line.match(/^\d+\.\s+(.+)$/)

    if (h1Match) {
      flushList()
      elements.push(
        <h3 key={idx} className="text-lg font-semibold mt-4 mb-2">
          {formatInline(h1Match[1])}
        </h3>
      )
    } else if (h2Match) {
      flushList()
      elements.push(
        <h4 key={idx} className="text-base font-semibold mt-3 mb-1">
          {formatInline(h2Match[1])}
        </h4>
      )
    } else if (h3Match) {
      flushList()
      elements.push(
        <h5 key={idx} className="text-sm font-semibold mt-2 mb-1">
          {formatInline(h3Match[1])}
        </h5>
      )
    } else if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList()
        currentList = { type: 'ul', items: [] }
      }
      currentList.items.push(ulMatch[1])
    } else if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList()
        currentList = { type: 'ol', items: [] }
      }
      currentList.items.push(olMatch[1])
    } else if (line.trim() === '') {
      flushList()
      elements.push(<br key={idx} />)
    } else {
      flushList()
      elements.push(
        <p key={idx} className="my-1">
          {formatInline(line)}
        </p>
      )
    }
  })

  flushList()

  return <>{elements}</>
}

// Format inline elements (bold, italic, code, links)
function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0

  // Combined regex for inline formatting
  const inlineRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g
  let match

  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // Bold **text**
      parts.push(
        <strong key={key++} className="font-semibold">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // Italic *text*
      parts.push(
        <em key={key++} className="italic">
          {match[3]}
        </em>
      )
    } else if (match[4]) {
      // Code `text`
      parts.push(
        <code key={key++} className="bg-muted-foreground/20 rounded px-1 py-0.5 text-sm font-mono">
          {match[4]}
        </code>
      )
    } else if (match[5] && match[6]) {
      // Link [text](url) - only render as link if URL is safe
      const url = match[6]
      if (isUrlSafe(url)) {
        parts.push(
          <a
            key={key++}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {match[5]}
          </a>
        )
      } else {
        // Render unsafe URLs as plain text
        parts.push(<span key={key++}>{match[5]}</span>)
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
