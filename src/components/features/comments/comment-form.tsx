'use client'

import { useState } from 'react'
import { Send, Loader2, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  onSubmit: (content: string, isInternal?: boolean) => void
  onCancel?: () => void
  isLoading?: boolean
  placeholder?: string
  submitLabel?: string
  showInternalToggle?: boolean
  className?: string
}

export function CommentForm({
  onSubmit,
  onCancel,
  isLoading = false,
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  showInternalToggle = false,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit(content.trim(), showInternalToggle ? isInternal : undefined)
    setContent('')
    setIsInternal(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (content.trim()) {
        onSubmit(content.trim(), showInternalToggle ? isInternal : undefined)
        setContent('')
        setIsInternal(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showInternalToggle && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked as boolean)}
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
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Posting...
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
