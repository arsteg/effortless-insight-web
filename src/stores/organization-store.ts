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

          set({ organizations })

          // Determine which organization to use
          const current = get().currentOrganization
          let targetOrg = current

          // If current org is set, verify it still exists in the list
          if (current) {
            const stillExists = organizations.find(o => o.id === current.id)
            if (!stillExists && organizations.length > 0) {
              targetOrg = organizations[0]
            }
          } else if (organizations.length > 0) {
            targetOrg = organizations[0]
          }

          // Always call switchOrganization to ensure JWT has org_id claim
          if (targetOrg) {
            await authApi.switchOrganization({ organizationId: targetOrg.id })
            set({ currentOrganization: targetOrg, isLoading: false })
          } else {
            set({ isLoading: false })
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
