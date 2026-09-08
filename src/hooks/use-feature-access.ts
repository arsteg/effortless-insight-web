'use client'

import { useQuery } from '@tanstack/react-query'
import { billingApi } from '@/lib/api/billing'
import { useOrganizationStore } from '@/stores'

/**
 * Known feature codes used in the system.
 * These should match the feature codes in the backend.
 */
export const FeatureCodes = {
  WhatsAppIntegration: 'whatsapp_integration',
  Workflows: 'workflows',
  AdvancedWorkflows: 'advanced_workflows',
  ApiAccess: 'api_access',
  AdvancedAnalytics: 'advanced_analytics',
  PrioritySupport: 'priority_support',
  CustomBranding: 'custom_branding',
  SsoIntegration: 'sso_integration',
  AuditLogs: 'audit_logs',
  BulkOperations: 'bulk_operations',
  AdvancedReporting: 'advanced_reporting',
  DataExport: 'data_export',
  FullAiAnalysis: 'full_ai_analysis',
  PriorityProcessing: 'priority_processing',
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
