'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  MoreHorizontal,
  Reply,
  Trash2,
  Lock,
  Edit,
  Smile,
  Check,
  X,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { CommentForm } from './comment-form'
import { renderTextWithMentions } from './mention-autocomplete'
import { ALLOWED_REACTIONS } from '@/types/collaboration'
import type { Comment, ReactionSummary, CommentVisibility } from '@/types/collaboration'

interface MentionUser {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  currentUserRole?: string
  availableUsers?: MentionUser[]
  onReply: (parentId: string, content: string, visibility?: CommentVisibility) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  onAddReaction: (commentId: string, emoji: string) => void
  onRemoveReaction: (commentId: string, emoji: string) => void
  isReplying?: boolean
  isEditing?: boolean
  isDeleting?: boolean
  depth?: number
}

const MAX_DEPTH = 3

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ReactionButton({
  reaction,
  hasReacted,
  onClick,
}: {
  reaction: ReactionSummary
  hasReacted: boolean
  onClick: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs',
              'border transition-colors',
              hasReacted
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-muted/50 border-transparent hover:border-border'
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{reaction.users.slice(0, 5).join(', ')}</p>
          {reaction.users.length > 5 && (
            <p className="text-muted-foreground">and {reaction.users.length - 5} more</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function CommentItem({
  comment,
  currentUserId,
  currentUserRole,
  availableUsers = [],
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  isReplying = false,
  isEditing = false,
  isDeleting = false,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Compare IDs case-insensitively (GUIDs may have different casing)
  const isOwnComment = currentUserId
    ? comment.author.id.toLowerCase() === currentUserId.toLowerCase()
    : false
  // Admins and managers can delete any comment
  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'owner' || currentUserRole === 'manager'
  const canReply = depth < MAX_DEPTH && !comment.isDeleted
  const canEdit = isOwnComment && !comment.isDeleted
  const canDelete = (isOwnComment || isAdmin) && !comment.isDeleted

  const handleReply = (content: string, visibility?: CommentVisibility) => {
    onReply(comment.id, content, visibility)
    setShowReplyForm(false)
  }

  const handleEdit = (content: string) => {
    onEdit(comment.id, content)
    setIsEditMode(false)
  }

  const handleReactionClick = (emoji: string) => {
    const existingReaction = comment.reactions.find((r) => r.emoji === emoji)
    if (existingReaction?.hasReacted) {
      onRemoveReaction(comment.id, emoji)
    } else {
      onAddReaction(comment.id, emoji)
    }
    setShowReactionPicker(false)
  }

  // Render content with mentions highlighted
  const renderContent = () => {
    if (comment.isDeleted) {
      return <p className="text-sm text-muted-foreground italic">This comment has been deleted.</p>
    }

    // Use HTML content if available (already sanitized by backend)
    if (comment.contentHtml) {
      return (
        <div
          className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
          dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
        />
      )
    }

    // Fallback to rendering mentions manually
    const htmlContent = renderTextWithMentions(comment.content)
    return (
      <p
        className="text-sm whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  }

  if (comment.isDeleted && (!comment.replies || comment.replies.length === 0)) {
    return null // Don't render deleted comments without replies
  }

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
          <AvatarFallback className="text-xs">{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {comment.visibility === 'internal' && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Lock className="h-3 w-3" />
                Internal
              </Badge>
            )}
          </div>

          {/* Content or Edit Form */}
          {isEditMode ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleEdit}
                onCancel={() => {
                  setIsEditMode(false)
                  setEditContent(comment.content)
                }}
                initialContent={comment.content}
                availableUsers={availableUsers}
                isLoading={isEditing}
                placeholder="Edit your comment..."
                submitLabel="Save"
                showVisibilityToggle={false}
                isEditing
              />
            </div>
          ) : (
            <div className="mt-1">{renderContent()}</div>
          )}

          {/* Reactions */}
          {!comment.isDeleted && comment.reactions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {comment.reactions.map((reaction) => (
                <ReactionButton
                  key={reaction.emoji}
                  reaction={reaction}
                  hasReacted={reaction.hasReacted}
                  onClick={() => handleReactionClick(reaction.emoji)}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          {!comment.isDeleted && !isEditMode && (
            <div className="flex items-center gap-1 mt-2">
              {/* Reaction Picker */}
              <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex gap-1">
                    {ALLOWED_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReactionClick(emoji)}
                        className="p-1.5 rounded hover:bg-muted text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Reply */}
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

              {/* Edit Button */}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditMode(true)}
                  title="Edit comment"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              {/* Delete Button */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  title="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                availableUsers={availableUsers}
                isLoading={isReplying}
                placeholder="Write a reply..."
                submitLabel="Reply"
                showVisibilityToggle
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
                  currentUserRole={currentUserRole}
                  availableUsers={availableUsers}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  isReplying={isReplying}
                  isEditing={isEditing}
                  isDeleting={isDeleting}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(comment.id)
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
