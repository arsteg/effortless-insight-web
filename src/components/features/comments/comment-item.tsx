'use client'

import { useState } from 'react'
import { MoreHorizontal, Reply, Trash2, Lock } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { CommentForm } from './comment-form'
import type { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply: (parentId: string, content: string, isInternal?: boolean) => void
  onDelete: (commentId: string) => void
  isReplying?: boolean
  isDeleting?: boolean
  depth?: number
}

const MAX_DEPTH = 3

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  isReplying = false,
  isDeleting = false,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const isOwnComment = comment.userId === currentUserId
  const canReply = depth < MAX_DEPTH

  const handleReply = (content: string, isInternal?: boolean) => {
    onReply(comment.id, content, isInternal)
    setShowReplyForm(false)
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs">
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isInternal && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                Internal
              </Badge>
            )}
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="mr-1 h-3 w-3" />
                Reply
              </Button>
            )}
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                isLoading={isReplying}
                placeholder="Write a reply..."
                submitLabel="Reply"
                showInternalToggle
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  isReplying={isReplying}
                  isDeleting={isDeleting}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
