'use client'

import { useState } from 'react'
import { AlertCircle, ArrowUp, ArrowDown, Calendar } from 'lucide-react'
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
import { formatAmount } from '@/lib/api/billing'
import { BillingToggle } from './billing-toggle'
import type { Plan, BillingCycle, Subscription } from '@/types/billing'

interface ChangePlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans: Plan[]
  currentSubscription: Subscription
  onConfirm: (planCode: string, billingCycle: BillingCycle, immediate: boolean) => void
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
  const [immediate, setImmediate] = useState(true)

  const currentPlan = plans.find((p) => p.code === currentSubscription.planCode)
  const newPlan = plans.find((p) => p.code === selectedPlan)

  const isUpgrade = newPlan && currentPlan ? getPlanTier(newPlan.code) > getPlanTier(currentPlan.code) : false
  const isDowngrade = newPlan && currentPlan ? getPlanTier(newPlan.code) < getPlanTier(currentPlan.code) : false
  const isSamePlan = selectedPlan === currentSubscription.planCode
  const isBillingCycleChange = billingCycle !== currentSubscription.billingCycle

  const availablePlans = plans.filter((p) => !p.contactSales && p.code !== 'free')

  const getNewPrice = () => {
    if (!newPlan) return 0
    return billingCycle === 'annually' ? newPlan.pricing.annually : newPlan.pricing.monthly
  }

  const handleConfirm = () => {
    onConfirm(selectedPlan, billingCycle, immediate)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Your Plan</DialogTitle>
          <DialogDescription>
            Select a new plan and billing cycle for your subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                    }`}
                    onClick={() => setSelectedPlan(plan.code)}
                  >
                    <RadioGroupItem value={plan.code} id={plan.code} />
                    <div className="flex-1">
                      <Label
                        htmlFor={plan.code}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {plan.displayName}
                        {isCurrentPlan && (
                          <span className="text-xs text-muted-foreground">(Current)</span>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatAmount(price || 0)}</div>
                      <div className="text-xs text-muted-foreground">
                        per {billingCycle === 'annually' ? 'year' : 'month'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </RadioGroup>

          {/* Change Type Info */}
          {!isSamePlan && newPlan && (
            <Alert variant={isUpgrade ? 'default' : 'destructive'}>
              {isUpgrade ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <AlertTitle>
                {isUpgrade ? 'Upgrade' : 'Downgrade'} to {newPlan.displayName}
              </AlertTitle>
              <AlertDescription>
                {isUpgrade ? (
                  <>
                    Your new plan will be activated immediately. You will be charged a
                    prorated amount for the remainder of your current billing period.
                  </>
                ) : (
                  <>
                    Your downgrade will take effect at the end of your current billing
                    period on {formatDate(currentSubscription.currentPeriodEnd)}.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Billing Cycle Change Only */}
          {isSamePlan && isBillingCycleChange && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>Billing Cycle Change</AlertTitle>
              <AlertDescription>
                Your billing cycle will change to {billingCycle} at the end of your
                current billing period.
              </AlertDescription>
            </Alert>
          )}

          {/* Downgrade Immediate Option */}
          {isDowngrade && (
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="immediate"
                checked={immediate}
                onChange={(e) => setImmediate(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="immediate" className="text-sm">
                Apply immediately (you will receive a prorated credit)
              </Label>
            </div>
          )}

          {/* Summary */}
          {!isSamePlan && newPlan && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>New plan price:</span>
                <span className="font-medium">
                  {formatAmount(getNewPrice() || 0)} / {billingCycle === 'annually' ? 'year' : 'month'}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (isSamePlan && !isBillingCycleChange)}
          >
            {isLoading ? 'Processing...' : 'Confirm Change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getPlanTier(planCode: string): number {
  const tiers: Record<string, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
  }
  return tiers[planCode] ?? 0
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
