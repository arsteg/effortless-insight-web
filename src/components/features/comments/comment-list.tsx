'use client'

import { MessageSquare } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useReplyToComment,
} from '@/hooks/use-comments'
import { useAuthStore } from '@/stores/auth-store'

interface CommentListProps {
  noticeId: string
  showHeader?: boolean
}

export function CommentList({ noticeId, showHeader = true }: CommentListProps) {
  const { user } = useAuthStore()
  const { data: comments = [], isLoading } = useComments(noticeId)
  const createMutation = useCreateComment(noticeId)
  const deleteMutation = useDeleteComment(noticeId)
  const replyMutation = useReplyToComment(noticeId)

  const handleCreate = (content: string, isInternal?: boolean) => {
    createMutation.mutate({ content, isInternal })
  }

  const handleReply = (parentId: string, content: string, isInternal?: boolean) => {
    replyMutation.mutate({ parentId, content, isInternal })
  }

  const handleDelete = (commentId: string) => {
    deleteMutation.mutate(commentId)
  }

  // Count total comments including replies
  const countComments = (items: typeof comments): number => {
    return items.reduce((count, comment) => {
      return count + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
  }

  const totalComments = countComments(comments)

  if (isLoading) {
    return <CommentListSkeleton showHeader={showHeader} />
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg">
            Comments
            {totalComments > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalComments})
              </span>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        {/* Comment form */}
        <CommentForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          showInternalToggle
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
                  onReply={handleReply}
                  onDelete={handleDelete}
                  isReplying={replyMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
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

function CommentListSkeleton({ showHeader = true }: { showHeader?: boolean }) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <Skeleton className="h-20 w-full" />
        <Separator className="my-6" />
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
