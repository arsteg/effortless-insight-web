import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Organization, OrganizationListItem } from '@/types'
import { organizationsApi, authApi } from '@/lib/api'

interface OrganizationState {
  currentOrganization: OrganizationListItem | null
  organizations: OrganizationListItem[]
  isLoading: boolean

  // Actions
  fetchOrganizations: () => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
  setCurrentOrganization: (org: OrganizationListItem | null) => void
  clearOrganizations: () => void
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      currentOrganization: null,
      organizations: [],
      isLoading: false,

      fetchOrganizations: async () => {
        set({ isLoading: true })
        try {
          const response = await organizationsApi.list()
          const organizations = response.organizations

          set({
            organizations,
            isLoading: false,
          })

          // If no current org is set, use the first one
          const current = get().currentOrganization
          if (!current && organizations.length > 0) {
            set({ currentOrganization: organizations[0] })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      switchOrganization: async (orgId: string) => {
        const { organizations } = get()
        const org = organizations.find((o) => o.id === orgId)

        if (!org) {
          throw new Error('Organization not found')
        }

        set({ isLoading: true })
        try {
          // Call API to switch organization (updates JWT)
          await authApi.switchOrganization({ organizationId: orgId })
          set({
            currentOrganization: org,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      setCurrentOrganization: (org: OrganizationListItem | null) => {
        set({ currentOrganization: org })
      },

      clearOrganizations: () => {
        set({
          currentOrganization: null,
          organizations: [],
        })
      },
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentOrganization: state.currentOrganization,
      }),
    }
  )
)
