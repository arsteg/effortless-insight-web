'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  History,
  Mic,
  MicOff,
  Plus,
  Send,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AIDisclaimer } from '@/components/features/notices/ai-disclaimer'
import { FeatureCodes, useFeatureAccess } from '@/hooks/use-feature-access'
import { AssistantBubble } from './assistant-message'
import type { AssistantAction, AssistantMessageDto } from '@/types/assistant'
import { useAssistantStore } from '@/stores/assistant-store'
import {
  buildDisplayMessages,
  useAssistantChat,
  useAssistantConversation,
  useAssistantConversations,
  useDeleteAssistantConversation,
} from '@/hooks/use-assistant'
import {
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
  useAssistantVoiceInput,
} from '@/hooks/use-assistant-voice'

const SUGGESTED_QUESTIONS = [
  'Show my notices that are due soon',
  'What does a DRC-01 notice mean?',
  'How do I invite my CA?',
  'Help me reply to a notice',
]

export function AssistantPanel() {
  const { isOpen, close, activeConversationId, setActiveConversationId, speakReplies, setSpeakReplies } =
    useAssistantStore()
  // Same plan gate as the launcher (and the backend); belt-and-braces.
  const { hasAccess, isLoading } = useFeatureAccess(FeatureCodes.AskAi)
  const conversationsQuery = useAssistantConversations(isOpen && hasAccess)
  const conversationQuery = useAssistantConversation(hasAccess ? activeConversationId : null)
  const deleteConversation = useDeleteAssistantConversation()
  const { turn, sendMessage, stop, dismissError } = useAssistantChat()

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const voice = useAssistantVoiceInput((transcript) => {
    setInput((previous) => (previous ? previous + ' ' : '') + transcript)
  })

  const messages = buildDisplayMessages(conversationQuery.data?.messages, turn)

  // Keep the newest message in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, turn.streamingContent])

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking()
      voice.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isLoading && !hasAccess && isOpen) {
      stop()
      stopSpeaking()
      voice.stop()
      close()
      setActiveConversationId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, isLoading, isOpen])

  const handleSend = () => {
    const content = input.trim()
    if (!hasAccess || !content || turn.isStreaming) return
    setInput('')
    void sendMessage(content, (finalContent) => {
      if (speakReplies) speakText(finalContent)
    })
  }

  // After all hooks: plans without Ask AI never render the panel.
  if (!hasAccess) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        data-testid="assistant-panel"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-2 pr-8">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-lavender-500 to-azure-600">
                <Bot className="h-4 w-4 text-white" />
              </span>
              EI Assistant
            </SheetTitle>
            <div className="flex items-center gap-1">
              {isSpeechSynthesisSupported() && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={speakReplies ? 'Stop speaking replies' : 'Speak replies aloud'}
                  onClick={() => {
                    if (speakReplies) stopSpeaking()
                    setSpeakReplies(!speakReplies)
                  }}
                >
                  {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Conversation history">
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {(conversationsQuery.data?.conversations ?? []).map((conversation) => (
                    <DropdownMenuItem
                      key={conversation.id}
                      className="flex items-center justify-between gap-2"
                      onSelect={() => setActiveConversationId(conversation.id)}
                    >
                      <span className="truncate">{conversation.title}</span>
                      <Trash2
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-coral-600"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteConversation.mutate(conversation.id)
                        }}
                      />
                    </DropdownMenuItem>
                  ))}
                  {!conversationsQuery.data?.conversations?.length && (
                    <DropdownMenuItem disabled>No conversations yet</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="New chat"
                onClick={() => setActiveConversationId(null)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && !turn.isStreaming && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Sparkles className="h-8 w-8 text-lavender-500" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about your GST notices or how to use EffortlessInsight.
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-1.5 text-xs"
                    onClick={() => void sendMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((item, index) => {
            if (item.kind === 'saved') {
              return (
                <AssistantSavedMessage key={item.message.id} item={item} />
              )
            }
            if (item.kind === 'pending-user') {
              return <AssistantPendingUser key={`pending-${index}`} content={item.content} />
            }
            return (
              <AssistantStreaming
                key={`streaming-${index}`}
                content={item.content}
                actions={item.actions}
                activeTool={turn.activeTool}
              />
            )
          })}

          {turn.error && (
            <div className="rounded-lg border border-coral-200 bg-coral-50 p-3 text-sm text-coral-700 dark:border-coral-900 dark:bg-coral-950/40 dark:text-coral-300">
              {turn.error}
              <Button variant="ghost" size="sm" className="ml-2 h-6 px-2 text-xs" onClick={dismissError}>
                Dismiss
              </Button>
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3">
          {voice.error && (
            <p className="mb-1.5 text-xs text-muted-foreground">{voice.error}</p>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              placeholder={
                voice.isRecording
                  ? 'Listening…'
                  : voice.isTranscribing
                    ? 'Transcribing…'
                    : 'Ask the assistant…'
              }
              rows={1}
              className="max-h-28 min-h-[40px] flex-1 resize-none"
              data-testid="assistant-input"
            />
            {voice.mode !== 'unsupported' && (
              <Button
                variant={voice.isRecording ? 'destructive' : 'outline'}
                size="icon"
                className="h-10 w-10 shrink-0"
                title={voice.isRecording ? 'Stop listening' : 'Speak your question'}
                onClick={() => (voice.isRecording ? voice.stop() : void voice.start())}
                data-testid="assistant-mic"
              >
                {voice.isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            {turn.isStreaming ? (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                title="Stop"
                onClick={stop}
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-10 w-10 shrink-0"
                title="Send"
                onClick={handleSend}
                disabled={!input.trim()}
                data-testid="assistant-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-2">
            <AIDisclaimer className="text-[10px]" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function AssistantSavedMessage({
  item,
}: {
  item: { kind: 'saved'; message: AssistantMessageDto }
}) {
  const { message } = item
  return (
    <AssistantBubble
      role={message.role}
      content={message.content}
      citations={message.role === 'assistant' ? message.citations : undefined}
      actions={message.role === 'assistant' ? message.actions : undefined}
      isError={message.isError}
    />
  )
}

function AssistantPendingUser({ content }: { content: string }) {
  return <AssistantBubble role="user" content={content} />
}

function AssistantStreaming({
  content,
  actions,
  activeTool,
}: {
  content: string
  actions: AssistantAction[]
  activeTool: string | null
}) {
  return (
    <AssistantBubble
      role="assistant"
      content={content}
      actions={actions}
      isStreaming
      activeTool={activeTool}
    />
  )
}
