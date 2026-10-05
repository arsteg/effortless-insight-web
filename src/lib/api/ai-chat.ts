import { apiClient, getAccessToken } from './client'
import type {
  ConversationDto,
  ConversationDetailDto,
  MessageDto,
  SendMessageRequest,
  CreateConversationRequest,
  MessageFeedbackRequest,
  ConversationListResponse,
  ChatStreamEvent,
} from '@/types/ai-chat'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Shared SSE reader for the chat streaming endpoints
async function* streamChatEvents(
  url: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEvent> {
  const token = getAccessToken()
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to send message')
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            return
          }
          try {
            const event = JSON.parse(data) as ChatStreamEvent
            yield event
          } catch {
            // Ignore parse errors for partial data
          }
        }
      }
    }

    // Process any remaining data
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim()
      if (data && data !== '[DONE]') {
        try {
          const event = JSON.parse(data) as ChatStreamEvent
          yield event
        } catch {
          // Ignore parse errors
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export const aiChatApi = {
  // Get all conversations for a notice
  getConversations: async (noticeId: string): Promise<ConversationListResponse> => {
    const response = await apiClient.get(`/notices/${noticeId}/conversations`)
    return response.data.data
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationRequest): Promise<ConversationDto> => {
    const response = await apiClient.post(`/notices/${data.noticeId}/conversations`, {
      title: data.title,
    })
    return response.data.data
  },

  // Get a conversation with messages
  getConversation: async (conversationId: string): Promise<ConversationDetailDto> => {
    const response = await apiClient.get(`/conversations/${conversationId}`)
    return response.data.data
  },

  // Get suggested questions for a notice
  getSuggestedQuestions: async (noticeId: string): Promise<string[]> => {
    const response = await apiClient.get(`/notices/${noticeId}/suggested-questions`)
    return response.data.data
  },

  // Send a message (non-streaming)
  sendMessage: async (
    conversationId: string,
    data: SendMessageRequest
  ): Promise<MessageDto> => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages/sync`,
      data
    )
    return response.data.data
  },

  // Send a message with streaming response
  sendMessageStream: function (
    conversationId: string,
    data: SendMessageRequest,
    signal?: AbortSignal
  ): AsyncGenerator<ChatStreamEvent> {
    return streamChatEvents(
      `${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
      data,
      signal
    )
  },

  // Edit a user message: rewinds the conversation to that message and streams
  // a new AI response for the edited content
  editMessageStream: function (
    conversationId: string,
    messageId: string,
    data: SendMessageRequest,
    signal?: AbortSignal
  ): AsyncGenerator<ChatStreamEvent> {
    return streamChatEvents(
      `${API_BASE_URL}/api/v1/conversations/${conversationId}/messages/${messageId}/edit`,
      data,
      signal
    )
  },

  // Regenerate a message
  regenerateMessage: async (
    conversationId: string,
    messageId: string
  ): Promise<MessageDto> => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/regenerate`
    )
    return response.data.data
  },

  // Submit feedback for a message
  submitFeedback: async (
    conversationId: string,
    messageId: string,
    data: MessageFeedbackRequest
  ): Promise<void> => {
    await apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/feedback`,
      data
    )
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/conversations/${conversationId}`)
  },

  // Update conversation title
  updateConversationTitle: async (
    conversationId: string,
    title: string
  ): Promise<ConversationDto> => {
    const response = await apiClient.patch(`/conversations/${conversationId}`, {
      title,
    })
    return response.data.data
  },
}
