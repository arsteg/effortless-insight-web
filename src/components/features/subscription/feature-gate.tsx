'use client'

import { ReactNode } from 'react'
import { useFeatureAccess, FeatureCode, FeatureCodes } from '@/hooks/use-feature-access'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FeatureGateProps {
  /**
   * The feature code to check access for
   */
  feature: FeatureCode | string

  /**
   * Content to show when feature is available
   */
  children: ReactNode

  /**
   * Custom fallback content when feature is not available.
   * If not provided, a default upgrade prompt is shown.
   */
  fallback?: ReactNode

  /**
   * If true, show nothing when feature is not available (useful for hiding UI elements)
   */
  hideWhenUnavailable?: boolean

  /**
   * If true, show a loading skeleton while checking feature access
   */
  showLoadingState?: boolean

  /**
   * Feature display name for the upgrade prompt
   */
  featureDisplayName?: string
}

/**
 * Map feature codes to display names
 */
const featureDisplayNames: Record<string, string> = {
  [FeatureCodes.WhatsAppIntegration]: 'WhatsApp Integration',
  [FeatureCodes.Workflows]: 'Workflows',
  [FeatureCodes.AdvancedWorkflows]: 'Advanced Workflows',
  [FeatureCodes.ApiAccess]: 'API Access',
  [FeatureCodes.AdvancedAnalytics]: 'Advanced Analytics',
  [FeatureCodes.PrioritySupport]: 'Priority Support',
  [FeatureCodes.CustomBranding]: 'Custom Branding',
  [FeatureCodes.SsoIntegration]: 'SSO Integration',
  [FeatureCodes.AuditLogs]: 'Audit Logs',
  [FeatureCodes.BulkOperations]: 'Bulk Operations',
  [FeatureCodes.AdvancedReporting]: 'Advanced Reporting',
  [FeatureCodes.DataExport]: 'Data Export',
  [FeatureCodes.FullAiAnalysis]: 'Full AI Analysis',
  [FeatureCodes.PriorityProcessing]: 'Priority Processing',
}

function getFeatureDisplayName(featureCode: string): string {
  return featureDisplayNames[featureCode] || featureCode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Default upgrade prompt component
 */
function DefaultUpgradePrompt({ featureName }: { featureName: string }) {
  const router = useRouter()

  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Premium Feature</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-3">
          <strong>{featureName}</strong> is not available in your current plan.
          Upgrade to access this feature and more.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/settings/billing')}
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade Plan
        </Button>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Component that gates content behind a feature check.
 *
 * @example Basic usage - show upgrade prompt when feature unavailable:
 * ```tsx
 * <FeatureGate feature={FeatureCodes.Workflows}>
 *   <WorkflowsEditor />
 * </FeatureGate>
 * ```
 *
 * @example Hide content when feature unavailable:
 * ```tsx
 * <FeatureGate feature={FeatureCodes.ApiAccess} hideWhenUnavailable>
 *   <ApiKeySection />
 * </FeatureGate>
 * ```
 *
 * @example Custom fallback:
 * ```tsx
 * <FeatureGate
 *   feature={FeatureCodes.BulkOperations}
 *   fallback={<p>Bulk operations coming soon!</p>}
 * >
 *   <BulkActions />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  hideWhenUnavailable = false,
  showLoadingState = false,
  featureDisplayName,
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureAccess(feature)

  // Show loading state if requested
  if (isLoading && showLoadingState) {
    return (
      <div className="animate-pulse h-20 bg-muted rounded-md" />
    )
  }

  // Feature available - render children
  if (hasAccess) {
    return <>{children}</>
  }

  // Feature not available - hide completely if requested
  if (hideWhenUnavailable) {
    return null
  }

  // Feature not available - show fallback or default upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  const displayName = featureDisplayName || getFeatureDisplayName(feature)
  return <DefaultUpgradePrompt featureName={displayName} />
}

/**
 * Hook-based feature check for programmatic access control.
 * Useful when you need to conditionally render or disable elements.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canUseBulkOps = useCanAccessFeature(FeatureCodes.BulkOperations)
 *
 *   return (
 *     <Button disabled={!canUseBulkOps} onClick={handleBulkDelete}>
 *       Bulk Delete
 *     </Button>
 *   )
 * }
 * ```
 */
export function useCanAccessFeature(feature: FeatureCode | string): boolean {
  const { hasAccess } = useFeatureAccess(feature)
  return hasAccess
}
