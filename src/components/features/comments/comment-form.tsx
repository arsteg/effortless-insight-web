'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Lock, AtSign, Smile } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  MentionAutocomplete,
  useMentionAutocomplete,
  insertMention,
  parseMentions,
} from './mention-autocomplete'
import { ALLOWED_REACTIONS } from '@/types/collaboration'
import type { CommentVisibility } from '@/types/collaboration'

interface MentionUser {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
}

interface CommentFormProps {
  onSubmit: (content: string, visibility?: CommentVisibility, attachmentUrls?: string[]) => void
  onCancel?: () => void
  availableUsers?: MentionUser[]
  isLoading?: boolean
  placeholder?: string
  submitLabel?: string
  showVisibilityToggle?: boolean
  defaultVisibility?: CommentVisibility
  initialContent?: string
  isEditing?: boolean
  className?: string
}

export function CommentForm({
  onSubmit,
  onCancel,
  availableUsers = [],
  isLoading = false,
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  showVisibilityToggle = true,
  defaultVisibility = 'all',
  initialContent = '',
  isEditing = false,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent)
  const [visibility, setVisibility] = useState<CommentVisibility>(defaultVisibility)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mention = useMentionAutocomplete(availableUsers)

  // Reset content when initialContent changes (for edit mode)
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    // Extract mentions from content
    const mentions = parseMentions(content)

    onSubmit(content.trim(), showVisibilityToggle ? visibility : undefined)
    // Note: Form content is cleared by parent component on success via key prop
    // This preserves content if the submission fails
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't submit if mention autocomplete is open
    if (mention.isOpen) return

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (content.trim()) {
        onSubmit(content.trim(), showVisibilityToggle ? visibility : undefined)
        // Note: Form content is cleared by parent component on success via key prop
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart
    setContent(newValue)

    // Check for @ trigger
    const textBeforeCursor = newValue.slice(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      // Check if it's a valid mention trigger (no spaces or special chars after @)
      const isValidTrigger = /^[a-zA-Z0-9]*$/.test(textAfterAt) && textAfterAt.length <= 20

      if (isValidTrigger && availableUsers.length > 0) {
        // Get position for autocomplete
        const textarea = textareaRef.current
        if (textarea) {
          const rect = textarea.getBoundingClientRect()
          // Approximate position (simplified - in production use a library like textarea-caret)
          const lineHeight = 20
          const lines = textBeforeCursor.split('\n').length
          const top = rect.top + lines * lineHeight + window.scrollY
          const left = rect.left

          if (!mention.isOpen) {
            mention.openAutocomplete(lastAtIndex, { top: 40, left: 0 })
          }
          mention.updateSearchTerm(textAfterAt)
        }
      } else {
        mention.closeAutocomplete()
      }
    } else {
      mention.closeAutocomplete()
    }
  }

  const handleMentionSelect = (user: MentionUser) => {
    if (mention.mentionStartIndex === null || !textareaRef.current) return

    const cursorPosition = textareaRef.current.selectionStart
    const { newText, newCursorPosition } = insertMention(
      content,
      mention.mentionStartIndex,
      cursorPosition,
      user
    )

    setContent(newText)
    mention.closeAutocomplete()

    // Focus and set cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  const insertMentionTrigger = () => {
    if (!textareaRef.current) return

    const cursorPosition = textareaRef.current.selectionStart
    const before = content.slice(0, cursorPosition)
    const after = content.slice(cursorPosition)

    // Add @ and space before if needed
    const needsSpace = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n')
    const newContent = before + (needsSpace ? ' @' : '@') + after

    setContent(newContent)

    // Focus and trigger autocomplete
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = cursorPosition + (needsSpace ? 2 : 1)
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newPosition, newPosition)

        // Trigger change event to open autocomplete
        const event = new Event('input', { bubbles: true })
        textareaRef.current.dispatchEvent(event)
      }
    }, 0)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={3}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'resize-none focus:outline-none focus:ring-2 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-muted-foreground'
          )}
        />

        {/* Mention Autocomplete */}
        <MentionAutocomplete
          users={availableUsers}
          searchTerm={mention.searchTerm}
          position={mention.position}
          onSelect={handleMentionSelect}
          onClose={mention.closeAutocomplete}
          isVisible={mention.isOpen}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mention Button */}
          {availableUsers.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={insertMentionTrigger}
              disabled={isLoading}
            >
              <AtSign className="h-4 w-4" />
            </Button>
          )}

          {/* Visibility Toggle */}
          {showVisibilityToggle && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal"
                checked={visibility === 'internal'}
                onCheckedChange={(checked) => setVisibility(checked ? 'internal' : 'all')}
                disabled={isLoading}
              />
              <Label
                htmlFor="internal"
                className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Internal only
              </Label>
            </div>
          )}

          <span className="text-xs text-muted-foreground hidden sm:inline">
            Press Cmd+Enter to submit
          </span>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Posting...'}
              </>
            ) : (
              <>
                <Send className="mr-1 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
