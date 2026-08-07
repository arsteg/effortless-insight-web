'use client'

import { useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { billingApi, formatAmount } from '@/lib/api/billing'
import { BillingToggle } from './billing-toggle'
import { PlanChangeValidationModal } from './plan-change-validation-modal'
import type { Plan, BillingCycle, Subscription, PlanChangeValidationResult } from '@/types/billing'

interface ChangePlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans: Plan[]
  currentSubscription: Subscription
  onConfirm: (planCode: string, billingCycle: BillingCycle) => void
  isLoading?: boolean
}

export function ChangePlanModal({
  open,
  onOpenChange,
  plans,
  currentSubscription,
  onConfirm,
  isLoading,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentSubscription.planCode)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(currentSubscription.billingCycle)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<PlanChangeValidationResult | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)

  const currentPlan = plans.find((p) => p.code === currentSubscription.planCode)
  const newPlan = plans.find((p) => p.code === selectedPlan)

  const isSamePlan = selectedPlan === currentSubscription.planCode
  const isBillingCycleChange = billingCycle !== currentSubscription.billingCycle
  const hasChanges = !isSamePlan || isBillingCycleChange

  // Exclude free plan (can't downgrade to free) and enterprise plans (contactSales)
  const availablePlans = plans.filter((p) => !p.contactSales && p.code !== 'free')

  const getNewPrice = () => {
    if (!newPlan) return 0
    return billingCycle === 'annually' ? newPlan.pricing.annually : newPlan.pricing.monthly
  }

  const handleValidateAndConfirm = async () => {
    // If same plan and same billing cycle, nothing to do
    if (isSamePlan && !isBillingCycleChange) {
      return
    }

    // If only billing cycle change (same plan), proceed directly
    if (isSamePlan && isBillingCycleChange) {
      onConfirm(selectedPlan, billingCycle)
      return
    }

    setIsValidating(true)
    try {
      const result = await billingApi.validatePlanChange({
        newPlanCode: selectedPlan,
        billingCycle: billingCycle,
        additionalSeats: 0,
      })
      setValidationResult(result)

      // Always show the validation modal when changing plans
      // This ensures user sees what features they gain/lose before confirming
      setShowValidationModal(true)
    } catch (error) {
      console.error('Validation failed:', error)
      // On error, still allow the change (API will catch it)
      onConfirm(selectedPlan, billingCycle)
    } finally {
      setIsValidating(false)
    }
  }

  const handleConfirmFromValidation = () => {
    setShowValidationModal(false)
    onConfirm(selectedPlan, billingCycle)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Change Your Plan</DialogTitle>
          <DialogDescription>
            Select a new plan and billing cycle for your subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <BillingToggle
              value={billingCycle}
              onChange={setBillingCycle}
              annualDiscount={20}
            />
          </div>

          {/* Plan Selection */}
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            <div className="grid gap-4">
              {availablePlans.map((plan) => {
                const price = billingCycle === 'annually' ? plan.pricing.annually : plan.pricing.monthly
                const isCurrentPlan = plan.code === currentSubscription.planCode

                return (
                  <div
                    key={plan.code}
                    className={`relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer hover:bg-accent ${
                      selectedPlan === plan.code ? 'border-primary bg-accent' : ''
                    } ${isCurrentPlan ? 'border-primary/50' : ''}`}
                    onClick={() => setSelectedPlan(plan.code)}
                  >
                    <RadioGroupItem value={plan.code} id={plan.code} />
                    <div className="flex-1">
                      <Label
                        htmlFor={plan.code}
                        className="flex items-center gap-2 cursor-pointer flex-wrap"
                      >
                        {plan.displayName}
                        {isCurrentPlan && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatAmount(price || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per {billingCycle === 'annually' ? 'year' : 'month'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RadioGroup>

          {/* Plan Change Info */}
          {hasChanges && newPlan && !isSamePlan && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Plan Change</AlertTitle>
              <AlertDescription>
                You are switching to {newPlan.displayName}.
                Click &quot;Review Changes&quot; to see what features will change.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          {!isSamePlan && newPlan && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current plan:</span>
                <span className="font-medium">
                  {currentPlan?.displayName} - {formatAmount(currentPlan?.pricing.monthly || 0)}/month
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New plan:</span>
                <span className="font-medium">
                  {newPlan.displayName} - {formatAmount(getNewPrice() || 0)} / {billingCycle === 'annually' ? 'year' : 'month'}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleValidateAndConfirm}
            disabled={isLoading || isValidating || !hasChanges}
          >
            {isLoading || isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isValidating ? 'Checking changes...' : 'Processing...'}
              </>
            ) : isSamePlan && isBillingCycleChange ? (
              'Change Billing Cycle'
            ) : (
              'Review Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Validation Modal */}
      <PlanChangeValidationModal
        open={showValidationModal}
        onOpenChange={setShowValidationModal}
        validation={validationResult}
        targetPlanName={newPlan?.displayName}
        onConfirm={validationResult?.canChange ? handleConfirmFromValidation : undefined}
        isLoading={isLoading}
      />
    </Dialog>
  )
}
