'use client'

import { cn } from '@/lib/utils'
import type { BillingCycle } from '@/types/billing'

/** Billing cycle configuration */
const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

interface BillingToggleProps {
  value: BillingCycle
  onChange: (value: BillingCycle) => void
  /** Optional: Only show cycles in this array. If not provided, shows monthly and annually by default. */
  allowedCycles?: BillingCycle[]
  /** Discount percentage for annual billing (shown as badge) */
  annualDiscount?: number
}

export function BillingToggle({
  value,
  onChange,
  allowedCycles,
  annualDiscount
}: BillingToggleProps) {
  // Default to monthly and annually if not specified
  const cycles = allowedCycles && allowedCycles.length > 0
    ? BILLING_CYCLES.filter(c => allowedCycles.includes(c.value))
    : BILLING_CYCLES.filter(c => c.value !== 'weekly') // Default: monthly + annually

  // If only one cycle is allowed, don't show the toggle
  if (cycles.length <= 1) {
    return null
  }

  return (
    <div className="inline-flex items-center rounded-full border bg-muted p-1">
      {cycles.map((cycle) => (
        <button
          key={cycle.value}
          type="button"
          onClick={() => onChange(cycle.value)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            value === cycle.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {cycle.label}
          {cycle.value === 'annually' && annualDiscount && annualDiscount > 0 && (
            <span className="ml-1 text-xs text-primary">
              (Save {annualDiscount}%)
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
