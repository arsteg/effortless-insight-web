'use client'

import { useState } from 'react'
import { MessageSquare, RefreshCw, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useReplyToComment,
  useAddReaction,
  useRemoveReaction,
} from '@/hooks/use-collaboration'
import { useAuthStore } from '@/stores/auth-store'
import type { Comment, CommentVisibility } from '@/types/collaboration'

interface MentionUser {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
}

interface CommentListProps {
  noticeId: string
  availableUsers?: MentionUser[]
  showHeader?: boolean
  className?: string
}

export function CommentList({
  noticeId,
  availableUsers = [],
  showHeader = true,
  className,
}: CommentListProps) {
  const { user } = useAuthStore()
  const [formKey, setFormKey] = useState(0)

  const { data, isLoading, error, refetch } = useComments(noticeId, {
    includeReplies: true,
    sortOrder: 'desc',
  })
  const createMutation = useCreateComment(noticeId)
  const updateMutation = useUpdateComment(noticeId)
  const deleteMutation = useDeleteComment(noticeId)
  const replyMutation = useReplyToComment(noticeId)
  const addReactionMutation = useAddReaction(noticeId)
  const removeReactionMutation = useRemoveReaction(noticeId)

  const comments = data?.comments ?? []

  const handleCreate = (content: string, visibility?: CommentVisibility) => {
    createMutation.mutate(
      { content, visibility },
      {
        onSuccess: () => {
          // Reset form by incrementing the key
          setFormKey((k) => k + 1)
        },
      }
    )
  }

  const handleReply = (
    parentId: string,
    content: string,
    visibility?: CommentVisibility
  ) => {
    replyMutation.mutate({
      commentId: parentId,
      data: { content, visibility },
    })
  }

  const handleEdit = (commentId: string, content: string) => {
    updateMutation.mutate({
      commentId,
      data: { content },
    })
  }

  const handleDelete = (commentId: string) => {
    deleteMutation.mutate(commentId)
  }

  const handleAddReaction = (commentId: string, emoji: string) => {
    addReactionMutation.mutate({ commentId, emoji })
  }

  const handleRemoveReaction = (commentId: string, emoji: string) => {
    removeReactionMutation.mutate({ commentId, emoji })
  }

  // Count total comments including replies
  const countComments = (items: Comment[]): number => {
    return items.reduce((count, comment) => {
      if (comment.isDeleted) return count
      return count + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countComments(comments)

  if (isLoading) {
    return <CommentListSkeleton showHeader={showHeader} className={className} />
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Comments</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
        )}
        <CardContent className={showHeader ? '' : 'pt-6'}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load comments. Please try refreshing the page or click the refresh button.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Comments
            {totalComments > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalComments})
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        {/* Comment form */}
        <CommentForm
          key={formKey}
          onSubmit={handleCreate}
          availableUsers={availableUsers}
          isLoading={createMutation.isPending}
          showVisibilityToggle
        />

        {comments.length > 0 && (
          <>
            <Separator className="my-6" />

            {/* Comments list */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                  availableUsers={availableUsers}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddReaction={handleAddReaction}
                  onRemoveReaction={handleRemoveReaction}
                  isReplying={replyMutation.isPending}
                  isEditing={updateMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>

            {/* Pagination info */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing {comments.length} of {data.pagination.totalItems} comments
                </p>
              </div>
            )}
          </>
        )}

        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommentListSkeleton({
  showHeader = true,
  className,
}: {
  showHeader?: boolean
  className?: string
}) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <Skeleton className="h-20 w-full" />
        <Separator className="my-6" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { CommentForm } from './comment-form'
export { CommentItem } from './comment-item'
export { MentionAutocomplete, useMentionAutocomplete } from './mention-autocomplete'
