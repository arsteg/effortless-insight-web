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

export const aiChatApi = {
  // Get all conversations for a notice
  getConversations: async (noticeId: string): Promise<ConversationListResponse> => {
    const response = await apiClient.get(`/notices/${noticeId}/conversations`)
    return response.data
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationRequest): Promise<ConversationDto> => {
    const response = await apiClient.post(`/notices/${data.noticeId}/conversations`, {
      title: data.title,
    })
    return response.data
  },

  // Get a conversation with messages
  getConversation: async (conversationId: string): Promise<ConversationDetailDto> => {
    const response = await apiClient.get(`/conversations/${conversationId}`)
    return response.data
  },

  // Get suggested questions for a notice
  getSuggestedQuestions: async (noticeId: string): Promise<string[]> => {
    const response = await apiClient.get(`/notices/${noticeId}/conversations/suggested-questions`)
    return response.data
  },

  // Send a message (non-streaming)
  sendMessage: async (
    conversationId: string,
    data: SendMessageRequest
  ): Promise<MessageDto> => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages`,
      data
    )
    return response.data
  },

  // Send a message with streaming response
  sendMessageStream: async function* (
    conversationId: string,
    data: SendMessageRequest,
    signal?: AbortSignal
  ): AsyncGenerator<ChatStreamEvent> {
    const token = getAccessToken()
    const response = await fetch(
      `${API_BASE_URL}/api/v1/conversations/${conversationId}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal,
      }
    )

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
  },

  // Regenerate a message
  regenerateMessage: async (
    conversationId: string,
    messageId: string
  ): Promise<MessageDto> => {
    const response = await apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/regenerate`
    )
    return response.data
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
    return response.data
  },
}
