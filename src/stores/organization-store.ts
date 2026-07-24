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

          // Try to call switchOrganization to ensure JWT has org_id claim
          if (targetOrg) {
            try {
              await authApi.switchOrganization({ organizationId: targetOrg.id })
            } catch (switchError: unknown) {
              // If switchOrganization fails with 402 (subscription required),
              // just continue - we'll handle subscription separately
              const isPaymentRequired =
                (switchError && typeof switchError === 'object' && 'status' in switchError &&
                 (switchError as { status: number }).status === 402) ||
                (switchError && typeof switchError === 'object' && 'response' in switchError &&
                 (switchError as { response: { status: number } }).response?.status === 402)

              if (!isPaymentRequired) {
                throw switchError
              }
              // For 402 errors, continue without re-throwing - organization is still valid
            }
            set({ currentOrganization: targetOrg, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch (error: unknown) {
          // Check for NOT_A_MEMBER or similar errors - clear stale data
          const errorCode = (error && typeof error === 'object' && 'code' in error)
            ? String((error as { code: unknown }).code)
            : ''

          if (errorCode === 'NOT_A_MEMBER' || errorCode === 'NOT_FOUND' || errorCode === 'FORBIDDEN') {
            // Clear stale organization data
            set({
              currentOrganization: null,
              organizations: [],
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
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
