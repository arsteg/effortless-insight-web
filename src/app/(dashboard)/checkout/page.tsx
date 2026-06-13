'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckoutSteps,
  BillingToggle,
  PlanCard,
  BillingDetailsForm,
  OrderSummary,
  CouponInput,
} from '@/components/features/billing'
import type { CheckoutStep, BillingDetailsFormValues } from '@/components/features/billing'
import {
  usePlans,
  useCurrentSubscription,
  useCreateSubscription,
  useVerifyPayment,
  useValidateCoupon,
  useRazorpayCheckout,
} from '@/hooks/use-billing'
import { useOrganization } from '@/hooks/use-settings'
import type { BillingCycle, CouponValidation } from '@/types/billing'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('plan')
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([])
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>(
    searchParams.get('plan') || ''
  )
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    (searchParams.get('billing') as BillingCycle) || 'annually'
  )
  const [billingDetails, setBillingDetails] = useState<BillingDetailsFormValues | null>(null)
  const [additionalSeats] = useState(0)
  const [coupon, setCoupon] = useState<CouponValidation | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Queries
  const { data: plans, isLoading: isLoadingPlans } = usePlans()
  const { data: subscription } = useCurrentSubscription()
  const { data: organization } = useOrganization()

  // Mutations
  const createSubscription = useCreateSubscription()
  const verifyPayment = useVerifyPayment()
  const validateCoupon = useValidateCoupon()
  const { openCheckout } = useRazorpayCheckout()

  // Get selected plan
  const selectedPlan = plans?.find((p) => p.code === selectedPlanCode)

  // Handle plan selection from URL
  useEffect(() => {
    if (selectedPlanCode && selectedPlan) {
      setCompletedSteps(['plan'])
      setCurrentStep('billing')
    }
  }, [selectedPlanCode, selectedPlan])

  const handlePlanSelect = (planCode: string) => {
    setSelectedPlanCode(planCode)
    setCompletedSteps(['plan'])
    setCurrentStep('billing')
  }

  const handleBillingDetailsSubmit = (data: BillingDetailsFormValues) => {
    setBillingDetails(data)
    setCompletedSteps(['plan', 'billing'])
    setCurrentStep('payment')
  }

  const handleValidateCoupon = async (code: string): Promise<CouponValidation> => {
    const result = await validateCoupon.mutateAsync({
      code,
      planCode: selectedPlanCode,
      billingCycle,
    })
    return {
      valid: result.isValid,
      couponCode: result.coupon?.code,
      discountType: result.coupon?.discountType === 'percent' ? 'percentage' : result.coupon?.discountType,
      discountValue: result.coupon?.discountValue,
      maxDiscountAmount: result.coupon?.maxDiscountAmount,
      message: result.errorMessage,
    }
  }

  const handleApplyCoupon = (validation: CouponValidation) => {
    setCoupon(validation)
  }

  const handleRemoveCoupon = () => {
    setCoupon(null)
  }

  const handlePayment = async () => {
    if (!selectedPlan || !billingDetails) return

    setIsProcessing(true)

    try {
      // Create subscription order
      const orderResponse = await createSubscription.mutateAsync({
        planCode: selectedPlanCode,
        billingCycle,
        additionalSeats,
        billingDetails: {
          organizationName: billingDetails.companyName,
          gstin: billingDetails.gstin,
          address: billingDetails.addressLine1,
          addressLine2: billingDetails.addressLine2,
          city: billingDetails.city,
          state: billingDetails.state,
          pincode: billingDetails.postalCode,
          email: billingDetails.billingEmail,
          phone: billingDetails.phone,
        },
        couponCode: coupon?.couponCode,
        autoRenew: true,
      })

      // Open Razorpay checkout
      await openCheckout(
        {
          key: orderResponse.razorpayOrder.key,
          amount: orderResponse.razorpayOrder.amount,
          currency: orderResponse.razorpayOrder.currency,
          name: 'EffortlessInsight',
          description: `${selectedPlan.displayName} - ${billingCycle === 'annually' ? 'Annual' : 'Monthly'}`,
          orderId: orderResponse.razorpayOrder.id,
          prefill: {
            name: billingDetails.companyName,
            email: billingDetails.billingEmail,
            contact: billingDetails.phone,
          },
          theme: {
            color: '#7C3AED',
          },
        },
        async (response) => {
          // Verify payment
          await verifyPayment.mutateAsync({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          })

          setCompletedSteps(['plan', 'billing', 'payment'])
          setCurrentStep('confirmation')
        },
        () => {
          setIsProcessing(false)
        }
      )
    } catch {
      setIsProcessing(false)
    }
  }

  const handleBackToBilling = () => {
    setCurrentStep('billing')
  }

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={currentStep === 'plan' ? '/settings/billing' : '#'}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentStep === 'confirmation' ? 'Welcome!' : 'Checkout'}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 'confirmation'
              ? 'Your subscription is now active'
              : 'Complete your subscription purchase'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      {currentStep !== 'confirmation' && (
        <div className="mb-12">
          <CheckoutSteps currentStep={currentStep} completedSteps={completedSteps} />
        </div>
      )}

      {/* Step Content */}
      {currentStep === 'plan' && (
        <div className="space-y-8">
          {/* Billing Toggle */}
          <div className="flex justify-center">
            <BillingToggle
              value={billingCycle}
              onChange={setBillingCycle}
              annualDiscount={20}
            />
          </div>

          {/* Plan Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans
              ?.filter((p) => !p.contactSales)
              .map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  billingCycle={billingCycle}
                  currentPlanCode={subscription?.planCode}
                  onSelect={handlePlanSelect}
                />
              ))}
          </div>
        </div>
      )}

      {currentStep === 'billing' && selectedPlan && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BillingDetailsForm
              defaultValues={billingDetails || undefined}
              organizationName={organization?.name}
              onSubmit={handleBillingDetailsSubmit}
              onBack={() => {
                setCurrentStep('plan')
                setCompletedSteps([])
              }}
            />
          </div>
          <div>
            <OrderSummary
              plan={selectedPlan}
              billingCycle={billingCycle}
              additionalSeats={additionalSeats}
            />
          </div>
        </div>
      )}

      {currentStep === 'payment' && selectedPlan && billingDetails && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Review */}
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Summary */}
                <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedPlan.displayName} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {billingCycle === 'annually' ? 'Annual' : 'Monthly'} billing
                    </p>
                  </div>
                  <Button variant="link" onClick={handleBackToBilling}>
                    Edit
                  </Button>
                </div>

                {/* Billing Details Summary */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium">Billing Details</h4>
                    <Button variant="link" onClick={handleBackToBilling}>
                      Edit
                    </Button>
                  </div>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{billingDetails.companyName}</p>
                    <p>{billingDetails.billingEmail}</p>
                    <p>
                      {billingDetails.addressLine1}
                      {billingDetails.addressLine2 && `, ${billingDetails.addressLine2}`}
                    </p>
                    <p>
                      {billingDetails.city}, {billingDetails.state}{' '}
                      {billingDetails.postalCode}
                    </p>
                    {billingDetails.gstin && <p>GSTIN: {billingDetails.gstin}</p>}
                  </div>
                </div>

                {/* Coupon */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-4">Have a coupon?</h4>
                  <CouponInput
                    onValidate={handleValidateCoupon}
                    onApply={handleApplyCoupon}
                    onRemove={handleRemoveCoupon}
                    appliedCoupon={coupon}
                    planCode={selectedPlanCode}
                    billingCycle={billingCycle}
                  />
                </div>

                {/* Pay Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || createSubscription.isPending}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our{' '}
                  <Link href="/terms" className="underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline">
                    Privacy Policy
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <OrderSummary
              plan={selectedPlan}
              billingCycle={billingCycle}
              additionalSeats={additionalSeats}
              coupon={coupon}
              companyState={billingDetails.state}
              companyGstin={billingDetails.gstin}
            />
          </div>
        </div>
      )}

      {currentStep === 'confirmation' && (
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground mb-8">
            Thank you for subscribing to {selectedPlan?.displayName}. Your
            subscription is now active and you have full access to all features.
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/settings/billing">View Billing Details</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </div>
  )
}
