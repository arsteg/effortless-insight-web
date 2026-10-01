import { create } from 'zustand'

interface AssistantState {
  /** Whether the assistant panel (right-side sheet) is open */
  isOpen: boolean
  /** Conversation currently shown in the panel; null = newest/new */
  activeConversationId: string | null
  /** Whether assistant replies are spoken aloud (TTS) */
  speakReplies: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setActiveConversationId: (id: string | null) => void
  setSpeakReplies: (value: boolean) => void
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  activeConversationId: null,
  speakReplies: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setSpeakReplies: (value) => set({ speakReplies: value }),
}))
