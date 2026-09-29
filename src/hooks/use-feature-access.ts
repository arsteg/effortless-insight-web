'use client'

import { useQuery } from '@tanstack/react-query'
import { billingApi } from '@/lib/api/billing'
import { useOrganizationStore } from '@/stores'

/**
 * Known feature codes used in the system.
 * These should match the feature codes in the backend (API FeatureCodes class).
 *
 * Clean set of 15 technical features. Core features (notice_detection, email/push
 * notifications) are always available and not listed here.
 */
export const FeatureCodes = {
  // AI Features
  AiExplanation: 'ai_explanation',
  DraftReply: 'draft_reply',
  WhatsAppAssistant: 'whatsapp_assistant',
  MultilingualSupport: 'multilingual_support',

  // Team Features
  Collaboration: 'collaboration',
  AdvancedAnalytics: 'advanced_analytics',

  // Premium Features
  Workflows: 'workflows',
  BulkOperations: 'bulk_operations',
  DataExport: 'data_export',

  // CA Features
  CaClientManagement: 'ca_client_management',

  // Enterprise Features
  Sso: 'sso',
  ApiAccess: 'api_access',
} as const

export type FeatureCode = typeof FeatureCodes[keyof typeof FeatureCodes]

/**
 * Hook to fetch and check available features for the current organization.
 * Waits for the organization to be fully initialized before fetching features.
 */
export function useFeatures() {
  const { currentOrganization, isLoading: isOrgLoading } = useOrganizationStore()

  return useQuery({
    queryKey: ['features', currentOrganization?.id],
    queryFn: () => billingApi.getAvailableFeatures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v5)
    enabled: !!currentOrganization && !isOrgLoading, // Only run when org is ready
  })
}

/**
 * Hook to check if a specific feature is available.
 *
 * @param featureCode - The feature code to check
 * @returns Object with hasAccess boolean and loading state
 *
 * @example
 * ```tsx
 * const { hasAccess, isLoading } = useFeatureAccess(FeatureCodes.Workflows)
 *
 * if (!hasAccess) {
 *   return <UpgradePrompt feature="Workflows" />
 * }
 * ```
 */
export function useFeatureAccess(featureCode: FeatureCode | string) {
  const { data: features, isLoading, error } = useFeatures()

  const hasAccess = features?.includes(featureCode) ?? false

  return {
    hasAccess,
    isLoading,
    error,
    features,
  }
}

/**
 * Hook to check multiple features at once.
 *
 * @param featureCodes - Array of feature codes to check
 * @returns Object with access status for each feature
 *
 * @example
 * ```tsx
 * const { hasAllAccess, hasAnyAccess, featureAccess } = useMultipleFeatureAccess([
 *   FeatureCodes.Workflows,
 *   FeatureCodes.ApiAccess,
 * ])
 * ```
 */
export function useMultipleFeatureAccess(featureCodes: (FeatureCode | string)[]) {
  const { data: features, isLoading, error } = useFeatures()

  const featureAccess = featureCodes.reduce((acc, code) => {
    acc[code] = features?.includes(code) ?? false
    return acc
  }, {} as Record<string, boolean>)

  const hasAllAccess = featureCodes.every(code => features?.includes(code))
  const hasAnyAccess = featureCodes.some(code => features?.includes(code))

  return {
    featureAccess,
    hasAllAccess,
    hasAnyAccess,
    isLoading,
    error,
  }
}
