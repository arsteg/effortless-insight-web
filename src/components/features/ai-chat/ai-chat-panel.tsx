'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Bot, PanelLeftClose, PanelLeft, Loader2 } from 'lucide-react'
import { ChatMessageList } from './chat-message-list'
import { ChatInput } from './chat-input'
import { SuggestedQuestions } from './suggested-questions'
import { ConversationList } from './conversation-list'
import {
  useConversations,
  useConversation,
  useSuggestedQuestions,
  useCreateConversation,
  useStreamingMessage,
  useRegenerateMessage,
  useSubmitFeedback,
  useDeleteConversation,
  useUpdateConversationTitle,
} from '@/hooks/use-ai-chat'

interface AIChatPanelProps {
  noticeId: string
  className?: string
}

export function AIChatPanel({ noticeId, className }: AIChatPanelProps) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Queries
  const { data: conversationsData, isLoading: isLoadingConversations } =
    useConversations(noticeId)
  const { data: conversationDetail, isLoading: isLoadingConversation } =
    useConversation(activeConversationId)
  const { data: suggestedQuestions, isLoading: isLoadingSuggestions } =
    useSuggestedQuestions(noticeId)

  // Mutations
  const createConversation = useCreateConversation(noticeId)
  const deleteConversation = useDeleteConversation(noticeId)
  const updateTitle = useUpdateConversationTitle(noticeId)
  const regenerateMessage = useRegenerateMessage(activeConversationId || '')
  const submitFeedback = useSubmitFeedback(activeConversationId || '')

  // Streaming hook
  const {
    sendMessage: streamSendMessage,
    editMessage: streamEditMessage,
    stopStreaming,
    isStreaming,
  } = useStreamingMessage()

  // Auto-select first conversation or create new one
  useEffect(() => {
    if (conversationsData?.conversations && conversationsData.conversations.length > 0) {
      if (!activeConversationId) {
        setActiveConversationId(conversationsData.conversations[0].id)
      }
    }
  }, [conversationsData, activeConversationId])

  const handleNewConversation = useCallback(async () => {
    const result = await createConversation.mutateAsync({})
    setActiveConversationId(result.id)
    setIsMobileSidebarOpen(false)
  }, [createConversation])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    setIsMobileSidebarOpen(false)
  }, [])

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation.mutateAsync(id)
      if (activeConversationId === id) {
        const remaining = conversationsData?.conversations.filter((c) => c.id !== id)
        setActiveConversationId(remaining?.[0]?.id || null)
      }
    },
    [deleteConversation, activeConversationId, conversationsData]
  )

  const handleRenameConversation = useCallback(
    (id: string, title: string) => {
      updateTitle.mutate({ conversationId: id, title })
    },
    [updateTitle]
  )

  const handleSendMessage = useCallback(
    async (message: string) => {
      let targetConversationId = activeConversationId

      if (!targetConversationId) {
        // Create a new conversation first
        const newConv = await createConversation.mutateAsync({})
        targetConversationId = newConv.id
        setActiveConversationId(newConv.id)
      }

      // Now send with the correct conversation ID
      await streamSendMessage(targetConversationId, message)
    },
    [activeConversationId, createConversation, streamSendMessage]
  )

  const handleSelectSuggestion = useCallback(
    (question: string) => {
      handleSendMessage(question)
    },
    [handleSendMessage]
  )

  const handleRegenerate = useCallback(
    (messageId: string) => {
      regenerateMessage.mutate(messageId)
    },
    [regenerateMessage]
  )

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!activeConversationId) return
      await streamEditMessage(activeConversationId, messageId, newContent)
    },
    [activeConversationId, streamEditMessage]
  )

  const handleFeedback = useCallback(
    (messageId: string, rating: 1 | -1) => {
      submitFeedback.mutate({ messageId, rating })
    },
    [submitFeedback]
  )

  const messages = conversationDetail?.messages || []
  const hasConversations = (conversationsData?.conversations?.length || 0) > 0
  const showSuggestions = messages.length === 0 && !isStreaming

  const sidebarContent = (
    <ConversationList
      conversations={conversationsData?.conversations || []}
      activeConversationId={activeConversationId}
      onSelect={handleSelectConversation}
      onNew={handleNewConversation}
      onDelete={handleDeleteConversation}
      onRename={handleRenameConversation}
      isLoading={isLoadingConversations}
      isCreating={createConversation.isPending}
    />
  )

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {/* Mobile sidebar toggle */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle conversations</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{sidebarContent}</div>
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>
        </div>

        {hasConversations && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            disabled={createConversation.isPending}
          >
            {createConversation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'New Chat'
            )}
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        {showSidebar && (
          <div className="hidden lg:block w-64 border-r p-3 overflow-y-auto">
            {sidebarContent}
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {isLoadingConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Messages */}
              <ChatMessageList
                messages={messages}
                isStreaming={isStreaming}
                onRegenerate={handleRegenerate}
                onFeedback={handleFeedback}
                onEditMessage={handleEditMessage}
                isRegenerating={regenerateMessage.isPending}
                className="flex-1"
              />

              {/* Suggested questions */}
              {showSuggestions && (
                <div className="px-4 pb-2">
                  <SuggestedQuestions
                    questions={suggestedQuestions || []}
                    onSelect={handleSelectSuggestion}
                    isLoading={isLoadingSuggestions}
                    disabled={isStreaming || createConversation.isPending}
                  />
                </div>
              )}

              <Separator />

              {/* Input */}
              <div className="p-4">
                <ChatInput
                  onSend={handleSendMessage}
                  onStop={stopStreaming}
                  isLoading={createConversation.isPending}
                  isStreaming={isStreaming}
                  disabled={!activeConversationId && !createConversation.isPending}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
