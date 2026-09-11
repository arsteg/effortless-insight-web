'use client'

import { useState } from 'react'
import { ArrowLeft, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CurrentPlanCard,
  UsageWidget,
  BillingHistory,
  PaymentMethods,
  ChangePlanModal,
  CancelSubscriptionModal,
  PauseSubscriptionModal,
  AddSeatsModal,
} from '@/components/features/billing'
import {
  useCurrentSubscription,
  useUsage,
  useInvoices,
  usePlansWithSettings,
  useChangePlan,
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
  useAddSeats,
  useVerifySeatsPayment,
  useRazorpayCheckout,
  useDownloadInvoice,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from '@/hooks/use-billing'
import { usePermissions } from '@/hooks/use-permissions'
import type { BillingCycle } from '@/types/billing'

export default function BillingSettingsPage() {
  const router = useRouter()
  const { isOwner } = usePermissions()
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showAddSeatsModal, setShowAddSeatsModal] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1)

  // Non-owners have read-only access to billing
  const canEdit = isOwner

  // Queries
  const { data: subscription, isLoading: isLoadingSubscription } = useCurrentSubscription()
  const { data: usage, isLoading: isLoadingUsage } = useUsage()
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices(invoicePage, 10)
  const { data: plansData, isLoading: isLoadingPlans } = usePlansWithSettings()
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods()

  // Extract plans and global settings
  const plans = plansData?.plans
  const globalSettings = plansData?.globalSettings

  // Mutations
  const changePlan = useChangePlan()
  const cancelSubscription = useCancelSubscription()
  const pauseSubscription = usePauseSubscription()
  const resumeSubscription = useResumeSubscription()
  const addSeats = useAddSeats()
  const verifySeatsPayment = useVerifySeatsPayment()
  const { openCheckout } = useRazorpayCheckout()
  const downloadInvoice = useDownloadInvoice()
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()

  const isLoading = isLoadingSubscription || isLoadingPlans

  const handleUpgrade = () => {
    // During trial, no action allowed - informational only
    if (subscription?.isTrialing) {
      return
    }

    if (subscription) {
      setShowChangePlanModal(true)
    } else {
      router.push('/checkout')
    }
  }

  const handleAddSeats = () => {
    setShowAddSeatsModal(true)
  }

  // Check if user can add seats:
  // - Not on trial
  // - Not on free plan
  // - Plan allows additional users
  const currentPlan = plans?.find(p => p.code === subscription?.planCode)
  const isFreePlan = currentPlan ? (currentPlan.pricing.monthly === 0 && currentPlan.pricing.annually === 0) : false
  const canAddSeats = subscription
    && subscription.status === 'active'
    && !isFreePlan
    && currentPlan?.limits.additionalUsersAllowed === true

  const handleCancel = () => {
    setShowCancelModal(true)
  }

  const handlePause = () => {
    setShowPauseModal(true)
  }

  const handleResume = () => {
    resumeSubscription.mutate()
  }

  const handleChangePlanConfirm = (
    planCode: string,
    billingCycle: BillingCycle
  ) => {
    changePlan.mutate(
      {
        newPlanCode: planCode,
        billingCycle,
      },
      {
        onSuccess: () => {
          setShowChangePlanModal(false)
        },
        onError: (error: Error) => {
          // Check if this is a PAYMENT_REQUIRED error (free to paid transition)
          // The error code is in the Axios response data
          const axiosError = error as { response?: { data?: { code?: string } } }
          const errorCode = axiosError.response?.data?.code
          if (errorCode === 'PAYMENT_REQUIRED' || error.message?.includes('PAYMENT_REQUIRED')) {
            setShowChangePlanModal(false)
            // Redirect to checkout with the selected plan and billing cycle
            router.push(`/checkout?plan=${planCode}&billing=${billingCycle}`)
            return
          }
          // Other errors are handled by the hook's default onError
        },
      }
    )
  }

  const handleCancelConfirm = (
    reason: string,
    feedback?: string,
    immediate?: boolean
  ) => {
    cancelSubscription.mutate(
      { reason, feedback, cancelImmediately: immediate ?? false },
      {
        onSuccess: () => {
          setShowCancelModal(false)
        },
      }
    )
  }

  const handlePauseConfirm = (reason: string, resumeAt?: string) => {
    pauseSubscription.mutate(
      { reason, resumeAt },
      {
        onSuccess: () => {
          setShowPauseModal(false)
        },
      }
    )
  }

  const handleAddSeatsConfirm = (quantity: number) => {
    addSeats.mutate(
      { additionalSeats: quantity },
      {
        onSuccess: (data) => {
          if (data.razorpayOrder) {
            // Payment required - open Razorpay checkout
            openCheckout(
              {
                key: data.razorpayOrder.key,
                amount: data.razorpayOrder.amount,
                currency: data.razorpayOrder.currency,
                name: 'EffortlessInsight',
                description: `Add ${quantity} seat(s)`,
                orderId: data.razorpayOrder.id,
              },
              (response) => {
                // Payment successful - verify and apply seats
                verifySeatsPayment.mutate({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  additionalSeats: quantity,
                })
                setShowAddSeatsModal(false)
              },
              () => {
                // Payment dismissed - do nothing, modal stays open
              }
            )
          } else {
            // No payment required - seats already applied
            setShowAddSeatsModal(false)
          }
        },
      }
    )
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    downloadInvoice.mutate(invoiceId)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods.
          </p>
        </div>
      </div>

      {/* Read-only banner for non-owners */}
      {!canEdit && (
        <Alert>
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            You have view-only access to billing settings. Only the organization owner can make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Upgrade-only policy message */}
      {subscription && globalSettings?.downgradesAllowed === false && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Upgrade-Only Policy</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Once subscribed, you can only upgrade to a higher plan. Downgrades to lower plans are not available.
            If you need to change your plan or have any questions, please contact our support team.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan - during trial, no action buttons are shown */}
      <CurrentPlanCard
        subscription={subscription}
        isLoading={isLoadingSubscription}
        onUpgrade={canEdit && !subscription?.isTrialing ? handleUpgrade : undefined}
        onAddSeats={canEdit ? handleAddSeats : undefined}
        canAddSeats={canEdit && canAddSeats}
        onCancel={canEdit && !subscription?.isTrialing ? handleCancel : undefined}
        onPause={canEdit && !subscription?.isTrialing ? handlePause : undefined}
        onResume={canEdit ? handleResume : undefined}
      />

      {/* Usage */}
      <UsageWidget usage={usage} isLoading={isLoadingUsage} />

      {/* Payment Methods */}
      <PaymentMethods
        paymentMethods={paymentMethods}
        isLoading={isLoadingPaymentMethods}
        onSetDefault={canEdit ? (id) => setDefaultPaymentMethod.mutate(id) : undefined}
        onDelete={canEdit ? (id) => deletePaymentMethod.mutate(id) : undefined}
        isSettingDefault={setDefaultPaymentMethod.isPending}
        isDeleting={deletePaymentMethod.isPending}
      />

      {/* Billing History */}
      <BillingHistory
        invoices={invoicesData?.invoices}
        isLoading={isLoadingInvoices}
        page={invoicePage}
        totalPages={invoicesData?.pagination.totalPages}
        onPageChange={setInvoicePage}
        onDownload={handleDownloadInvoice}
        isDownloading={downloadInvoice.isPending}
      />

      {/* Change Plan Modal - only for active subscriptions, not during trial */}
      {subscription && plans && !subscription.isTrialing && (
        <ChangePlanModal
          open={showChangePlanModal}
          onOpenChange={setShowChangePlanModal}
          plans={plans}
          currentSubscription={subscription}
          onConfirm={handleChangePlanConfirm}
          isLoading={changePlan.isPending}
          globalSettings={globalSettings}
        />
      )}

      {/* Cancel Subscription Modal - not during trial */}
      {subscription && !subscription.isTrialing && (
        <CancelSubscriptionModal
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          subscription={subscription}
          onConfirm={handleCancelConfirm}
          isLoading={cancelSubscription.isPending}
        />
      )}

      {/* Pause Subscription Modal - not during trial */}
      {subscription && !subscription.isTrialing && (
        <PauseSubscriptionModal
          open={showPauseModal}
          onOpenChange={setShowPauseModal}
          subscription={subscription}
          onConfirm={handlePauseConfirm}
          isLoading={pauseSubscription.isPending}
        />
      )}

      {/* Add Seats Modal - not during trial */}
      {subscription && currentPlan && canAddSeats && !subscription.isTrialing && (
        <AddSeatsModal
          open={showAddSeatsModal}
          onOpenChange={setShowAddSeatsModal}
          subscription={subscription}
          pricePerSeat={
            subscription.billingCycle === 'annually'
              ? currentPlan.pricing.perSeat?.annually ?? 0
              : currentPlan.pricing.perSeat?.monthly ?? 0
          }
          onConfirm={handleAddSeatsConfirm}
          isLoading={addSeats.isPending}
        />
      )}
    </div>
  )
}
