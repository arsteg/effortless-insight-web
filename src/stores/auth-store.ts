import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/lib/api'
import { notificationsApi } from '@/lib/api/notifications'
import { clearTokens, getAccessToken } from '@/lib/api/client'

const PUSH_TOKEN_KEY = 'ei_push_token'
const PUSH_TOKEN_REGISTERED_KEY = 'ei_push_registered'

/**
 * Deactivate this browser's push token on logout, before auth tokens are
 * cleared, so the previous user stops receiving pushes on a shared computer
 * (audit WB-03 / CC-10). Best effort: never blocks logout.
 */
async function deactivatePushTokenOnLogout(): Promise<void> {
  if (typeof window === 'undefined') return
  const token = localStorage.getItem(PUSH_TOKEN_KEY)
  if (!token) return
  try {
    await notificationsApi.deactivatePushToken(token)
  } catch {
    // Server call failed (offline / already gone) — clear locally regardless.
  } finally {
    localStorage.removeItem(PUSH_TOKEN_KEY)
    localStorage.removeItem(PUSH_TOKEN_REGISTERED_KEY)
  }
}

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
          // Deactivate the push token while the access token is still valid.
          await deactivatePushTokenOnLogout()
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
