import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/lib/api'
import { clearTokens, getAccessToken } from '@/lib/api/client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        const token = getAccessToken()
        if (!token) {
          set({ isInitialized: true, isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })
        try {
          const user = await authApi.getMe()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          })
        } catch {
          clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          })
        }
      },

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const result = await authApi.login(credentials)

          // Check if 2FA is required
          if ('requires2fa' in result) {
            set({ isLoading: false })
            throw new Error('2FA_REQUIRED')
          }

          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true })
        try {
          await authApi.register(data)
          set({ isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authApi.logout()
        } catch {
          // Ignore logout errors, clear state anyway
        } finally {
          clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshUser: async () => {
        try {
          const user = await authApi.getMe()
          set({ user })
        } catch {
          // Ignore errors, keep existing user
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal user info for hydration
        user: state.user
          ? {
              id: state.user.id,
              email: state.user.email,
              name: state.user.name,
              role: state.user.role,
            }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
