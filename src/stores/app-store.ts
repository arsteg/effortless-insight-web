import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  // UI State
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Selection state
  selectedNotices: string[]

  // Notifications
  notificationCount: number

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Notice selection
  selectNotice: (id: string) => void
  deselectNotice: (id: string) => void
  toggleNoticeSelection: (id: string) => void
  selectAllNotices: (ids: string[]) => void
  clearSelection: () => void
  isNoticeSelected: (id: string) => boolean

  // Notifications
  setNotificationCount: (count: number) => void
  incrementNotificationCount: () => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      selectedNotices: [],
      notificationCount: 0,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

      // Notice selection actions
      selectNotice: (id: string) =>
        set((state) => ({
          selectedNotices: state.selectedNotices.includes(id)
            ? state.selectedNotices
            : [...state.selectedNotices, id],
        })),
      deselectNotice: (id: string) =>
        set((state) => ({
          selectedNotices: state.selectedNotices.filter((n) => n !== id),
        })),
      toggleNoticeSelection: (id: string) => {
        const { selectedNotices } = get()
        if (selectedNotices.includes(id)) {
          set({ selectedNotices: selectedNotices.filter((n) => n !== id) })
        } else {
          set({ selectedNotices: [...selectedNotices, id] })
        }
      },
      selectAllNotices: (ids: string[]) => set({ selectedNotices: ids }),
      clearSelection: () => set({ selectedNotices: [] }),
      isNoticeSelected: (id: string) => get().selectedNotices.includes(id),

      // Notification actions
      setNotificationCount: (count: number) => set({ notificationCount: count }),
      incrementNotificationCount: () =>
        set((state) => ({ notificationCount: state.notificationCount + 1 })),
      clearNotifications: () => set({ notificationCount: 0 }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
