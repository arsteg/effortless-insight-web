'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Subscription, SubscriptionStatus } from '@/types/billing'
import { billingApi } from '@/lib/api/billing'

interface SubscriptionState {
  subscription: Subscription | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  lastFetchedAt: number | null

  // Actions
  initialize: () => Promise<void>
  fetchSubscription: () => Promise<Subscription | null>
  setSubscription: (subscription: Subscription | null) => void
  clearSubscription: () => void

  // Computed helpers
  hasActiveSubscription: () => boolean
  isTrialing: () => boolean
  isExpired: () => boolean
  getSubscriptionStatus: () => SubscriptionStatus | 'none'
  canAccessApp: () => boolean
}

// Valid statuses that allow app access
const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due']

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      lastFetchedAt: null,

      initialize: async () => {
        const state = get()

        // If already initialized and cache is fresh, skip fetch
        if (state.isInitialized && state.lastFetchedAt) {
          const cacheAge = Date.now() - state.lastFetchedAt
          if (cacheAge < CACHE_DURATION_MS) {
            return
          }
        }

        await get().fetchSubscription()
      },

      fetchSubscription: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await billingApi.getCurrentSubscription()
          const subscription = response.subscription

          set({
            subscription,
            isLoading: false,
            isInitialized: true,
            error: null,
            lastFetchedAt: Date.now(),
          })

          return subscription
        } catch (error: unknown) {
          // Check if it's a "no subscription" error (404 or similar)
          const errorMessage = error instanceof Error
            ? error.message
            : (error && typeof error === 'object' && 'message' in error)
              ? String((error as { message: unknown }).message)
              : ''

          const errorCode = (error && typeof error === 'object' && 'code' in error)
            ? String((error as { code: unknown }).code)
            : ''

          const isNotFound = errorMessage.includes('404') ||
            errorMessage.toLowerCase().includes('not found') ||
            errorMessage.toLowerCase().includes('no subscription') ||
            errorCode === 'NOT_FOUND' ||
            errorCode === 'SUBSCRIPTION_NOT_FOUND'

          set({
            subscription: null,
            isLoading: false,
            isInitialized: true,
            error: isNotFound ? null : (errorMessage || 'Failed to fetch subscription'),
            lastFetchedAt: Date.now(),
          })

          return null
        }
      },

      setSubscription: (subscription: Subscription | null) => {
        set({
          subscription,
          isInitialized: true,
          lastFetchedAt: Date.now(),
        })
      },

      clearSubscription: () => {
        set({
          subscription: null,
          isLoading: false,
          isInitialized: false,
          error: null,
          lastFetchedAt: null,
        })
      },

      hasActiveSubscription: () => {
        const { subscription } = get()
        if (!subscription) return false
        return ACTIVE_STATUSES.includes(subscription.status)
      },

      isTrialing: () => {
        const { subscription } = get()
        return subscription?.status === 'trialing' || subscription?.isTrialing === true
      },

      isExpired: () => {
        const { subscription } = get()
        if (!subscription) return false
        return subscription.status === 'expired' || subscription.status === 'cancelled'
      },

      getSubscriptionStatus: () => {
        const { subscription } = get()
        if (!subscription) return 'none'
        return subscription.status
      },

      canAccessApp: () => {
        const { subscription, isInitialized } = get()

        // Not initialized yet - don't block
        if (!isInitialized) return true

        // No subscription - block
        if (!subscription) return false

        // Check if status allows access
        return ACTIVE_STATUSES.includes(subscription.status)
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal data for fast hydration
        subscription: state.subscription
          ? {
              id: state.subscription.id,
              planCode: state.subscription.planCode,
              planName: state.subscription.planName,
              status: state.subscription.status,
              isTrialing: state.subscription.isTrialing,
              trialEnd: state.subscription.trialEnd,
              trialDaysRemaining: state.subscription.trialDaysRemaining,
              currentPeriodEnd: state.subscription.currentPeriodEnd,
            }
          : null,
        isInitialized: state.isInitialized,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
