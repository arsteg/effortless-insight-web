import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CaContext, CaProfile, CaClientSummary } from '@/types'
import { caApi } from '@/lib/api'

interface CaState {
  // Profile
  profile: CaProfile | null
  isLoadingProfile: boolean

  // Context
  context: CaContext | null
  isContextActive: boolean
  isLoadingContext: boolean

  // Selected client for quick access
  selectedClient: CaClientSummary | null

  // Actions
  loadProfile: () => Promise<void>
  clearProfile: () => void

  setContext: (context: CaContext) => void
  clearContext: () => Promise<void>
  refreshContext: () => Promise<void>

  selectClient: (relationshipId: string) => Promise<void>
  setSelectedClient: (client: CaClientSummary | null) => void

  // Computed helpers
  isCa: () => boolean
  hasClientSelected: () => boolean
}

export const useCaStore = create<CaState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isLoadingProfile: false,
      context: null,
      isContextActive: false,
      isLoadingContext: false,
      selectedClient: null,

      // Profile actions
      loadProfile: async () => {
        set({ isLoadingProfile: true })
        try {
          const profile = await caApi.getProfile()
          set({ profile, isLoadingProfile: false })
        } catch {
          // User is not a CA or profile fetch failed
          set({ profile: null, isLoadingProfile: false })
        }
      },

      clearProfile: () => {
        set({
          profile: null,
          context: null,
          isContextActive: false,
          selectedClient: null,
        })
      },

      // Context actions
      setContext: (context: CaContext) => {
        const isActive = !!(
          context.selectedClientRelationshipId &&
          context.selectedOrganizationId
        )
        set({
          context,
          isContextActive: isActive,
        })
      },

      clearContext: async () => {
        try {
          await caApi.clearContext()
        } catch {
          // Ignore errors during clear
        } finally {
          set({
            context: null,
            isContextActive: false,
            selectedClient: null,
          })
        }
      },

      refreshContext: async () => {
        const { profile } = get()
        if (!profile) return

        set({ isLoadingContext: true })
        try {
          const context = await caApi.getCurrentContext()
          const isActive = !!(
            context.selectedClientRelationshipId &&
            context.selectedOrganizationId
          )
          set({
            context,
            isContextActive: isActive,
            isLoadingContext: false,
          })
        } catch {
          set({
            context: null,
            isContextActive: false,
            isLoadingContext: false,
          })
        }
      },

      selectClient: async (relationshipId: string) => {
        set({ isLoadingContext: true })
        try {
          const response = await caApi.selectClient({
            clientRelationshipId: relationshipId,
          })
          set({
            context: response.context,
            isContextActive: true,
            isLoadingContext: false,
          })
        } catch (error) {
          set({ isLoadingContext: false })
          throw error
        }
      },

      setSelectedClient: (client: CaClientSummary | null) => {
        set({ selectedClient: client })
      },

      // Computed helpers
      isCa: () => {
        const { profile } = get()
        return profile !== null && profile.status === 'active'
      },

      hasClientSelected: () => {
        const { context, isContextActive } = get()
        return isContextActive && !!context?.selectedClientRelationshipId
      },
    }),
    {
      name: 'ca-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist minimal context info for hydration
        context: state.context
          ? {
              caUserId: state.context.caUserId,
              caName: state.context.caName,
              selectedClientRelationshipId:
                state.context.selectedClientRelationshipId,
              selectedClientName: state.context.selectedClientName,
              selectedOrganizationId: state.context.selectedOrganizationId,
              selectedOrganizationName: state.context.selectedOrganizationName,
              authorizedGstins: state.context.authorizedGstins,
              permissions: state.context.permissions,
            }
          : null,
        isContextActive: state.isContextActive,
        selectedClient: state.selectedClient
          ? {
              relationshipId: state.selectedClient.relationshipId,
              clientName: state.selectedClient.clientName,
              organizationName: state.selectedClient.organizationName,
            }
          : null,
      }),
    }
  )
)
