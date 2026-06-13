'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CheckoutStep = 'plan' | 'billing' | 'payment' | 'confirmation'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
  completedSteps: CheckoutStep[]
}

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'plan', label: 'Select Plan' },
  { id: 'billing', label: 'Billing Details' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' },
]

export function CheckoutSteps({ currentStep, completedSteps }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isPast = index < currentIndex

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/25 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    isCurrent
                      ? 'text-primary'
                      : isPast || isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 w-16 transition-colors',
                    index < currentIndex || isCompleted
                      ? 'bg-primary'
                      : 'bg-muted-foreground/25'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
