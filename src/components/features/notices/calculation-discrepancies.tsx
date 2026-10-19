'use client'

import { AlertTriangle, XCircle, Calculator } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { CalculationDiscrepancy } from '@/types'

interface CalculationDiscrepanciesProps {
  discrepancies: CalculationDiscrepancy[]
}

export function CalculationDiscrepancies({ discrepancies }: CalculationDiscrepanciesProps) {
  if (!discrepancies || discrepancies.length === 0) {
    return null
  }

  const hasErrors = discrepancies.some((d) => d.severity === 'error')

  return (
    <Alert variant={hasErrors ? 'destructive' : 'default'} className="border-l-4 border-l-amber-500">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            hasErrors ? 'bg-coral-100 text-coral-600' : 'bg-amber-100 text-amber-600'
          )}
        >
          <Calculator className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <AlertTitle className="mb-2 flex items-center gap-2">
            {hasErrors ? (
              <>
                <XCircle className="h-4 w-4" />
                Calculation Errors Found
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Calculation Discrepancies Detected
              </>
            )}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The following calculation issues were found in this notice. Please verify against the
              original document.
            </p>
            <ul className="space-y-2">
              {discrepancies.map((discrepancy, index) => (
                <li
                  key={index}
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-3 text-sm',
                    discrepancy.severity === 'error'
                      ? 'border-coral-200 bg-coral-50'
                      : 'border-amber-200 bg-amber-50'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 shrink-0',
                      discrepancy.severity === 'error' ? 'text-coral-600' : 'text-amber-600'
                    )}
                  >
                    {discrepancy.severity === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{discrepancy.message}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        Field: <code className="rounded bg-muted px-1">{discrepancy.field}</code>
                      </span>
                      {discrepancy.expected !== 0 && (
                        <span>
                          Expected:{' '}
                          <span className="font-medium">
                            {formatCurrency(discrepancy.expected)}
                          </span>
                        </span>
                      )}
                      <span>
                        Actual:{' '}
                        <span className="font-medium">{formatCurrency(discrepancy.actual)}</span>
                      </span>
                      {discrepancy.difference !== 0 && (
                        <span>
                          Difference:{' '}
                          <span className="font-medium text-coral-600">
                            {formatCurrency(discrepancy.difference)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}
