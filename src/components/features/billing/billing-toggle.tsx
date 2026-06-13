'use client'

import { cn } from '@/lib/utils'
import type { BillingCycle } from '@/types/billing'

interface BillingToggleProps {
  value: BillingCycle
  onChange: (value: BillingCycle) => void
  annualDiscount?: number
}

export function BillingToggle({ value, onChange, annualDiscount }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full border bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(
          'rounded-full px-6 py-2 text-sm font-medium transition-colors',
          value === 'monthly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange('annually')}
        className={cn(
          'rounded-full px-6 py-2 text-sm font-medium transition-colors',
          value === 'annually'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Annually
        {annualDiscount && (
          <span className="ml-1 text-xs text-primary">
            (Save {annualDiscount}%)
          </span>
        )}
      </button>
    </div>
  )
}
