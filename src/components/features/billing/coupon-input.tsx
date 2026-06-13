'use client'

import { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { CouponValidation } from '@/types/billing'

interface CouponInputProps {
  onValidate: (code: string) => Promise<CouponValidation>
  onApply: (validation: CouponValidation) => void
  onRemove: () => void
  appliedCoupon?: CouponValidation | null
  planCode: string
  billingCycle: string
}

export function CouponInput({
  onValidate,
  onApply,
  onRemove,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleValidate = async () => {
    if (!code.trim()) return

    setIsValidating(true)
    setError(null)

    try {
      const validation = await onValidate(code.trim().toUpperCase())

      if (validation.valid) {
        onApply(validation)
        setCode('')
      } else {
        setError(validation.message || 'Invalid coupon code')
      }
    } catch {
      setError('Failed to validate coupon')
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleValidate()
    }
  }

  if (appliedCoupon?.valid) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {appliedCoupon.couponCode}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {appliedCoupon.discountType === 'percentage'
                ? `${appliedCoupon.discountValue}% off`
                : `${formatAmount(appliedCoupon.discountValue || 0)} off`}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-green-700 hover:text-green-800 hover:bg-green-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            className={cn('pl-9', error && 'border-destructive')}
            disabled={isValidating}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={!code.trim() || isValidating}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}
