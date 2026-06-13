'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/api/billing'
import type { Plan, BillingCycle } from '@/types/billing'

interface PlanCardProps {
  plan: Plan
  billingCycle: BillingCycle
  currentPlanCode?: string
  onSelect: (planCode: string) => void
  isLoading?: boolean
}

export function PlanCard({
  plan,
  billingCycle,
  currentPlanCode,
  onSelect,
  isLoading,
}: PlanCardProps) {
  const isCurrentPlan = plan.code === currentPlanCode
  const price = billingCycle === 'annually' ? plan.pricing.annually : plan.pricing.monthly
  const isFreePlan = price === 0

  // Get features to display
  const features = getFeaturesToDisplay(plan)

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.isPopular && 'border-primary shadow-lg',
        isCurrentPlan && 'ring-2 ring-primary'
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pt-8">
        <CardTitle className="flex items-center justify-between">
          <span>{plan.displayName}</span>
          {isCurrentPlan && (
            <Badge variant="outline">Current</Badge>
          )}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="mb-6">
          {plan.contactSales ? (
            <div>
              <span className="text-3xl font-bold">Custom</span>
              <p className="text-sm text-muted-foreground">
                Starting at {formatAmount(plan.pricing.monthly || 0)}/mo
              </p>
            </div>
          ) : (
            <div>
              <span className="text-4xl font-bold">
                {isFreePlan ? 'Free' : formatAmount(price || 0)}
              </span>
              {!isFreePlan && (
                <span className="text-muted-foreground">
                  /{billingCycle === 'annually' ? 'year' : 'month'}
                </span>
              )}
              {billingCycle === 'annually' && plan.pricing.annualDiscount && (
                <Badge variant="secondary" className="ml-2">
                  Save {plan.pricing.annualDiscount}%
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {plan.contactSales ? (
          <Button className="w-full" variant="outline" asChild>
            <a href="mailto:sales@effortlessinsight.com">Contact Sales</a>
          </Button>
        ) : isCurrentPlan ? (
          <Button className="w-full" variant="secondary" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={plan.isPopular ? 'default' : 'outline'}
            onClick={() => onSelect(plan.code)}
            disabled={isLoading}
          >
            {isFreePlan ? 'Get Started' : `Upgrade to ${plan.displayName}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function getFeaturesToDisplay(plan: Plan): string[] {
  const features: string[] = []

  // Limits
  if (plan.limits.noticesPerMonth === -1) {
    features.push('Unlimited notices')
  } else {
    features.push(`${plan.limits.noticesPerMonth} notices/month`)
  }

  if (plan.limits.users === -1) {
    features.push('Unlimited users')
  } else {
    features.push(`${plan.limits.users} users`)
  }

  if (plan.limits.storageGb === -1) {
    features.push('Unlimited storage')
  } else {
    features.push(`${plan.limits.storageGb}GB storage`)
  }

  // Feature flags
  if (plan.features.includes('priority_support')) {
    features.push('Priority support')
  }

  if (plan.features.includes('full_ai_analysis')) {
    features.push('Full AI analysis')
  }

  if (plan.features.includes('api_access')) {
    features.push('API access')
  }

  if (plan.features.includes('custom_workflows')) {
    features.push('Custom workflows')
  }

  if (plan.features.includes('audit_logs')) {
    features.push('Audit logs')
  }

  // Add trial info
  if (plan.trialDays > 0) {
    features.push(`${plan.trialDays}-day free trial`)
  }

  return features
}
