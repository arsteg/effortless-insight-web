import { buildDisplayMessages } from '../use-assistant'
import type { AssistantMessageDto } from '@/types/assistant'

const savedMessage = (overrides: Partial<AssistantMessageDto> = {}): AssistantMessageDto => ({
  id: 'm1',
  role: 'assistant',
  content: 'Hello',
  citations: [],
  actions: null,
  tokenCount: 0,
  modelId: null,
  isError: false,
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('buildDisplayMessages', () => {
  const idleTurn = {
    pendingUserContent: null,
    streamingContent: '',
    liveActions: [],
    activeTool: null,
    isStreaming: false,
    error: null,
  }

  it('returns saved messages when idle', () => {
    const items = buildDisplayMessages([savedMessage()], idleTurn)
    expect(items).toHaveLength(1)
    expect(items[0].kind).toBe('saved')
  })

  it('appends the optimistic user message and streaming bubble during a turn', () => {
    const items = buildDisplayMessages([savedMessage()], {
      ...idleTurn,
      pendingUserContent: 'show my notices',
      streamingContent: 'You have',
      isStreaming: true,
    })
    expect(items.map((item) => item.kind)).toEqual(['saved', 'pending-user', 'streaming'])
    const streaming = items[2] as Extract<(typeof items)[number], { kind: 'streaming' }>
    expect(streaming.content).toBe('You have')
  })

  it('shows the streaming bubble even before the first chunk arrives', () => {
    const items = buildDisplayMessages(undefined, {
      ...idleTurn,
      pendingUserContent: 'hi',
      isStreaming: true,
    })
    expect(items.map((item) => item.kind)).toEqual(['pending-user', 'streaming'])
  })

  it('carries live actions into the streaming bubble', () => {
    const items = buildDisplayMessages(undefined, {
      ...idleTurn,
      pendingUserContent: 'hi',
      isStreaming: true,
      liveActions: [
        { type: 'navigate', intent: 'team', label: 'Team', webRoute: '/team', mobileRoute: null },
      ],
    })
    const streaming = items[1] as Extract<(typeof items)[number], { kind: 'streaming' }>
    expect(streaming.actions).toHaveLength(1)
  })
})
