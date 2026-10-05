// AI Chat types

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Citation {
  source: string
  reference: string
  quote?: string
}

export interface MessageFeedback {
  rating: number
  feedbackText?: string
}

export interface ConversationDto {
  id: string
  noticeId: string
  title?: string
  status?: string
  messageCount: number
  lastMessageAt?: string
  createdAt: string
  lastMessage?: MessageDto
}

export interface MessageDto {
  id: string
  conversationId?: string
  role: MessageRole
  content: string
  contentHtml?: string
  citations?: Citation[]
  tokenCount?: number
  modelId?: string
  isError?: boolean
  feedback?: MessageFeedback
  createdAt: string
}

export interface ConversationDetailDto {
  id: string
  noticeId: string
  title?: string
  status?: string
  messageCount: number
  totalTokens: number
  messages: MessageDto[]
  lastMessageAt?: string
  createdAt: string
  hasMore?: boolean
  nextCursor?: string
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

// Streaming event types (must match ChatEventType constants in the .NET API)
export type ChatEventType =
  | 'user_message_saved'
  | 'stream_started'
  | 'content_chunk'
  | 'stream_completed'
  | 'error'

export interface ChatStreamEvent {
  type: ChatEventType
  data?: string | MessageDto
}

// Conversation list response
export interface ConversationListResponse {
  conversations: ConversationDto[]
  totalCount: number
}
