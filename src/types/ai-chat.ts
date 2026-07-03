// AI Chat types

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Citation {
  source: string
  type: string
  reference?: string
}

export interface ConversationDto {
  id: string
  noticeId: string
  title?: string
  messageCount: number
  totalTokens: number
  lastMessageAt?: string
  createdAt: string
}

export interface MessageDto {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  citations?: Citation[]
  tokenCount: number
  feedbackRating?: number
  createdAt: string
}

export interface ConversationDetailDto {
  id: string
  noticeId: string
  title?: string
  messageCount: number
  totalTokens: number
  messages: MessageDto[]
  lastMessageAt?: string
  createdAt: string
}

export interface SendMessageRequest {
  message: string
}

export interface CreateConversationRequest {
  noticeId: string
  title?: string
}

export interface MessageFeedbackRequest {
  rating: 1 | -1
  feedbackText?: string
}

export interface RegenerateMessageRequest {
  messageId: string
}

// Streaming event types
export type ChatEventType =
  | 'UserMessageSaved'
  | 'StreamStarted'
  | 'ContentChunk'
  | 'StreamCompleted'
  | 'Error'

export interface ChatStreamEvent {
  type: ChatEventType
  data?: string | MessageDto
}

// Conversation list response
export interface ConversationListResponse {
  conversations: ConversationDto[]
  totalCount: number
}
