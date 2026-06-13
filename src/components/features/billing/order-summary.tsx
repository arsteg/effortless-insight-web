'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/lib/api/billing'
import type { Plan, BillingCycle, CouponValidation } from '@/types/billing'

interface OrderSummaryProps {
  plan: Plan
  billingCycle: BillingCycle
  additionalSeats?: number
  seatPrice?: number
  coupon?: CouponValidation | null
  companyState?: string
  companyGstin?: string
}

const GST_RATE = 18
const COMPANY_STATE = 'Karnataka' // Company is based in Karnataka

export function OrderSummary({
  plan,
  billingCycle,
  additionalSeats = 0,
  seatPrice = 0,
  coupon,
  companyState,
}: OrderSummaryProps) {
  const basePrice = billingCycle === 'annually' ? plan.pricing.annually : plan.pricing.monthly
  const seatsTotal = additionalSeats * seatPrice
  const subtotal = (basePrice || 0) + seatsTotal

  // Calculate discount
  let discount = 0
  if (coupon?.valid) {
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * (coupon.discountValue || 0)) / 100
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount
      }
    } else {
      discount = coupon.discountValue || 0
    }
  }

  const afterDiscount = subtotal - discount

  // Calculate GST
  const isIntraState = companyState === COMPANY_STATE
  const gstAmount = (afterDiscount * GST_RATE) / 100
  const cgst = isIntraState ? gstAmount / 2 : 0
  const sgst = isIntraState ? gstAmount / 2 : 0
  const igst = isIntraState ? 0 : gstAmount

  const total = afterDiscount + gstAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan */}
        <div className="flex justify-between">
          <div>
            <p className="font-medium">{plan.displayName} Plan</p>
            <p className="text-sm text-muted-foreground">
              {billingCycle === 'annually' ? 'Annual' : 'Monthly'} billing
            </p>
          </div>
          <p className="font-medium">{formatAmount(basePrice || 0)}</p>
        </div>

        {/* Additional Seats */}
        {additionalSeats > 0 && (
          <div className="flex justify-between text-sm">
            <span>
              Additional seats (x{additionalSeats})
            </span>
            <span>{formatAmount(seatsTotal)}</span>
          </div>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatAmount(subtotal)}</span>
        </div>

        {/* Coupon Discount */}
        {coupon?.valid && discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-2">
              Discount
              <Badge variant="secondary" className="text-xs">
                {coupon.couponCode}
              </Badge>
            </span>
            <span>-{formatAmount(discount)}</span>
          </div>
        )}

        {/* GST Breakdown */}
        {companyState && (
          <>
            <Separator />
            {isIntraState ? (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>CGST (9%)</span>
                  <span>{formatAmount(cgst)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>SGST (9%)</span>
                  <span>{formatAmount(sgst)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IGST (18%)</span>
                <span>{formatAmount(igst)}</span>
              </div>
            )}
          </>
        )}

        <Separator />

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatAmount(total)}</span>
        </div>

        {/* Billing Info */}
        <p className="text-xs text-muted-foreground">
          {billingCycle === 'annually' ? (
            <>Billed annually. You save {plan.pricing.annualDiscount}% compared to monthly billing.</>
          ) : (
            <>Billed monthly. Switch to annual billing to save {plan.pricing.annualDiscount}%.</>
          )}
        </p>

        {/* Trial Info */}
        {plan.trialDays > 0 && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium text-primary">
              {plan.trialDays}-day free trial included
            </p>
            <p className="text-xs text-muted-foreground">
              You won&apos;t be charged until your trial ends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
