'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type { Comment, CreateCommentRequest } from '@/types'

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (noticeId: string) => [...commentKeys.lists(), noticeId] as const,
}

// Get comments for a notice
export function useComments(noticeId: string) {
  return useQuery<Comment[]>({
    queryKey: commentKeys.list(noticeId),
    queryFn: () => commentsApi.getByNotice(noticeId),
    enabled: !!noticeId,
  })
}

// Create comment
export function useCreateComment(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.create(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(noticeId) })
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to add comment',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Delete comment
export function useDeleteComment(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(noticeId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(noticeId) })
      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to delete comment',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Reply to comment
export function useReplyToComment(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      parentId,
      content,
      isInternal,
    }: {
      parentId: string
      content: string
      isInternal?: boolean
    }) => commentsApi.reply(noticeId, parentId, content, isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(noticeId) })
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to add reply',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}
