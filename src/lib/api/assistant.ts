import { apiClient, getAccessToken } from './client'
import type {
  AssistantConversationDetailDto,
  AssistantConversationDto,
  AssistantConversationListDto,
  AssistantStreamEvent,
  AssistantTranscriptionDto,
  AssistantTurnDto,
  SendAssistantMessageRequest,
} from '@/types/assistant'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// SSE reader for the assistant streaming endpoint (same contract as ai-chat)
async function* streamAssistantEvents(
  url: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<AssistantStreamEvent> {
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
    let message = 'Failed to send message'
    try {
      const error = await response.json()
      message = error.message || message
    } catch {
      // keep default message
    }
    throw new Error(message)
  }
  if (!response.body) throw new Error('No response body')

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
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        try {
          yield JSON.parse(data) as AssistantStreamEvent
        } catch {
          // ignore partial lines
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export const assistantApi = {
  getConversations: async (page = 1, pageSize = 20): Promise<AssistantConversationListDto> => {
    const response = await apiClient.get('/assistant/conversations', {
      params: { page, pageSize },
    })
    return response.data.data
  },

  createConversation: async (title?: string): Promise<AssistantConversationDetailDto> => {
    const response = await apiClient.post('/assistant/conversations', {
      title: title ?? null,
      platform: 'web',
    })
    return response.data.data
  },

  getConversation: async (
    conversationId: string,
    messageLimit = 50
  ): Promise<AssistantConversationDetailDto> => {
    const response = await apiClient.get(`/assistant/conversations/${conversationId}`, {
      params: { messageLimit },
    })
    return response.data.data
  },

  renameConversation: async (conversationId: string, title: string): Promise<void> => {
    await apiClient.patch(`/assistant/conversations/${conversationId}`, { title })
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/assistant/conversations/${conversationId}`)
  },

  sendMessageSync: async (
    conversationId: string,
    data: SendAssistantMessageRequest
  ): Promise<AssistantTurnDto> => {
    const response = await apiClient.post(
      `/assistant/conversations/${conversationId}/messages/sync`,
      data
    )
    return response.data.data
  },

  sendMessageStream: function (
    conversationId: string,
    data: SendAssistantMessageRequest,
    signal?: AbortSignal
  ): AsyncGenerator<AssistantStreamEvent> {
    return streamAssistantEvents(
      `${API_BASE_URL}/api/v1/assistant/conversations/${conversationId}/messages`,
      data,
      signal
    )
  },

  transcribe: async (audio: Blob, fileName = 'clip.webm'): Promise<AssistantTranscriptionDto> => {
    const form = new FormData()
    form.append('file', audio, fileName)
    const response = await apiClient.post('/assistant/transcribe', form)
    return response.data.data
  },
}

export type { AssistantConversationDto }
