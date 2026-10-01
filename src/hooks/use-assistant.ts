'use client'

import { useCallback, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

import { assistantApi } from '@/lib/api/assistant'
import { useAssistantStore } from '@/stores/assistant-store'
import type {
  AssistantAction,
  AssistantMessageDto,
  AssistantStreamEvent,
} from '@/types/assistant'

export const assistantKeys = {
  all: ['assistant'] as const,
  conversations: () => [...assistantKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...assistantKeys.all, 'conversation', id] as const,
}

export function useAssistantConversations(enabled = true) {
  return useQuery({
    queryKey: assistantKeys.conversations(),
    queryFn: () => assistantApi.getConversations(1, 20),
    enabled,
  })
}

export function useAssistantConversation(conversationId: string | null) {
  return useQuery({
    queryKey: assistantKeys.conversation(conversationId ?? 'none'),
    queryFn: () => assistantApi.getConversation(conversationId!),
    enabled: !!conversationId,
  })
}

export function useDeleteAssistantConversation() {
  const queryClient = useQueryClient()
  const { activeConversationId, setActiveConversationId } = useAssistantStore()
  return useMutation({
    mutationFn: (conversationId: string) => assistantApi.deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      if (activeConversationId === conversationId) setActiveConversationId(null)
      queryClient.invalidateQueries({ queryKey: assistantKeys.conversations() })
    },
  })
}

/** Extract the noticeId when the user is on a notice detail page. */
export function useAssistantClientContext() {
  const pathname = usePathname()
  const match = pathname?.match(
    /^\/notices\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
  )
  return { route: pathname ?? null, noticeId: match ? match[1] : null }
}

export interface StreamingTurnState {
  /** The user message currently being answered (optimistic) */
  pendingUserContent: string | null
  /** Partial assistant text while streaming */
  streamingContent: string
  /** Actions received so far this turn */
  liveActions: AssistantAction[]
  /** Name of the tool currently running, if any */
  activeTool: string | null
  isStreaming: boolean
  error: string | null
}

const IDLE_TURN: StreamingTurnState = {
  pendingUserContent: null,
  streamingContent: '',
  liveActions: [],
  activeTool: null,
  isStreaming: false,
  error: null,
}

/**
 * Drives one streaming chat turn against the assistant gateway.
 * Creates the conversation lazily on the first message.
 */
export function useAssistantChat() {
  const queryClient = useQueryClient()
  const { activeConversationId, setActiveConversationId } = useAssistantStore()
  const clientContext = useAssistantClientContext()
  const [turn, setTurn] = useState<StreamingTurnState>(IDLE_TURN)
  const abortRef = useRef<AbortController | null>(null)
  const onCompleteRef = useRef<((content: string) => void) | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const sendMessage = useCallback(
    async (content: string, onComplete?: (content: string) => void) => {
      const trimmed = content.trim()
      if (!trimmed || turn.isStreaming) return
      onCompleteRef.current = onComplete ?? null

      let conversationId = activeConversationId
      setTurn({
        ...IDLE_TURN,
        pendingUserContent: trimmed,
        isStreaming: true,
      })

      try {
        if (!conversationId) {
          const created = await assistantApi.createConversation()
          conversationId = created.id
          setActiveConversationId(created.id)
          queryClient.invalidateQueries({ queryKey: assistantKeys.conversations() })
        }

        const abort = new AbortController()
        abortRef.current = abort

        let finalContent = ''
        const stream = assistantApi.sendMessageStream(
          conversationId,
          { content: trimmed, context: clientContext },
          abort.signal
        )

        for await (const event of stream) {
          applyEvent(event, setTurn)
          if (event.type === 'stream_completed') finalContent = event.content
          if (event.type === 'content_chunk' && !finalContent) {
            // tracked in state; finalContent set at completion
          }
        }

        await queryClient.invalidateQueries({
          queryKey: assistantKeys.conversation(conversationId),
        })
        queryClient.invalidateQueries({ queryKey: assistantKeys.conversations() })
        setTurn(IDLE_TURN)
        if (finalContent && onCompleteRef.current) onCompleteRef.current(finalContent)
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          setTurn(IDLE_TURN)
          if (conversationId) {
            queryClient.invalidateQueries({
              queryKey: assistantKeys.conversation(conversationId),
            })
          }
          return
        }
        setTurn((previous) => ({
          ...previous,
          isStreaming: false,
          error: (error as Error).message || 'Something went wrong',
        }))
      } finally {
        abortRef.current = null
      }
    },
    [activeConversationId, clientContext, queryClient, setActiveConversationId, turn.isStreaming]
  )

  const dismissError = useCallback(() => setTurn(IDLE_TURN), [])

  return { turn, sendMessage, stop, dismissError }
}

function applyEvent(
  event: AssistantStreamEvent,
  setTurn: React.Dispatch<React.SetStateAction<StreamingTurnState>>
) {
  switch (event.type) {
    case 'content_chunk':
      setTurn((previous) => ({
        ...previous,
        activeTool: null,
        streamingContent: previous.streamingContent + event.content,
      }))
      break
    case 'tool_call_started':
      setTurn((previous) => ({ ...previous, activeTool: event.tool }))
      break
    case 'tool_call_completed':
      setTurn((previous) => ({ ...previous, activeTool: null }))
      break
    case 'action':
      setTurn((previous) => ({
        ...previous,
        liveActions: [...previous.liveActions, event.action],
      }))
      break
    case 'stream_completed':
      setTurn((previous) => ({
        ...previous,
        streamingContent: event.content || previous.streamingContent,
        liveActions: event.actions?.length ? event.actions : previous.liveActions,
      }))
      break
    case 'error':
      setTurn((previous) => ({
        ...previous,
        isStreaming: false,
        error:
          event.code === 'RATE_LIMITED'
            ? event.message
            : 'The assistant is temporarily unavailable. Please try again.',
      }))
      break
    default:
      break
  }
}

/** Build messages to render: saved messages + the in-flight optimistic turn. */
export function buildDisplayMessages(
  saved: AssistantMessageDto[] | undefined,
  turn: StreamingTurnState
): Array<
  | { kind: 'saved'; message: AssistantMessageDto }
  | { kind: 'pending-user'; content: string }
  | { kind: 'streaming'; content: string; actions: AssistantAction[] }
> {
  const items: ReturnType<typeof buildDisplayMessages> = (saved ?? []).map((message) => ({
    kind: 'saved' as const,
    message,
  }))
  if (turn.pendingUserContent) {
    items.push({ kind: 'pending-user', content: turn.pendingUserContent })
    if (turn.streamingContent || turn.isStreaming) {
      items.push({
        kind: 'streaming',
        content: turn.streamingContent,
        actions: turn.liveActions,
      })
    }
  }
  return items
}
