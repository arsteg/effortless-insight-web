'use client'

import { Check, X, Minus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/billing'

interface PlanComparisonProps {
  plans: Plan[]
  highlightPlan?: string
}

interface FeatureRow {
  name: string
  category: string
  getValue: (plan: Plan) => string | number | boolean
}

const FEATURE_ROWS: FeatureRow[] = [
  // Limits
  {
    name: 'Notices per month',
    category: 'Usage Limits',
    getValue: (plan) => plan.limits.noticesPerMonth === -1 ? 'Unlimited' : plan.limits.noticesPerMonth,
  },
  {
    name: 'Team members',
    category: 'Usage Limits',
    getValue: (plan) => plan.limits.users === -1 ? 'Unlimited' : plan.limits.users,
  },
  {
    name: 'Storage',
    category: 'Usage Limits',
    getValue: (plan) => plan.limits.storageGb === -1 ? 'Unlimited' : `${plan.limits.storageGb} GB`,
  },
  {
    name: 'API requests/month',
    category: 'Usage Limits',
    getValue: (plan) => plan.limits.apiCallsPerMonth === -1 ? 'Unlimited' : (plan.limits.apiCallsPerMonth || 0).toLocaleString(),
  },

  // Core Features
  {
    name: 'Notice management',
    category: 'Core Features',
    getValue: () => true,
  },
  {
    name: 'Document upload',
    category: 'Core Features',
    getValue: () => true,
  },
  {
    name: 'Basic AI analysis',
    category: 'Core Features',
    getValue: () => true,
  },
  {
    name: 'Full AI analysis',
    category: 'Core Features',
    getValue: (plan) => plan.features.includes('full_ai_analysis'),
  },
  {
    name: 'Custom workflows',
    category: 'Core Features',
    getValue: (plan) => plan.features.includes('custom_workflows'),
  },

  // Collaboration
  {
    name: 'Team collaboration',
    category: 'Collaboration',
    getValue: (plan) => plan.limits.users > 1 || plan.limits.users === -1,
  },
  {
    name: 'Role-based access',
    category: 'Collaboration',
    getValue: (plan) => plan.features.includes('rbac') || plan.limits.users === -1,
  },
  {
    name: 'Audit logs',
    category: 'Collaboration',
    getValue: (plan) => plan.features.includes('audit_logs'),
  },

  // Integration & API
  {
    name: 'API access',
    category: 'Integration',
    getValue: (plan) => plan.features.includes('api_access'),
  },
  {
    name: 'Webhooks',
    category: 'Integration',
    getValue: (plan) => plan.features.includes('webhooks'),
  },
  {
    name: 'SSO integration',
    category: 'Integration',
    getValue: (plan) => plan.features.includes('sso'),
  },

  // Support
  {
    name: 'Email support',
    category: 'Support',
    getValue: () => true,
  },
  {
    name: 'Priority support',
    category: 'Support',
    getValue: (plan) => plan.features.includes('priority_support'),
  },
  {
    name: 'Dedicated account manager',
    category: 'Support',
    getValue: (plan) => plan.features.includes('dedicated_support'),
  },
  {
    name: 'SLA guarantee',
    category: 'Support',
    getValue: (plan) => plan.features.includes('sla'),
  },
]

export function PlanComparison({ plans, highlightPlan }: PlanComparisonProps) {
  const sortedPlans = [...plans].sort((a, b) => getPlanTier(a.code) - getPlanTier(b.code))

  // Group features by category
  const categories = [...new Set(FEATURE_ROWS.map((f) => f.category))]

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Features</TableHead>
            {sortedPlans.map((plan) => (
              <TableHead
                key={plan.code}
                className={cn(
                  'text-center min-w-[150px]',
                  highlightPlan === plan.code && 'bg-primary/5'
                )}
              >
                <div className="font-semibold">{plan.displayName}</div>
                {plan.isPopular && (
                  <div className="text-xs text-primary font-normal">Most Popular</div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <>
              {/* Category Header */}
              <TableRow key={category} className="bg-muted/50">
                <TableCell
                  colSpan={sortedPlans.length + 1}
                  className="font-semibold text-sm"
                >
                  {category}
                </TableCell>
              </TableRow>

              {/* Features in Category */}
              {FEATURE_ROWS.filter((f) => f.category === category).map((feature) => (
                <TableRow key={feature.name}>
                  <TableCell className="text-sm">{feature.name}</TableCell>
                  {sortedPlans.map((plan) => {
                    const value = feature.getValue(plan)
                    return (
                      <TableCell
                        key={plan.code}
                        className={cn(
                          'text-center',
                          highlightPlan === plan.code && 'bg-primary/5'
                        )}
                      >
                        <FeatureValue value={value} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function FeatureValue({ value }: { value: string | number | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-600 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    )
  }

  if (value === 0 || value === '0') {
    return <Minus className="h-5 w-5 text-muted-foreground/50 mx-auto" />
  }

  return <span className="text-sm">{value}</span>
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
