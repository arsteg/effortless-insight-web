'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Loader2, Rocket, Shield, Zap, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BillingToggle } from '@/components/features/billing'
import { usePlans, useStartTrial, useCurrentSubscription } from '@/hooks/use-billing'
import { useAuthStore } from '@/stores'
import { formatAmount } from '@/lib/api/billing'
import { cn } from '@/lib/utils'
import type { Plan, BillingCycle } from '@/types/billing'

function SelectPlanContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const { data: plans, isLoading: isLoadingPlans } = usePlans()
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription()
  const startTrial = useStartTrial()

  // Check if user has already used a trial (from subscription data)
  const hasUsedTrial = subscription?.hasUsedTrial ?? false

  // Check if this is an expired trial - user should only see their trial plan
  const isExpiredTrial = hasUsedTrial && subscription?.status === 'expired'
  const trialPlanCode = subscription?.planCode

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan.code)

    // Plan selection is stored in BillingSubscription table when trial starts
    // No need for localStorage - subscription data contains planCode and billingCycle

    const isFreePlan = plan.pricing.monthly === 0 || plan.pricing.annually === 0

    // If plan has trial days AND user hasn't used trial yet, start trial
    if (plan.trialDays > 0 && !hasUsedTrial) {
      try {
        await startTrial.mutateAsync({
          planCode: plan.code,
          billingCycle,
        })
        // Trial started successfully - redirect to dashboard
        router.push('/dashboard')
      } catch {
        setSelectedPlan(null)
      }
    } else if (isFreePlan) {
      // Free plan - activate immediately
      try {
        await startTrial.mutateAsync({
          planCode: plan.code,
          billingCycle,
        })
        router.push('/dashboard')
      } catch {
        setSelectedPlan(null)
      }
    } else {
      // Paid plan (either no trial days OR user already used trial) - go to checkout
      router.push(`/checkout?plan=${plan.code}&billing=${billingCycle}`)
    }
  }

  if (isLoadingPlans || isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Filter out enterprise/contact sales plans for self-service
  let availablePlans = plans?.filter((p) => !p.contactSales) || []

  // If trial expired, only show the plan the user was trialing
  // This ensures they subscribe to the same plan to restore their features
  if (isExpiredTrial && trialPlanCode) {
    availablePlans = availablePlans.filter((p) => p.code === trialPlanCode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Rocket className="mr-1 h-3 w-3" />
            {isExpiredTrial ? 'Trial Expired' : 'Welcome to EffortlessInsight'}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {isExpiredTrial ? (
              <>
                Continue with your{' '}
                <span className="text-primary">{subscription?.planName}</span> plan
              </>
            ) : (
              <>
                Choose the right plan for{' '}
                <span className="text-primary">your business</span>
              </>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isExpiredTrial
              ? 'Your trial has ended. Subscribe now to continue using all the features you had access to during your trial.'
              : 'Start with a free trial and upgrade when you\'re ready. All plans include our core GST notice management features.'}
          </p>
          {user?.name && !isExpiredTrial && (
            <p className="mt-2 text-sm text-muted-foreground">
              Hi <strong>{user.name}</strong>, let&apos;s get you started!
            </p>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <BillingToggle value={billingCycle} onChange={setBillingCycle} annualDiscount={17} />
        </div>

        {/* Plans Grid */}
        <div
          className={cn(
            'grid gap-6 mb-12',
            isExpiredTrial
              ? 'max-w-md mx-auto' // Single plan centered for expired trial
              : 'md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {availablePlans.map((plan) => (
            <SelectablePlanCard
              key={plan.code}
              plan={plan}
              billingCycle={billingCycle}
              isSelected={selectedPlan === plan.code}
              isLoading={selectedPlan === plan.code && startTrial.isPending}
              hasUsedTrial={hasUsedTrial}
              isExpiredTrial={isExpiredTrial}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-card rounded-xl p-8 border">
          <h2 className="text-2xl font-bold text-center mb-8">
            All plans include these features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureHighlight
              icon={Shield}
              title="Bank-grade Security"
              description="Your data is encrypted and stored securely with SOC 2 compliance"
            />
            <FeatureHighlight
              icon={Zap}
              title="AI-Powered Analysis"
              description="Automatic extraction and categorization of GST notices"
            />
            <FeatureHighlight
              icon={Users}
              title="Team Collaboration"
              description="Work together with your team on notice management"
            />
            <FeatureHighlight
              icon={Rocket}
              title="Quick Setup"
              description="Get started instantly with no complex configuration required"
            />
          </div>
        </div>

        {/* FAQ or Help */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Have questions?{' '}
            <a href="mailto:info@arsteg.com" className="text-primary hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

interface SelectablePlanCardProps {
  plan: Plan
  billingCycle: BillingCycle
  isSelected: boolean
  isLoading: boolean
  hasUsedTrial: boolean
  isExpiredTrial: boolean
  onSelect: () => void
}

function SelectablePlanCard({
  plan,
  billingCycle,
  isSelected,
  isLoading,
  hasUsedTrial,
  isExpiredTrial,
  onSelect,
}: SelectablePlanCardProps) {
  const price = billingCycle === 'annually' ? plan.pricing.annually : plan.pricing.monthly
  const isFreePlan = price === 0
  const hasFreeTrial = plan.trialDays > 0

  const features = getFeaturesToDisplay(plan)

  // Determine button text based on trial eligibility
  const getButtonText = () => {
    if (isLoading) return 'Processing...'
    // Expired trial - show clear subscribe action
    if (isExpiredTrial) return 'Subscribe Now'
    // Only show trial button if plan has trial AND user hasn't used trial yet
    if (hasFreeTrial && !hasUsedTrial) return `Start ${plan.trialDays}-Day Free Trial`
    if (isFreePlan) return 'Get Started Free'
    return 'Subscribe Now'
  }

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-200',
        plan.isPopular && 'border-primary shadow-lg scale-105',
        isSelected && 'ring-2 ring-primary'
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="flex items-center gap-1 bg-primary">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className={cn('pt-8', plan.isPopular && 'pt-10')}>
        <CardTitle className="text-xl">{plan.displayName}</CardTitle>
        <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {isFreePlan ? 'Free' : formatAmount(price || 0)}
            </span>
            {!isFreePlan && (
              <span className="text-muted-foreground">
                /{billingCycle === 'annually' ? 'year' : 'month'}
              </span>
            )}
          </div>
          {billingCycle === 'annually' && plan.pricing.annualDiscount && !isFreePlan && (
            <Badge variant="secondary" className="mt-2">
              Save {plan.pricing.annualDiscount}% annually
            </Badge>
          )}
          {hasFreeTrial && !isFreePlan && !hasUsedTrial && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              {plan.trialDays}-day free trial included
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.isPopular ? 'default' : 'outline'}
          size="lg"
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface FeatureHighlightProps {
  icon: React.ElementType
  title: string
  description: string
}

function FeatureHighlight({ icon: Icon, title, description }: FeatureHighlightProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
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
    features.push('Unlimited team members')
  } else {
    features.push(`Up to ${plan.limits.users} team members`)
  }

  if (plan.limits.storageGb === -1) {
    features.push('Unlimited storage')
  } else {
    features.push(`${plan.limits.storageGb}GB document storage`)
  }

  // Key features
  if (plan.features.includes('full_ai_analysis')) {
    features.push('Full AI-powered analysis')
  } else if (plan.features.includes('basic_ai_analysis')) {
    features.push('Basic AI analysis')
  }

  if (plan.features.includes('priority_support')) {
    features.push('Priority support')
  } else {
    features.push('Email support')
  }

  if (plan.features.includes('api_access')) {
    features.push('API access')
  }

  return features.slice(0, 6) // Limit to 6 features for cleaner display
}

export default function SelectPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SelectPlanContent />
    </Suspense>
  )
}
