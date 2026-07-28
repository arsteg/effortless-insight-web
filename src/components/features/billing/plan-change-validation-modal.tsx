'use client'

import { AlertTriangle, AlertCircle, XCircle, Users, HardDrive, Building2, FileText, Zap, Info } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import type { PlanChangeValidationResult, PlanChangeBlocker } from '@/types/billing'

export interface PlanChangeValidationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validation: PlanChangeValidationResult | null
  targetPlanName?: string
  onConfirm?: () => void
  isLoading?: boolean
}

const blockerIcons: Record<string, React.ElementType> = {
  users: Users,
  storage: HardDrive,
  organizations: Building2,
  notices: FileText,
  api_calls: Zap,
  additional_seats: Users,
  feature: Info,
}

const blockerTitles: Record<string, string> = {
  users: 'User Limit Exceeded',
  storage: 'Storage Limit Exceeded',
  organizations: 'Organization Limit Exceeded',
  notices: 'Notice Limit Exceeded',
  api_calls: 'API Call Limit Exceeded',
  additional_seats: 'Additional Seats Required',
  feature: 'Feature In Use',
}

function BlockerItem({ blocker }: { blocker: PlanChangeBlocker }) {
  const Icon = blockerIcons[blocker.type] || AlertCircle
  const title = blockerTitles[blocker.type] || 'Limit Exceeded'

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{blocker.message}</p>
        {blocker.currentUsage > 0 && blocker.newLimit > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Current usage: {blocker.currentUsage} | New limit: {blocker.newLimit} |
            Excess: {blocker.excessAmount}
          </p>
        )}
      </div>
    </div>
  )
}

export function PlanChangeValidationModal({
  open,
  onOpenChange,
  validation,
  targetPlanName,
  onConfirm,
  isLoading,
}: PlanChangeValidationModalProps) {
  if (!validation) return null

  const hasBlockers = validation.blockers && validation.blockers.length > 0
  const hasWarnings = validation.featuresToLose && validation.featuresToLose.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasBlockers ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Cannot Switch to {targetPlanName || 'New Plan'}
              </>
            ) : hasWarnings ? (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Confirm Plan Change
              </>
            ) : (
              <>
                <Info className="h-5 w-5 text-primary" />
                Plan Change Available
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {hasBlockers
              ? 'Please resolve the following issues before changing your plan.'
              : hasWarnings
              ? 'Please review the following before confirming your plan change.'
              : `You can switch to ${targetPlanName || 'the new plan'}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Blockers */}
          {hasBlockers && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Issues to Resolve ({validation.blockers!.length})
              </h4>
              {validation.blockers!.map((blocker, index) => (
                <BlockerItem key={index} blocker={blocker} />
              ))}
            </div>
          )}

          {/* Features to lose warning */}
          {hasWarnings && (
            <>
              {hasBlockers && <Separator />}
              <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-400">
                  Features You Will Lose
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <p className="mb-2">
                    The following features are not available in the new plan:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {validation.featuresToLose!.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Success state */}
          {!hasBlockers && !hasWarnings && (
            <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
              <Info className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-400">
                Ready to Switch
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your current usage is within the limits of the new plan. You can proceed with the plan change.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {hasBlockers ? 'Close' : 'Cancel'}
          </Button>
          {!hasBlockers && onConfirm && (
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Change'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
