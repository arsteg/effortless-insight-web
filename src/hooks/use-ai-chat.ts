'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiChatApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import type {
  ConversationDto,
  ConversationDetailDto,
  MessageDto,
  SendMessageRequest,
  CreateConversationRequest,
  MessageFeedbackRequest,
  ChatStreamEvent,
} from '@/types/ai-chat'

// Query keys
export const aiChatKeys = {
  all: ['aiChat'] as const,
  conversations: () => [...aiChatKeys.all, 'conversations'] as const,
  conversationList: (noticeId: string) => [...aiChatKeys.conversations(), 'list', noticeId] as const,
  conversation: (conversationId: string) => [...aiChatKeys.conversations(), 'detail', conversationId] as const,
  suggestedQuestions: (noticeId: string) => [...aiChatKeys.all, 'suggestedQuestions', noticeId] as const,
}

// Get conversations for a notice
export function useConversations(noticeId: string) {
  return useQuery({
    queryKey: aiChatKeys.conversationList(noticeId),
    queryFn: () => aiChatApi.getConversations(noticeId),
    enabled: !!noticeId,
  })
}

// Get a single conversation with messages
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: aiChatKeys.conversation(conversationId || ''),
    queryFn: () => aiChatApi.getConversation(conversationId!),
    enabled: !!conversationId,
  })
}

// Get suggested questions for a notice
export function useSuggestedQuestions(noticeId: string) {
  return useQuery({
    queryKey: aiChatKeys.suggestedQuestions(noticeId),
    queryFn: () => aiChatApi.getSuggestedQuestions(noticeId),
    enabled: !!noticeId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

// Create conversation
export function useCreateConversation(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: Omit<CreateConversationRequest, 'noticeId'>) =>
      aiChatApi.createConversation({ ...data, noticeId }),
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversationList(noticeId) })
      return newConversation
    },
    onError: () => {
      toast({
        title: 'Failed to create conversation',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Send message (non-streaming)
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      aiChatApi.sendMessage(conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(conversationId) })
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description:
          (error as { message?: string })?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Streaming message hook - accepts conversationId at call time to avoid stale closures
export function useStreamingMessage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Cleanup on unmount - abort any active streams
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Shared event-processing loop for send and edit streams
  const runStream = useCallback(
    async (
      conversationId: string,
      events: AsyncGenerator<ChatStreamEvent>
    ): Promise<MessageDto | null> => {
      try {
        let finalMessage: MessageDto | null = null

        for await (const event of events) {
          switch (event.type) {
            case 'user_message_saved':
              // Update with the actual user message
              if (event.data && typeof event.data !== 'string') {
                queryClient.setQueryData<ConversationDetailDto>(
                  aiChatKeys.conversation(conversationId),
                  (old) => {
                    if (!old) return old
                    // Replace temp message with actual message
                    const messages = old.messages.map((m) =>
                      m.id.startsWith('temp-') && m.role === 'user'
                        ? (event.data as MessageDto)
                        : m
                    )
                    return { ...old, messages }
                  }
                )
              }
              break

            case 'stream_started':
              // Add a temporary assistant message for streaming
              queryClient.setQueryData<ConversationDetailDto>(
                aiChatKeys.conversation(conversationId),
                (old) => {
                  if (!old) return old
                  const tempAssistantMessage: MessageDto = {
                    id: `streaming-${Date.now()}`,
                    conversationId,
                    role: 'assistant',
                    content: '',
                    tokenCount: 0,
                    createdAt: new Date().toISOString(),
                  }
                  return {
                    ...old,
                    messages: [...old.messages, tempAssistantMessage],
                  }
                }
              )
              break

            case 'content_chunk':
              if (typeof event.data === 'string') {
                setStreamingContent((prev) => prev + event.data)
                // Update the streaming message in cache
                queryClient.setQueryData<ConversationDetailDto>(
                  aiChatKeys.conversation(conversationId),
                  (old) => {
                    if (!old) return old
                    const messages = old.messages.map((m) =>
                      m.id.startsWith('streaming-')
                        ? { ...m, content: m.content + (event.data as string) }
                        : m
                    )
                    return { ...old, messages }
                  }
                )
              }
              break

            case 'stream_completed':
              if (event.data && typeof event.data !== 'string') {
                finalMessage = event.data as MessageDto
                // Replace streaming message with final message
                queryClient.setQueryData<ConversationDetailDto>(
                  aiChatKeys.conversation(conversationId),
                  (old) => {
                    if (!old) return old
                    const messages = old.messages.map((m) =>
                      m.id.startsWith('streaming-') ? finalMessage! : m
                    )
                    return {
                      ...old,
                      messages,
                      messageCount: old.messageCount + 1,
                    }
                  }
                )
              }
              break

            case 'error':
              if (typeof event.data === 'string') {
                setError(event.data)
                toast({
                  title: 'Error',
                  description: event.data,
                  variant: 'destructive',
                })
                // Refetch so temp/streaming placeholders are replaced with server state
                queryClient.invalidateQueries({
                  queryKey: aiChatKeys.conversation(conversationId),
                })
              }
              break
          }
        }

        return finalMessage
      } catch (err) {
        // Don't show error if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          // Clean up optimistic updates on abort
          queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(conversationId) })
          return null
        }
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        toast({
          title: 'Failed to send message',
          description: errorMessage,
          variant: 'destructive',
        })
        // Refetch to get clean state
        queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(conversationId) })
        return null
      } finally {
        setIsStreaming(false)
        setStreamingContent('')
        abortControllerRef.current = null
      }
    },
    [queryClient, toast]
  )

  const sendMessage = useCallback(
    async (conversationId: string, message: string): Promise<MessageDto | null> => {
      if (!conversationId) {
        setError('No conversation selected')
        return null
      }

      setIsStreaming(true)
      setStreamingContent('')
      setError(null)
      setActiveConversationId(conversationId)
      abortControllerRef.current = new AbortController()

      // Optimistically add the user message to the cache
      queryClient.setQueryData<ConversationDetailDto>(
        aiChatKeys.conversation(conversationId),
        (old) => {
          if (!old) return old
          const tempUserMessage: MessageDto = {
            id: `temp-${Date.now()}`,
            conversationId,
            role: 'user',
            content: message,
            tokenCount: 0,
            createdAt: new Date().toISOString(),
          }
          return {
            ...old,
            messages: [...old.messages, tempUserMessage],
            messageCount: old.messageCount + 1,
          }
        }
      )

      return runStream(
        conversationId,
        aiChatApi.sendMessageStream(
          conversationId,
          { message },
          abortControllerRef.current.signal
        )
      )
    },
    [queryClient, runStream]
  )

  // Edit a previously sent user message: rewinds the conversation to that
  // message and streams a new AI response for the edited content
  const editMessage = useCallback(
    async (
      conversationId: string,
      messageId: string,
      message: string
    ): Promise<MessageDto | null> => {
      if (!conversationId) {
        setError('No conversation selected')
        return null
      }

      setIsStreaming(true)
      setStreamingContent('')
      setError(null)
      setActiveConversationId(conversationId)
      abortControllerRef.current = new AbortController()

      // Optimistically rewind: drop the edited message and everything after it,
      // then append the edited content as a temp user message
      queryClient.setQueryData<ConversationDetailDto>(
        aiChatKeys.conversation(conversationId),
        (old) => {
          if (!old) return old
          const idx = old.messages.findIndex((m) => m.id === messageId)
          if (idx < 0) return old
          const kept = old.messages.slice(0, idx)
          const tempUserMessage: MessageDto = {
            id: `temp-${Date.now()}`,
            conversationId,
            role: 'user',
            content: message,
            tokenCount: 0,
            createdAt: new Date().toISOString(),
          }
          return {
            ...old,
            messages: [...kept, tempUserMessage],
            messageCount: kept.length + 1,
          }
        }
      )

      return runStream(
        conversationId,
        aiChatApi.editMessageStream(
          conversationId,
          messageId,
          { message },
          abortControllerRef.current.signal
        )
      )
    },
    [queryClient, runStream]
  )

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    sendMessage,
    editMessage,
    stopStreaming,
    isStreaming,
    activeConversationId,
    streamingContent,
    error,
  }
}

// Regenerate message
export function useRegenerateMessage(conversationId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (messageId: string) =>
      aiChatApi.regenerateMessage(conversationId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversation(conversationId) })
      toast({
        title: 'Response regenerated',
        description: 'A new response has been generated.',
        variant: 'success',
      })
    },
    onError: (error) => {
      toast({
        title: 'Failed to regenerate',
        description:
          (error as { message?: string })?.message ||
          'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Submit feedback
export function useSubmitFeedback(conversationId: string) {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ messageId, ...data }: MessageFeedbackRequest & { messageId: string }) =>
      aiChatApi.submitFeedback(conversationId, messageId, data),
    onSuccess: () => {
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to submit feedback',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Delete conversation
export function useDeleteConversation(noticeId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (conversationId: string) =>
      aiChatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversationList(noticeId) })
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
        variant: 'success',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to delete conversation',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
  })
}

// Update conversation title
export function useUpdateConversationTitle(noticeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: string; title: string }) =>
      aiChatApi.updateConversationTitle(conversationId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiChatKeys.conversationList(noticeId) })
    },
  })
}
